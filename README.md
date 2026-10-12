# Fee-only Investment Adviser website

The client-facing website for a SEBI-registered individual Investment Adviser (RIA). It is built the same way as the FundFit v3 distributor site: static, no backend, no cookies, no tracking, deployed on GitHub Pages.

Content follows the **NISM Series X-A (Sep 2026)** and **X-B (Dec 2025)** workbooks. Regulatory points not in the books (fee limits, MITC, Investor Charter, complaint disclosure format) come from SEBI circulars, listed at the end.

## What's on the site

| Page | What it does |
|---|---|
| Home | "Advice paid for only by you": a who-pays-whom diagram, adviser vs distributor table, the six-step process |
| How I work | Six-step planning process (X-A 1.5), scope (X-A 1.3), what clients can expect, what I will never do |
| Money check-up | Six steps: cash flow → assets & loans (X-A 3.9 ratios) → risk profile (ability vs willingness, X-B 18) → life cover (needs-based, X-B 2.2) → retirement (expense protection method, X-B 4.4.2) → goals |
| Summary | Printable, shareable summary. Data travels inside the link. Send on WhatsApp/email in one tap |
| Fees | Fee plans from config, SEBI fee rules, refund-on-exit calculator |
| Learn | 11 short guides, each citing its NISM section |
| Investor charter | SEBI's Investor Charter for IAs (June 2025) |
| Disclosures | Registration plate, escalation matrix, conflicts/holdings/AI disclosures, monthly complaints tables, audit status, MITC |
| SEBI updates | Adviser-related SEBI circulars, refreshed daily |
| Contact | Discovery call, official contact numbers |

Every page footer carries the registration details, the standard warning (word for word) and the BASL/NISM disclaimer.

## Preview mode: stays on until you are registered

Anything still in `[square brackets]` in `js/config.js` keeps the site in **preview mode**: a red banner says "not for publication", and booking buttons are switched off.

This is deliberate. Under the IA Regulations, no one may act as, **or hold themselves out as**, an investment adviser before SEBI grants registration. **Keep GitHub Pages switched off (or the repo private) until your certificate arrives.**

## Before going live

1. **Stop distribution first.** An individual IA cannot provide distribution services. Your family cannot distribute to clients you advise (X-A 18.6.15). The ARN, the FundFit v3 distributor site and any trail commission have to be wound down as SEBI requires before you take advisory clients. Confirm the exact steps with your compliance advisor. The two sites must not link to each other.
2. Fill in `js/config.js`: SEBI registration number, BASL membership number, address as on the certificate, official phone/WhatsApp/email, officers, the SEBI office for your region, NISM X-A/X-B certificate numbers, and fees.
3. Set your fees. The site checks them against SEBI's limits: ₹1,51,000 a year per family (fixed) or 2.5% of AUA. A test fails the deploy if a fee breaks the limit.
4. Write your disclosures honestly: other business activity, holdings, AI use. If you use AI tools in arriving at advice, say which tools, at which stages, and their limits.
5. **BASL approval:** the Advertisement Code requires prior approval of advertisements from BASL. Check with BASL whether the website content needs it, and keep a copy of each version for 5 years.
6. Every month by the 7th, update `data/complaints.json` (SEBI format: last month, monthly trend, annual trend).
7. Put the agreement, MITC and Investor Charter PDFs you give clients in a `docs/` folder and link them from Disclosures if you want.

## Publish on GitHub Pages

1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions: Read and write.**
3. **Actions → "Test, refresh SEBI updates and deploy" → Run workflow.**

The workflow runs daily. It runs the tests, refreshes `data/sebi.json` from sebi.gov.in, and redeploys.

## How the check-up works (`js/engine.js`)

- **Ratios** (X-A 3.9): savings, expense, liquidity (liquid ÷ monthly outflow incl. EMIs; 4–6 months comfortable), debt-to-income (>35–40% excessive), leverage, solvency, net worth, financial-assets share, savings-to-income (≥3× in the early 40s).
- **Risk profile** (X-A 18.6.9, X-B 18):
  - Six *ability* questions use the X-B Table 18.1 factors: age, dependants, earning members, income regularity, cushion, horizon.
  - Four *willingness* questions cover experience, reaction to a fall, choice of outcomes and objective.
  - Every answer is on the same 1–5 scale, so no answer carries undue weight. The profile is the lower of the two.
  - Caps: money needed within 1 year → Conservative; 1–3 years → at most Moderate; "sell everything after a 20% fall" → Conservative.
  - The three grades and their descriptions are the workbook's own. No asset allocation is shown: that is advice, given only after agreement, KYC and a signed risk profile.
- **Life cover** (X-B 2.2): PV of the yearly need at the inflation-adjusted rate, paid at the start of each year, plus loans, minus existing cover and investments. The test reproduces the book's Anil example to the rupee: ₹2,36,43,984 → ₹1,26,43,984.
- **Retirement** (X-B 4.4.2): expense protection method. The test reproduces the Ashish example: ₹1,44,321 a month.

`node --test tests/*.test.mjs` runs 25 tests:

- the worked examples from the books;
- risk-profile weighting and caps;
- fee limits and refund maths;
- share-link sanitising (XSS);
- word-for-word mandatory texts;
- a scan for words the Advertisement Code forbids (guaranteed returns, testimonials, prizes).

## Compliance choices built in

- The registration plate (name, type, registration number, validity, BASL number, address, contacts, principal and compliance officer, SEBI office) appears on every page and every printed summary.
- There are no testimonials, no performance claims, no return projections for any product, and no games or prizes. Wordle-style share cards from the other tools are deliberately left out.
- The check-up summary says it is not advice, and that advice follows only after agreement, KYC and risk-profile consent. This respects the rule against free trials without a risk profile.
- Fees are paid only through banking channels, with CeFCoM as an option (`cefcom: true`). Advance fees are limited to 1 year. Refunds are pro-rata, less a breakage fee of at most 1 quarter.
- Complaints run you → SCORES (BASL, then SEBI) → SMART ODR. You promise a reply within your stated working days, inside SEBI's 21-day limit. The SEBI helpline and head office address are listed.

## Files

```
index.html            page shell and all styles (light, dark, print)
js/config.js          your details: the main file you edit
js/engine.js          maths, ratios, risk profile, fee rules, share links (pure, tested)
js/content.js         text: process, MITC, Investor Charter, learn guides (book-sourced)
js/app.js             all pages
data/complaints.json  monthly complaints disclosure (edit by the 7th)
data/sebi.json        SEBI adviser circulars (refreshed daily)
scripts/              SEBI refresh (Node, no dependencies)
fonts/                Fraunces + Plus Jakarta Sans, self-hosted (SIL OFL)
og.png                link preview image
```

## Regulatory sources beyond the workbooks

- SEBI, Guidelines for Investment Advisers, 8 Jan 2025 (SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2025/003)
- SEBI, Most Important Terms and Conditions (MITC) for IAs, 17 Feb 2025 (SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/19)
- SEBI board decision, Apr 2025: advance fees up to one year
- SEBI, Investor Charter for IAs and monthly complaint disclosure, 2 Jun 2025 (SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/80)
- SEBI, AUA fees for second opinions, 30 Oct 2025
- SEBI, Advertisement Code for IAs and RAs, 2023
