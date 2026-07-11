# PYMTW — Legal Review Items

**Purpose:** flag website language, services, and workflows that qualified legal counsel should review before or shortly after launch. **These are flags, not legal conclusions.** Nothing here should be treated as legal advice, and no representation of regulatory compliance is made.

## A. Services / offerings that may touch regulated activity
1. **Private education packages** (Clarity $149 / Implementation $399 / Self-Custody $499) and membership — confirm the education framing keeps them clear of investment-adviser regulation in the relevant jurisdiction(s). Language was rewritten to "education/implementation/framework/readiness" and away from "advisory/portfolio/allocation/recommendation," but counsel should confirm scope.
2. **Any 1:1 discussion of amounts, timing, or suitability** could be construed as individualized advice. Confirm boundaries and intake/consent language.
3. **"General portfolio-literacy education"** — confirm acceptable framing; ensure no security-specific (stocks/ETFs/retirement) recommendations creep in.
4. **Tax & estate/inheritance content** (Starter Kit inheritance guide, family workshop, DCA recordkeeping) — ensure it stays educational and directs users to licensed tax/legal/estate professionals.
5. **Self-custody / hardware-wallet guidance** — confirm we never handle credentials; verify liability language for any workflow where a client sets up custody during a session.

## B. Website language to review
6. **Educational disclaimer, Terms, Privacy, Affiliate, Refund/Cancellation** (`legal.html`) — drafted in plain language; require counsel review. _Strengthened 2026-07-11:_ Terms now include eligibility (18+), IP/license, purchases & recording consent, "as is" warranty disclaimer, max-extent limitation of liability with fee cap, and amendment-with-notice. **Governing law — RESOLVED (2026-07-11):** entity confirmed as **PYMTW LLC, a Wyoming LLC**; the governing-law & disputes clause in `legal.html#terms` now names the entity and Wyoming as governing law/venue. Counsel should still confirm whether a specific county/venue and a binding-arbitration + class-action-waiver clause are advisable (flagged inline as an HTML comment). **Sales region — RESOLVED (2026-07-11):** Frank confirmed **US-only** for now, so the Privacy Policy intentionally omits GDPR/UK-specific data-subject-rights language and the EU digital-goods cooling-off waiver; revisit if/when selling into the EU/UK. **CCPA/CPRA — ADDRESSED (2026-07-11):** added a "California privacy rights" subsection (know/delete/correct rights, no-sale statement, how to exercise) and a "Cookies & similar technologies" subsection to `legal.html#privacy`, plus named PYMTW LLC as the responsible business. The no-sale and no-cross-site-tracking claims were verified against `pymtw-config.js` (`allow_google_signals: false`) before publishing. This is light-touch, not a full CPRA compliance program — counsel should still confirm it's sufficient once real traffic/checkout volume exists. **Still open:** controller contact + postal address (Frank has deferred publishing one — see item 19), and auto-renewal (state ARL, e.g. California) compliance in the future membership checkout flow.
7. **Refund/cancellation/rescheduling policies** — confirm enforceability and consumer-law compliance for digital goods and live services.
8. **Security Promise / "we will never ask…"** — confirm claims are accurate and not over-promising.
9. **Hero stats** ("500M+ users", "15+ years", "21M supply") — confirm sourcing/defensibility of marketing claims.
10. **Book bonus / "Professional Bitcoin Toolkit"** offer language (planned) — ensure delivery matches promise; avoid implying availability before assets exist.

## C. Affiliate & disclosure
11. **Confirm which outbound links are affiliate relationships — RESOLVED (2026-07-11).** Frank confirmed an active Amazon Associates account. Audit found **9 `amzn.to` + 1 `a.co` Amazon short links on `index.html` (books section)**; these are Associates links. `legal.html#affiliate` now states definitively that PYMTW LLC is an Amazon Associate and that book links to Amazon are compensated; `about.html`'s conflict-of-interest paragraph and the near-link notice on the homepage books panel were updated to match. All other outbound links (wallets, exchanges, custody, tools) were audited, carry no affiliate parameters, and are stated as uncompensated. **Ongoing responsibility:** if a new affiliate relationship is added (wallets, exchanges, etc.), label the specific link and update `legal.html#affiliate` + the "Last updated" date.
12. Ensure no compensated link is presented as "best" without stated evaluation criteria.

## D. Data / privacy workflows
13. **Email capture** (Beehiiv) — confirm consent language, unsubscribe, and data-processing terms; add explicit privacy-consent checkbox if counsel advises.
14. **Analytics** — ensure the privacy-safe event layer (`pymtwTrack`) and calculator exclusion satisfy the privacy policy; confirm no sensitive financial values are ever captured.
15. **Assessment answers** — currently NOT transmitted (only email is). Confirm this remains true if a backend is added, and disclose if that changes.

## E. Payments / checkout (pending integration)
16. Before enabling checkout (Stripe/Lemon Squeezy etc.), review merchant terms, refund handling, tax collection (sales tax/VAT on digital goods), and chargeback policy.

## F. Factual accuracy (see also "factual questions" in IMPLEMENTATION_SUMMARY.md)
17. **Bitcoin-since year — RESOLVED (2016).** Frank confirmed 2016; standardized across `playbook.html`, `book/index.html`, and `about.html`.
18. Confirm Frank's credentials as stated (MBA, blockchain certification, "Wall Street professional") are accurate and not overstated.

## G. Deferred items
19. **Contact email + mailing address — DEFERRED at Frank's request (2026-07-11).** A postal address and dedicated business email are typically expected on a Privacy Policy and are required in commercial email footers (CAN-SPAM); Beehiiv's own compliance may also require an address on file for the newsletter. No address is published on the site yet — `legal.html#privacy` and the footer route contact through the existing forms instead. **Action before broad email sending or checkout launch:** decide on a P.O. box, registered-agent address, or business address, and a dedicated inbox (e.g. hello@pymtw.com).

_No definitive legal conclusions are drawn in this document. Engage qualified counsel in the operating jurisdiction._
