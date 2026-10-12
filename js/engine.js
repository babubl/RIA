// Pure functions: maths, ratios, risk profile, fee rules, share links.
// Formulas follow the NISM Series X-A and X-B workbooks. No DOM access here, so it is all testable.

/* ---------------- time value of money (X-A chapter 2) ---------------- */
export const fv = (rate, n, pv) => pv * Math.pow(1 + rate, n);
export const realRate = (ret, infl) => (1 + ret) / (1 + infl) - 1;
// Present value of an annuity. due=true: payments at the start of each period (Excel PV type 1).
export function pvAnnuity(rate, n, pmt, due = false) {
  if (n <= 0) return 0;
  const v = Math.abs(rate) < 1e-12 ? pmt * n : pmt * (1 - Math.pow(1 + rate, -n)) / rate;
  return due ? v * (1 + rate) : v;
}
// Level monthly saving (end of month) needed to build `target` in `years` at an annual return.
export function monthlySaving(target, years, annualReturn) {
  if (target <= 0) return 0;
  const n = Math.round(years * 12);
  if (n <= 0) return target;
  const r = Math.pow(1 + annualReturn, 1 / 12) - 1;
  if (Math.abs(r) < 1e-12) return target / n;
  return target * r / (Math.pow(1 + r, n) - 1);
}

/* ---------------- personal finance ratios (X-A 3.9) ---------------- */
// Benchmarks are the workbook's own: liquidity 4-6 months comfortable, debt-to-income above 35-40% excessive,
// leverage above 1 means assets do not cover liabilities, accumulated savings at least 3x income in the early 40s.
export function ratios(x) {
  const n = (v) => Math.max(0, +v || 0);
  const income = n(x.monthlyIncome), spend = n(x.monthlyExpenses), emi = n(x.monthlyEmi);
  const liquid = n(x.liquidAssets), invest = n(x.investments), physical = n(x.physicalAssets), debt = n(x.liabilities);
  const outflow = spend + emi;                       // monthly expenses including loan repayments
  const savings = income - outflow;
  const totalAssets = liquid + invest + physical;
  const netWorth = totalAssets - debt;
  const r = {
    monthlySurplus: savings,
    savingsRatio: income ? savings / income : null,
    expenseRatio: income ? outflow / income : null,
    liquidityRatio: outflow ? liquid / outflow : null, // months of expenses covered
    debtToIncome: income ? emi / income : null,
    leverage: totalAssets ? debt / totalAssets : (debt ? Infinity : null),
    solvency: totalAssets ? netWorth / totalAssets : null,
    netWorth, totalAssets,
    financialAssetsRatio: totalAssets ? (liquid + invest) / totalAssets : null,
    savingsToIncome: income ? (liquid + invest) / (income * 12) : null,
  };
  const age = +x.age || 0;
  r.checks = [
    check('liquidity', r.liquidityRatio, (v) => v >= 6 ? 'good' : v >= 4 ? 'ok' : 'act'),
    check('debtToIncome', r.debtToIncome, (v) => v <= 0.35 ? 'good' : v <= 0.40 ? 'ok' : 'act'),
    check('leverage', r.leverage, (v) => v <= 0.5 ? 'good' : v <= 1 ? 'ok' : 'act'),
    check('savingsRatio', r.savingsRatio, (v) => v > 0 ? 'info' : 'act'),
    check('savingsToIncome', r.savingsToIncome, (v) => age >= 40 && age < 46 ? (v >= 3 ? 'good' : 'act') : 'info'),
  ];
  return r;
}
function check(id, value, grade) { return { id, value, status: value == null || !isFinite(value) ? (value === Infinity ? 'act' : 'na') : grade(value) }; }

