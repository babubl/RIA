// Text content. Sources: NISM Series X-A (Sep 2026 edition) and X-B (Dec 2025 edition) workbooks,
// SEBI (Investment Advisers) Regulations, 2013 as summarised there, SEBI's Investor Charter for IAs
// (circular dated June 2, 2025) and the MITC for IAs (circular dated February 17, 2025).

export const STANDARD_WARNING = 'Investment in securities market are subject to market risks. Read all the related documents carefully before investing.';
export const BASL_DISCLAIMER = 'Registration granted by SEBI, membership of BASL and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.';

export const LINKS = {
  scores: 'https://scores.sebi.gov.in/',
  odr: 'https://smartodr.in/',
  sebiList: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
  sebiCirculars: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0',
  sebiHelpline: '1800 22 7575 / 1800 266 7575',
  sebiHO: 'Office of Investor Assistance and Education, Securities and Exchange Board of India, SEBI Bhavan, Plot No. C4-A, ‘G’ Block, Bandra-Kurla Complex, Bandra (E), Mumbai 400051',
};

// X-A 1.5: the six-step financial planning process
export const PROCESS = [
  ['Agree how we will work', 'We set out the scope of work and the terms in a written agreement, along with the fee, before any advice. You get the Most Important Terms and Conditions and the Investor Charter at this stage.'],
  ['Gather your data and goals', 'Income, expenses, assets, loans, insurance, and each goal as an amount and a date. KYC is completed here.'],
  ['Analyse where you stand', 'Cash flow, net worth and personal finance ratios, your risk profile (which you see and sign), and how much each goal needs.'],
  ['Recommend a plan', 'A written plan with an asset allocation for each goal and the reasons for every recommendation. Advice uses Direct plans, so no commission is built into what you buy.'],
  ['Implement', 'You act on the advice through your own accounts. I never handle your money, and I never ask for your login, password or OTP.'],
  ['Monitor and review', 'Your life and the markets change. We review the plan, rebalance and update your risk profile when your family, income, assets or loans change.'],
];

// X-A 1.3: scope of financial planning
export const SCOPE = [
  ['Cash flow and budgeting', 'Where the money goes, an emergency fund, and a savings rate that fits your goals.'],
  ['Insurance', 'Life cover sized to what your family would need, and health cover. Insurance first, investment second.'],
  ['Debt', 'Which loans to prepay, which to keep, and whether a new loan fits your income.'],
  ['Investments and asset allocation', 'The mix of equity, debt, gold and cash for each goal, and the products to hold it in.'],
  ['Tax', 'Using the deductions and tax treatment of each product well, within the law.'],
  ['Retirement', 'How much you need, how to build it, and how to draw it down.'],
  ['Estate', 'Will, nominations and how your assets pass to the people you choose.'],
];

// X-A 1.6, 18.6.7, 18.6.15, 18.6.16
export const COMPARE = [
  ['Who pays', 'You pay a fee. Nobody else pays me.', 'The product maker pays commission, built into the product cost.'],
  ['Products', 'Direct plans, without commission.', 'Regular plans, with commission.'],
  ['Duty to you', 'Fiduciary: your interest comes first, by regulation.', 'Must sell suitable products. Advice is incidental to the sale.'],
  ['Risk profile', 'Required before any advice. You see it and agree to it.', 'Used to check a product is suitable.'],
  ['Records', 'Written rationale for every piece of advice, kept for 5 years.', 'Transaction records.'],
  ['Regulated by', 'SEBI, supervised by BSE Administration & Supervision Ltd (BASL).', 'SEBI and AMFI (for mutual funds).'],
];

// MITC for investment advisers (SEBI, February 2025), with the April 2025 change allowing up to one year's advance fee.
export const MITC = [
  'I can accept only advisory fees from you. I cannot hold your money or securities in any account of mine.',
  'I do not guarantee returns, accuracy or risk-free investments. All advice is subject to market risk.',
  'Any scheme with assured, guaranteed or fixed returns is prohibited, and I cannot offer one.',
  'For any product outside SEBI’s purview, I will tell you so and take your declaration that SEBI’s grievance process will not be available for it.',
  'I cannot execute any trade for you without your specific consent for each trade.',
  'Fees are capped for individual and HUF clients: ₹1,51,000 a year per family (fixed fee) or 2.5% a year of assets under advice (AUA). Statutory charges are extra. The caps do not apply to non-individuals or accredited investors.',
  'If you agree, fees may be charged in advance for up to one year. If the service ends early, you may ask for a refund of the fee for the unexpired period; I may keep a breakage fee of at most one quarter’s fee.',
  'Fees are paid by cheque, online bank transfer, UPI or another banking channel. Cash is not accepted. You may also pay through BSE’s Centralised Fee Collection Mechanism (CeFCoM) if I have opted in.',
  'You share your financial details with me: income, investments, loans and so on, and keep them updated.',
  'I assess your risk profile and suitability before advising and keep it current. You receive your risk profile in writing.',
  'I do not provide distribution services to you or your family, and I advise Direct plans where available. I will tell you promptly about any conflict of interest.',
  'Complaints: first to me; then SEBI SCORES; then online dispute resolution through SMART ODR.',
  'SEBI registration, BASL membership and NISM certification do not guarantee my performance or assure returns.',
  'Keep your email and mobile number updated with me.',
  'I will never ask for your login, password or OTP for any trading, demat or bank account. Do not share them with anyone, including me.',
];

