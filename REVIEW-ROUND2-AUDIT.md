# Verified Round 2 audit fixes and approved 401(k) launch

Based on main `639202524de45d7b8e43f49c19de08c1aea4eef6`. Frank subsequently approved merging PR #19 and launching the reviewed Explain My 401(k), including its private statement import. The release now includes that tool and its catalog/search/sitemap activation.

## Changes and decisions by audit item

| Item | Verified result and action |
| --- | --- |
| 1 | The Tools newsletter `/archive` returns 404; the publication root redirects to `/subscribe`. All three guides now offer one accurately labeled **Subscribe to the newsletter** link directly to `/subscribe`. No archive destination was invented. |
| 2 | The reported debt-page layout shift was not reproduced. Its final local mobile test has CLS **0** and performance **99**. No blanket italic-font preload was added. |
| 3 | Paycheck Decoder now has an optional newsletter invitation after calculated results, plus WebApplication and FAQPage structured data with matching visible questions. Its existing title and BreadcrumbList were already suitable. The invitation opens the hosted signup page only when clicked. **No analytics or embedded signup form was added, and its restrictive CSP is byte-for-byte unchanged.** |
| 4 | Book title and Open Graph title now say **Bitcoin for Working Professionals (Second Edition) by Frank Jerome**. The user-confirmed **September 2026** date is retained. |
| 5 | No change needed: the untagged Amazon link was already explicitly labeled **Direct Amazon link · not an affiliate link**. |
| 6 | The starter-kit purchase button's HTML fallback incorrectly pointed to Beehiiv, while JavaScript already used the configured Stripe checkout. Its fallback now uses that same Stripe URL, including with JavaScript disabled. Changing a $29 purchase button to a newsletter would be misleading. Checkout configuration, price and delivery settings are unchanged. No purchase was made. |
| 7 | Added spaces before the three Bitcoin homepage heading line breaks. All Understand, Evaluate and Protect headings now read correctly when mobile styles hide the breaks. |
| 8 | Increased sub-12px labels to at least 12px on the parent homepage, Bitcoin homepage, legacy Bitcoin library and resources page. Darkened the specifically flagged Bitcoin colors to `#6f6352`. Verified responsive layout and visible text sizes; this is not a claim of complete WCAG compliance. |
| 9 | Underlined the car guide's source links. Tools logos now use their visible **PYMTW Tools** text as their accessible name instead of an overriding label that omitted part of it; the decorative P stays hidden from assistive technology. The parent-home destination is unchanged. A targeted accessibility check confirms the name-mismatch warning is resolved. |
| 10 | Replaced the Tools homepage's “original PYMTW emergency fund calculation” wording with a plain description of how long savings could cover essential spending. |
| 11 | Removed empty Book `numberOfPages` and added the authentic cover image to Book structured data. ISBN and page count remain omitted because neither was verified. |
| 12 | Added a shared branded 1200×630 social card to the **32 shareable pages** actually missing an image. Existing page-specific cards are retained; noindex utility pages are excluded. |
| 13 | Added a matching multi-size ICO and the previously requested PYMTW brand SVG favicon, with versioned links across 57 production pages. Historical preview files are untouched. |
| 14 | Replaced the long Unchained redirect chain with the verified final collection URL, `https://www.unchained.com/blog-category/gradually-then-suddenly`, and its canonical `www` homepage URL. |
| 15 | Added a visually hidden **Remove** heading to the debt table's action column. Add/remove behavior and calculation code are unchanged. |
| 16 | Removed the unused Inter/Space Grotesk Google Fonts request and preconnects from the book page. Its visible theme already uses Arial and Georgia. |

## Privacy and scope

- Paycheck photos, PDFs and extracted amounts continue to be processed locally. No third-party request, document upload, analytics, cookies or browser persistence was observed during the tested import and manual-entry flows.
- The newsletter card contains a fixed external link; it does not include entered amounts or document text. The page keeps `no-referrer` and the link uses `noopener noreferrer`.
- The reviewed 401(k) statement-import tool is included in this release with its existing no-analytics policy and restrictive CSP.
- Existing calculator JavaScript is byte-for-byte preserved relative to this PR's base. Production changes are the three heading spaces and the exact 401(k) catalog/homepage activation. New 401(k) calculation and import scripts match the reviewed preview. Calculator data, photographs, authentic book-cover derivatives, routes, canonicals, privacy-policy body, provider configuration and Search Console verification are preserved; only the newly launched 401(k) noindex/sitemap entry changes.
- Existing analytics on other public pages are unchanged.

