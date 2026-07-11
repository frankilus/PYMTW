# PYMTW — Legal Review Items

**Purpose:** flag website language, services, and workflows that qualified legal counsel should review before or shortly after launch. **These are flags, not legal conclusions.** Nothing here should be treated as legal advice, and no representation of regulatory compliance is made.

## A. Services / offerings that may touch regulated activity
1. **Private education packages** (Clarity $149 / Implementation $399 / Self-Custody $499) and membership — confirm the education framing keeps them clear of investment-adviser regulation in the relevant jurisdiction(s). Language was rewritten to "education/implementation/framework/readiness" and away from "advisory/portfolio/allocation/recommendation," but counsel should confirm scope.
2. **Any 1:1 discussion of amounts, timing, or suitability** could be construed as individualized advice. Confirm boundaries and intake/consent language.
3. **"General portfolio-literacy education"** — confirm acceptable framing; ensure no security-specific (stocks/ETFs/retirement) recommendations creep in.
4. **Tax & estate/inheritance content** (Starter Kit inheritance guide, family workshop, DCA recordkeeping) — ensure it stays educational and directs users to licensed tax/legal/estate professionals.
5. **Self-custody / hardware-wallet guidance** — confirm we never handle credentials; verify liability language for any workflow where a client sets up custody during a session.

## B. Website language to review
6. **Educational disclaimer, Terms, Privacy, Affiliate, Refund/Cancellation** (`legal.html`) — drafted in plain language as placeholders; require counsel review and possibly jurisdiction-specific terms (GDPR/CCPA, e-commerce/consumer refund law).
7. **Refund/cancellation/rescheduling policies** — confirm enforceability and consumer-law compliance for digital goods and live services.
8. **Security Promise / "we will never ask…"** — confirm claims are accurate and not over-promising.
9. **Hero stats** ("500M+ users", "15+ years", "21M supply") — confirm sourcing/defensibility of marketing claims.
10. **Book bonus / "Professional Bitcoin Toolkit"** offer language (planned) — ensure delivery matches promise; avoid implying availability before assets exist.

## C. Affiliate & disclosure
11. **Confirm which outbound links are affiliate relationships** (books/Amazon, wallets, exchanges, custody, tax tools) and label each near the link per FTC-style guidance. The affiliate policy exists; per-link labeling is pending owner confirmation.
12. Ensure no compensated link is presented as "best" without stated evaluation criteria.

## D. Data / privacy workflows
13. **Email capture** (Beehiiv) — confirm consent language, unsubscribe, and data-processing terms; add explicit privacy-consent checkbox if counsel advises.
14. **Analytics** — ensure the privacy-safe event layer (`pymtwTrack`) and calculator exclusion satisfy the privacy policy; confirm no sensitive financial values are ever captured.
15. **Assessment answers** — currently NOT transmitted (only email is). Confirm this remains true if a backend is added, and disclose if that changes.

## E. Payments / checkout (pending integration)
16. Before enabling checkout (Stripe/Lemon Squeezy etc.), review merchant terms, refund handling, tax collection (sales tax/VAT on digital goods), and chargeback policy.

## F. Factual accuracy (see also "factual questions" in IMPLEMENTATION_SUMMARY.md)
17. **Bitcoin-since year inconsistency (2016 vs 2017)** — must be corrected to a single confirmed year across `playbook.html`, `book/index.html`, and `about.html`. Do not publish a specific year until confirmed.
18. Confirm Frank's credentials as stated (MBA, blockchain certification, "Wall Street professional") are accurate and not overstated.

_No definitive legal conclusions are drawn in this document. Engage qualified counsel in the operating jurisdiction._