// Investor Charter for investment advisers (SEBI circular dated June 2, 2025)
export const CHARTER = {
  vision: 'Invest with knowledge and safety.',
  mission: 'Every investor should be able to invest in the right investment products based on their needs, manage and monitor them to meet their goals, access reports, and enjoy financial wellness.',
  conduct: [
    'Enter into an agreement with the client covering fees, conflicts of interest and confidentiality.',
    'Carry out a fair and unbiased risk profiling and suitability assessment of the client.',
    'Get an annual compliance audit done.',
    'Disclose the status of complaints on the website.',
    'Disclose the name, proprietor’s name, type of registration, registration number, validity, complete address, telephone numbers and email of the adviser, and the address of the relevant SEBI office, on the website.',
    'Employ only qualified and certified people.',
    'Deal with clients only from official numbers.',
    'Keep records of interactions with clients and prospective clients, including all advice-related conversations.',
    'Follow the Advertisement Code for investment advisers.',
    'Be fair to clients who choose the same or similar services.',
  ],
  services: [
    'Onboard clients, giving them a copy of the agreement and completing KYC.',
    'Disclose the nature of the business, affiliations and compensation, in the agreement.',
    'Not access clients’ accounts or holdings to give advice.',
    'Disclose the risk profile to the client.',
    'Disclose any conflict of interest arising from other activities.',
    'Disclose the extent of use of artificial intelligence tools in the advisory services.',
    'Give advice based on the client’s risk profile and suitability.',
    'Treat advisory clients with honesty and integrity.',
    'Disclose all material facts about the products advised, including risks, obligations and costs.',
    'Give clear guidance and adequate caution for complex and high-risk products.',
    'Keep client information confidential unless the law requires otherwise or the client agrees.',
    'Disclose the timelines for each service and keep to them.',
  ],
  rights: [
    'Privacy and confidentiality', 'Transparent practices', 'Fair and equitable treatment', 'Adequate information',
    'Initial and continuing disclosure', 'Information on all statutory and regulatory disclosures', 'Fair and true advertisement',
    'Awareness of service parameters and turnaround times', 'Being told the timelines for each service',
    'Being heard and having grievances resolved satisfactorily', 'Timely redressal of grievances',
    'Suitable financial products', 'Exiting a financial product or service as per the terms of the agreement',
    'Clear guidance and caution notices for complex and high-risk products', 'Additional care for vulnerable investors, including accessible services',
    'Giving feedback on financial products and services', 'Not being bound by any clause that is coercive, unfair or one-sided',
  ],
  dos: [
    'Deal only with SEBI-registered investment advisers.',
    'Check the adviser’s registration number and that the registration is valid, on SEBI’s list of registered advisers.',
    'Pay only advisory fees, only through banking channels (or CeFCoM if the adviser has opted in), and keep signed receipts.',
    'Insist on your risk profile before accepting advice, and on advice that follows it.',
    'Ask every question you have and clear your doubts before acting on advice.',
    'Assess the risk, return, liquidity and safety of an investment before making it.',
    'Get the terms and conditions in writing, signed and stamped, and read them, especially on fees and plans.',
    'Be vigilant in your transactions.',
    'Approach the right authority for doubts and grievances.',
    'Tell SEBI about any investment adviser offering assured or guaranteed returns.',
    'Know that you can exit the service, ask for clarification and give feedback.',
    'Know that no clause contrary to the regulations binds you.',
  ],
  donts: [
    'Don’t fall for stock tips offered as investment advice.',
    'Don’t give your money to an investment adviser to invest for you.',
    'Don’t fall for promises of indicative, exorbitant or assured returns.',
    'Don’t get carried away by luring advertisements or market rumours.',
    'Don’t transact only on the basis of phone calls or messages from an adviser or their representatives.',
    'Don’t decide just because of repeated calls or messages.',
    'Don’t fall for limited-period discounts, incentives or gifts.',
    'Don’t rush into investments that don’t match your risk appetite and goals.',
    'Don’t share your trading, demat or bank login credentials with the adviser.',
  ],
};

