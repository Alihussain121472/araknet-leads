import { ProposalInput, ProposalResponse, AcademicProposalInput, AcademicProposalResponse } from './types';
import { generateOfflineProposal } from './offline-engine';
import { generateAcademicProposalOffline } from './academic-engine';
import { analyzeRedFlags } from './red-flag-detector';
import { lintProposal, countWords } from './rules-linter';


const SYSTEM_PROMPT = `# ROLE
You are a senior freelance proposal strategist who has helped freelancers win over $2M in contracts across Upwork, direct outreach, and agency pitches.

You understand one truth above all others:
Clients do not hire the most qualified freelancer.
They hire the freelancer who makes them feel most understood and most confident the problem will be solved.

Your job is to write a proposal that wins the project.
Not a proposal that sounds impressive.
Not a proposal that lists skills.
A proposal that makes the client think: "This person gets it."

---

# STEP 1 — ANALYZE BEFORE WRITING (INTERNAL)
- Understand client's real underlying business goal and biggest fear (wasted budget, missed deadlines, wrong hire).
- Calibrate by platform:
  * Upwork: < 220 words, hook shows in 2-line preview, do not mention Upwork inside.
  * Direct Email: 220-300 words, generate subject line, personal.
  * LinkedIn: 100-150 words, conversational, end with question.
  * Agency RFP: 250-350 words, structured, addresses brief.
- Check red flags: unpaid spec work, vague scope, multiple freelancer tests, scope-budget disconnect.

---

# STEP 2 — WRITE TWO PROPOSAL VARIATIONS
VARIATION A — Lead with the client's pain and problem
VARIATION B — Lead with a bold, relevant result or achievement

---

# ABSOLUTE RULES
- Never start with freelancer's name or job title
- Never open with "I"
- Never list skills as bullet points
- Never use: "passionate", "hardworking", "detail-oriented", "team player", "perfect fit", "excited about"
- Never say "I always deliver on time"
- Never mention that AI was used
- Never fabricate numbers or clients
- Never write a cover letter — write a business proposal
- Never be sycophantic ("Great project!", "Love this idea!")

---

# OUTPUT FORMAT

Return your response in EXACTLY this structure:

═══════════════════════════════════════

🚩 RED FLAG ALERT (only include if red flags detected):
[2 sentences maximum. What the freelancer should watch out for before sending this proposal.]

═══════════════════════════════════════

VARIATION A — [one line: the specific angle used]

[Proposal text]

---

VARIATION B — [one line: the specific angle used]

[Proposal text]

═══════════════════════════════════════

📊 COACHING NOTE

Stronger variation: [A or B] — [one sentence explaining why for this specific job]

What to personalize: [one specific thing the freelancer should manually customize before sending]

Smart question to consider adding: [one optional question if not already included above]

Win probability factors: [2–3 sentences on what will most affect whether this proposal wins — based on the job post]

═══════════════════════════════════════
`;

function formatUserPrompt(inp: ProposalInput): string {
  return `# INPUT

PLATFORM:
${inp.platform}

JOB_DESCRIPTION:
${inp.job_description}

FREELANCER_PROFILE:
${inp.freelancer_profile}

RELEVANT_EXPERIENCE:
${inp.relevant_experience}

PROPOSED_APPROACH:
${inp.proposed_approach}

BUDGET_RANGE:
${inp.budget_range || 'Not specified'}

TONE:
${inp.tone}

ACHIEVEMENTS:
${inp.achievements || 'None specified (use situational proof only)'}
`;
}

