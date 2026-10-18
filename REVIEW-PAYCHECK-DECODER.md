# Paycheck Decoder — unpublished review preview

Preview: http://127.0.0.1:8773/tools/paycheck-decoder/

Branch: `feature/paycheck-decoder-preview`. Based on main after PR #17. No merge, deployment, or public launch. The shared catalog still marks Paycheck Decoder as planned, and this page remains noindex and excluded from the sitemap.

## What is implemented

- Local photo/PDF import with mandatory review, plus manual entry for a single current-period U.S. employee paycheck, in dollars.
- Gross cash earnings, optional reported net pay, and up to 30 labeled payroll lines.
- Fourteen line types and a searchable glossary of common codes. Tax, retirement, benefit, reimbursement, employer contribution and memo explanations are separated.
- Integer-cent reconciliation: gross cash minus entered employee taxes and deductions, plus cash additions not already included in gross. Employer and memo amounts do not change cash pay.
- Exact match, missing net, mismatch and negative-result states. Combined FICA and separate Social Security/Medicare cannot be counted together.
- Fictional example, editable rows, accessible errors, stale-result clearing, clear-all and reload reset.
- Existing green Money Tools theme, responsive layout, and PYMTW logo returning to the parent homepage.
- No analytics, server uploads, third-party scripts or persistence of pay-stub data. OCR/PDF code, models and fonts are bundled and loaded from the same origin. External source links open only when selected, without sending entries or a referrer.

## Scope for this first preview

This is a pay-stub explanation and arithmetic tool. It suggests classifications for recognized labels but requires review. It does not audit employer correctness, project annual tax liability, or recommend W-4 settings. Labels alone cannot establish pre-tax treatment. Non-cash pay and unusual reversals may require payroll assistance. The IRS withholding estimator is linked for the broader annual question.

The sample is fictional: $3,000 gross cash, $609.50 employee taxes, $325 deductions and $25 reimbursement yield $2,090.50. A $90 employer match is informational only. The health-premium example is explicitly after-tax. None of these amounts are recommended withholding.

## Verification

- 17 core calculation scenarios: pennies, formatting, optional versus zero net, both mismatch directions, negative calculated net, reimbursements, employer/memo exclusion, FICA duplication, invalid/oversized input and line limits.
- Browser checks at 320, 390, 768 and 1280 pixels: example, custom entries, mismatch, add/remove, required fields, malformed amounts, glossary, escaped user labels, clear/reload and stale results.
- Browser request/storage checks: no third-party requests, no submitted amounts in requests, no cookies and no local/session storage.
- Site static check: 57 pages, 1,189 references. Tools link checks: 337 references. Existing source-preservation checks pass, with an explicit exception for replacing this tool's approved coming-soon stub.
- Lighthouse accessibility and best-practices scores are 100/100 on both entry and example-result screens, with no failing checks in those categories. Reports are saved with the local preview outputs; automated audits do not certify full accessibility.

Run `node tests/paycheck-decoder.cjs`. For browser checks set `PLAYWRIGHT_PATH` to the installed Playwright package, start a local server at the repository root, and run `node tests/paycheck-decoder-browser.cjs`. `PREVIEW_URL` overrides the default local port 8773.

## Sources reviewed October 18, 2026

- https://consumer.gov/your-money/your-paycheck-explained
- https://www.irs.gov/taxtopics/tc751
- https://www.irs.gov/retirement-plans/retirement-plan-faqs-regarding-contributions-are-retirement-plan-contributions-subject-to-withholding-for-fica-medicare-or-federal-income-tax
- https://www.irs.gov/publications/p15b
- https://www.irs.gov/individuals/tax-withholding-estimator

Before launch, obtain approval of the preview and scope, remove the preview banner/noindex, finalize public metadata, enable the tool in the catalog/search, and add the route to the sitemap. These release actions are intentionally not part of this preview.

## Private photo and PDF import

Supported: JPEG, PNG, WebP and PDFs up to 10 MB; PDFs up to 5 pages; English printed text. One selected page is processed at a time. Photos over 40 megapixels are rejected and working canvases are bounded to about 6 million pixels. Password-protected PDFs must be unlocked locally first. Handwriting and unfamiliar layouts may require manual corrections.

PDF.js 5.6.205 reads text PDFs and renders scanned pages. Tesseract.js/core 7.0.0 and the bundled English tessdata_fast model recognize images. All code/model/resource URLs point to the same origin; there is no cloud OCR fallback. Content Security Policy blocks third-party connections, form submission, frames and objects. PDF JavaScript actions are never invoked; dynamic PDF evaluation is disabled. OCR model IndexedDB caching is disabled. Public library/model assets may be cached by the browser, but pay-stub data is not written to storage.

The reader only proposes lines. It excludes identifying/banking fields and defaults unknown labels, earnings details and subtotals to excluded. Multiple amount columns require a user selection; it does not silently choose current versus YTD. Source text is shown alongside editable labels, classifications and amounts. Negative adjustments are not converted to positive values. A review checkbox and explicit import are required. Import replaces the form values and removes the document canvas and raw extracted text; it does not automatically calculate a result. Users can remove the file, cancel reading or clear all entries.

Vendor licenses and a SHA-256 manifest are in `tools/paycheck-decoder/vendor/`. The vendored bundle is approximately 21 MB, loaded as needed (not all downloaded on initial page load). Fictional sample PDF/photo downloads are available within the preview. All fixtures in `tests/fixtures/paycheck-import/` are synthetic; no actual pay stub was used or committed.

### Import verification

- 14 parser scenarios cover current/YTD ambiguity, negative values, employer-paid taxes, ambiguous MED labels, totals, unknown labels, mixed layouts, identifying fields and bounded input.
- End-to-end browser tests actually read text PDFs, scanned PDFs, PNG, JPEG and WebP fixtures, then reconcile the imported sample to $2,090.50.
- Confirmed: no form overwrite before explicit review/import, editable extracted amounts, multi-page isolation, rotation, blank-image handling, corrupt/spoofed/password-protected/oversized files, page limits, cancellation without late results, and clear-all cleanup.
- Review tested at 320, 390, 768 and 1280 pixels. The existing manual-entry browser and calculation suites still pass.
- Network/storage checks during actual OCR and PDF processing: only same-origin GET requests for public assets; no request bodies or document data in URLs; no third-party requests; no cookies, localStorage, sessionStorage or IndexedDB databases.
- Automated accessibility checks run on initial import and populated desktop/mobile review states. This is not a complete accessibility certification.

Run `node tests/paycheck-import-parser.cjs` and `node tests/paycheck-import-browser.cjs` (same Playwright/PREVIEW_URL configuration as above). OCR tests use the committed fictional fixtures and need no remote OCR service.

Real-world payroll layouts and camera quality vary. Tests demonstrate the private pipeline and review controls on synthetic fixtures, not universal extraction accuracy. The preview remains local and unpublished; catalog status and sitemap are unchanged.
