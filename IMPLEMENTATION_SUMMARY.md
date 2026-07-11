# PYMTW — Implementation Summary (Stage 4 & 5)

_First implementation pass of the monetization/conversion overhaul. Static HTML/CSS/JS, GitHub Pages. All internal `.html` links verified (0 broken). Assessment flow verified end-to-end in-browser._

---

## 1. Current website problems (summary)
PYMTW read as an overloaded Bitcoin **resource directory**, not an education business: no positioning, a homepage buried under a huge link dump, four competing hero CTAs, no lead-capture, no product ladder, and services written in **advisory/"portfolio management"** language that is both off-brand and a regulatory risk. It had **no** privacy policy, terms, affiliate disclosure, security policy, or trust section; calculators were fully local but never said so; SEO metadata was thin; and a factual **2016-vs-2017** inconsistency about Frank's Bitcoin start date sat unresolved.

## 2. New monetization strategy (summary)
A single positioning — _practical Bitcoin education for working professionals, without trading or hype_ — feeding one funnel: **Assess → Subscribe → $29 Starter Kit → Workshops ($79–199) → Private education ($149–499) → Membership ($29/mo) → Corporate/speaking.** A flagship **Bitcoin Readiness Assessment** segments visitors into Beginner / Accumulator / Security Builder and routes each to a matched free resource + paid offer. Trust is productized (Security Promise, disclosures, "we never ask for your keys") to convert a security-anxious audience.

## 3. Pages changed
- `index.html` — new SEO head + Organization JSON-LD; repositioned hero (single primary CTA + credibility line); simplified nav; **new** trust strip, assessment band, 3 pathways, and featured-programs/book band; rebuilt footer with Learn/Programs/Trust columns + full disclaimer.
- `services.html` — de-risked language ("Portfolio & Strategy" → "Implementation & Recordkeeping"; removed "ongoing advisory/allocation/analysis"); added **Scope statement** + **Security statement**; new SEO head; standardized nav.
- `calculator.html` — privacy callout (local-only, not stored/analytics); post-result 3 educational paths; educational disclaimer; standardized nav.
- `dca.html` — "how to read this" interpretation; volatility/drawdown + hypothetical-results reminders; privacy callout; worksheet + workshop CTAs; standardized nav.
- `performance.html`, `videos.html`, `whitepaper.html`, `dashboard.html`, `members.html` — standardized nav + `pymtw.css` link.

## 4. Pages created
- `assessment.html` — **Bitcoin Readiness Assessment** (10 Q, scored to 3 profiles, email-gated result, next steps, matched offers, disclaimers). _Verified working end-to-end._
- `start-here.html` — segmentation entry + learning sequence.
- `programs.html` — Programs hub: workshops (Busy Professionals $79, Self-Custody $129, Couples/Families $199), private education (Clarity $149 / Intensive $399 / Self-Custody Readiness $499), membership ($29/mo · $290/yr, Family "coming soon"), corporate teaser, inquiry form, FAQ.
- `starter-kit.html` — Bitcoin Professional Starter Kit ($29): problem, 9 templates, who it's/isn't for, visual placeholders, buy block (launch-list), FAQ.
- `corporate.html` — Corporate education & speaking: audiences, 9 formats, objectives, speaker bio, inquiry form.
- `about.html` — story, philosophy, does/doesn't-do, security principles, editorial/affiliate/COI policy, contact form. (Year-neutral bio pending fact confirmation.)
- `security-promise.html` — full "never does / does / how to protect yourself" trust page.
- `legal.html` — Educational Disclaimer, Security Policy, Privacy, **Calculator Privacy**, Affiliate Disclosure, Refunds/Cancellations, Terms.
- [`workshop-professionals.html`](workshop-professionals.html) — standalone landing page for "Bitcoin for Busy Professionals" ($79): outcomes, agenda, audience, registration form, FAQ, refund policy, disclaimer, Course + FAQPage structured data.
- [`workshop-self-custody.html`](workshop-self-custody.html) — standalone landing page for "Self-Custody Without the Fear" ($129): same treatment + explicit security statement, Course + FAQPage structured data.
- [`resources.html`](resources.html) — dedicated Resource Library: 10 categories, 35 entries, each with who-for / benefits / limitations / typical cost / security / affiliate / date-reviewed, plus affiliate disclosure. No fabricated prices (uses "confirm current pricing").
- **Shared layer:** `pymtw.css` (component styles) + `pymtw.js` (standardized nav, trust bar, footer, mobile behavior, privacy-safe analytics helper).
- **Docs:** `SITE_AUDIT.md`, `SITE_ARCHITECTURE.md`, `CONTENT_AND_COPY_PLAN.md`, `LEGAL_REVIEW_ITEMS.md`, this file.

