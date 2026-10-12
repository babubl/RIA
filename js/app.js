import C from './config.js';
import * as E from './engine.js';
import * as T from './content.js';

const { esc, inr, pct } = E;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ph = (v) => typeof v === 'string' && /\[[^\]]*\]/.test(v);
const show = (v) => ph(v) ? `<span class="ph">${esc(v)}</span>` : esc(v);
const digits = (v) => String(v).replace(/\D/g, '');
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }

/* ---------------- preview mode ---------------- */
function placeholders(obj, path = '', out = []) {
  if (typeof obj === 'string') { if (ph(obj)) out.push(path); }
  else if (Array.isArray(obj)) obj.forEach((v, i) => placeholders(v, `${path}[${i}]`, out));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) placeholders(v, path ? `${path}.${k}` : k, out);
  return out;
}
const missing = placeholders(C);
const unregistered = ph(C.sebiReg) || ph(C.baslNo);
const feeIssues = C.fees.flatMap((f) => ph(f.amount) ? [] : E.feeProblems(f).map((p) => `${f.name}: ${p}`));
const PREVIEW = missing.length > 0 || feeIssues.length > 0;

/* ---------------- state (check-up answers) ---------------- */
const KEY = 'ria-checkup-v1';
const DEFAULT = {
  name: '', answers: {},
  health: { age: 35, monthlyIncome: 150000, monthlyExpenses: 70000, monthlyEmi: 25000, liquidAssets: 400000, investments: 1200000, physicalAssets: 6000000, liabilities: 2000000 },
  cover: { annualNeed: 900000, years: 25, inflation: 0.06, ret: 0.08, loans: 2000000, existingCover: 5000000, investments: 1200000 },
  retire: { age: 35, retireAge: 60, lifeExpectancy: 85, monthlyExpense: 70000, extraMonthly: 10000, inflation: 0.06, preReturn: 0.1, postReturn: 0.07, existing: 1200000 },
  goals: [{ name: 'Child’s higher education', cost: 2500000, years: 12, inflation: 0.08, saved: 0, ret: 0.1 }],
};
let S;
try { const raw = localStorage.getItem(KEY); S = raw ? E.sanitizeState(JSON.parse(raw)) : structuredClone(DEFAULT); } catch { S = structuredClone(DEFAULT); }
for (const k of ['health', 'cover', 'retire']) S[k] = { ...DEFAULT[k], ...S[k] };
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: keep in memory */ } }