/* ---------------- life cover: needs-based approach (X-B 2.2) ---------------- */
// Corpus = PV of the income the family needs, at the inflation-adjusted rate, paid at the start of each year;
// plus loans outstanding; minus existing cover and investments. Never below zero.
export function lifeCover(x) {
  const n = (v) => Math.max(0, +v || 0);
  const rate = x.roundRate ? Math.round(realRate(+x.ret, +x.inflation) * 10000) / 10000 : realRate(+x.ret, +x.inflation);
  const corpus = pvAnnuity(rate, n(x.years), n(x.annualNeed), true);
  const required = corpus + n(x.loans);
  const available = n(x.existingCover) + n(x.investments);
  return { rate, corpus, required, available, additional: Math.max(0, required - available) };
}

/* ---------------- retirement: expense protection method (X-B 4.4.2) ---------------- */
export function retirement(x) {
  const n = (v) => Math.max(0, +v || 0);
  const yearsToGo = Math.max(0, n(x.retireAge) - n(x.age));
  const yearsIn = Math.max(0, n(x.lifeExpectancy) - Math.max(n(x.retireAge), n(x.age)));
  const monthlyToday = n(x.monthlyExpense) + n(x.extraMonthly);
  const monthlyAtRetirement = fv(+x.inflation, yearsToGo, monthlyToday);
  const rate = realRate(+x.postReturn, +x.inflation);
  const corpus = pvAnnuity(rate, yearsIn, monthlyAtRetirement * 12, true);
  const existingGrown = fv(+x.preReturn, yearsToGo, n(x.existing));
  const gap = Math.max(0, corpus - existingGrown);
  return { yearsToGo, yearsIn, monthlyAtRetirement, corpus, existingGrown, gap, monthly: monthlySaving(gap, yearsToGo, +x.preReturn) };
}

/* ---------------- goals (X-A chapter 2) ---------------- */
export function goal(g) {
  const years = Math.max(0, +g.years || 0);
  const future = fv(+g.inflation || 0, years, Math.max(0, +g.cost || 0));
  const savedGrown = fv(+g.ret || 0, years, Math.max(0, +g.saved || 0));
  const gap = Math.max(0, future - savedGrown);
  return { future, savedGrown, gap, monthly: monthlySaving(gap, years, +g.ret || 0) };
}

/* ---------------- risk profile (X-A 18.6.9, X-B chapter 18) ---------------- */
// Ability = capacity to absorb loss (X-B Table 18.1 factors). Willingness = attitude to risk.
// Every answer is scored on the same 1-5 scale, so no single answer carries extra weight.
// The profile is the lower of the two: advice has to fit both what you can bear and what you are comfortable with.
export const QUESTIONS = [
  { id: 'age', part: 'ability', q: 'How old are you?', o: ['60 or older', '50 to 59', '40 to 49', '30 to 39', 'Under 30'] },
  { id: 'dependants', part: 'ability', q: 'How many people depend on your income?', o: ['Four or more', 'Three', 'Two', 'One', 'None'] },
  { id: 'earners', part: 'ability', q: 'How many people in your household earn a regular income?', o: ['No one at the moment', 'Only me', 'Two', 'Three or more'] },
  { id: 'income', part: 'ability', q: 'Which best describes your income?', o: ['No regular income right now', 'It varies a lot from year to year', 'Steady business or professional income', 'Steady salary or pension'] },
  { id: 'cushion', part: 'ability', q: 'If your income stopped, how many months of expenses could your savings and deposits cover?', o: ['Less than 1 month', '1 to 3 months', '3 to 6 months', '6 to 12 months', 'More than 12 months'] },
  { id: 'horizon', part: 'ability', q: 'When will you need most of the money you plan to invest?', o: ['Within 1 year', 'In 1 to 3 years', 'In 3 to 5 years', 'In 5 to 10 years', 'After 10 years or more'] },
  { id: 'experience', part: 'willingness', q: 'Which of these have you invested in?', o: ['Only bank deposits, PPF, or insurance policies', 'Mutual funds, for less than 3 years', 'Mutual funds or shares, for 3 years or more', 'Shares, funds and other products, for many years, through at least one market fall'] },
  { id: 'fall', part: 'willingness', q: 'Your investments fall 20% over a few months. What would you most likely do?', o: ['Sell everything to stop further loss', 'Sell part of it', 'Hold and wait', 'Invest more, if my plan has room for it'] },
  { id: 'range', part: 'willingness', q: 'You invest ₹1,00,000 for one year. Which range of outcomes would you choose?', o: ['Ends between ₹1,04,000 and ₹1,07,000', 'Ends between ₹96,000 and ₹1,14,000', 'Ends between ₹88,000 and ₹1,25,000', 'Ends between ₹78,000 and ₹1,40,000'] },
  { id: 'objective', part: 'willingness', q: 'What matters most to you for this money?', o: ['Keeping its value steady', 'A regular income from it', 'Steady growth with moderate ups and downs', 'Highest long-term growth, accepting large ups and downs'] },
];
export const GRADES = ['Conservative', 'Moderate', 'Aggressive'];
const scoreOf = (q, i) => 1 + 4 * (i / (q.o.length - 1));
export const gradeOf = (score) => score < 2.5 ? 0 : score < 3.75 ? 1 : 2;

