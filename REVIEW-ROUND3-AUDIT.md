# Verified Round 3 fixes — review only

Based on main `ef63d858250d324e76aa591f20540bd98ea286fd` after PR #19. No merge or deployment is included. Frank confirmed ISBN **9798174357846** for the second edition; it is included in the Book metadata. Both statement-import tools remain free of analytics.

## Changes by audit item

1. **Font loading:** added the missing Fraunces italic preload on 17 Tools/guide pages whose H1 uses it. The Tools homepage already had that preload; all 18 italic headlines are now covered without duplicates. No fallback-font override was needed: measured preview CLS is 0 for the debt calculator and the other three requested pages.
2. **Explain My 401(k):** preloads all three locally hosted fonts; adds BreadcrumbList, WebApplication and FAQPage structured data matching its six existing visible questions; adds an optional newsletter link inside the results section. The card is hidden initially, after edits make results stale, after import replacement and after clearing. The page and social titles now read **401(k) Explainer: Match, Investments & Fees | PYMTW**. Existing visible guide content is unchanged.
3. **Paycheck title:** page, Open Graph and Twitter titles now read **Paycheck Decoder: Understand Your Pay Stub | PYMTW**. Its existing FAQ/schema and private import remain intact.
4. **Tap targets:** standalone `.linkbtn` controls, including “Add another debt,” now have a minimum 24×24px target with vertical padding. Add/remove behavior and mobile layouts passed. Existing navigation targets already have 44px minimum height. The cited “Put Your Money to Work” text is a footer sentence link; it was left in its existing inline layout. WCAG's minimum-target rule has inline and spacing exceptions, so its size alone was not treated as a verified failure.
5. **Book metadata:** adds the confirmed publication month as `datePublished: "2026-09"`. The visible **September 2026** text is unchanged. Adds the user-confirmed ISBN **9798174357846**. No publication day is invented.
6. **Privacy:** no analytics, external scripts or embedded signup forms were added to either importer. Both CSPs and no-referrer policies remain unchanged. The 401(k) signup uses a fixed hosted URL, `noopener noreferrer`, and no statement values, query parameters or request body.

## Preservation

All production JavaScript is byte-for-byte unchanged from main, including calculations, parsers, workers/loaders, catalog and search. Existing fonts, images, PDFs, financial data, sitemaps, routes, canonical URLs, legal/privacy text and the Google verification file are unchanged. The newsletter card follows the existing results container's visibility; it requires no new JavaScript.

## Validation

Passed:

- `tests/round3-static.py`: 18 italic headlines/preloads; all six schema answers match visible content; page/social titles match; month-only book date and confirmed ISBN; scripts/assets/catalog/sitemaps/privacy/CSP preserved.
- Existing `site-audit-static.py`, `v7-preservation.py`, `round2-static.py`, `v7-links.py`: 57 pages, 1,271 local references, 380 Tools references, metadata/indexing and original source preservation.
- `tests/round3-browser.cjs`: 320/390/768/1280px; newsletter hidden/show/stale/reset, sample math, add-debt target and behavior, italic font loading, overflow checks. An intercepted signup click used only the fixed destination, with no request body, referrer or opener. No actual subscription was submitted.
- `tests/site-audit-browser.cjs`: 18 Tools routes at three widths; all wizard steps/live results, fonts, newsletter cards, navigation, debt controls and existing analytics opt-outs.
- `tests/401k-launch.cjs`, `tests/paycheck-launch.cjs`: catalog availability, search/categories, public metadata, navigation, import controls and sitemap. Only their expected page-title strings changed.
- `tests/401k-browser.cjs`: four widths, contribution/match/fee calculations, partial/invalid inputs, stale results, reset/reload, no transmission/storage. Automated accessibility checks passed for initial and example states.
- `tests/401k-import-browser.cjs`, `tests/paycheck-import-browser.cjs`: real local text/scanned PDFs and PNG/JPG/WebP recognition, editable review, page selection, rotation, rejection cases, cancellation/reset, responsive layouts and privacy assertions. No third-party requests, document payloads, cookies or local/session/IndexedDB persistence. 401(k) populated import accessibility also passed.
- `tests/v7-calculations.cjs`: 17 assertions; `401k-core.cjs`: 16 scenarios; `401k-import-parser.cjs`: 8 scenarios; `paycheck-decoder.cjs`: 17 scenarios; `paycheck-import-parser.cjs`: 14 scenarios.
- `tests/bitcoin-reliability.cjs`, `site-analytics.cjs`, `v7-newsletter.cjs`: existing DCA behavior, sanitized analytics/opt-outs and optional signup handling.
- Desktop/mobile newsletter screenshots visually inspected; `git diff --check`.

All import tests use fictional statements. They do not guarantee recognition of every real-world layout. Historical snapshot tests from earlier redesign PRs are not represented as a current full-suite certification.

## Lighthouse mobile

Lighthouse 12.8.2 and Chrome, default simulated mobile settings, one recorded run per page against the local review build. All four pages scored 100 in Accessibility, Best Practices and SEO. These are lab observations, not production guarantees or complete accessibility certification.

| Page | Performance | Accessibility | Best practices | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/tools/debt-payoff-planner/` | 99 | 100 | 100 | 100 | 0 |
| `/tools/explain-my-401k/` | 99 | 100 | 100 | 100 | 0 |
| `/tools/paycheck-decoder/` | 99 | 100 | 100 | 100 | 0 |
| `/tools/` | 95 | 100 | 100 | 100 | 0 |

The earlier live-site review measured 401(k) CLS 0.067 and attributed movement to loading web fonts. It did not reproduce Grok's debt-page CLS 0.226. Live and local runs have different network conditions, so these results are not a controlled performance comparison. The requested preview CLS target below 0.05 is met without a size-adjusted fallback.

Full HTML/JSON Lighthouse reports and newsletter screenshots are saved in this Codex task's outputs.

## Local review

Open `http://127.0.0.1:8776/tools/explain-my-401k/` and choose **Try an example** to see the newsletter card after the results. Use `PREVIEW_URL` to point the browser tests at a different server, `PLAYWRIGHT_PATH` for Playwright, and `AXE_PATH` for optional local accessibility checks.
