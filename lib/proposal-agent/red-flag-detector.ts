import { RedFlagResult } from './types';

const SPEC_WORK_PATTERNS = [
  /show (us|me) what you(?:'d| would) do/i,
  /submit a (sample|test|mockup|prototype) (first|before hiring)/i,
  /free (trial|test|sample|task)/i,
  /unpaid (trial|test)/i,
  /do a quick test (task|project)/i,
  /provide a free/i,
  /complete this test before/i,
];

const MULTIPLE_FREELANCER_PATTERNS = [
  /hiring (several|multiple|2|3|4|5|a few) freelancers/i,
  /test (several|multiple) freelancers/i,
  /trial run with multiple/i,
  /compete against other freelancers/i,
  /best one will be chosen/i,
  /best submission wins/i,
];

const VAGUE_SCOPE_PATTERNS = [
  /need someone to help with various/i,
  /general help/i,
  /lots of different tasks/i,
  /and whatever else comes up/i,
  /ongoing random tasks/i,
  /need a guru who can do everything/i,
  /wear many hats/i,
  /rockstar who knows everything/i,
];

const LOW_BUDGET_HIGH_SCOPE_PATTERNS = [
  /build (a clone of|an entire|a full) (uber|airbnb|amazon|facebook|saas|marketplace) for \$(?:[1-9][0-9]{0,2}|[1-4][0-9]{2})\b/i,
  /budget is \$(?:5|10|15|20|30|50)\b.*?(?:complex|enterprise|complete platform|full stack|mobile app)/i,
  /fixed price \$(?:5|10|15|20|30|50)\b.*?(?:full stack|entire website|complete app)/i,
  /equity only/i,
  /pay once we get funding/i,
  /revenue share only/i,
];

export function analyzeRedFlags(jobDescription: string, budgetRange: string = ''): RedFlagResult {
  const reasons: string[] = [];
  const text = jobDescription.toLowerCase();
  const combinedText = `${text} ${budgetRange.toLowerCase()}`;

  // 1. Spec Work / Unpaid tests
  for (const pat of SPEC_WORK_PATTERNS) {
    if (pat.test(text)) {
      reasons.push('Client is soliciting free spec work or unpaid test tasks before hiring.');
      break;
    }
  }

  // 2. Multiple freelancers tested simultaneously
  for (const pat of MULTIPLE_FREELANCER_PATTERNS) {
    if (pat.test(text)) {
      reasons.push('Client appears to be testing multiple freelancers in parallel or running a contest.');
      break;
    }
  }

  // 3. Vague scope
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 8 && !/api|bug|fix|audit|script/i.test(text)) {
    reasons.push('Job post is extremely brief with no deliverable or scope boundaries.');
  } else {
    for (const pat of VAGUE_SCOPE_PATTERNS) {
      if (pat.test(text)) {
        reasons.push('Scope is vague and broad with potential for severe scope creep.');
        break;
      }
    }
  }

  // 4. Low budget high scope
  for (const pat of LOW_BUDGET_HIGH_SCOPE_PATTERNS) {
    if (pat.test(combinedText)) {
      reasons.push('Budget is drastically disconnected from the requested technical scope.');
      break;
    }
  }

  if (reasons.length === 0) {
    return { has_flags: false, reasons: [] };
  }

  // Synthesize strict 2-sentence maximum alert
  let alertText = '';
  if (reasons.length === 1) {
    alertText = `Watch out: ${reasons[0]} Protect your time by defining strict deliverables and milestone payments before starting any work.`;
  } else {
    alertText = `Watch out: ${reasons[0]} Also note that ${reasons[1].toLowerCase()} Require milestone escrow before commencing work.`;
  }

  return {
    has_flags: true,
    reasons,
    alert_text: alertText,
  };
}