export function riskProfile(answers) {
  const parts = { ability: [], willingness: [] };
  for (const q of QUESTIONS) {
    const i = answers?.[q.id];
    if (!Number.isInteger(i) || i < 0 || i >= q.o.length) return null; // all questions must be answered
    parts[q.part].push(scoreOf(q, i));
  }
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const ability = avg(parts.ability), willingness = avg(parts.willingness);
  let abilityGrade = gradeOf(ability), willingnessGrade = gradeOf(willingness);
  const notes = [];
  if (answers.horizon === 0) { abilityGrade = 0; notes.push('horizon'); }               // money needed within a year
  else if (answers.horizon === 1 && abilityGrade > 1) { abilityGrade = 1; notes.push('horizon'); }
  if (answers.fall === 0) { willingnessGrade = 0; notes.push('fall'); }                 // would sell everything after a fall
  if (answers.cushion === 0) notes.push('cushion');
  const grade = Math.min(abilityGrade, willingnessGrade);
  if (willingnessGrade > abilityGrade) notes.push('wantsMore');
  if (abilityGrade > willingnessGrade) notes.push('canMore');
  return { ability, willingness, abilityGrade, willingnessGrade, grade, label: GRADES[grade], notes };
}

/* ---------------- fees (SEBI IA Regulations and guidelines; MITC) ---------------- */
// Limits apply to individual and HUF clients who are not accredited investors.
export const FEE_LIMITS = { fixedPerFamilyPerYear: 151000, auaPctPerYear: 2.5, advanceMonthsMax: 12, breakageMonthsMax: 3 };
export function feeProblems(plan) {
  const p = [];
  if (plan.mode === 'fixed') {
    const perYear = plan.period === 'one-time' ? +plan.amount : +plan.amount * (12 / (+plan.months || 12));
    if (!(perYear > 0)) p.push('amount missing');
    else if (perYear > FEE_LIMITS.fixedPerFamilyPerYear) p.push('above the fixed-fee limit of ₹1,51,000 a year per family');
  } else if (plan.mode === 'aua') {
    if (!(+plan.pct > 0)) p.push('percentage missing');
    else if (+plan.pct > FEE_LIMITS.auaPctPerYear) p.push('above the 2.5% a year of assets under advice limit');
  } else p.push('mode must be "fixed" or "aua"');
  if ((+plan.advanceMonths || 0) > FEE_LIMITS.advanceMonthsMax) p.push('advance fee for more than one year');
  return p;
}
// Refund when the client ends the service early: fee for the unexpired period, less a breakage fee
// of at most one quarter's fee.
export function refundOnExit(feePaid, monthsPaid, monthsUsed, breakageMonths = FEE_LIMITS.breakageMonthsMax) {
  const fee = Math.max(0, +feePaid || 0), m = Math.max(1, +monthsPaid || 1);
  const used = Math.min(m, Math.max(0, +monthsUsed || 0));
  const unexpired = fee * (m - used) / m;
  const breakage = Math.min(unexpired, fee * Math.min(+breakageMonths || 0, FEE_LIMITS.breakageMonthsMax) / m);
  return { unexpired, breakage, refund: unexpired - breakage };
}

