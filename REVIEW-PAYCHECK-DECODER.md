# Paycheck Decoder — unpublished review preview

Preview: http://127.0.0.1:8773/tools/paycheck-decoder/

Branch: `feature/paycheck-decoder-preview`. Based on main after PR #17. No merge, deployment, or public launch. The shared catalog still marks Paycheck Decoder as planned, and this page remains noindex and excluded from the sitemap.

## What is implemented

- Manual entry for a single current-period U.S. employee paycheck, in dollars.
- Gross cash earnings, optional reported net pay, and up to 30 labeled payroll lines.
- Fourteen line types and a searchable glossary of common codes. Tax, retirement, benefit, reimbursement, employer contribution and memo explanations are separated.
- Integer-cent reconciliation: gross cash minus entered employee taxes and deductions, plus cash additions not already included in gross. Employer and memo amounts do not change cash pay.
- Exact match, missing net, mismatch and negative-result states. Combined FICA and separate Social Security/Medicare cannot be counted together.
- Fictional example, editable rows, accessible errors, stale-result clearing, clear-all and reload reset.
- Existing green Money Tools theme, responsive layout, and PYMTW logo returning to the parent homepage.
- No analytics, uploads, external scripts, browser persistence or data transmission on this page. External source links open only when selected, without sending entries or a referrer.

## Scope for this first preview

This is a pay-stub explanation and arithmetic tool. It does not read photos/PDFs, infer payroll classifications, audit employer correctness, project annual tax liability, or recommend W-4 settings. Labels alone cannot establish pre-tax treatment. Non-cash pay and unusual reversals may require payroll assistance. The IRS withholding estimator is linked for the broader annual question.

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
