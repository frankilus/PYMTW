# PYMTW — Content & Copy Plan (Stage 3)

## Voice
Professional, calm, intelligent, practical, responsible. Bitcoin-focused (not "crypto"). No hype, no price predictions, no trading culture. Short paragraphs, plain English, honest about uncertainty.

## Homepage copy (implemented)
- **Headline:** "Build a Responsible Bitcoin Strategy—Without Becoming a Trader."
- **Sub:** "Practical Bitcoin education, tools, and implementation support for working professionals who want to understand Bitcoin, protect their purchasing power, and secure their holdings with confidence."
- **Primary CTA:** Take the Bitcoin Readiness Assessment · **Secondary:** Explore Programs
- **Credibility line:** "Practical education. Long-term thinking. No hype."
- Trust strip: never asks for keys · never takes custody · never trades · education not advice.

## SEO titles & meta descriptions (implemented on new/updated pages)
| Page | Title | Meta description (excerpt) |
|---|---|---|
| Home | PYMTW — Practical Bitcoin Education for Working Professionals | Build a responsible Bitcoin strategy without becoming a trader… |
| Assessment | Bitcoin Readiness Assessment — Find Your Starting Point \| PYMTW | Answer 10 questions to discover your Bitcoin Readiness Level… |
| Programs | Bitcoin Education Programs — Workshops, Private Sessions & Membership \| PYMTW | Live workshops, outcome-based private education, and membership… |
| Starter Kit | Bitcoin Professional Starter Kit — Templates & Checklists ($29) \| PYMTW | A $29 toolkit of templates and checklists… |
| About | About PYMTW & Frank W. Jerome \| Practical Bitcoin Education | Practical Bitcoin education for working professionals… |
| Corporate | Corporate Bitcoin Education & Speaking \| PYMTW | Webinars, executive briefings, scam-awareness, and keynotes… |
| Security | Our Security Promise \| PYMTW | PYMTW never takes custody, never asks for your keys… |
| Legal | Disclosures, Privacy & Policies \| PYMTW | Educational disclaimer, privacy, affiliate, terms… |
| Services | Bitcoin Education Services \| PYMTW | Outcome-based education and implementation support… |
| Start Here | Start Here — Your First Steps with Bitcoin \| PYMTW | New to Bitcoin? Pick your path… |

Priority keyword themes seeded across copy: _Bitcoin for working professionals, Bitcoin for beginners, Bitcoin DCA strategy, Bitcoin self-custody, best Bitcoin hardware wallet, Bitcoin inheritance planning, Bitcoin security checklist, Bitcoin workshop, Bitcoin corporate education, Bitcoin for families, how to buy Bitcoin responsibly, Bitcoin recordkeeping._

## Program page copy language rules
Use: education, guidance, readiness, framework, action roadmap, implementation support, decision-making framework, general portfolio-literacy education.
**Avoid:** advisory, portfolio management, investment/allocation/trade recommendation, personalized financial plan, asset allocation.

## Required disclosures (deployed via `pymtw.js` footer + `legal.html` + inline)
- **Educational disclaimer:** "PYMTW provides general educational information about Bitcoin, technology, custody, and financial concepts. Nothing on this website constitutes individualized investment, tax, legal, accounting, or financial advice."
- **Volatility:** "Bitcoin is volatile and can decline substantially in value. Past performance does not predict future results."
- **Security:** "Never share your seed phrase, private keys, passwords, authentication codes, or full account credentials with PYMTW or anyone claiming to represent PYMTW."
- **Affiliate:** "PYMTW may earn a commission when you purchase through certain links, at no additional cost to you. Compensation does not determine which products are recommended."
- **Calculators:** "Historical results are hypothetical and do not predict future performance."

## Assessment copy (implemented)
Title "What Is Your Bitcoin Readiness Level?", 10 questions, 3 results (Beginner / Accumulator / Security Builder), each with a stage explanation, 3 next steps, a free resource, a paid offer, and an educational disclaimer. Email required before result.

## Segmented email capture (structure implemented; sequences to load into Beehiiv)
Segments via `utm_source`/`utm_medium` on each form: `assessment`, `programs`, `about`, `corporate`, plus profile from assessment. Recommended UTM→segment mapping and sequences:

**Beginner:** 1) Bitcoin in plain English 2) Bitcoin vs. other crypto 3) How to buy safely 4) Common beginner mistakes 5) Invite: Busy Professionals workshop.
**Accumulator:** 1) Building a recurring-buy process 2) Understanding volatility 3) Recordkeeping 4) Reviewing your process 5) Invite: Implementation Intensive.
**Security:** 1) Exchange risk 2) Custody choices 3) Hardware-wallet prep 4) Backup mistakes 5) Invite: Self-Custody workshop.
Additional lists: Book Reader, Workshop Attendee, Corporate Inquiry.

## FAQs (implemented on programs, starter-kit; reusable `<details>` component)
Coverage: "Is this financial advice?", "Will you ask for my keys?", refund policy, recordings, formats, digital format, seed-phrase safety.

## Testimonials
Reusable card styles ready. **No testimonials fabricated.** Add a labeled section only when real, clarity/confidence/security-focused testimonials are supplied (avoid profit/return claims).