## Validation

Passed automated checks:

- `tests/site-audit-static.py`: 57 pages and 1,252 local references; canonical/description/JSON-LD, indexing and script syntax.
- `tests/round2-static.py`: strict production-JavaScript and asset preservation; metadata/link fixes; unchanged Paycheck CSP and no tracking; exact authorized 401(k) catalog/sitemap launch changes and unchanged reviewed scripts.
- `tests/v7-preservation.py` and `tests/v7-links.py`: original calculation scripts/forms, approved cover hashes, privacy disclosures and 361 Tools references.
- `tests/v7-calculations.cjs`: 17 original calculation assertions.
- `tests/paycheck-decoder.cjs`: 17 calculation/validation scenarios.
- `tests/paycheck-import-parser.cjs`: 14 parsing scenarios.
- `tests/bitcoin-reliability.cjs`: DCA known values, dates, missing prices, invalid inputs and CSV parity.
- `tests/site-analytics.cjs`, `tests/v7-newsletter.cjs` and `tests/homepage-fragments.cjs`: existing analytics sanitization/opt-outs, optional newsletter behavior and legacy route fragments.
- `tests/round2-browser.cjs`: four viewport widths, Bitcoin headings, book title/fonts, result-only newsletter/reset, guide signup links, underlined sources, debt table and JavaScript-disabled checkout fallback; no sub-12px visible text on the four audited landing/library pages.
- `tests/site-audit-browser.cjs`: 18 Tools routes at 320/390/1280px, every wizard step/live result, fonts, newsletter cards, debt editing, holding pages, 404 search, real cover and analytics opt-outs.
- `tests/paycheck-decoder-browser.cjs`: manual entry, reconciliation, errors, escaped labels, glossary, reset/reload and privacy at 320/390/768/1280px.
- `tests/paycheck-import-browser.cjs`: real local PNG/JPG/WebP recognition, text and scanned PDFs, page selection, rotation, editable review, rejection cases, cancellation, reset, responsive review and privacy assertions. Only fixed same-origin public assets were requested; no request bodies or cookies/local/session/IndexedDB storage.
- `tests/bitcoin-resources-browser.cjs`: all 49 resources, five categories, search/reset, keyboard/history/deep links, local destinations and no-JavaScript access at five widths.
- Targeted axe check: no Tools logo label-content-name mismatch.
- Mobile screenshots and the shared social card visually inspected; `git diff --check` passed.

Test maintenance is limited to the approved metadata/favicons in preservation checks, explicit public favicon paths in import traffic checks, and scoping glossary assertions to the glossary now that a separate FAQ is present. Old historical snapshot tests from earlier redesign PRs are not presented as a current full-suite certification.

## Mobile Lighthouse

Lighthouse 12.8.2, Chrome, default mobile simulation against the local review server. One recorded final run per page, with the debt page rerun after its accessible-name fix. These are local lab results; production/CDN behavior, hardware and network conditions may differ.

| Page | Performance | Accessibility | Best practices | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 0 |
| `/tools/` | 96 | 100 | 100 | 100 | 0 |
| `/tools/debt-payoff-planner/` | 99 | 100 | 100 | 100 | 0 |
| `/tools/paycheck-decoder/` | 99 | 100 | 100 | 100 | 0.00023 |
| `/book/` | 99 | 100 | 100 | 100 | 0 |
| `/bitcoin/` | 100 | 100 | 100 | 100 | 0 |

Full HTML/JSON reports and screenshots are saved in this Codex task's outputs. Accessibility scores are automated coverage, not a certification. No new financial guidance, completed Beehiiv subscription, payment fulfillment or production deployment was tested.

## Local review

Serve this branch with a static HTTP server and review `/`, `/bitcoin/`, `/resources.html`, `/book/` and `/tools/paycheck-decoder/`. Select **Try a fictional example** on Paycheck Decoder to see the newsletter invitation below the result.

Set `PREVIEW_URL` for browser tests, `PLAYWRIGHT_PATH` for the installed Playwright module, and `NODE` for the Python syntax checker. Chrome is used by the browser tests.

## Approved 401(k) release addition

See [the tool review and launch notes](REVIEW-401K-PREVIEW.md) for scope, privacy, limits and tests. It supports manual entry and private photo/PDF import of investment holdings. Contributions, match rules, vesting and plan fees are entered separately. It does not score retirement readiness or infer missing expense ratios. Both statement-import tools remain free of analytics. The Lighthouse table above records the audit build before this launch addition; it is not a Lighthouse score for the new 401(k) tool.
