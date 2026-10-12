import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';

const near = (a, b, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('X-B 2.2 worked example: needs-based life cover for Anil', () => {
  // Rs 83,000/month to replace, 31 years, 8% return, 6% inflation (rate rounded to 1.89% as the book does)
  const r = E.lifeCover({ annualNeed: 996000, years: 31, ret: 0.08, inflation: 0.06, loans: 4000000, existingCover: 10000000, investments: 5000000, roundRate: true });
  near(r.corpus, 23643984, 2);
  near(r.required, 27643984, 2);
  near(r.additional, 12643984, 2);
});

test('life cover never goes below zero', () => {
  const r = E.lifeCover({ annualNeed: 100000, years: 5, ret: 0.08, inflation: 0.06, existingCover: 1e8 });
  assert.equal(r.additional, 0);
});

test('X-B 4.4.2 worked example: Ashish expense at retirement', () => {
  const r = E.retirement({ age: 40, retireAge: 60, lifeExpectancy: 85, monthlyExpense: 30000, extraMonthly: 15000, inflation: 0.06, preReturn: 0.1, postReturn: 0.07 });
  near(r.monthlyAtRetirement, 144321, 1);
  assert.equal(r.yearsToGo, 20);
  assert.equal(r.yearsIn, 25);
  assert.ok(r.corpus > r.monthlyAtRetirement * 12 * 20 && r.corpus < r.monthlyAtRetirement * 12 * 25);
});

test('X-A 3.9 ratios: leverage, solvency and net worth example', () => {
  const r = E.ratios({ physicalAssets: 5000000, investments: 1500000, liabilities: 1300000 });
  near(r.leverage, 0.2, 1e-9); near(r.solvency, 0.8, 1e-9); assert.equal(r.netWorth, 5200000);
});

test('X-A 3.9.8 liquidity ratio example (NFG: 13 lakh liquid / 1.5 lakh a month)', () => {
  const r = E.ratios({ monthlyIncome: 200000, monthlyExpenses: 150000, liquidAssets: 1300000 });
  near(r.liquidityRatio, 8.6667, 1e-3);
  assert.equal(r.checks.find((c) => c.id === 'liquidity').status, 'good');
});

test('X-A 3.9.10 debt to income: 40% sits at the edge, above it needs action', () => {
  assert.equal(E.ratios({ monthlyIncome: 150000, monthlyEmi: 60000 }).checks.find((c) => c.id === 'debtToIncome').status, 'ok');
  assert.equal(E.ratios({ monthlyIncome: 150000, monthlyEmi: 70000 }).checks.find((c) => c.id === 'debtToIncome').status, 'act');
  assert.equal(E.ratios({ monthlyIncome: 150000, monthlyEmi: 30000 }).checks.find((c) => c.id === 'debtToIncome').status, 'good');
});

test('savings-to-income benchmark only applied in the early 40s', () => {
  const base = { monthlyIncome: 100000, investments: 2000000 };
  assert.equal(E.ratios({ ...base, age: 30 }).checks.find((c) => c.id === 'savingsToIncome').status, 'info');
  assert.equal(E.ratios({ ...base, age: 42 }).checks.find((c) => c.id === 'savingsToIncome').status, 'act');
  assert.equal(E.ratios({ ...base, age: 42, investments: 3600000 }).checks.find((c) => c.id === 'savingsToIncome').status, 'good');
});

test('ratios survive empty input', () => {
  const r = E.ratios({});
  assert.equal(r.savingsRatio, null);
  assert.ok(r.checks.every((c) => c.status === 'na' || c.status === 'info'));
});

const all = (i) => Object.fromEntries(E.QUESTIONS.map((q) => [q.id, Math.min(i, q.o.length - 1)]));
test('risk profile: needs every answer', () => {
  const a = all(2); delete a.fall;
  assert.equal(E.riskProfile(a), null);
});
test('risk profile: top answers give Aggressive, bottom give Conservative', () => {
  assert.equal(E.riskProfile(all(9)).label, 'Aggressive');
  assert.equal(E.riskProfile(all(0)).label, 'Conservative');
});
test('risk profile is the lower of ability and willingness', () => {
  const a = all(9); a.experience = 0; a.fall = 1; a.range = 0; a.objective = 0;
  const r = E.riskProfile(a);
  assert.equal(r.abilityGrade, 2); assert.equal(r.willingnessGrade, 0); assert.equal(r.grade, 0);
  assert.ok(r.notes.includes('canMore'));
});
test('selling everything after a fall caps willingness at Conservative', () => {
  const a = all(9); a.fall = 0;
  const r = E.riskProfile(a);
  assert.equal(r.label, 'Conservative'); assert.ok(r.notes.includes('fall'));
});
test('money needed within a year caps ability at Conservative; 1-3 years at Moderate', () => {
  const a = all(9); a.horizon = 0; assert.equal(E.riskProfile(a).label, 'Conservative');
  a.horizon = 1; assert.equal(E.riskProfile(a).label, 'Moderate');
});
test('every question has the same weight (scores span 1 to 5)', () => {
  for (const q of E.QUESTIONS) {
    const lo = E.riskProfile({ ...all(2), [q.id]: 0 }), hi = E.riskProfile({ ...all(2), [q.id]: q.o.length - 1 });
    const d = q.part === 'ability' ? hi.ability - lo.ability : hi.willingness - lo.willingness;
    const n = E.QUESTIONS.filter((x) => x.part === q.part).length;
    near(d, 4 / n, 1e-9);
  }
});

test('fee limits: fixed ₹1,51,000 a year per family, AUA 2.5%, advance up to a year', () => {
  assert.deepEqual(E.feeProblems({ mode: 'fixed', amount: 151000, period: 'year' }), []);
  assert.equal(E.feeProblems({ mode: 'fixed', amount: 151001, period: 'year' }).length, 1);
  assert.equal(E.feeProblems({ mode: 'fixed', amount: 40000, months: 3, period: 'quarter' }).length, 1); // 1.6 lakh a year
  assert.deepEqual(E.feeProblems({ mode: 'aua', pct: 2.5 }), []);
  assert.equal(E.feeProblems({ mode: 'aua', pct: 2.6 }).length, 1);
  assert.equal(E.feeProblems({ mode: 'fixed', amount: 20000, period: 'year', advanceMonths: 13 }).length, 1);
});

test('refund on exit: unexpired fee less at most one quarter', () => {
  const r = E.refundOnExit(24000, 12, 4);
  near(r.unexpired, 16000, 1e-9); near(r.breakage, 6000, 1e-9); near(r.refund, 10000, 1e-9);
  const late = E.refundOnExit(24000, 12, 11);
  near(late.refund, 0, 1e-9); // breakage cannot exceed what is left
  assert.ok(E.refundOnExit(24000, 12, 4, 9).breakage <= 6000);
});

test('goal maths and monthly saving', () => {
  const g = E.goal({ cost: 1000000, years: 10, inflation: 0.06, saved: 0, ret: 0 });
  near(g.future, 1790848, 1);
  near(g.monthly, g.future / 120, 1e-6);
  near(E.monthlySaving(1000000, 0, 0.1), 1000000, 1e-9);
});

test('share links round-trip and are sanitised', () => {
  const st = { name: 'Asha', answers: all(2), health: { age: 35, monthlyIncome: 100000 }, cover: { years: 30 }, retire: { age: 35 }, goals: [{ name: 'House', cost: 5e6, years: 7, inflation: 0.07, saved: 0, ret: 0.09 }] };
  const back = E.decodeState(E.encodeState(st));
  assert.equal(back.name, 'Asha'); assert.equal(back.goals[0].name, 'House'); assert.equal(back.health.monthlyIncome, 100000);
  const evil = E.decodeState(E.encodeState({ name: '<img src=x onerror=alert(1)>'.repeat(5), health: { age: 1e9 }, answers: { age: 99, fall: 'x' }, goals: Array(40).fill({ cost: -5 }) }));
  assert.equal(evil.name.length, 40); assert.equal(evil.health.age, 110); assert.deepEqual(evil.answers, {});
  assert.equal(evil.goals.length, 12); assert.equal(evil.goals[0].cost, 0);
  assert.ok(!E.esc(evil.name).includes('<'));
  assert.equal(E.decodeState('%%%not-base64'), null);
});

test('rupee formatting', () => {
  assert.equal(E.inr(1234567), '₹12,34,567');
  assert.equal(E.inr(23643984, { short: true }), '₹2.36 Cr');
  assert.equal(E.inr(150000, { short: true }), '₹1.5 L');
  assert.equal(E.inr(-500), '−₹500');
  assert.equal(E.inr(1.5e9, { short: true }), '₹150 Cr');
  assert.equal(E.inr(-400000, { short: true }), '−₹4 L');
});