// Learn: short guides, each traced to the workbook section it comes from.
export const LEARN = [
  { id: 'adviser-or-distributor', t: 'Adviser or distributor: why it matters who pays', src: 'X-A 1.6, 18.6.7, 18.6.15', body: [
    'When the person recommending a product is paid by the company that makes it, there is a conflict of interest. They may push the product that pays more commission rather than the one that suits you. That is how mis-selling happens.',
    'SEBI’s answer is to separate the two roles. An investment adviser is paid only by the client and may not receive any payment from product makers for the products advised. An individual adviser cannot also be a distributor, and their family cannot distribute to the clients they advise.',
    'An adviser can help you implement the advice, but only through Direct plans and products, and without charging any implementation fee. You are free to implement the advice on your own.',
  ] },
  { id: 'fiduciary', t: 'What “fiduciary” means for you', src: 'X-A 19.5, 18.6.17', body: [
    'An investment adviser acts in a fiduciary capacity. In plain words: your interest comes first, always, even when that costs the adviser.',
    'In practice that means full disclosure (including any conflict, and even the perception of one), advice that suits your specific situation, a reasonable and objective basis for every recommendation, and careful execution.',
    'The code of conduct adds honesty and fairness, diligence, fair and reasonable charges, and confidentiality of what you share.',
  ] },
  { id: 'process', t: 'The six steps of a financial plan', src: 'X-A 1.5', body: [
    'Good planning follows a sequence: agree the relationship and scope; gather your data and goals; analyse where you stand; recommend; implement; and monitor.',
    'The order matters. Product choice comes near the end, after your goals, cash flow, protection and risk profile are clear. Advice that starts with a product skips four steps.',
  ] },
  { id: 'risk-profile', t: 'Your risk profile: able versus willing', src: 'X-B 18.1–18.2, X-A 18.6.9', body: [
    'Two different things decide how much risk your money should take. Ability is your financial capacity to absorb a loss: age, dependants, earning members, how steady your income is, your savings cushion, and when you need the money. Willingness is your comfort with ups and downs, shaped by knowledge, experience and temperament.',
    'Advice has to fit both. If you are willing but not able, the plan follows your ability. If you are able but not willing, the plan respects your comfort and we talk about the trade-off.',
    'There are no right answers in a risk questionnaire. Guessing the “good” answer only gives you a plan you won’t stick with. Your profile is reviewed when your family, income, assets or loans change.',
  ] },
  { id: 'allocation', t: 'Asset allocation: strategic, tactical, dynamic', src: 'X-B 18.3', body: [
    'Spreading money across asset classes that don’t move together (equity, debt, gold) means one doing badly is cushioned by another. Research suggests the allocation explains more of a portfolio’s results than the choice of individual securities.',
    'Strategic allocation is set from your goals, time horizon and risk profile, and rebalanced back to target periodically. It changes when your life changes, not when the market mood does.',
    'Tactical allocation tilts towards an asset class on a market view, and suits only seasoned investors with large surpluses. Dynamic allocation follows pre-set rules or valuation triggers, which takes emotion out of the decision.',
  ] },
  { id: 'ratios', t: 'Five ratios that describe your finances', src: 'X-A 3.9', body: [
    'Liquidity ratio: liquid assets divided by monthly expenses including EMIs. Around 4 to 6 months is comfortable. Shares and equity funds don’t count as liquid.',
    'Debt-to-income: monthly EMIs divided by monthly income. Above 35–40% is excessive.',
    'Leverage: total loans divided by total assets. Above 1 means your assets don’t cover your debts.',
    'Savings ratio: the share of income you save. Higher is better; discretionary spending is where it improves.',
    'Accumulated savings to annual income: a measure of readiness for long-term goals. By the early 40s, at least 3 times annual income is suitable.',
  ] },
  { id: 'life-cover', t: 'How much life cover is enough?', src: 'X-B 2.2, 17.1', body: [
    'The needs-based approach: work out the yearly income your family would need, find the corpus that pays it for as many years as needed (at the return left after inflation), add loans outstanding, and subtract the cover and investments you already have. The difference is the additional cover to buy.',
    'Term insurance is the pure, low-cost way to buy that cover. Buying insurance mainly to save tax is a common mistake that leaves families both under-insured and with low-return policies.',
  ] },
  { id: 'retirement', t: 'Two ways to size your retirement', src: 'X-B 4.4', body: [
    'Replacement ratio method: plan for a percentage of your pre-retirement income (the workbook’s example uses 80%), increased with inflation each year.',
    'Expense protection method: start from today’s expenses, add what will rise (medical, travel) and remove what will stop (EMIs, school fees), then grow it at inflation to your retirement date. The corpus is what funds that expense for the years after retirement.',
    'Both are estimates that get better the closer you are to retirement, so review them periodically.',
  ] },
  { id: 'biases', t: 'Money mistakes everyone makes', src: 'X-B 16, 17', body: [
    'Loss aversion: losses hurt more than equal gains please, so we hold losers too long and sell winners too early.',
    'Overconfidence: confusing a lucky bet with skill, which leads to concentration and too much trading.',
    'Mental accounting: treating a bonus or refund as “play money” and spending or risking it differently from salary.',
    'Chasing past performance: buying last year’s winner. A pre-agreed allocation with limits for each asset class guards against this.',
    'Status quo: doing nothing because a decision might turn out badly. A plan with set review dates helps.',
  ] },
  { id: 'estate', t: 'Will and nominations', src: 'X-B 14.3, 15.2', body: [
    'A will decides who inherits your assets. Without one, the law of succession decides, and heirs may need a succession certificate or legal heir certificate.',
    'A nomination makes the transfer of a financial asset smoother, but a nominee generally holds the asset as a custodian until it passes to the legal heirs. In life insurance, a spouse, parent or child named as nominee is a beneficial nominee who receives the money.',
    'Review nominations when life changes, for example after marriage.',
  ] },
  { id: 'unregistered', t: 'Spotting advice you shouldn’t take', src: 'X-A 19.6', body: [
    'Anyone giving investment advice for a fee must be registered with SEBI. Social media followers are not a qualification.',
    'Walk away from stock tips presented as advice, promises of assured or exorbitant returns, requests to hand over your money or passwords, and pressure through repeated calls or limited-time offers.',
    'Check any adviser’s registration on SEBI’s website before you pay a rupee.',
  ] },
];

