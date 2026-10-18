# Bitcoin Tax-Lot Cleanup — local preview

Review URL: http://127.0.0.1:8777/tools/bitcoin-tax-lot-cleanup/

Branch: `feature/bitcoin-tax-lot-preview`, based on main at `eb88595e5c6d7a7391388b8d273d7b110b498e20` (PR #20). No push, PR, merge or deployment is part of this preview. The catalog still marks this tool planned; noindex and sitemap exclusion remain.

## What to try

Select **Try an example**. Record 5 repeats a sale; record 6 lacks its acquisition cost. Exclude record 5, edit record 6’s USD amount to 4000, confirm the FIFO illustration, then check the records. The result is $1,800 proceeds, $800 matched basis and $1,000 illustrated gain. The hardware wallet retains 0.03 BTC with $1,200 basis. Excluded rows remain traceable in the records export.

Alternatively, import the fictional CSV template, verify its column mapping, and confirm the import. Its sale produces $1,500 proceeds, $800 basis and $700 gain. Add more CSVs or enter/edit records manually. A duplicate import is flagged, not silently dropped. On narrow screens, editable records become cards.

## Implemented behavior

- Local-only UTF-8, comma-separated CSV parsing with quoted fields, BOM, embedded newlines and strict row/header validation; 2 MB/file and 500 records overall.
- Explicit column mapping and confirmation. Only exact template headers are preselected. No exchange-specific type, currency, date, sign or transfer-pair guessing.
- Original imported values, source file/row and inclusion status retained in downloadable record/issue reports. Unknown cost stays unknown. Exclusion is explicit and reversible.
- Strict UTC second-resolution timestamps and plain unsigned decimals; BTC stored as integer satoshis, USD as integer cents. BigInt accounting and exact display formatting avoid floating-point arithmetic.
- Account-specific FIFO for USD buys/sales and fee-free own-account transfers. Transfers preserve original acquisition dates and basis; partial allocations conserve cents. Separate original acquisitions sharing a timestamp in one account block matching rather than inventing an order.
- Detection of missing/invalid values, duplicate candidates, reused account references, ambiguous capitalization/timestamps, unsupported activity/fees, future records and insufficient per-account inventory. Unresolved records suppress all gain figures and lot exports, including otherwise valid earlier sales.
- Remaining wallet balances/basis, individual sale-lot breakdown, remaining-lot CSV. All entered sales are included; there is no tax-year filter.
- Source-linked plain-English scope and privacy guide; responsive green Money Tools styling and parent-home logo link.

## Deliberate boundaries

The worksheet is for review, not Form 8949, a tax return or a tax estimate. No automatic holding-period classifications, 1099-DA reconciliation, filing-box selection or tax rates. No HIFO/specific-identification election or reconstruction. The chosen broker method and existing records may require a different result.

Sales and transfers before January 1, 2025 are blocked. Earlier purchase records can establish original lots. Complete supported history is required; missing past disposals or historical universal-basis allocations cannot be reconstructed. Clean structural checks do not prove completeness. Users must reconcile balances, costs and prior treatment with their records/preparer.

BTC-denominated fees, cash transfer fees, other assets, swaps, gifts, inheritance, rewards, mining, income and spending are not modeled. They must not be deleted or disguised to force a result. A withdrawal and its deposit must be independently reconciled into one fee-free transfer row before import. Common exchange exports require preparation into the documented column meanings. PDF/photo import and exchange API connections are not included.

## Privacy and security

No analytics, third-party scripts, uploads, persistence, API calls, cookies or telemetry. CSP blocks all connections, frames, workers and form submissions. Scripts, styles and fonts are local. Clear/reload/pagehide clears in-memory entries; downloaded/original files remain on the user's device. User-controlled labels render with textContent. Export cells neutralize spreadsheet formula prefixes; negative numeric exports are conservatively quoted as text with an apostrophe where needed.

## Verification completed

- `tests/tax-lot-core.cjs`: 19 focused checks including arithmetic, FIFO across transferred lots, cents conservation, missing-vs-zero basis, blocked partial results, duplicate/exclusion behavior, unsupported inputs, strict timestamps, CSV parsing/mapping/limits and formula injection.
- `tests/tax-lot-browser.cjs`: Chrome at 320, 390, 768 and 1280 px; sample corrections, expected results, private file mapping/append, duplicate import, manual entry, canceled import, exports, stale-result suppression, clear/reload, malicious text rendering; no external or non-GET network requests and no storage writes observed. Automated axe WCAG A/AA checks passed on populated results at all four widths. These checks are not a full manual accessibility audit.
- `tests/tax-lot-static.py`: byte-for-byte preservation of existing main files other than this planned tool’s HTML and the narrow old-stub preservation exception; strict preview privacy and noindex checks.
- Existing `tests/v7-preservation.py`, `tests/v7-links.py`, `tests/site-audit-static.py`, `tests/round3-static.py` passed. Both live statement-import tools, catalogs, analytics boundaries, sitemaps, assets and deployment files are unchanged.
- Desktop/mobile screenshots visually inspected. Financial examples are fictional; no personal files were used.

## Sources

IRS guidance reviewed October 18, 2026:

- https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-digital-asset-transactions — basis, fees, own-account transfers, identification and wallet/account FIFO, particularly FAQs 52–56, 62, 81–95.
- https://www.irs.gov/filing/digital-assets — digital asset record/reporting overview.

## Run locally

From this checkout: `python3 -m http.server 8777 --bind 127.0.0.1`.

Use Node to run `tests/tax-lot-core.cjs`; use Python 3 for static checks. Browser checks require Playwright/Chrome (`PLAYWRIGHT_PATH`), axe (`AXE_PATH`) and optionally `SCREENSHOT_DIR`; `PREVIEW_URL` defaults to port 8777. Browser tests keep production CSP enabled and inject the accessibility auditor through the test runner, not a shipped script.