**Session 2 additions:** the two standalone workshop pages and the Resource Library above; [`book/index.html`](book/index.html) enhanced with a reader-bonus "Professional Bitcoin Toolkit" section, a proof-of-purchase submission form, a team/bulk & book-club offer linking to Corporate, an "after the book" funnel band, and Book structured data. Workshop CTAs across `programs.html`, `assessment.html`, and `dca.html` now point to the dedicated workshop pages; the "Resource Library" nav link (all pages + `pymtw.js`) now points to `resources.html`.

**Session 4 additions:** five more guide/comparison pages — `compare-coldcard-trezor-bitbox.html`, `compare-recurring-buy-platforms.html`, `compare-collaborative-vs-multisig.html`, `compare-bitcoin-books.html`, `compare-tax-software.html` (same criteria-first template, Article schema, no fabricated pricing), all cross-linked from the Resource Library "Guides & comparisons" block; [`digital-credit.html`](digital-credit.html) — honest landing page for Frank's second book (specifics marked "to be announced," Book schema, notify form), cross-linked from Resources/About/Corporate/best-books; a reusable **testimonials** component + a clearly-labeled placeholder section on the homepage (no fabricated quotes) with a "share yours" CTA; and **integration scaffolding** — [`pymtw-config.js`](pymtw-config.js) (loaded on all 32 pages) centralizing a privacy-safe `pymtwTrack`, an off-by-default GA4 loader, a `data-checkout` link upgrader, and Calendly config, plus [`INTEGRATIONS.md`](INTEGRATIONS.md). Verified: `pymtwTrack` strips financial values before they can reach analytics; GA loads nothing until an ID is set.

