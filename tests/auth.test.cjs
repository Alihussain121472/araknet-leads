const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
function load(file) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
 const mod = new Module(require('node:path').resolve(file), module);
 mod.paths = module.paths; mod._compile(code, file); return mod.exports;
}
const { createSession, validSession, validBasic, SESSION_SECONDS } = load('lib/session.ts');
const secret = 'test-only-password:unicode-\u2713';
test('valid sessions expire after seven days', () => {
 const now = 1800000000000, token = createSession(secret, now);
 assert.equal(validSession(token, secret, now), true);
 assert.equal(validSession(token, secret, now + SESSION_SECONDS * 1000), false);
});
test('tampered, malformed and wrong-password sessions fail closed', () => {
 const token = createSession(secret);
 for (const value of ['', undefined, 'NaN.x', token + '.extra', token + '0']) assert.equal(validSession(value, secret), false);
 assert.equal(validSession(token, 'different-password'), false);
 assert.equal(validSession(token, ''), false);
});
test('Basic authentication supports colon and Unicode passwords', () => {
 const basic = value => 'Basic ' + Buffer.from(value).toString('base64');
 assert.equal(validBasic(basic('owner:' + secret), secret), true);
 assert.equal(validBasic(basic('admin:' + secret), secret), false);
 assert.equal(validBasic(basic('owner:'), ''), false);
});
const { auditAndScore } = load('lib/agent/scorer.ts');
test('scoring marks app status unverified and explains directory evidence', () => {
 const result = auditAndScore({ business_name: 'Test', industry: 'Restaurant' });
 assert.equal(result.has_app, null);
 assert.equal(result.website_status, 'no_website');
 assert.match(result.opportunity_reason, /verify manually/);
 assert.ok(result.opportunity_score >= 0 && result.opportunity_score <= 100);
});