function parseRawLlmOutput(rawText: string, inp: ProposalInput, providerName: string): ProposalResponse {
  // Red Flag Alert
  let redFlagAlert: string | null = null;
  const redFlagMatch = rawText.match(/🚩\s*RED FLAG ALERT[^\n:]*:\s*\n([\s\S]*?)(?=\n═|\nVARIATION|$)/i);
  if (redFlagMatch) {
    const alertCand = redFlagMatch[1].trim();
    if (alertCand && !alertCand.toLowerCase().startsWith('[only include')) {
      redFlagAlert = alertCand;
    }
  }

  // Fallback to rule detector if LLM missed it
  const detectorRes = analyzeRedFlags(inp.job_description, inp.budget_range || '');
  if (!redFlagAlert && detectorRes.has_flags) {
    redFlagAlert = detectorRes.alert_text || null;
  }

  // Variation A
  let varAAngle = "Lead with the client's pain and problem";
  let varAText = '';
  const varAMatch = rawText.match(/VARIATION A\s*[-—:]\s*([^\n]+)\n+([\s\S]*?)(?=\n---\s*\n|\nVARIATION B|$)/i);
  if (varAMatch) {
    varAAngle = varAMatch[1].trim();
    varAText = varAMatch[2].trim();
  }

  // Variation B
  let varBAngle = 'Lead with a bold, relevant result or achievement';
  let varBText = '';
  const varBMatch = rawText.match(
    /VARIATION B\s*[-—:]\s*([^\n]+)\n+([\s\S]*?)(?=\n═|\n📊\s*COACHING NOTE|$)/i
  );
  if (varBMatch) {
    varBAngle = varBMatch[1].trim();
    varBText = varBMatch[2].trim();
  }

  // Coaching Note
  let strongerVar = 'Variation A';
  let strongerReason = 'Directly addresses the operational bottleneck and builds rapid confidence.';
  let whatToPersonalize = 'Insert specific repository, stack, or company names from their posting.';
  let smartQuestion =
    'Clarify early whether the primary priority is delivery speed or architectural headroom for scaling.';
  let winFactors = 'Fast proposal response within 2 hours and opening with zero fluff.';

  const coachMatch = rawText.match(/📊\s*COACHING NOTE[\s\S]*/i);
  if (coachMatch) {
    const coachText = coachMatch[0];
    const strongerM = coachText.match(/Stronger variation:\s*([^\n—\-]+)[—\-]\s*([^\n]+)/i);
    if (strongerM) {
      strongerVar = strongerM[1].trim();
      strongerReason = strongerM[2].trim();
    }
    const persM = coachText.match(/What to personalize:\s*([^\n]+)/i);
    if (persM) whatToPersonalize = persM[1].trim();
    const sqM = coachText.match(/Smart question to consider adding:\s*([^\n]+)/i);
    if (sqM) smartQuestion = sqM[1].trim();
    const winM = coachText.match(/Win probability factors:\s*([\s\S]*?)(?=\n═|$)/i);
    if (winM) winFactors = winM[1].trim();
  }

  if (!varAText || !varBText) {
    return generateOfflineProposal(inp);
  }

  const varAWarns = lintProposal(varAText, inp.platform);
  const varBWarns = lintProposal(varBText, inp.platform);

  return {
    red_flag_alert: redFlagAlert,
    variation_a: {
      title: `VARIATION A — ${varAAngle}`,
      angle: varAAngle,
      text: varAText,
      word_count: countWords(varAText),
      warnings: varAWarns,
    },
    variation_b: {
      title: `VARIATION B — ${varBAngle}`,
      angle: varBAngle,
      text: varBText,
      word_count: countWords(varBText),
      warnings: varBWarns,
    },
    coaching_note: {
      stronger_variation: strongerVar,
      stronger_reason: strongerReason,
      what_to_personalize: whatToPersonalize,
      smart_question: smartQuestion,
      win_probability_factors: winFactors,
    },
    raw_formatted: rawText.trim(),
    provider_used: providerName,
    validation_status: varAWarns.length === 0 && varBWarns.length === 0 ? 'PASS' : 'WARNINGS_REVIEWED',
  };
}

export async function generateProposalWithAi(
  inp: ProposalInput,
  options?: {
    provider?: 'gemini' | 'groq' | 'openai' | 'offline';
    apiKey?: string;
    model?: string;
  }
): Promise<ProposalResponse> {
  const provider = options?.provider || 'offline';
  const apiKey =
    options?.apiKey ||
    (provider === 'gemini' ? process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY : '') ||
    (provider === 'groq' ? process.env.GROQ_API_KEY : '') ||
    (provider === 'openai' ? process.env.OPENAI_API_KEY : '');

  if (!apiKey || provider === 'offline') {
    return generateOfflineProposal(inp);
  }

  const userPrompt = formatUserPrompt(inp);

  try {
    if (provider === 'gemini') {
      const model = options?.model || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return parseRawLlmOutput(text, inp, `gemini (${model})`);
      }
    } else if (provider === 'groq') {
      const model = options?.model || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return parseRawLlmOutput(text, inp, `groq (${model})`);
      }
    } else if (provider === 'openai') {
      const model = options?.model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return parseRawLlmOutput(text, inp, `openai (${model})`);
      }
    }
  } catch (err) {
    console.error('[Proposal AI Engine error]:', err);
  }

  // Fallback to offline strategic engine
  return generateOfflineProposal(inp);
}

