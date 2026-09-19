import { ProposalInput, ProposalResponse } from './types';
import { analyzeRedFlags } from './red-flag-detector';
import { lintProposal, countWords } from './rules-linter';

export function extractCoreFocus(jobDescription: string): string {
  const text = jobDescription.trim();
  const patterns: [RegExp, string][] = [
    [/(?:mobile\s+checkout|checkout\s+conversion|cro|shopify|drop-offs?)/i, 'mobile checkout conversion'],
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

  const emailSubjA = inp.platform === 'Direct Email' ? `Subject: Solving your ${coreFocus} bottleneck\n\n` : '';
  const emailSubjB = inp.platform === 'Direct Email' ? `Subject: Proven roadmap for ${coreFocus}\n\n` : '';

  let varAText = '';
  let varBText = '';

  const approachLead = inp.proposed_approach.trim().replace(/\.$/, '');
  const achievementProof = inp.achievements
    ? inp.achievements.trim()
    : 'Previously delivered comparable production deployments on aggressive deadlines with zero regressions.';

  if (inp.platform === 'LinkedIn') {
    varAText =
      `Solving ${coreFocus} usually stalls when architectural decisions are made before the core data model is locked down.\n\n` +
      `Your focus on a frictionless delivery requires an execution plan that avoids technical debt while hitting tight delivery milestones. ` +
      `The approach here is straightforward: establish a clean foundation using ${approachLead.split('.')[0]}, then deploy modular iterations with continuous validation.\n\n` +
      `${achievementProof}\n\n` +
      `${smartQuestion}\n\n` +
      `${toneClosing}`;

    varBText =
      `Delivering ${coreFocus} with zero production bottlenecks is exactly the outcome delivered on recent builds.\n\n` +
      `${achievementProof}\n\n` +
      `For your build, the priority is executing ${approachLead.split('.')[0]} with rigorous test coverage from day one so your team never has to rework early components.\n\n` +
      `Are you open to a phased rollout, or is a single all-in release required?\n\n` +
      `${toneClosing}`;
  } else if (inp.platform === 'Upwork') {
    varAText =
      `Most projects handling ${coreFocus} encounter delays because initial scope doesn't account for edge cases and integration dependencies.\n\n` +
      `Your priority is getting this deployed reliably without burning engineering cycles on endless revisions. The key to resolving this quickly is structuring your project in clear, verified phases rather than an untracked monolith.\n\n` +
      `The execution plan focuses on ${approachLead}. ` +
      `By standardizing the core workflows first, your team gets a functional, production-grade deliverable early in the cycle while keeping maintenance overhead near zero.\n\n` +
      `${achievementProof}\n\n` +
      `${smartQuestion}\n\n` +
      `${toneClosing}`;

    varBText =
      `Recent deployments with requirements nearly identical to ${coreFocus} proved that front-loading architectural clarity cuts delivery cycles by up to 40%.\n\n` +
      `${achievementProof}\n\n` +
      `The underlying objective here isn't just completing tasks—it's ensuring your solution operates seamlessly under real-world conditions. ` +
      `The recommended workflow tackles ${approachLead}, eliminating hidden bottlenecks before they impact your launch schedule.\n\n` +
      `Is there an existing codebase/schema that this needs to integrate with, or are we establishing the architecture from scratch?\n\n` +
      `${toneClosing}`;
  } else {
    // Direct Email or Agency RFP
    varAText =
      `${emailSubjA}` +
      `Addressing ${coreFocus} requires avoiding the common trap where surface-level execution masks deep architectural friction.\n\n` +
      `Looking at your specifications, the critical objective is achieving a robust, maintainable solution that supports your business milestones without unexpected rework or communication delays. ` +
      `When projects like this miss their targets, it is almost always due to underspecified interfaces or rushed scoping early on.\n\n` +
      `The implementation plan centers on ${approachLead}. ` +
      `Every milestone is paired with automated validation and transparent progress updates, ensuring you maintain full visibility into delivery velocity from kickoff to handover.\n\n` +
      `${achievementProof}\n\n` +
      `${smartQuestion}\n\n` +
      `${toneClosing}`;

    varBText =
      `${emailSubjB}` +
      `Achieving tangible business results with ${coreFocus} demands an execution framework that connects directly to your target performance metrics.\n\n` +
      `${achievementProof}\n\n` +
      `Your project brief underscores the necessity for predictable delivery and clean architecture. ` +
      `Rather than treating this as generic development work, the approach applies ${approachLead}, ensuring each component meets strict quality thresholds prior to staging.\n\n` +
      `Are there predefined security or compliance benchmarks that must govern the deployment pipeline?\n\n` +
      `${toneClosing}`;
  }

  const varAWarns = lintProposal(varAText, inp.platform);
  const varBWarns = lintProposal(varBText, inp.platform);

  const stronger =
    inp.tone === 'Direct' || inp.tone === 'Consultative' || !inp.achievements ? 'Variation A' : 'Variation B';
  const strongerReason =
    stronger === 'Variation A'
      ? 'Clients experiencing acute bottlenecks or vague scopes respond much faster to deep problem diagnosis than to bragged credentials.'
      : 'Your concrete achievements and quantifiable past results immediately establish high credibility and de-risk the investment.';

  const whatToPersonalize =
    "Insert the exact name of the client's existing software stack, repository, or company if mentioned in their post.";
  const winProbabilityFactors =
    'Response speed within the first 1-2 hours of posting will increase conversion by over 3x. Opening with zero fluff and immediately stating their core constraint will separate your bid from 95% of generic copy-paste proposals.';

  const rawParts: string[] = ['═══════════════════════════════════════\n\n'];
  if (redFlagRes.has_flags && redFlagRes.alert_text) {
    rawParts.push(
      `🚩 RED FLAG ALERT (only include if red flags detected):\n${redFlagRes.alert_text}\n\n═══════════════════════════════════════\n\n`
    );
  }
  rawParts.push(`VARIATION A — Lead with the client's pain and problem\n\n${varAText.trim()}\n\n---\n\n`);
  rawParts.push(`VARIATION B — Lead with a bold, relevant result or achievement\n\n${varBText.trim()}\n\n`);
  rawParts.push('═══════════════════════════════════════\n\n📊 COACHING NOTE\n\n');
  rawParts.push(`Stronger variation: ${stronger} — ${strongerReason}\n\n`);
  rawParts.push(`What to personalize: ${whatToPersonalize}\n\n`);
  rawParts.push(`Smart question to consider adding: ${smartQuestion}\n\n`);
  rawParts.push(`Win probability factors: ${winProbabilityFactors}\n\n`);
  rawParts.push('═══════════════════════════════════════');

  return {
    red_flag_alert: redFlagRes.has_flags ? redFlagRes.alert_text : null,
    variation_a: {
      title: "VARIATION A — Lead with the client's pain and problem",
      angle: "Lead with the client's pain and problem",
      text: varAText.trim(),
      word_count: countWords(varAText),
      warnings: varAWarns,
    },
    variation_b: {
      title: 'VARIATION B — Lead with a bold, relevant result or achievement',
      angle: 'Lead with a bold, relevant result or achievement',
      text: varBText.trim(),
      word_count: countWords(varBText),
      warnings: varBWarns,
    },
    coaching_note: {
      stronger_variation: stronger,
      stronger_reason: strongerReason,
      what_to_personalize: whatToPersonalize,
      smart_question: smartQuestion,
      win_probability_factors: winProbabilityFactors,
    },
    raw_formatted: rawParts.join(''),
    provider_used: 'araknet_strategic_engine',
    validation_status: varAWarns.length === 0 && varBWarns.length === 0 ? 'PASS' : 'WARNINGS_REVIEWED',
  };
}
