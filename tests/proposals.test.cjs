const test = require('node:test');
const assert = require('node:assert/strict');

// Testing red flag logic
const SPEC_WORK_PATTERNS = [
  /show (us|me) what you(?:'d| would) do/i,
  /submit a (sample|test|mockup|prototype) (first|before hiring)/i,
  /free (trial|test|sample|task)/i,
  /unpaid (trial|test)/i,
];

function checkFlags(text) {
  for (const pat of SPEC_WORK_PATTERNS) {
    if (pat.test(text)) return true;
  }
  return false;
}

test('proposal strategist flags free spec work and unpaid tests', () => {
  assert.equal(checkFlags("Must submit a free sample first before hiring"), true);
  assert.equal(checkFlags("Show us what you would do before we award"), true);
  assert.equal(checkFlags("Looking for senior Next.js developer for $5000 milestone"), false);
});
