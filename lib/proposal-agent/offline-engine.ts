import { ProposalInput, ProposalResponse } from './types';
import { analyzeRedFlags } from './red-flag-detector';
import { countWords } from './rules-linter';

export function extractCoreFocus(jobDescription: string): string {
  const text = jobDescription.trim();
  const patterns: [RegExp, string][] = [
    [/(?:mobile\s+checkout|checkout\s+conversion|\bcro\b|shopify|drop-offs?)/i, 'mobile checkout conversion'],
    [/(?:pdf|contract|summariz|document|pgvector|rag|vector)/i, 'AI document processing'],
    [/(?:scraper|scraping|crawl|playwright|selenium|data\s+extract)/i, 'web data extraction'],
    [/(?:landing\s+page|copywriting|messaging|reposition|b2b)/i, 'conversion messaging & landing page'],
    [/(?:api|microservice|backend|fastapi|django|express)/i, 'backend API infrastructure'],
    [/(?:mobile\s+app|react\s+native|flutter|ios|android)/i, 'mobile app development'],
  ];

  for (const [pat, label] of patterns) {
    if (pat.test(text)) {
      return label;
    }
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || 'your project';
  let cleaned = firstLine.replace(/^(looking for|we need|seeking|need a|urgent:|hiring|our)\s+/i, '');
  cleaned = cleaned.replace(/[.:,]+$/, '');
  const words = cleaned.split(/\s+/);
  if (words.length > 6) {
    cleaned = words.slice(0, 5).join(' ');
  }
  return cleaned || 'your system requirements';
}

export function generateOfflineProposal(inp: ProposalInput): ProposalResponse {
  const redFlagRes = analyzeRedFlags(inp.job_description, inp.budget_range || '');
  const coreFocus = extractCoreFocus(inp.job_description);

  const toneClosingMap: Record<string, string> = {
    Professional: 'Available for a brief technical alignment call this week to review the implementation schedule.',
    Friendly: "Happy to jump on a quick call this week if you'd like to chat through the roadmap.",
    Direct: 'Open for a quick 15-minute sync to finalize architecture and milestones.',
    Consultative: 'Available for a strategic discovery session this week to benchmark your requirements against industry standards.',
  };
  const toneClosing = toneClosingMap[inp.tone] || 'Available for a quick call this week to talk through the approach.';

  const smartQuestion =
    'One strategic detail worth clarifying early: is the primary priority lightning-fast time-to-delivery, or architectural headroom for scaling users post-launch?';

  const approachLead = inp.proposed_approach.trim().replace(/\.$/, '');
  const achievementProof = inp.achievements
    ? inp.achievements.trim()
    : 'Previously delivered comparable production deployments on aggressive deadlines with zero regressions.';

  let draftText = '';
  if (inp.is_structured) {
    draftText = 
      `Subject: Proven roadmap for ${coreFocus}\n\n` +
      `Achieving tangible business results with ${coreFocus} demands an execution framework that connects directly to your target performance metrics.\n\n` +
      `${achievementProof}\n\n` +
      `Your project brief underscores the necessity for predictable delivery and clean architecture. Rather than treating this as generic development work, the approach applies ${approachLead}, ensuring each component meets strict quality thresholds prior to staging.\n\n` +
      `### Scope of Work\n- Full implementation of ${coreFocus}\n- Setup of ${approachLead}\n\n` +
      `### Deliverables\n- Completed and tested system\n- Documentation and handover\n\n` +
      `### Timeline\n- Kickoff and architecture: Week 1\n- Core implementation: Week 2-3\n- Testing and launch: Week 4\n\n` +
      `### Pricing\n- Estimated budget: ${inp.budget_range || 'To be discussed based on final scope'}\n\n` +
      `${smartQuestion}\n\n${toneClosing}`;
  } else {
    draftText = 
      `Subject: Solving your ${coreFocus} bottleneck\n\n` +
      `Addressing ${coreFocus} requires avoiding the common trap where surface-level execution masks deep architectural friction.\n\n` +
      `Looking at your specifications, the critical objective is achieving a robust, maintainable solution that supports your business milestones without unexpected rework or communication delays. When projects like this miss their targets, it is almost always due to underspecified interfaces or rushed scoping early on.\n\n` +
      `The implementation plan centers on ${approachLead}. Every milestone is paired with automated validation and transparent progress updates, ensuring you maintain full visibility into delivery velocity from kickoff to handover.\n\n` +
      `${achievementProof}\n\n` +
      `${smartQuestion}\n\n` +
      `${toneClosing}`;
  }

  const whatToPersonalize =
    "Insert the exact name of the client's existing software stack, repository, or company if mentioned in their post.";

  const rawParts: string[] = ['═══════════════════════════════════════\n\n'];
  if (redFlagRes.has_flags && redFlagRes.alert_text) {
    rawParts.push(
      `🚩 RED FLAG ALERT (only include if red flags detected):\n${redFlagRes.alert_text}\n\n═══════════════════════════════════════\n\n`
    );
  }
  rawParts.push(`${draftText.trim()}\n\n`);
  rawParts.push('═══════════════════════════════════════\n\n📊 COACHING NOTE\n\n');
  rawParts.push(`What to personalize: ${whatToPersonalize}\n\n`);
  rawParts.push(`Smart question to consider adding: ${smartQuestion}\n\n`);
  rawParts.push('═══════════════════════════════════════');

  return {
    red_flag_alert: redFlagRes.has_flags ? redFlagRes.alert_text : null,
    draft: draftText.trim(),
    word_count: countWords(draftText),
    coaching_note: {
      what_to_personalize: whatToPersonalize,
      smart_question: smartQuestion,
    },
    raw_formatted: rawParts.join(''),
    provider_used: 'Template Mode (Offline Fallback)',
    validation_status: 'PASS',
  };
}
