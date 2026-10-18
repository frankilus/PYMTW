# Explain My 401(k) — reviewed tool and launch

Originally reviewed locally at port 8774 on `feature/explain-my-401k-preview`. On October 18, 2026, Frank authorized including this tool in the PR #19 release.

The release removes the preview banner/noindex, marks the tool available in the Money Tools catalog and search, adds it to the sitemap and updates the listing description to its actual scope. Matching PYMTW favicons and public social metadata are retained. The reviewed calculation and import scripts are unchanged. No analytics is added.

Production route: https://pymtw.com/tools/explain-my-401k/

## Scope

Manual entry or private statement photo/PDF import for a U.S. workplace 401(k), using an existing statement and plan documents. The first version focuses on understanding a current plan rather than retirement projections or account integration. Import is limited to reviewed investment holdings; match rules, contributions, vesting and plan fees are entered separately.

- Contributions: annualized employee contributions and optional one- or two-tier employer matching. Unknown and no-match states are distinct. Two tiers use sequential contribution bands.
- Ownership: optional employer-source balance and entered vested percentage. Employee contributions remain fully vested; only the entered employer source is modeled.
- Investments: up to 20 current fund balances and user-selected types. Target-date/balanced funds remain grouped; no underlying asset allocation is invented.
- Fees: current balance multiplied by each known annual expense ratio, plus separately entered annual flat and asset-based plan fees. Unknown fees remain explicitly unknown. Weighted fund ratio uses only holdings with known fees; coverage is shown. No benchmark or recommendation of individual funds is made.
- Plain-English guide, plan-specific follow-up questions, links to existing Money Tools, and a fictional example.

No annual IRS/plan limits, compensation caps, tax savings, catch-ups, pay-period timing, true-up, eligibility, nonelective contributions, future investment returns or retirement-readiness score are calculated. These boundaries are stated beside the relevant results. Use plan documents for actual matching and vesting terms.

Example: $80,000 eligible pay at 4% = $3,200 annualized employee contributions. A 50% match on the first 6% gives $1,600 at the entered rate and a $2,400 formula maximum, before eligibility/timing/limits. $60,000 across three funds produces $42 in estimated annual fund expenses, plus $60 flat plan fees = $102. $20,000 employer-source balance at 60% vesting = $12,000 vested.

## Privacy

Local arithmetic only, no analytics, external scripts, account links, network submissions or persistence. CSP blocks third-party connections, form submissions and frames. Reading libraries, workers, fonts and models load from the same origin; pay-stub/statement data is never included in network requests. User-entered labels are escaped. Clear all, reload and restored-page handling discard inputs/results. Changes hide stale results until recalculation.

## Verification

- `node tests/401k-core.cjs`: 16 scenario groups covering example arithmetic, matching bands, cap behavior, zero/unknown distinctions, partial inputs, fee coverage, asset-based costs, zero balances, vesting, validation and input limits.
- `node tests/401k-browser.cjs`: mobile/desktop, interactive examples, two-tier matching, unknown fees, no data transmission/storage, partial entry, errors, escaped labels, add/remove, stale results and reset/reload. Set `PLAYWRIGHT_PATH` if Playwright is not on the module path; `PREVIEW_URL` defaults to port 8774.
- Optional `AXE_PATH` runs automated accessibility checks on initial and example states. That separate audit context bypasses CSP only to inject the local audit library; functional/privacy checks run with normal CSP.
- Static site, local link and preservation checks. The preservation test explicitly permits replacing only this tool's coming-soon stub in addition to previously approved changes.

Official sources are linked in the page: IRS matching, vesting and designated Roth accounts; Department of Labor fee disclosures and target-date funds. Reviewed October 18, 2026.

## Private statement import

- Reuses the existing bundled PDF.js 5.6.205 and Tesseract.js/core 7.0.0 assets from `/tools/paycheck-decoder/vendor/`. There are no new remote dependencies or duplicate vendor bundles, and the Paycheck Decoder files are unchanged.
- JPG, PNG, WebP and PDF, at most 10 MB. PDFs up to 20 pages, one selected page at a time; photos up to 40 megapixels, with working canvases bounded to roughly 6 megapixels. English printed text. Password PDFs must be unlocked locally.
- PDF text layers are used when available, with local OCR for scans/photos. PDFs disable dynamic evaluation and XFA; annotations are not rendered and actions are not invoked. OCR caching in IndexedDB is disabled. Reading has a 90-second timeout.
- Every candidate starts unchecked. Users explicitly select the current/ending balance column or edit balances, verify investment types, and enter known expense ratios. Percentages are never guessed to be expense ratios. Totals, many activity/source lines and identifiers are excluded; unfamiliar rows still require user judgment. Multi-line labels, integer-only balances, poor photos and complex layouts can need manual entry.
- Mandatory review precedes an atomic replacement of the investment list only. Duplicate selected names and invalid balances/fees are rejected. Other plan inputs are preserved, with a warning if they came from the fictional example. Pages are not automatically merged; additional-page holdings can be added manually.
- Cancel/remove/reset/page navigation terminate active work and clear canvases/raw text. A successfully imported file and extracted text are removed, while selected holdings remain editable. Browser caching may retain public reading software, never statement data.
- Fictional sample PDF and photo downloads are included in the UI. All committed fixtures are synthetic. No real financial statement was used.

Tests: `tests/401k-import-parser.cjs` covers 8 groups of extraction/classification, column ambiguity, percentages, negative amounts, precision, identifiers/totals and bounded input. `tests/401k-import-browser.cjs` exercises actual text/scanned PDFs and three photo formats, rotation, page selection, explicit review, duplicate rejection, preserved plan data, clear/cancel, malformed/password-protected/oversized files and page limits. It also verifies fixed public asset requests only, no request payloads, no cookies or local/session/IndexedDB storage, and desktop/mobile review layouts. Optional `AXE_PATH` checks populated review accessibility. Automated tests on fictional statements do not establish universal extraction accuracy.

## Launch validation

The release reruns all 16 calculation scenarios, 8 parser scenarios, responsive manual-entry tests, actual local photo/text-PDF/scanned-PDF recognition, import review/cancellation/error/privacy tests, and automated accessibility on entry, example and populated import states. `tests/401k-launch.cjs` covers the available catalog card, search, life-moment category, public indexing, import control, example calculation, parent-home logo and sitemap. The existing Paycheck launch test now expects one remaining planned tool.