/* ---------------- router ---------------- */
const VIEWS = { home, approach, checkup, summary, fees, learn, charter, disclosures, updates, contact };
function route() {
  const [name, ...rest] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const v = VIEWS[name] ? name : 'home';
  $$('.view').forEach((s) => s.classList.toggle('on', s.id === 'v-' + v));
  $$('#nav a').forEach((a) => { if (a.getAttribute('href') === '#' + v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  VIEWS[v]($('#v-' + v), rest.join('/'));
  document.title = (TITLES[v] || 'Home') + ' · ' + C.name + ', ' + C.title;
  window.scrollTo(0, 0);
}
const TITLES = { home: 'Fee-only advice', approach: 'How I work', checkup: 'Money check-up', summary: 'Your summary', fees: 'Fees', learn: 'Learn', charter: 'Investor charter', disclosures: 'Disclosures', updates: 'SEBI updates', contact: 'Contact' };
window.addEventListener('hashchange', route);
$('#menuBtn').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', String(o)); });

/* ---------------- chrome ---------------- */
function regLine() { return `SEBI Reg. No. ${show(C.sebiReg)} · BASL No. ${show(C.baslNo)}`; }
function plate() {
  return `<div class="plate"><dl>
    <dt>Name</dt><dd>${esc(C.name)}</dd>
    <dt>Type</dt><dd>${esc(C.registrationType)} ${esc(C.title)}</dd>
    <dt>SEBI registration</dt><dd>${show(C.sebiReg)}</dd>
    <dt>Validity</dt><dd>${esc(C.validity)}</dd>
    <dt>BASL membership</dt><dd>${show(C.baslNo)}</dd>
    ${C.cin ? `<dt>CIN</dt><dd>${esc(C.cin)}</dd>` : ''}
    <dt>Address</dt><dd>${show(C.registeredAddress)}</dd>
    <dt>Phone</dt><dd>${show(C.phone)}</dd>
    <dt>Email</dt><dd>${show(C.email)}</dd>
    <dt>Principal officer</dt><dd>${esc(C.principalOfficer.name)}</dd>
    <dt>Compliance officer</dt><dd>${esc(C.complianceOfficer.name)}</dd>
    <dt>SEBI office</dt><dd>${show(C.sebiOffice)}</dd>
  </dl></div>`;
}
function paintChrome() {
  $('#brandName').textContent = C.name;
  $('#brandTag').innerHTML = `${esc(C.title)} · ${regLine()}`;
  $('#seal').textContent = C.initials;
  $('#stdWarn').textContent = T.STANDARD_WARNING;
  $('#baslDisc').textContent = T.BASL_DISCLAIMER;
  $('#footId').innerHTML = `<b>${esc(C.name)}</b>, ${esc(C.registrationType)} ${esc(C.title)}<br>${regLine()} · Validity: ${esc(C.validity)}<br>${show(C.registeredAddress)}<br>${show(C.phone)} · ${show(C.email)}<br>Principal and compliance officer: ${esc(C.complianceOfficer.name)}<br>SEBI office: ${show(C.sebiOffice)}`;
  if (PREVIEW) {
    const bar = $('#previewBar');
    bar.hidden = false;
    bar.innerHTML = unregistered
      ? `<b>Preview — not for publication.</b> SEBI registration is pending, so no advisory services are offered and booking is switched off. ${missing.length} detail${missing.length === 1 ? '' : 's'} still to fill in <code>js/config.js</code>.`
      : `<b>Preview.</b> ${missing.length ? missing.length + ' detail(s) still to fill in js/config.js. ' : ''}${feeIssues.map(esc).join('; ')}`;
  }
}
function bookBtn(label = 'Book a discovery call', cls = 'btn', style = '') {
  const off = PREVIEW || ph(C.booking);
  return `<a class="${cls}" ${style ? `style="${style}"` : ''} href="${off ? '#contact' : esc(C.booking)}" ${off ? 'aria-disabled="true" tabindex="-1"' : 'target="_blank" rel="noopener"'}>${esc(label)}</a>`;
}

/* ---------------- views ---------------- */
const FLOW = `<svg viewBox="0 0 420 300" role="img" aria-labelledby="flowT flowD">
  <title id="flowT">Who pays whom</title><desc id="flowD">You pay the adviser a fee and receive advice. Product makers pay the adviser nothing. You invest directly in Direct plans.</desc>
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink)"/></marker>
  <marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--brass)"/></marker></defs>
  <g font-family="var(--sans)" font-size="13" fill="var(--ink)">
    <rect x="10" y="20" width="130" height="64" rx="12" fill="var(--brand)"/><text x="75" y="50" text-anchor="middle" fill="var(--on-brand)" font-weight="700" font-size="15">You</text><text x="75" y="69" text-anchor="middle" fill="var(--on-brand)" opacity=".75" font-size="11.5">the client</text>
    <rect x="280" y="20" width="130" height="64" rx="12" fill="var(--card)" stroke="var(--line-2)"/><text x="345" y="50" text-anchor="middle" font-weight="700" font-size="15">Adviser</text><text x="345" y="69" text-anchor="middle" fill="var(--ink-3)" font-size="11.5">SEBI-registered</text>
    <rect x="280" y="210" width="130" height="64" rx="12" fill="var(--card)" stroke="var(--line-2)" stroke-dasharray="4 4"/><text x="345" y="238" text-anchor="middle" font-weight="700">Product makers</text><text x="345" y="257" text-anchor="middle" fill="var(--ink-3)" font-size="11.5">AMCs, insurers</text>
    <rect x="10" y="210" width="130" height="64" rx="12" fill="var(--card)" stroke="var(--line-2)"/><text x="75" y="238" text-anchor="middle" font-weight="700">Your investments</text><text x="75" y="257" text-anchor="middle" fill="var(--ink-3)" font-size="11.5">in your name</text>
    <path d="M146 40H274" stroke="var(--brass)" stroke-width="2.5" marker-end="url(#ab)"/><text x="210" y="32" text-anchor="middle" fill="var(--brass)" font-weight="700">Fee</text>
    <path d="M274 66H146" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#ah)"/><text x="210" y="84" text-anchor="middle" fill="var(--ink-2)">Advice, in writing</text>
    <path d="M345 204V92" stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="5 5"/>
    <circle cx="345" cy="148" r="15" fill="var(--bad-soft)" stroke="var(--bad)" stroke-width="1.5"/><path d="M338 141l14 14M352 141l-14 14" stroke="var(--bad)" stroke-width="2.4" stroke-linecap="round"/>
    <text x="268" y="152" text-anchor="end" fill="var(--bad)" font-weight="700">No commission</text>
    <path d="M75 92V204" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#ah)"/><text x="88" y="152" fill="var(--ink-2)">Direct plans</text><text x="88" y="168" fill="var(--ink-2)">you invest yourself</text>
  </g></svg>`;

function home(el) {
  el.innerHTML = `
  <section class="hero"><div class="wrap grid">
    <div>
      <p class="kicker">${esc(C.title)} · ${esc(C.city)}</p>
      <h1>Advice paid for <em class="s">only</em> by you.</h1>
      <p class="lead">Financial planning and investment advice for families who want a plan, not a product pitch. I charge a fee, and I take nothing from any fund house or insurer. So the only reason to recommend anything is that it suits you.</p>
      <div class="row"><a class="btn" href="#checkup">Start the 10-minute money check-up</a><a class="btn ghost" href="#approach">How I work</a></div>
      <div class="facts"><span>No commission, ever</span><span>Risk profile before advice</span><span>Written reasons for every recommendation</span></div>
    </div>
    <figure class="flow" style="margin:0">${FLOW}<figcaption>How the money moves when you work with a fee-only adviser.</figcaption></figure>
  </div></section>

  <section class="band"><div class="wrap">
    <div class="head"><p class="kicker">The difference</p><h2>Adviser or distributor?</h2><p>Both are regulated, and both can be good at what they do. The difference is who pays them, and so whose interest the arrangement is built around.</p></div>
    <div class="scroll"><table class="tbl"><thead><tr><th></th><th>Investment adviser (me)</th><th>Distributor</th></tr></thead><tbody>
    ${T.COMPARE.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td class="me">${esc(b)}</td><td>${esc(c)}</td></tr>`).join('')}
    </tbody></table></div>
  </div></section>

  <section class="band alt"><div class="wrap">
    <div class="head"><p class="kicker">How it works</p><h2>Six steps, in this order</h2><p>Products come near the end, after your goals, cash flow, protection and risk profile are clear.</p></div>
    <ol class="steps">${T.PROCESS.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div></section>

  <section class="band"><div class="wrap g2" style="align-items:center">
    <div><p class="kicker">Before we talk</p><h2>A money check-up you keep</h2>
      <p class="muted">Ten minutes. Your personal finance ratios, a risk profile that separates what you can afford to risk from what you’re comfortable risking, how much life cover your family needs, what retirement will cost, and what each goal needs a month. It stays in your browser; share it with me only if you want to.</p>
      <div class="row" style="margin-top:18px"><a class="btn" href="#checkup">Start the check-up</a></div></div>
    <div class="card"><div class="g2" style="gap:14px">
      ${[['Liquidity', '6.2 months'], ['Debt to income', '17%'], ['Risk profile', 'Moderate'], ['Extra life cover', '₹1.26 Cr']].map(([l, v]) => `<div class="stat"><span class="l">${l}</span><span class="v">${v}</span></div>`).join('')}
    </div><p class="tiny" style="margin-top:14px">Sample figures for illustration.</p></div>
  </div></section>

  <section class="band ink"><div class="wrap g2">
    <div><p class="kicker" style="color:var(--brass-2)">About</p><h2>${esc(C.name)}</h2><p class="muted" style="margin-top:12px">${esc(C.bio)}</p></div>
    <div><ul class="list" style="border-top:1px solid color-mix(in srgb,var(--on-brand) 20%,transparent)">${C.credentials.map((c) => `<li style="border-color:color-mix(in srgb,var(--on-brand) 20%,transparent)">${show(c)}</li>`).join('')}</ul>
    <div class="row" style="margin-top:20px"><a class="btn brass" href="#fees">See fees</a>${bookBtn('Book a discovery call', 'btn ghost', 'color:var(--on-brand);border-color:color-mix(in srgb,var(--on-brand) 40%,transparent)')}</div></div>
  </div></section>`;
}

function approach(el) {
  el.innerHTML = `
  <section class="band"><div class="wrap">
    <div class="head"><p class="kicker">How I work</p><h1 style="font-size:clamp(2rem,4.6vw,3.2rem)">A plan first. Products last.</h1><p>I follow the six-step financial planning process. You get the reasons for every recommendation in writing, and you stay in control of your money throughout.</p></div>
    <ol class="steps">${T.PROCESS.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div></section>
  <section class="band alt"><div class="wrap">
    <div class="head"><p class="kicker">Scope</p><h2>What a plan covers</h2></div>
    <div class="scope">${T.SCOPE.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
  </div></section>
  <section class="band"><div class="wrap g2">
    <div class="card"><h3>What you can expect</h3><ul class="list">
      <li>A written agreement, the Most Important Terms and Conditions and the Investor Charter before any advice</li>
      <li>Your risk profile in writing, for you to review and agree to</li>
      <li>Advice that fits your risk profile, with the rationale signed and dated</li>
      <li>Direct plans, so no commission is built into what you buy</li>
      <li>My holdings in anything I advise on, and any conflict of interest, disclosed</li>
      <li>Records of our advice kept for at least five years</li>
    </ul></div>
    <div class="card"><h3>What I will never do</h3><ul class="list no">
      <li>Hold your money or securities, or ask you to transfer money to me for investing</li>
      <li>Ask for your login, password or OTP for any bank, demat or trading account</li>
      <li>Promise assured, guaranteed or fixed returns</li>
      <li>Give stock tips or trading calls</li>
      <li>Take commission, referral fees or anything else from product makers</li>
      <li>Trade against my own advice to you within 15 days of giving it</li>
    </ul></div>
  </div>
  <div class="wrap"><p class="note">You can implement the advice yourself, through any platform you like. If you want help implementing it, I do that only through Direct plans and products, with no implementation fee, and you are under no obligation to use it.</p></div></section>`;
}

/* ---------- check-up wizard ---------- */
const STEPS = [['you', 'Cash flow'], ['worth', 'Assets & loans'], ['risk', 'Risk profile'], ['cover', 'Life cover'], ['retire', 'Retirement'], ['goals', 'Goals']];
let step = 0;
function num(id, label, val, { money = false, pct: isPct = false, hint = '', min = 0, max, stepv } = {}) {
  const v = isPct ? +(val * 100).toFixed(2) : val;
  return `<div class="field"><label for="${id}">${label}</label><div class="${money ? 'money' : ''}"><input id="${id}" data-k="${id}" type="number" inputmode="decimal" min="${min}" ${max != null ? `max="${max}"` : ''} step="${stepv || (isPct ? 0.5 : money ? 1000 : 1)}" value="${esc(v)}" ${isPct ? 'data-pct="1"' : ''}></div>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
}
function bind(root, obj, after) {
  $$('input[data-k]', root).forEach((i) => i.addEventListener('input', () => {
    const key = i.dataset.k.split('.').pop();
    let v = i.value === '' ? 0 : +i.value;
    if (i.dataset.pct) v = v / 100;
    obj[key] = v; save(); after();
  }));
}
function checkup(el) {
  el.innerHTML = `<section class="band"><div class="wrap">
    <div class="head"><p class="kicker">Money check-up</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Where you stand, in ten minutes</h1><p>Use rough numbers; you can change them any time. Everything stays in this browser. The calculations follow the NISM investment adviser workbooks; they are for your understanding and are not investment advice.</p></div>
    <div class="wizard"><ol class="stepnav" id="stepnav"></ol><div id="pane"></div></div>
  </div></section>`;
  paintStep();
}
function paintStep() {
  const nav = $('#stepnav'), pane = $('#pane');
  if (!nav) return;
  nav.innerHTML = STEPS.map(([, t], i) => `<li><button type="button" data-i="${i}" ${i === step ? 'aria-current="step"' : ''} class="${i < step ? 'done' : ''}"><span class="n">${i + 1}</span><span class="t">${t}</span></button></li>`).join('');
  $$('button', nav).forEach((b) => b.addEventListener('click', () => { step = +b.dataset.i; paintStep(); }));
  const id = STEPS[step][0];
  pane.innerHTML = `<div class="card">${PANES[id]()}<div class="wnav">
    ${step > 0 ? '<button class="btn ghost" type="button" id="prev">Back</button>' : '<span></span>'}
    ${step < STEPS.length - 1 ? '<button class="btn" type="button" id="next">Next</button>' : '<button class="btn" type="button" id="finish">See my summary</button>'}
  </div></div>`;
  $('#prev')?.addEventListener('click', () => { step--; paintStep(); pane.scrollIntoView({ block: 'start' }); });
  $('#next')?.addEventListener('click', () => { step++; paintStep(); pane.scrollIntoView({ block: 'start' }); });
  $('#finish')?.addEventListener('click', () => { location.hash = '#summary/' + E.encodeState(S); });
  AFTER[id]?.(pane);
}
const PANES = {
  you: () => `<h3>Monthly cash flow</h3><p class="muted small">Take-home income after tax. Count big yearly costs (school fees, a holiday every few years) as a monthly average; leave out one-offs.</p>
    <div class="fields" style="margin-top:16px">
      <div class="field"><label for="nm">Your first name <span class="dim">(optional)</span></label><input id="nm" type="text" maxlength="40" value="${esc(S.name)}" autocomplete="given-name"></div>
      ${num('age', 'Your age', S.health.age, { max: 110 })}
      ${num('monthlyIncome', 'Household take-home income a month', S.health.monthlyIncome, { money: true })}
      ${num('monthlyExpenses', 'Household expenses a month, excluding EMIs', S.health.monthlyExpenses, { money: true })}
      ${num('monthlyEmi', 'All loan EMIs a month', S.health.monthlyEmi, { money: true })}
    </div><div class="out" id="o1"></div>`,
  worth: () => `<h3>What you own and owe</h3><p class="muted small">Current values. Include your home and its loan, so net worth and leverage are complete. Leave out personal jewellery and your car.</p>
    <div class="fields" style="margin-top:16px">
      ${num('liquidAssets', 'Liquid money', S.health.liquidAssets, { money: true, hint: 'Savings account, FDs maturing within 6 months, liquid funds' })}
      ${num('investments', 'Other financial investments', S.health.investments, { money: true, hint: 'Equity, mutual funds, PF, PPF, NPS, longer FDs' })}
      ${num('physicalAssets', 'Property and gold, including your home', S.health.physicalAssets, { money: true, hint: 'Counted in net worth and leverage, not in liquidity or savings' })}
      ${num('liabilities', 'Total loans outstanding', S.health.liabilities, { money: true, hint: 'Home, car, personal loans, credit card dues' })}
    </div><div class="out" id="o2"></div>`,
  risk: () => `<h3>Your risk profile</h3><p class="muted small">There are no right answers. The first six questions measure your <b>ability</b> to absorb a loss; the last four your <b>willingness</b>. Your profile is the lower of the two.</p>
    <div style="margin-top:18px">${E.QUESTIONS.map((q) => `<fieldset class="q"><legend>${esc(q.q)}<span class="tag">${q.part}</span></legend><div class="opts">
      ${q.o.map((o, i) => `<label><input type="radio" name="q-${q.id}" value="${i}" ${S.answers[q.id] === i ? 'checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`).join('')}</div>
    <div class="out" id="o3"></div>`,
  cover: () => `<h3>How much life cover does your family need?</h3><p class="muted small">The needs-based approach (NISM X-B 2.2): the corpus that would replace your income for your family, plus loans, less the cover and investments you already have.</p>
    <div class="fields" style="margin-top:16px">
      ${num('annualNeed', 'Yearly income your family would need', S.cover.annualNeed, { money: true, hint: 'Your income less your own expenses, EMIs and premiums' })}
      ${num('years', 'For how many years', S.cover.years, { max: 80, hint: 'e.g. until your spouse turns 80' })}
      ${num('loans', 'Loans to be repaid', S.cover.loans, { money: true })}
      ${num('existingCover', 'Life cover you already have', S.cover.existingCover, { money: true })}
      ${num('investments', 'Investments your family could use', S.cover.investments, { money: true })}
      ${num('inflation', 'Inflation', S.cover.inflation, { pct: true, max: 20 })}
      ${num('ret', 'Return on the corpus, after tax', S.cover.ret, { pct: true, max: 25 })}
    </div><div class="out" id="o4"></div>`,
  retire: () => `<h3>What will retirement cost?</h3><p class="muted small">The expense protection method (NISM X-B 4.4.2): today’s expenses plus what will rise in retirement, grown at inflation, funded for the years you’ll live after retiring.</p>
    <div class="fields" style="margin-top:16px">
      ${num('age', 'Your age', S.retire.age, { max: 110 })}
      ${num('retireAge', 'Age you want to retire', S.retire.retireAge, { max: 110 })}
      ${num('lifeExpectancy', 'Plan until age', S.retire.lifeExpectancy, { max: 120 })}
      ${num('monthlyExpense', 'Monthly expenses today that will continue', S.retire.monthlyExpense, { money: true })}
      ${num('extraMonthly', 'Extra monthly costs in retirement', S.retire.extraMonthly, { money: true, hint: 'Medical, travel, home help' })}
      ${num('existing', 'Savings already set aside for retirement', S.retire.existing, { money: true, hint: 'PF, NPS, PPF and so on' })}
      ${num('inflation', 'Inflation', S.retire.inflation, { pct: true, max: 20 })}
      ${num('preReturn', 'Return before retirement', S.retire.preReturn, { pct: true, max: 25 })}
      ${num('postReturn', 'Return after retirement', S.retire.postReturn, { pct: true, max: 25 })}
    </div><div class="out" id="o5"></div>`,
  goals: () => `<h3>Your other goals</h3><p class="muted small">Today’s cost, years away, and how fast that cost rises. The monthly figure uses the return you enter; it is an illustration, not a projection for any product.</p>
    <div id="glist" style="margin-top:12px"></div><button class="btn ghost sm" type="button" id="addg" style="margin-top:14px">Add a goal</button>`,
};
const AFTER = {
  you: (p) => {
    $('#nm', p).addEventListener('input', (e) => { S.name = e.target.value.slice(0, 40); save(); });
    bind(p, S.health, () => { S.retire.age = S.health.age; draw1(); }); draw1();
  },
  worth: (p) => { bind(p, S.health, draw2); draw2(); },
  risk: (p) => { $$('input[type=radio]', p).forEach((r) => r.addEventListener('change', () => { S.answers[r.name.slice(2)] = +r.value; save(); draw3(); })); draw3(); },
  cover: (p) => { bind(p, S.cover, draw4); draw4(); },
  retire: (p) => { bind(p, S.retire, draw5); draw5(); },
  goals: () => { drawGoals(); $('#addg').addEventListener('click', () => { if (S.goals.length < 12) { S.goals.push({ name: 'New goal', cost: 1000000, years: 5, inflation: 0.06, saved: 0, ret: 0.08 }); save(); drawGoals(); } }); },
};
function ratioRow(c, r) {
  const t = T.RATIO_TEXT[c.id];
  const v = c.value == null ? '—' : c.id === 'liquidity' ? c.value.toFixed(1) + ' months' : c.id === 'savingsToIncome' ? c.value.toFixed(1) + '×' : !isFinite(c.value) ? '—' : pct(c.value);
  const label = { good: 'Comfortable', ok: 'Watch', act: 'Act on this', info: 'For reference', na: 'Not enough data' }[c.status];
  return `<div class="ratio"><div><b>${t.name}</b> <span class="pill ${c.status}">${label}</span></div><div class="v">${v}</div><p>${esc(t[c.status] || t.info || '')}</p></div>`;
}
function draw1() {
  const r = E.ratios(S.health);
  $('#o1').innerHTML = `<div class="g3"><div class="stat"><span class="l">Monthly surplus</span><span class="v">${inr(r.monthlySurplus)}</span></div>
    <div class="stat"><span class="l">Savings ratio</span><span class="v">${pct(r.savingsRatio)}</span></div><div class="stat"><span class="l">Debt to income</span><span class="v">${pct(r.debtToIncome)}</span></div></div>`;
}
function draw2() {
  const r = E.ratios(S.health);
  $('#o2').innerHTML = `<div class="g2" style="margin-bottom:10px"><div class="stat"><span class="l">Net worth</span><span class="v">${inr(r.netWorth, { short: true })}</span></div><div class="stat"><span class="l">Financial assets share</span><span class="v">${pct(r.financialAssetsRatio)}</span></div></div>
    ${r.checks.map((c) => ratioRow(c, r)).join('')}`;
}
function profileBlock(p, compact = false) {
  if (!p) return `<p class="muted">Answer all ten questions to see your profile.</p>`;
  const meter = (g) => `<div class="meter">${[0, 1, 2].map((i) => `<span class="${i <= g ? 'on' : ''}"></span>`).join('')}</div>`;
  const d = T.PROFILE_TEXT[p.grade];
  return `<div class="g2"><div><span class="l dim small">Your risk profile</span><div class="big">${esc(p.label)}</div>${meter(p.grade)}<div class="legend"><span>Conservative</span><span style="text-align:center">Moderate</span><span style="text-align:right">Aggressive</span></div>
    <p class="small muted" style="margin-top:12px">Ability to absorb loss: <b>${E.GRADES[p.abilityGrade]}</b> · Willingness: <b>${E.GRADES[p.willingnessGrade]}</b></p></div>
    <div>${compact ? '' : '<span class="l dim small">What it describes (NISM X-B 18.2)</span>'}<ul class="list">${d.desc.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    ${p.notes.map((n) => `<p class="note ${n === 'cushion' ? 'red' : ''}">${esc(T.PROFILE_NOTES[n])}</p>`).join('')}`;
}
function draw3() { $('#o3').innerHTML = profileBlock(E.riskProfile(S.answers)); }
function draw4() {
  const r = E.lifeCover(S.cover);
  $('#o4').innerHTML = `<div class="g3"><div class="stat"><span class="l">Corpus needed</span><span class="v">${inr(r.required, { short: true })}</span></div>
    <div class="stat"><span class="l">You already have</span><span class="v">${inr(r.available, { short: true })}</span></div>
    <div class="stat"><span class="l">Additional cover</span><span class="v" style="color:${r.additional ? 'var(--bad)' : 'var(--ok)'}">${inr(r.additional, { short: true })}</span></div></div>
    <p class="tiny" style="margin-top:12px">Income corpus ${inr(r.corpus, { short: true })} at an inflation-adjusted rate of ${pct(r.rate, 2)}, paid at the start of each year, plus loans of ${inr(S.cover.loans, { short: true })}.</p>`;
}
function draw5() {
  const r = E.retirement(S.retire);
  $('#o5').innerHTML = `<div class="g2"><div class="stat"><span class="l">Monthly expenses when you retire</span><span class="v">${inr(r.monthlyAtRetirement)}</span></div>
    <div class="stat"><span class="l">Corpus needed at ${esc(S.retire.retireAge)}</span><span class="v">${inr(r.corpus, { short: true })}</span></div>
    <div class="stat"><span class="l">Your savings by then</span><span class="v">${inr(r.existingGrown, { short: true })}</span></div>
    <div class="stat"><span class="l">Monthly saving to close the gap</span><span class="v">${inr(r.monthly)}</span></div></div>
    <p class="tiny" style="margin-top:12px">${r.yearsToGo} years to go, ${r.yearsIn} years in retirement. Monthly saving is level, at the return before retirement you entered.</p>`;
}
function drawGoals() {
  const box = $('#glist');
  box.innerHTML = S.goals.length ? S.goals.map((g, i) => {
    const r = E.goal(g);
    return `<div class="goal" data-i="${i}">
      <div class="field"><label>Goal</label><input data-g="name" type="text" maxlength="40" value="${esc(g.name)}"></div>
      <div class="field"><label>Cost today</label><div class="money"><input data-g="cost" type="number" min="0" step="10000" value="${g.cost}"></div></div>
      <div class="field"><label>Years</label><input data-g="years" type="number" min="0" max="60" value="${g.years}"></div>
      <div class="field"><label>Inflation %</label><input data-g="inflation" data-pct="1" type="number" step="0.5" min="0" max="20" value="${+(g.inflation * 100).toFixed(2)}"></div>
      <div class="field"><label>Saved</label><div class="money"><input data-g="saved" type="number" min="0" step="10000" value="${g.saved}"></div></div>
      <div class="field"><label>Return %</label><input data-g="ret" data-pct="1" type="number" step="0.5" min="0" max="25" value="${+(g.ret * 100).toFixed(2)}"></div>
      <button type="button" class="x" data-del aria-label="Remove ${esc(g.name)}">✕</button>
      <p class="small muted" style="grid-column:1/-1;margin:0">Will cost <b>${inr(r.future, { short: true })}</b> in ${g.years} years · save <b>${inr(r.monthly)}</b> a month</p></div>`;
  }).join('') : '<p class="muted">No goals yet.</p>';
  $$('.goal', box).forEach((row) => {
    const g = S.goals[+row.dataset.i];
    $$('input', row).forEach((inp) => inp.addEventListener('change', () => {
      const k = inp.dataset.g; g[k] = k === 'name' ? inp.value.slice(0, 40) : (inp.dataset.pct ? (+inp.value || 0) / 100 : +inp.value || 0); save(); drawGoals();
    }));
    $('[data-del]', row).addEventListener('click', () => { S.goals.splice(+row.dataset.i, 1); save(); drawGoals(); });
  });
}

/* ---------- summary ---------- */
function summary(el, enc) {
  const st = enc ? E.decodeState(enc) : S;
  if (!st) { el.innerHTML = `<section class="band"><div class="wrap narrow"><h2>This link doesn’t open</h2><p class="muted">It may have been cut short when it was shared. <a href="#checkup">Start a fresh check-up</a>.</p></div></section>`; return; }
  const H = { ...DEFAULT.health, ...st.health }, Cv = { ...DEFAULT.cover, ...st.cover }, R = { ...DEFAULT.retire, ...st.retire };
  const r = E.ratios(H), p = E.riskProfile(st.answers), cov = E.lifeCover(Cv), ret = E.retirement(R);
  const link = location.href.split('#')[0] + '#summary/' + E.encodeState(st);
  const msg = `Hello ${C.name.split(' ')[0]}, here is my money check-up summary: ${link}`;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  el.innerHTML = `<section class="band"><div class="wrap" style="max-width:900px">
    <div class="row no-print" style="margin-bottom:18px;justify-content:space-between"><a href="#checkup" class="small">← Edit answers</a>
      <div class="row"><button class="btn ghost sm" type="button" id="print">Save as PDF</button><button class="btn ghost sm" type="button" id="copy">Copy link</button>
      ${ph(C.whatsapp) ? '' : `<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${digits(C.whatsapp)}?text=${encodeURIComponent(msg)}">Send on WhatsApp</a>`}
      ${ph(C.email) ? '' : `<a class="btn ghost sm" href="mailto:${esc(C.email)}?subject=${encodeURIComponent('My money check-up')}&body=${encodeURIComponent(msg)}">Email</a>`}</div></div>
    <article class="doc">
      <p class="kicker">Money check-up summary</p>
      <h1 style="font-size:clamp(1.9rem,4vw,2.6rem)">${st.name ? esc(st.name) + '’s' : 'Your'} financial position</h1>
      <div class="meta"><span>${today}</span><span>Prepared with the tool on ${esc(C.name)}’s website</span></div>
      <p class="note">This summary is for your understanding and to prepare for a first conversation. It is not investment advice. Advice is given only after we sign an agreement, complete KYC and you review and agree your risk profile.</p>

      <h2>1. Personal finance ratios</h2>
      <div class="g3" style="margin-bottom:8px"><div class="stat"><span class="l">Monthly surplus</span><span class="v">${inr(r.monthlySurplus)}</span></div><div class="stat"><span class="l">Net worth</span><span class="v">${inr(r.netWorth, { short: true })}</span></div><div class="stat"><span class="l">Savings ratio</span><span class="v">${pct(r.savingsRatio)}</span></div></div>
      ${r.checks.map((c) => ratioRow(c, r)).join('')}

      <h2>2. Risk profile</h2>${profileBlock(p, true)}

      <h2>3. Life cover</h2>
      <div class="g3"><div class="stat"><span class="l">Needed</span><span class="v">${inr(cov.required, { short: true })}</span></div><div class="stat"><span class="l">Already have</span><span class="v">${inr(cov.available, { short: true })}</span></div><div class="stat"><span class="l">Additional cover</span><span class="v">${inr(cov.additional, { short: true })}</span></div></div>
      <p class="tiny">${inr(Cv.annualNeed)} a year for ${Cv.years} years at ${pct(Cv.inflation, 1)} inflation and ${pct(Cv.ret, 1)} return, plus loans of ${inr(Cv.loans)}.</p>

      <h2>4. Retirement</h2>
      <div class="g2"><div class="stat"><span class="l">Monthly expenses at ${R.retireAge}</span><span class="v">${inr(ret.monthlyAtRetirement)}</span></div><div class="stat"><span class="l">Corpus needed</span><span class="v">${inr(ret.corpus, { short: true })}</span></div>
      <div class="stat"><span class="l">Savings by then</span><span class="v">${inr(ret.existingGrown, { short: true })}</span></div><div class="stat"><span class="l">Monthly saving needed</span><span class="v">${inr(ret.monthly)}</span></div></div>
      <p class="tiny">Age ${R.age}, retiring at ${R.retireAge}, planning to ${R.lifeExpectancy}. Inflation ${pct(R.inflation, 1)}; return ${pct(R.preReturn, 1)} before and ${pct(R.postReturn, 1)} after retirement.</p>

      <h2>5. Goals</h2>
      ${st.goals.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Goal</th><th>Cost today</th><th>Years</th><th>Future cost</th><th>Monthly saving</th></tr></thead><tbody>
      ${st.goals.map((g) => { const x = E.goal(g); return `<tr><td>${esc(g.name)}</td><td>${inr(g.cost, { short: true })}</td><td>${g.years}</td><td>${inr(x.future, { short: true })}</td><td>${inr(x.monthly)}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="tiny">Future cost grows at each goal’s inflation rate. Monthly saving assumes the return entered for each goal.</p>` : '<p class="muted">No goals added.</p>'}

      <h2>What happens next</h2>
      <ol class="list num"><li>A discovery call, without charge or obligation, to understand your situation. No advice is given on this call.</li><li>If we both want to go ahead: the agreement, MITC, Investor Charter and fee, in writing.</li><li>KYC, then your risk profile, which you review and sign.</li><li>Your written plan, with the reasons for each recommendation.</li></ol>
      <div class="print-only" style="margin-top:18px;font-size:8.5pt"><p><b>${esc(C.name)}</b>, ${esc(C.registrationType)} ${esc(C.title)} · SEBI Reg. No. ${esc(C.sebiReg)} · BASL No. ${esc(C.baslNo)} · ${esc(C.registeredAddress)} · ${esc(C.phone)} · ${esc(C.email)}</p><p><b>${T.STANDARD_WARNING}</b></p><p>${T.BASL_DISCLAIMER}</p></div>
    </article></div></section>`;
  $('#print').addEventListener('click', () => window.print());
  $('#copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch { prompt('Copy this link', link); } });
}

/* ---------- fees ---------- */
function fees(el) {
  const per = { 'one-time': 'one-time', year: 'a year', quarter: 'a quarter', month: 'a month' };
  el.innerHTML = `<section class="band"><div class="wrap">
    <div class="head"><p class="kicker">Fees</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">One fee. Nothing hidden in products.</h1><p>You pay me directly, through your bank. Because I take no commission, the products I recommend are Direct plans, which cost you less every year you hold them.</p></div>
    <div class="g2">${C.fees.map((f) => { const probs = ph(f.amount) ? [] : E.feeProblems(f); return `<div class="card plan">
      <h3>${esc(f.name)}</h3><div class="price">${ph(f.amount) ? show(f.amount) : f.mode === 'aua' ? esc(f.pct) + '%' : inr(+f.amount)}</div><div class="per">${f.mode === 'aua' ? 'of assets under advice, a year' : per[f.period] || esc(f.period)} · plus GST</div>
      ${probs.length ? `<p class="flag" style="margin-top:10px">Check: ${esc(probs.join('; '))}</p>` : ''}
      <ul>${f.what.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>`; }).join('')}</div>
    <p class="small muted" style="margin-top:14px">The same fee basis applies to every client who chooses the same service. One fee mode per family: fixed fee or a percentage of assets under advice, not both.</p>
  </div></section>
  <section class="band alt"><div class="wrap g2">
    <div><h2>The rules on advisers’ fees</h2><p class="muted">Set by SEBI for individual and HUF clients (not accredited investors).</p>
      <ul class="list">
        <li><b>Limit:</b> ₹1,51,000 a year per family under the fixed-fee mode, or 2.5% a year of assets under advice under the AUA mode.</li>
        <li><b>Advance:</b> only if you agree, and for no more than one year at a time.</li>
        <li><b>Leaving early:</b> you get back the fee for the unexpired period, less a breakage fee of at most one quarter’s fee.</li>
        <li><b>Payment:</b> ${esc(ph(C.payment) ? 'Cheque, bank transfer or UPI' : C.payment)}. Never cash.${C.cefcom ? ' You can also pay through BSE’s Centralised Fee Collection Mechanism (CeFCoM).' : ''}</li>
        <li><b>Receipts:</b> a signed receipt for every payment.</li>
      </ul></div>
    <div class="card"><h3>If you leave early: refund calculator</h3>
      <div class="fields" style="margin-top:14px">${num('rf-fee', 'Fee paid in advance', 40000, { money: true })}${num('rf-m', 'Months it covered', 12, { max: 12 })}${num('rf-u', 'Months used', 4, { max: 12 })}</div>
      <div class="out" id="rf"></div></div>
  </div></section>`;
  const calc = () => { const r = E.refundOnExit(+$('#rf-fee').value, +$('#rf-m').value, +$('#rf-u').value, C.breakageMonths);
    $('#rf').innerHTML = `<div class="g3"><div class="stat"><span class="l">Unexpired fee</span><span class="v">${inr(r.unexpired)}</span></div><div class="stat"><span class="l">Breakage fee</span><span class="v">${inr(r.breakage)}</span></div><div class="stat"><span class="l">Your refund</span><span class="v" style="color:var(--ok)">${inr(r.refund)}</span></div></div>`; };
  $$('#rf-fee,#rf-m,#rf-u').forEach((i) => i.addEventListener('input', calc)); calc();
}

/* ---------- learn ---------- */
function learn(el, id) {
  const a = T.LEARN.find((x) => x.id === id);
  if (a) {
    const i = T.LEARN.indexOf(a), next = T.LEARN[(i + 1) % T.LEARN.length];
    el.innerHTML = `<section class="band"><div class="wrap"><article class="prose"><a href="#learn" class="small">← All guides</a>
      <h1 style="font-size:clamp(1.9rem,4.4vw,2.9rem);margin:16px 0 8px">${esc(a.t)}</h1><p class="src">Source: NISM Series ${esc(a.src)}</p>
      ${a.body.map((p) => `<p>${esc(p)}</p>`).join('')}
      <hr class="rule"><p class="small">Next: <a href="#learn/${next.id}">${esc(next.t)}</a></p></article></div></section>`;
    return;
  }
  el.innerHTML = `<section class="band"><div class="wrap">
    <div class="head"><p class="kicker">Learn</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Short guides, straight from the syllabus</h1><p>Each guide comes from the NISM investment adviser workbooks (Series X-A and X-B), written in plain words. General information, not advice.</p></div>
    <div class="g3">${T.LEARN.map((x) => `<a class="lcard" href="#learn/${x.id}"><span class="src">NISM ${esc(x.src)}</span><h3>${esc(x.t)}</h3></a>`).join('')}</div>
  </div></section>`;
}

/* ---------- investor charter ---------- */
function charter(el) {
  const c = T.CHARTER;
  el.innerHTML = `<section class="band"><div class="wrap narrow" style="margin:0 auto">
    <p class="kicker">Investor charter</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Investor Charter for Investment Advisers</h1>
    <p class="muted">As issued by SEBI (circular dated June 2, 2025). You also receive a copy when we start working together.</p>
    <h2 style="margin-top:34px">Vision</h2><p>${esc(c.vision)}</p>
    <h2 style="margin-top:28px">Mission</h2><p>${esc(c.mission)}</p>
    <h2 style="margin-top:28px">Business conduct of investment advisers</h2><ul class="list">${c.conduct.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2 style="margin-top:28px">Services provided to investors</h2><ul class="list">${c.services.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2 style="margin-top:28px">Your rights</h2><div class="chips" style="margin-top:12px">${c.rights.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
    <h2 style="margin-top:28px">Do’s</h2><ul class="list">${c.dos.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2 style="margin-top:28px">Don’ts</h2><ul class="list no">${c.donts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2 style="margin-top:28px">Grievance redressal</h2>${grievance()}
  </div></section>`;
}
function grievance() {
  return `<ol class="list num">
    <li><b>Write to me first.</b> ${show(C.grievanceOfficer.email)} · ${show(C.grievanceOfficer.phone)}. I reply within ${esc(C.replyWorkingDays)} working days and resolve complaints as fast as possible, and in any case within 21 days.</li>
    <li><b>If you are not satisfied,</b> lodge it on <a href="${T.LINKS.scores}" target="_blank" rel="noopener">SEBI SCORES</a>. It is reviewed first by BASL (the supervisory body for advisers) and then, if needed, by SEBI. SEBI helpline: ${T.LINKS.sebiHelpline}.</li>
    <li><b>If you are still not satisfied,</b> start online conciliation or arbitration on <a href="${T.LINKS.odr}" target="_blank" rel="noopener">SMART ODR</a>.</li>
    <li><b>By post:</b> ${esc(T.LINKS.sebiHO)}.</li></ol>`;
}

/* ---------- disclosures ---------- */
async function disclosures(el) {
  const officers = [['Principal officer', C.principalOfficer], ['Compliance officer', C.complianceOfficer], ['Grievance officer', C.grievanceOfficer]];
  el.innerHTML = `<section class="band"><div class="wrap">
    <div class="head"><p class="kicker">Disclosures</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Everything SEBI asks me to tell you</h1><p>Registration, people, conflicts, complaints and audit. Kept up to date; complaint data by the 7th of every month.</p></div>
    <div class="g2" style="align-items:start">${plate()}
      <div class="card"><h3>Disclosures</h3><dl style="margin:12px 0 0">
        ${[['Distribution and commission', C.disclosures.distribution], ['My holdings', C.disclosures.holdings], ['Other business or employment', C.disclosures.otherActivity], ['Use of artificial intelligence', C.disclosures.ai], ['Disciplinary history', C.disclosures.disciplinary]]
          .map(([k, v]) => `<dt style="font-weight:700;margin-top:12px">${k}</dt><dd style="margin:2px 0 0" class="small muted">${show(v)}</dd>`).join('')}</dl></div></div>

    <h2 style="margin-top:56px">Grievance escalation matrix</h2>
    <div class="scroll" style="margin-top:16px"><table class="tbl"><thead><tr><th>Designation</th><th>Name</th><th>Address</th><th>Phone</th><th>Email</th><th>Working hours</th></tr></thead><tbody>
      ${officers.map(([d, o]) => `<tr><td>${d}</td><td>${esc(o.name)}</td><td>${show(C.registeredAddress)}</td><td>${show(o.phone)}</td><td>${show(o.email)}</td><td>${esc(C.workingHours)}</td></tr>`).join('')}
    </tbody></table></div>
    <div style="margin-top:22px" class="narrow">${grievance()}</div>

    <h2 style="margin-top:56px">Complaints data</h2><div id="cmp" class="muted">Loading…</div>

    <h2 style="margin-top:56px">Annual compliance audit</h2>
    <div class="scroll" style="margin-top:16px"><table class="tbl"><thead><tr><th>Financial year</th><th>Status</th><th>Remarks</th></tr></thead><tbody>
      ${C.audit.map((a) => `<tr><td>${show(a.year)}</td><td>${show(a.status)}</td><td>${show(a.remarks || 'None')}</td></tr>`).join('')}</tbody></table></div>

    <h2 style="margin-top:56px">Most Important Terms and Conditions</h2><p class="muted">The terms SEBI requires in every advisory agreement (MITC, February 2025).</p>
    <ol class="list num narrow">${T.MITC.map((m) => `<li>${esc(m)}</li>`).join('')}</ol>

    <h2 style="margin-top:56px">Verify me</h2><p class="muted">Check my registration on <a href="${T.LINKS.sebiList}" target="_blank" rel="noopener">SEBI’s list of registered investment advisers</a>. ${esc(T.BASL_DISCLAIMER)}</p>
  </div></section>`;
  try {
    const d = await (await fetch('data/complaints.json', { cache: 'no-cache' })).json();
    const cell = (v) => v === '' || v == null ? '—' : esc(v);
    const trend = (rows) => rows.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Period</th><th>Carried forward</th><th>Received</th><th>Resolved</th><th>Pending</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.period)}</td><td>${cell(r.carried)}</td><td>${cell(r.received)}</td><td>${cell(r.resolved)}</td><td>${cell(r.pending)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">No data yet.</p>';
    $('#cmp').innerHTML = `<p class="small">Data for the month ending ${show(d.asOf)}.</p>
      <div class="scroll" style="margin-top:12px"><table class="tbl"><thead><tr><th>Received from</th><th>Pending at end of last month</th><th>Received</th><th>Resolved</th><th>Total pending</th><th>Pending over 3 months</th><th>Average resolution time (days)</th></tr></thead><tbody>
      ${d.lastMonth.map((r) => `<tr><td>${esc(r.from)}</td><td>${cell(r.pendingLastMonth)}</td><td>${cell(r.received)}</td><td>${cell(r.resolved)}</td><td>${cell(r.pending)}</td><td>${cell(r.over3Months)}</td><td>${cell(r.avgResolutionDays)}</td></tr>`).join('')}</tbody></table></div>
      <h3 style="margin-top:24px">Monthly trend</h3>${trend(d.monthly)}<h3 style="margin-top:24px">Annual trend</h3>${trend(d.annual)}`;
  } catch { $('#cmp').textContent = 'Complaints data could not be loaded. Please write to me for it.'; }
}

/* ---------- SEBI updates ---------- */
async function updates(el) {
  el.innerHTML = `<section class="band"><div class="wrap narrow" style="margin:0 auto"><p class="kicker">SEBI updates</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Rules for investment advisers</h1>
    <p class="muted">Recent SEBI circulars about investment advisers, refreshed daily from sebi.gov.in. Read the circular itself for the exact text.</p><div id="sebi" style="margin-top:22px">Loading…</div></div></section>`;
  try {
    const d = await (await fetch('data/sebi.json', { cache: 'no-cache' })).json();
    const fmt = (s) => { const t = new Date(s + 'T00:00:00'); return isNaN(t) ? esc(s) : t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
    $('#sebi').innerHTML = `<ul class="list">${d.items.map((i) => `<li><span class="tiny">${fmt(i.date)} · ${esc(i.type)}</span><br><a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a></li>`).join('')}</ul>
      <p class="tiny" style="margin-top:14px">Last checked ${fmt(String(d.updatedAt).slice(0, 10))}. All circulars: <a href="${T.LINKS.sebiCirculars}" target="_blank" rel="noopener">sebi.gov.in</a>.</p>`;
  } catch { $('#sebi').innerHTML = `<a href="${T.LINKS.sebiCirculars}" target="_blank" rel="noopener">See SEBI’s circulars</a>`; }
}

/* ---------- contact ---------- */
function contact(el) {
  el.innerHTML = `<section class="band"><div class="wrap g2" style="align-items:start">
    <div><p class="kicker">Contact</p><h1 style="font-size:clamp(2rem,4.6vw,3.1rem)">Let’s talk about your plan</h1>
      <p class="muted">The first conversation is a discovery call, without charge or obligation: I learn about your situation and explain how I work. No advice is given until we sign an agreement and agree your risk profile.</p>
      ${PREVIEW && unregistered ? '<p class="note red">Advisory services have not started yet: SEBI registration is pending. Booking opens once registration is granted.</p>' : ''}
      <div class="row" style="margin-top:20px">${bookBtn()}
        ${ph(C.whatsapp) ? '' : `<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${digits(C.whatsapp)}">WhatsApp</a>`}
        ${ph(C.email) ? '' : `<a class="btn ghost" href="mailto:${esc(C.email)}">Email</a>`}</div>
      <p class="small" style="margin-top:22px">I will contact you only from <b>${show(C.phone)}</b> and <b>${show(C.email)}</b>. If anyone else claims to call on my behalf, please report it to me.</p>
      <h3 style="margin-top:30px">Useful to have for the first meeting</h3>
      <ul class="list"><li>Your <a href="#checkup">money check-up summary</a></li><li>Latest salary slip or income summary, and loan statements</li><li>Mutual fund and demat statements (CAS), PF, PPF and NPS balances</li><li>Insurance policies</li></ul></div>
    ${plate()}
  </div></section>`;
}

/* ---------------- boot ---------------- */
paintChrome();
route();
