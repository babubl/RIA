import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import C from '../js/config.js';
import * as T from '../js/content.js';
import { feeProblems } from '../js/engine.js';

const ph = (v) => /\[[^\]]*\]/.test(String(v));
test('configured fees stay within SEBI limits', () => {
  for (const f of C.fees) if (!ph(f.amount)) assert.deepEqual(feeProblems(f), [], f.name);
  assert.ok(C.breakageMonths <= 3);
});
test('mandatory texts are word for word', () => {
  assert.equal(T.STANDARD_WARNING, 'Investment in securities market are subject to market risks. Read all the related documents carefully before investing.');
  assert.match(T.BASL_DISCLAIMER, /^Registration granted by SEBI, membership of BASL and certification from NISM in no way guarantee performance/);
});
test('no promises of returns or safety anywhere in the site text', async () => {
  const text = (await readFile(new URL('../js/content.js', import.meta.url), 'utf8')) + (await readFile(new URL('../js/app.js', import.meta.url), 'utf8'));
  const prose = text.replace(/assured, guaranteed|guaranteed or fixed|assured or guaranteed|exorbitant or assured|indicative, exorbitant or assured|don’t guarantee|do not guarantee|no way guarantee|not guarantee/gi, '');
  for (const bad of [/guaranteed returns?/i, /risk[- ]free returns?/i, /\bsafe investment/i, /\btestimonial(?!s and)/i, /\bwin (a|prizes?)\b/i]) assert.doesNotMatch(prose, bad);
});
test('grievance timeline within SEBI limit', () => { assert.ok(C.replyWorkingDays <= 21); });