// Explanations of each ratio's status on the check-up
export const RATIO_TEXT = {
  liquidity: { name: 'Liquidity', unit: 'months', good: 'Comfortable: 6 months or more of expenses in liquid form.', ok: 'Adequate: 4 to 6 months. Fine for most households.', act: 'Below 4 months. Building an emergency fund comes before investing.' },
  debtToIncome: { name: 'Debt to income', good: 'EMIs are within 35% of income.', ok: 'At the edge: 35% to 40% of income goes to EMIs.', act: 'Above 40% of income goes to EMIs, which the workbook treats as excessive.' },
  leverage: { name: 'Leverage', good: 'Loans are half your assets or less.', ok: 'Loans are more than half your assets. Usually high just after buying a home.', act: 'Loans exceed your assets.' },
  savingsRatio: { name: 'Savings ratio', info: 'Share of income left after expenses and EMIs.', act: 'Expenses and EMIs use all your income.' },
  savingsToIncome: { name: 'Savings to annual income', info: 'Your investments and liquid savings as a multiple of a year’s income.', good: 'At or above 3 times annual income, suitable for the early 40s.', act: 'Below 3 times annual income, the level suitable for the early 40s.' },
};

export const PROFILE_TEXT = [
  { label: 'Conservative', desc: ['Prefers not to take risk with investments; may be new to riskier instruments.', 'Prefers income-yielding instruments with low risk.', 'May put a small part in riskier assets if it is likely to be better for the long term.'] },
  { label: 'Moderate', desc: ['Has some investment experience, including in equities.', 'Understands that long-term goals need some investment risk.', 'Willing to take risk with part of the available assets.'] },
  { label: 'Aggressive', desc: ['Experienced; has used a range of products and may manage them actively.', 'Willing to take investment risk and sees it as necessary for long-term returns.', 'Willing to take risk with a significant part of the assets.'] },
];

export const PROFILE_NOTES = {
  horizon: 'You need this money soon, so the time to recover from a fall is short. That limits the risk the plan can take.',
  fall: 'You said you would sell everything after a 20% fall. A plan has to be one you can hold through falls, so it stays on the careful side.',
  cushion: 'Your savings cover less than a month of expenses. An emergency fund comes first.',
  wantsMore: 'You are comfortable with more risk than your situation can absorb. The plan follows your ability, and we will talk this through.',
  canMore: 'Your situation could carry more risk than you are comfortable with. I won’t push you; we will discuss the trade-off.',
};
