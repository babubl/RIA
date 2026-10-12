// ---------------------------------------------------------------
// YOUR DETAILS. This is the only file you need to edit (plus data/complaints.json each month).
// Anything still in [square brackets] keeps the site in PREVIEW mode: a banner says advisory
// services have not started, and the "book" buttons are switched off. This is deliberate:
// under the SEBI (Investment Advisers) Regulations, 2013 no one may act as, or hold themselves out as,
// an investment adviser before SEBI grants registration.
// ---------------------------------------------------------------
export default {
  // Name exactly as registered with SEBI. Individuals must use the term "Investment Adviser"
  // in all correspondence ("Part-time Investment Adviser" if registered as part-time).
  name: 'Babu Balasubramanian',
  initials: 'BB',
  title: 'Investment Adviser',            // or 'Part-time Investment Adviser'
  registrationType: 'Individual',         // as on the certificate
  city: 'Chennai',

  // SEBI registration and BASL membership (shown on every page and every printed page)
  sebiReg: '[INAXXXXXXXXX]',
  validity: 'Perpetual',                  // IA registration is valid until suspended or cancelled
  baslNo: '[XXXX]',
  registeredAddress: '[Registered office address as on the SEBI certificate]',
  cin: '',                                // only for a company; leave empty for an individual

  // Contact. Phone numbers with country code, digits only, e.g. 919876543210.
  // Use only these official numbers to contact clients (Investor Charter).
  phone: '[91XXXXXXXXXX]',
  whatsapp: '[91XXXXXXXXXX]',
  email: '[you@example.com]',
  booking: '[https://calendly.com/your-link]',
  workingHours: 'Monday to Friday, 10:00 am to 6:00 pm',

  // Officers. For an individual adviser you are usually the principal officer and compliance officer.
  principalOfficer: { name: 'Babu Balasubramanian', email: '[you@example.com]', phone: '[91XXXXXXXXXX]' },
  complianceOfficer: { name: 'Babu Balasubramanian', email: '[you@example.com]', phone: '[91XXXXXXXXXX]' },
  grievanceOfficer: { name: 'Babu Balasubramanian', email: '[you@example.com]', phone: '[91XXXXXXXXXX]' },

  // The SEBI office for your region, as shown in your registration letter.
  sebiOffice: '[SEBI regional or local office address for your region]',

  // How fast you reply to a complaint. SEBI's outer limit is 21 days; promise less if you can.
  replyWorkingDays: 10,

  // Shown on the About section.
  bio: '16 years in banking, payments, insurance and fintech, including PayPal and Fidelity Investments. I wrote "From Salary to Security", a personal finance book for first-time earners, and teach money basics to college students.',
  credentials: [
    '[NISM Series X-A: Investment Adviser (Level 1) — certificate no. and validity]',
    '[NISM Series X-B: Investment Adviser (Level 2) — certificate no. and validity]',
    'MA Economics',
    '[CFP — add once awarded]',
  ],

  // Fee plans. Limits for individual and HUF clients: ₹1,51,000 a year per family (fixed fee)
  // or 2.5% a year of assets under advice (AUA). Use one mode per client. The site checks these limits.
  // advanceMonths: the longest period you bill in advance (12 at most, and only if the client agrees).
  feeMode: 'fixed',
  fees: [
    { id: 'plan', name: 'Financial plan', mode: 'fixed', amount: '[25000]', period: 'one-time', advanceMonths: 0,
      what: ['Cash flow, net worth and personal finance ratios', 'Risk profile, agreed and signed', 'Goal-wise asset allocation and investment advice', 'Insurance, debt, tax and estate checks', 'Written plan with the rationale for every recommendation', 'Two review meetings within 3 months'] },
    { id: 'annual', name: 'Annual advisory', mode: 'fixed', amount: '[40000]', period: 'year', advanceMonths: 12,
      what: ['Everything in the financial plan', 'Quarterly reviews and rebalancing advice', 'Advice when your life or the rules change', 'Year-round access by phone, email and WhatsApp'] },
  ],
  breakageMonths: 3,       // breakage fee kept on early exit: at most one quarter's fee
  cefcom: false,           // true once you opt in to BSE's Centralised Fee Collection Mechanism (CeFCoM)

  // Payment details shown on the Fees page (fees only through banking channels; never cash).
  payment: '[Bank transfer, UPI or cheque to the account named in your agreement]',

  // Mandatory disclosures (IA Regulations: holdings, conflicts, AI use). Keep these true at all times.
  disclosures: {
    distribution: 'I do not distribute any financial product and receive no commission, referral fee or any other payment from product makers, at my family or group level. I advise Direct plans where they exist.',
    holdings: 'I may hold some of the securities or funds I advise on. Where I do, I will tell you in the advice itself. I do not trade against my advice for 15 days after giving it.',
    otherActivity: '[Describe any other business or employment, or write: I have no other business activity.]',
    ai: 'I do not use artificial intelligence tools to arrive at investment advice. If that changes, I will tell you the tools used, the stages they are used in and their limits before you rely on the advice.',
    disciplinary: 'There is no disciplinary history against me.',
  },

  // Annual compliance audit (disclose material observations).
  audit: [
    { year: '[2026-27]', status: '[Not yet due]', remarks: '' },
  ],
};