**Session 3 additions:** [`membership.html`](membership.html) (standalone PYMTW Professional page — pricing, benefits, what-it-is/isn't, Family coming-soon, waitlist form, FAQ); [`workshop-family.html`](workshop-family.html) (Couples & Families $199 landing page + Course/FAQ schema); three guide/comparison pages — [`compare-exchanges-beginners.html`](compare-exchanges-beginners.html), [`compare-hardware-wallets.html`](compare-hardware-wallets.html), [`bitcoin-on-exchange.html`](bitcoin-on-exchange.html) — each with criteria-first comparisons (no fabricated pricing; "confirm current details"), qualitative spec tables, affiliate disclosure, workshop + checklist CTAs, last-updated dates, and Article structured data. Nav "Membership" (all pages + `pymtw.js`) now points to `membership.html`; the couples/families card on `programs.html` points to `workshop-family.html`; a "Guides & comparisons" block was added to `resources.html`.

## 5. Incomplete items (scoped, not built yet)
- ✅ _Done across sessions:_ Resource Library; all four workshop pages (Busy Professionals, Self-Custody, Couples & Families); standalone Membership page; book-page bonus/proof-of-purchase/bulk offer; **three comparison/guide pages** (`compare-exchanges-beginners.html`, `compare-hardware-wallets.html`, `bitcoin-on-exchange.html`) with Article structured data, cross-linked from Resources.
- **Remaining comparison pages** (Coldcard vs Trezor vs BitBox, Recurring-buy platforms, Collaborative vs DIY multisig, Best Bitcoin books, Tax software). _Do not fabricate pricing/features — verify before publishing._
- Dedicated **Digital Credit** book page (confirmed a separate book from _Bitcoin for Working Professionals_).
- **Testimonials** section (intentionally omitted until real ones exist).
- Starter Kit **template files** themselves (page is honest "launch list" until built + checkout connected).
- Retire/relocate the live **price ticker + particle canvas** on interior pages for the calmer brand (optional; new pages already omit them).
- Structured data beyond Organization (Course/Event/FAQ/Book/Person/Breadcrumb).

## 6. External integrations needed
1. **Payments/checkout** — Stripe or Lemon Squeezy for Starter Kit, workshops, private packages, membership. CTAs currently route to inquiry/launch-list forms; wire `data-track` events to real checkout.
2. **Scheduling** — Calendly/SavvyCal for workshops & private sessions (intake → schedule → prep).
3. **Email platform** — Beehiiv forms are live (`form_id b4a2c81e-…`); configure **segmentation/automations** by `utm_source`/`utm_medium` and assessment profile; build the 3 sequences in `CONTENT_AND_COPY_PLAN.md`. Custom fields (name/interest/profile) need Beehiiv field mapping.
4. **Analytics** — install GA4/Plausible; consume the `dataLayer`/`pymtwTrack` events (§9). Ensure calculator values stay excluded.
5. **Digital delivery** — host Starter Kit files (Gumroad/native) behind purchase.
6. **Proof-of-purchase** for book bonus (form + manual/automated verification).

## 7. Legal-review items
See `LEGAL_REVIEW_ITEMS.md` — key: education vs. adviser boundary on private sessions; tax/estate framing; affiliate per-link labeling; policy pages need counsel; payments/tax at checkout; resolve the 2016/2017 fact.

## 8. Factual questions requiring Frank's confirmation
1. **Bitcoin since 2016 or 2017?** (book says 2016 ×2; playbook says 2017). New copy is year-neutral until confirmed — then standardize all pages.
1b. **Book titles — RESOLVED:** Frank confirmed **two separate books** — _Bitcoin for Working Professionals_ (the live `/book` page) and _Digital Credit: How Bitcoin Is Reinventing Yield_ (no dedicated page yet). References reconciled: `/book` links now read "Bitcoin for Working Professionals"; About/Corporate bios credit both; Resources lists both. _Open follow-up:_ build a dedicated page for _Digital Credit_ if/when desired.
2. Confirm credentials: MBA, blockchain certification, "Wall Street professional."
3. Preferred public **contact email** (personal Gmail was not published; forms + newsletter reply used instead).
4. Confirm **prices** ($29/$79/$129/$199/$149/$399/$499/$29-mo/$290-yr) and refund/cancellation terms.
5. Which outbound links are **affiliate**; confirm the affiliate disclosure wording.
6. Confirm marketing stats (users, years) are defensible.
7. Book title styling — used "Digital Credit: How Bitcoin Is Reinventing Yield" per brief.

## 9. Recommended analytics events (via `pymtwTrack` / dataLayer)
`assessment_started` (Q1 answered), `assessment_completed` (email gate, w/ profile), `newsletter_signup` (any Beehiiv form; incl. `source`), `assessment_result_viewed`, `playbook_download` (add to Playbook CTA), `starter_kit_notify` / later `starter_kit_purchase`, `workshop_interest` (+label), `program_inquiry` (+interest), `private_interest`, `membership_interest`, `corporate_inquiry` (+format), `contact_submitted`, `book_link_click` (add on `/book` CTAs), `affiliate_link_click` (add `data-track="affiliate_link_click"` to compensated links), `calculator_completed` (add on calc run — **no values**), `checkout_started` / `checkout_completed` (post-integration), `form_abandoned` (optional). **Never send financial values**; `pymtwTrack` strips sensitive keys as a guard.

## 10. Suggested 30-day launch plan
- **Wk1:** Confirm facts (§8) & prices; connect Beehiiv segmentation; install analytics + verify events fire; QA all forms/links/mobile.
- **Wk2:** Build Starter Kit template files; connect checkout + digital delivery; turn Starter Kit page from "notify" to live buy; connect scheduling for workshops.
- **Wk3:** Legal review of `legal.html` + services scope; label affiliate links; publish 1–2 comparison pages (verified data); announce assessment to newsletter.
- **Wk4:** Schedule first "Bitcoin for Busy Professionals" workshop; launch beginner email sequence; add real testimonials as they arrive; soft-launch corporate one-sheet.

## 11. Suggested 90-day monetization roadmap
- **Days 1–30:** Free funnel live (assessment→email), Starter Kit selling, analytics baseline.
- **Days 31–60:** Run 2–3 live workshops; open private-education booking; launch all 3 email sequences; publish 3–4 comparison/SEO pillar pages; split workshop/membership into standalone pages.
- **Days 61–90:** Launch PYMTW Professional membership; ship book-bonus toolkit + proof-of-purchase; begin corporate outreach with speaker one-sheet; build dedicated Resource Library with review metadata; expand structured data + content hub (6 pillars).

---
_Verification: static server + in-app browser. Assessment: 10 Q → email gate → correct profile/steps/CTAs confirmed. Homepage, services, and interior pages render with standardized nav/trust/footer; header overlap bug found and fixed._