const ACADEMIC_SYSTEM_PROMPT = `# ROLE
You are an expert academic and professional proposal writing assistant designed for students at all levels — Bachelor's, Master's, and PhD.

Your goal is to help the user write a high-quality, structured proposal tailored to their academic level and chosen niche.

---

# STEP 1 — ACADEMIC LEVEL CALIBRATION
- Bachelor's: Clear, simple, foundational language. Practical understanding, structured milestones, foundational literature, direct outcomes.
- Master's: Analytical, structured, research-aware language. Theoretical frameworks, comparative analysis, empirical backing, gap identification, operational execution.
- PhD: Advanced, scholarly, gap-focused, methodology-rich language. Epistemological and ontological grounding, significant novel contribution to literature/field, rigorous empirical design, triangulation, and validation protocols.

---

# STEP 2 — PROPOSAL TYPE
- Education Proposal: Pedagogical frameworks, instructional design, curriculum development, student learning outcomes, assessment rubrics, educational equity/access.
- Business Proposal: Market analysis, competitive positioning, value proposition, operational feasibility, financial/ROI projections, resource allocation, risk mitigation.
- Social Media Proposal: Audience segmentation, multi-channel content strategy, algorithmic distribution mechanisms, community engagement, brand voice, performance KPIs.

---

# STEP 4 — PROPOSAL STRUCTURE (7 MANDATORY SECTIONS)
Return your proposal in clean Markdown with these exact sections:
# [Title]
## 1. Title
## 2. Introduction / Background
## 3. Problem Statement
## 4. Objectives (as bullet points)
## 5. Methodology or Approach
## 6. Expected Outcomes / Benefits
## 7. Conclusion
`;

export async function generateAcademicProposalWithAi(
  inp: AcademicProposalInput,
  options?: { provider?: string; apiKey?: string; model?: string }
): Promise<AcademicProposalResponse> {
  const provider = options?.provider || 'offline';
  const apiKey = options?.apiKey || (
    provider === 'gemini' ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) :
    provider === 'groq' ? process.env.GROQ_API_KEY :
    provider === 'openai' ? process.env.OPENAI_API_KEY : undefined
  );

  const fallback = generateAcademicProposalOffline(inp);
  if (!apiKey || provider === 'offline') {
    return fallback;
  }

  const userPrompt = `# INPUT
ACADEMIC_LEVEL: ${inp.academic_level}
PROPOSAL_TYPE: ${inp.proposal_type}
TOPIC: ${inp.topic}
PURPOSE: ${inp.purpose}
TARGET_AUDIENCE: ${inp.target_audience || 'Evaluation Committee'}
SPECIFIC_REQUIREMENTS: ${inp.specific_requirements || 'Standard guidelines'}
`;

  try {
    let rawText = '';
    if (provider === 'gemini') {
      const model = options?.model || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ACADEMIC_SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } else if (provider === 'groq') {
      const model = options?.model || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: ACADEMIC_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        rawText = data.choices?.[0]?.message?.content || '';
      }
    } else if (provider === 'openai') {
      const model = options?.model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: ACADEMIC_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        rawText = data.choices?.[0]?.message?.content || '';
      }
    }

    if (rawText && rawText.length > 100) {
      // Parse sections
      const introMatch = rawText.match(/##\s*2\.\s*Introduction[^\n]*\n+([\s\S]*?)(?=\n##|\Z)/i);
      const probMatch = rawText.match(/##\s*3\.\s*Problem Statement[^\n]*\n+([\s\S]*?)(?=\n##|\Z)/i);
      const objsMatch = rawText.match(/##\s*4\.\s*Objectives[^\n]*\n+([\s\S]*?)(?=\n##|\Z)/i);
      const methodMatch = rawText.match(/##\s*5\.\s*Methodology[^\n]*\n+([\s\S]*?)(?=\n##|\Z)/i);
      const outcomesMatch = rawText.match(/##\s*6\.\s*Expected Outcomes[^\n]*\n+([\s\S]*?)(?=\n##|\Z)/i);
      const conclusionMatch = rawText.match(/##\s*7\.\s*Conclusion[^\n]*\n+([\s\S]*?)(?=\n##|---\s*\n|\Z)/i);

      let parsedObjs = fallback.objectives;
      if (objsMatch && objsMatch[1].trim()) {
        const lines = objsMatch[1].split('\n').map(l => l.replace(/^[-*•\d.]\s*/, '').trim()).filter(l => l.length > 5);
        if (lines.length > 0) parsedObjs = lines;
      }

      return {
        title: fallback.title,
        academic_level: inp.academic_level,
        proposal_type: inp.proposal_type,
        introduction_background: introMatch?.[1]?.trim() || fallback.introduction_background,
        problem_statement: probMatch?.[1]?.trim() || fallback.problem_statement,
        objectives: parsedObjs,
        methodology_approach: methodMatch?.[1]?.trim() || fallback.methodology_approach,
        expected_outcomes_benefits: outcomesMatch?.[1]?.trim() || fallback.expected_outcomes_benefits,
        conclusion: conclusionMatch?.[1]?.trim() || fallback.conclusion,
        raw_markdown: rawText,
        word_count: countWords(rawText),
        provider_used: provider,
        level_insights: fallback.level_insights
      };
    }
  } catch (err) {
    console.error('[Academic AI Engine error]:', err);
  }

  return fallback;
}

