# PYMTW — Site Audit (Stage 1)

_Audit of https://www.pymtw.com prior to the July 2026 conversion/monetization overhaul._
_Repo: static HTML/CSS/JS on GitHub Pages (CNAME → pymtw.com). No build system._

## 1. Existing page inventory

| Page | File | Purpose (before) | Notes |
|---|---|---|---|
| Home | `index.html` (~1,600 lines) | Everything: hero, why-bitcoin, huge resource directory, quiz, FAQ, newsletter | Overloaded; identity was "resource directory" |
| Net-Worth Calculator | `calculator.html` + `calculator.css`/`calculator.js` | Net worth in BTC + price targets | Fully client-side; had no privacy note |
| DCA Calculator | `dca.html` + `dca.css`/`dca.js` | Historical DCA simulation (Chart.js) | Fully client-side; light disclaimer only |
| Performance | `performance.html` + `.css`/`.js` | Asset-class return comparison | "since 2011" data |
| Services | `services.html` + `.css`/`.js` | Paid consultation/"portfolio & strategy" | **Advisory language** (portfolio analysis, ongoing advisory, allocation) |
| Playbook | `playbook.html` + `.css`/`.js` | Free lead magnet (`bitcoin-playbook.pdf`) | Custom `pb-nav`; bio says "in Bitcoin since 2017" |
| Book | `book/index.html` + `.css`/`.js` | Landing for _Digital Credit_ | Custom nav; bio says "since 2016" (×2) |
| Whitepaper | `whitepaper.html` | Annotated Bitcoin whitepaper | Long-form |
| Videos | `videos.html` | Curated video library | |
| Dashboard | `dashboard.html` | Market dashboard | Not linked in primary nav |
| Members | `members.html` | Members area | Hidden from nav (commented out) |

Shared assets: `styles.css` (design tokens/nav/footer), `script.js` (nav toggle, reveal, quiz, price bar).

## 2. Navigation map (before)

`Home · Learn ▾ (Why Bitcoin, Get Started, Resources, Learn, Videos, Whitepaper, Book) · Tools ▾ (Net Worth, Performance, DCA) · Free Playbook · Services · Newsletter · FAQ`

Problems: "Learn" mixed concepts with assets; no path for Programs/About/Start Here; no single primary action; Members commented out mid-list; dropdown labels inconsistent across pages.

## 3. Current CTAs (before)

Hero had **four competing CTAs** (Start Your Journey, Why Bitcoin?, Download Playbook, Subscribe). No single primary action. Downstream pages pushed "Request This Service" inquiry only. No assessment, no product ladder, no funnel continuity.

## 4. Forms

- Newsletter (Beehiiv) — hero modal, CTA section, footer. `form_id b4a2c81e-…`. Works.
- Services inquiry form (`services.js`) — general contact.
- No lead-gen assessment, no segmented capture, no program registration/checkout.

## 5. Products / services / tools (before)

- **Free:** Playbook PDF, newsletter, calculators, articles/quiz.
- **Paid (services.html):** Consultation ($75/$150/mentorship), Wallet Setup & Security ($150/$300…), "Portfolio & Strategy" ($200/$400/$300-mo "Ongoing Advisory").
- **Book:** _Digital Credit_.
- No low-cost digital product, no workshops, no membership, no corporate offering.

## 6. Existing legal pages

**None.** Only a one-line footer disclaimer ("educational purposes only… not financial advice"). No privacy policy, terms, affiliate disclosure, refund/cancellation policy, or security policy.

## 7. Affiliate links

The homepage resource directory links to books, wallets, exchanges, podcasts, tools. **Affiliate status is undeclared and unverified** — no disclosure anywhere. Needs owner confirmation of which links are compensated (see `LEGAL_REVIEW_ITEMS.md`).

## 8. Content inconsistencies (factual)

- **Bitcoin-since year:** `playbook.html` = "since **2017**"; `book/index.html` = "since **2016**" (twice). **Unresolved — must be confirmed by Frank, not guessed.**
- Founder name appears as "Frank Jerome" (playbook/book) vs. brief's "Frank **W.** Jerome" — standardized to "Frank W. Jerome" on new pages.
- Hero stats ("500M+ users", "15+ years") are marketing approximations — acceptable but should be sourced.

## 9. UX / conversion problems

- No positioning statement; identity read as a generic Bitcoin directory, not an education business.
- Homepage buries the funnel under a massive resource dump.
- No "who is this for / what next" clarity; no visitor segmentation.
- Hero CTA overload dilutes action.
- Services page tone ("advisory", "portfolio") creates regulatory exposure **and** off-brand "manager" positioning.
- No trust/security section despite custody being core to the audience's fears.

## 10. Technical / SEO / mobile / a11y issues

- **SEO:** thin/duplicative `<title>`s, missing meta descriptions, no canonical/OG/structured data on most pages.
- **A11y:** decorative-heavy hero; dropdowns keyboard-openable but no `aria-expanded`; forms mostly labeled; motion-heavy (particles/orbits) with no reduced-motion handling.
- **Perf:** render-blocking Google Fonts; particle canvas + live-price polling on every page; large monolithic `index.html`.
- **Privacy:** calculators are fully local (only public price APIs fetched) but **never said so** — a missed trust signal.
- **Consistency:** nav markup duplicated per page and drifted.

## 11. Broken links / gaps

- `members.html` exists but is orphaned (commented out).
- `dashboard.html` orphaned.
- Footer "Resources" pointed only to external sites; no internal legal pages existed to link to.

---
_See `SITE_ARCHITECTURE.md` for the target structure and `IMPLEMENTATION_SUMMARY.md` for what was changed._
