import { ProposalInput, ProposalResponse } from './types';
import { generateOfflineProposal } from './offline-engine';
import { analyzeRedFlags } from './red-flag-detector';
import { countWords } from './rules-linter';

const SYSTEM_PROMPT = `# ROLE
You are a senior freelance proposal strategist who has helped freelancers win over $2M in contracts.

You understand one truth above all others:
Clients do not hire the most qualified freelancer.
They hire the freelancer who makes them feel most understood and most confident the problem will be solved.

Your job is to write a proposal that wins the project.
Not a proposal that sounds impressive.
Not a proposal that lists skills.
A proposal that makes the client think: "This person gets it."

---

# STEP 1 — ANALYZE BEFORE WRITING (INTERNAL)
- Understand client's real underlying business goal and biggest fear.
- Check red flags: unpaid spec work, vague scope, multiple freelancer tests, scope-budget disconnect.

---

# STEP 2 — WRITE ONE STRONG DRAFT
If the user requests a STRUCTURED proposal:
- Include sections for Scope, Deliverables, Timeline, and Pricing ONLY if provided in the input.

If the user requests a SHORT OUTREACH message:
- Keep it concise, punchy, and conversational. Get straight to the value.

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

[Proposal Text]

═══════════════════════════════════════

📊 COACHING NOTE

What to personalize: [one specific thing the freelancer should manually customize before sending]

Smart question to consider adding: [one optional question if not already included above]

═══════════════════════════════════════
`;

function formatUserPrompt(inp: ProposalInput): string {
  return `# INPUT

PLATFORM:
${inp.platform}

PROPOSAL FORMAT:
${inp.is_structured ? 'STRUCTURED SERVICE PROPOSAL' : 'SHORT OUTREACH MESSAGE'}

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
  let redFlagAlert: string | null = null;
  const redFlagMatch = rawText.match(/🚩\s*RED FLAG ALERT[^\n:]*:\s*\n([\s\S]*?)(?=\n═|\n\[Proposal Text\]|$)/i);
  if (redFlagMatch) {
    const alertCand = redFlagMatch[1].trim();
    if (alertCand && !alertCand.toLowerCase().startsWith('[only include')) {
      redFlagAlert = alertCand;
    }
  }

  const detectorRes = analyzeRedFlags(inp.job_description, inp.budget_range || '');
  if (!redFlagAlert && detectorRes.has_flags) {
    redFlagAlert = detectorRes.alert_text || null;
  }

  let draftText = '';
  // Extract text between the first separator block and coaching note
  const draftMatch = rawText.match(/═══════════════════════════════════════\s*(?:🚩[\s\S]*?═══════════════════════════════════════)?\s*([\s\S]*?)\s*═══════════════════════════════════════\s*📊\s*COACHING NOTE/i);
  if (draftMatch) {
    draftText = draftMatch[1].trim();
  } else {
    // fallback if regex fails
    draftText = rawText.replace(/════════[\s\S]*/g, '').trim();
    if (!draftText) draftText = rawText.trim(); // absolute fallback
  }

  let whatToPersonalize = 'Insert specific repository, stack, or company names from their posting.';
  let smartQuestion = 'Clarify early whether the primary priority is delivery speed or architectural headroom for scaling.';

  const coachMatch = rawText.match(/📊\s*COACHING NOTE[\s\S]*/i);
  if (coachMatch) {
    const coachText = coachMatch[0];
    const persM = coachText.match(/What to personalize:\s*([^\n]+)/i);
    if (persM) whatToPersonalize = persM[1].trim();
    const sqM = coachText.match(/Smart question to consider adding:\s*([^\n]+)/i);
    if (sqM) smartQuestion = sqM[1].trim();
  }

  if (!draftText) {
    return generateOfflineProposal(inp);
  }

  return {
    red_flag_alert: redFlagAlert,
    draft: draftText,
    word_count: countWords(draftText),
    coaching_note: {
      what_to_personalize: whatToPersonalize,
      smart_question: smartQuestion,
    },
    raw_formatted: rawText.trim(),
    provider_used: providerName,
    validation_status: 'PASS',
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
        if (text) return parseRawLlmOutput(text, inp, `gemini (${model} - AI Mode)`);
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
        if (text) return parseRawLlmOutput(text, inp, `groq (${model} - AI Mode)`);
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
        if (text) return parseRawLlmOutput(text, inp, `openai (${model} - AI Mode)`);
      }
    }
  } catch (err) {
    console.error('[Proposal AI Engine error]:', err);
  }

  // Fallback to offline strategic engine
  return generateOfflineProposal(inp);
}
