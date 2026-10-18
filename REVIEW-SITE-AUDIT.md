# Website audit fixes — review only

One PR based on live main `876fcc6`. Do not merge or deploy until Frank approves. The current design, original photos and cover, calculator math/data, privacy disclosures, provider configuration, and Google Search Console verification are retained.

## Findings and changes by audit item

1. **Fonts:** confirmed missing fonts. Self-host DM Sans and genuine Fraunces in `/assets/fonts/`, with licenses, WOFF2 subsets, swap, and hero preloads. The referenced preview folder contains DM Serif Display, not Fraunces; it was not mislabeled. Font loading verified on every tool, guide and checkup page.
2. **Member pages:** confirmed four missing assets and unusable screens. Replace both pages with styled, noindex “Not yet available” screens; remove them from the sitemap. No login fields, account data, or new authentication logic.
3. **404:** add a page with absolute asset paths, brand, local tool search, and Home/Tools/checkup/Bitcoin/newsletter links. Search uses a browser fragment rather than a URL query. Tested at a simulated nested 404 route; GitHub Pages delivery will take effect after an approved deployment.
4. **Canonical host:** replace www references with the apex, including social metadata and Book schema. Normalize `/book/` trailing slash.
5. **SEO:** add the six missing canonicals, descriptions on five active root pages and the two member holding pages, and 1200×630 social cards for root, Bitcoin and book. The alleged eighth missing description belongs to the Google verification file, which is intentionally untouched. Root Twitter card uses the large-image format. Original image files are preserved; responsive derivatives reduce downloads.
6. **Structured data:** repair quotation escaping in the book-comparison JSON-LD and its two malformed description attributes. All inspected JSON-LD parses.
7. **Book revenue:** keep the newer user-approved `https://amzn.to/4zwsLbQ`, already live through PR #12; do not revert to Grok’s older URL. Add sponsored/noopener and nearby disclosures to both book-page purchase buttons. Mark the other untagged archive book link as a direct, non-affiliate link.
8. **Book presentation:** replace the clipped CSS mockup with the authentic supplied cover, including responsive sizes. Label it “Second Edition — September 2026,” as Frank confirmed. Record edition 2 in Book schema; no publication day is invented.
9. **Newsletter:** add an optional signup card under all eleven live tool results and checkup results, plus a root-homepage row. Keep the Bitcoin and Tools lists separate. Archive-labeled guide links go to `/archive`; signup links go to `/subscribe`, preserving each link’s stated purpose. Existing optional Beehiiv forms and privacy disclosures stay intact.
10. **Prototype copy:** replace repository/original-tool/actual-cover wording with user benefits and clear coming-soon descriptions.
11. **Mobile forms:** constrain fieldsets and inputs, stack debt entry rows with labels and 44px remove buttons, and fix the car guide’s narrow grid. Every step and live result was checked at 320/390/1280px.
12. **Readability:** increase small Tools-home labels to 13px and darken failing colors. Fix related accessible-name/decorative-logo and inline-link distinctions surfaced by Lighthouse. The requested pages score 100 in its accessibility category; this is automated coverage, not a complete WCAG certification.
13. **Dead articles:** confirmed both original URLs return 404. River’s replacement `/learn/what-is-dollar-cost-averaging/` returns 200. Remove the unavailable Unchained article rather than guessing its replacement.
14. **Analytics:** use the same cookieless GoatCounter account on root, Bitcoin, book and active pages, with fixed Amazon/Bitcoin-newsletter/Tools-newsletter event names. Existing Tools tags are routed through the shared loader to avoid duplicates. Disable provider automatic sends until its query field is removed; strip query/fragment/referrer data and honor Do Not Track/Global Privacy Control. No forms, calculator values or search text are read. Tested against both a stub and the current real provider client with transport intercepted. Legal disclosures remain verbatim.
15. **LLM index:** add a concise root `/llms.txt` linking Bitcoin, book, resources, tools and `/tools/llms.txt`.
16. **Crawling:** add missing sitemap lastmod dates from source history, refresh changed Tools dates, and add only the requested preview-folder Disallow to root robots.txt. Retain historical preview files/noindex tags.
17. **Planned tools:** noindex the three unfinished tools and remove them from the Tools sitemap. They remain discoverable as coming soon within the site.
18. **Tool roles:** cross-link the two DCA tools with their actual differences (monthly averages versus frequency controls/CSV with illustrative prices), and cross-link the Bitcoin net-worth calculator and Money Tools.

## Validation

Passed:

- `node tests/v7-newsletter.cjs` — optional provider loading, failures/timeouts, no false subscription success.
- `python3 tests/v7-preservation.py` — current source preservation, calculator scripts, original assets/data, tool forms/schema/content, privacy disclosures, verification file.
- `python3 tests/v7-links.py` — 337 Tools references, no broken links.
- `node tests/v7-calculations.cjs` — 17 original calculation assertions.
- `node tests/bitcoin-reliability.cjs` — DCA known values, timing, date bounds, invalid inputs, missing prices and CSV parity.
- `python3 tests/site-audit-static.py` — 57 pages, 1,190 local references, metadata, JSON-LD, indexing, script syntax.
- `node tests/site-audit-browser.cjs` — 18 Tools routes at three widths, all steps/live results, fonts, newsletter cards, debt editing, member placeholders, deep 404 search, real cover, fixed analytics events and DNT.
- `node tests/site-analytics.cjs` — initialization order, sanitized page data, fixed events and DNT.
- Real GoatCounter client checked with all outgoing transport intercepted: no query/fragment/referrer leakage.
- `git diff --check`.

Set `PLAYWRIGHT_PATH` to an installed Playwright module and `NODE` to Node for the Python syntax checker. Browser checks use Chrome and default to `http://127.0.0.1:8771`. Use `PREVIEW_URL` to override it.

The requested preservation test initially failed on changes already merged in PRs 10–12. It now compares against current live main, allowing only audit-specific debt labels/config hostname changes, and continues protecting math, source data, forms, schemas, original images and privacy wording. The newsletter and link tests were not weakened or replaced.

## Lighthouse mobile results

Lighthouse 12.8.2, Chrome, default mobile simulation against the local review build. Final reports saved with the task outputs. Scores fluctuate with device/network conditions and do not promise future production scores.

| Page | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 |
| `/tools/` | 95 | 100 | 100 | 100 |
| `/tools/emergency-fund-runway/` | 99 | 100 | 100 | 100 |
| `/tools/guides/first-home/` | 99 | 100 | 100 | 100 |
| `/book/` | 98 | 100 | 100 | 100 |

## Deliberately deferred / limits

- Header/footer unification and bio wording remain deferred as requested.
- Membership was hidden, not launched or rebuilt. Neither list was merged, and no real subscription, inquiry, payment or provider-setting change was made.
- Keep the newest approved Amazon link; do not apply the audit’s stale link replacement.
- Preserve the Google verification file rather than adding metadata to it.
- No new financial claims, product prices or calculator source data were introduced or certified.
- Existing historical PR preservation tests capture earlier snapshots and are not claims that later approved work remains byte-for-byte identical to those snapshots.