/* ---------------- share links ---------------- */
// The summary travels inside the link (#/summary/<data>); nothing is stored on a server.
// Decoding never trusts the input: numbers are clamped, strings are cut short and escaped on display.
const b64u = { enc: (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))) };
export const encodeState = (st) => b64u.enc(JSON.stringify(st));
const num = (v, lo, hi, d = 0) => { const n = +v; return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const str = (v, max = 60) => String(v ?? '').replace(/[\u0000-\u001f]/g, '').slice(0, max);
export function sanitizeState(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const out = { name: str(s.name, 40), answers: {}, health: {}, cover: {}, retire: {}, goals: [] };
  for (const q of QUESTIONS) { const i = s.answers?.[q.id]; if (Number.isInteger(i) && i >= 0 && i < q.o.length) out.answers[q.id] = i; }
  const H = ['age', 'monthlyIncome', 'monthlyExpenses', 'monthlyEmi', 'liquidAssets', 'investments', 'physicalAssets', 'liabilities'];
  for (const k of H) if (s.health?.[k] != null) out.health[k] = num(s.health[k], 0, k === 'age' ? 110 : 1e12);
  const C = { annualNeed: [0, 1e10], years: [0, 80], inflation: [0, 0.2], ret: [0, 0.25], loans: [0, 1e11], existingCover: [0, 1e11], investments: [0, 1e12] };
  for (const [k, [lo, hi]] of Object.entries(C)) if (s.cover?.[k] != null) out.cover[k] = num(s.cover[k], lo, hi);
  const R = { age: [0, 110], retireAge: [0, 110], lifeExpectancy: [0, 120], monthlyExpense: [0, 1e9], extraMonthly: [0, 1e9], inflation: [0, 0.2], preReturn: [0, 0.25], postReturn: [0, 0.25], existing: [0, 1e12] };
  for (const [k, [lo, hi]] of Object.entries(R)) if (s.retire?.[k] != null) out.retire[k] = num(s.retire[k], lo, hi);
  for (const g of (Array.isArray(s.goals) ? s.goals : []).slice(0, 12)) {
    out.goals.push({ name: str(g?.name, 40) || 'Goal', cost: num(g?.cost, 0, 1e11), years: num(g?.years, 0, 60), inflation: num(g?.inflation, 0, 0.2, 0.06), saved: num(g?.saved, 0, 1e11), ret: num(g?.ret, 0, 0.25, 0.08) });
  }
  return out;
}
export function decodeState(s) {
  try { return sanitizeState(JSON.parse(b64u.dec(String(s)))); } catch { return null; }
}

/* ---------------- formatting ---------------- */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function inr(v, { short = false } = {}) {
  if (v == null || !isFinite(v)) return '—';
  const n = Math.round(v);
  if (short) {
    const a = Math.abs(n);
    const trim = (t) => t.includes('.') ? t.replace(/\.?0+$/, '') : t;
    const sg = n < 0 ? '−₹' : '₹';
    if (a >= 1e7) return sg + trim((a / 1e7).toFixed(a >= 1e9 ? 0 : 2)) + ' Cr';
    if (a >= 1e5) return sg + trim((a / 1e5).toFixed(2)) + ' L';
  }
  return (n < 0 ? '−₹' : '₹') + Math.abs(n).toLocaleString('en-IN');
}
export const pct = (v, d = 0) => v == null || !isFinite(v) ? '—' : (v * 100).toFixed(d) + '%';
