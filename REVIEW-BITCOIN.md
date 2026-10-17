# Bitcoin reliability and security fixes

Review branch only. Do not merge or deploy until the owner approves.

## What changes

- Correct the COLDCARD seed-migration/passphrase exception, related FAQ and table; distinguish an existing seed from current hardware/firmware. Direct official status and migration links, source-checked 2026-10-17. No new migration procedure is invented.
- Replace unsupported Bitcoin newsletter POSTs with an explicit Beehiiv-hosted signup handoff. Beehiiv handles validation, duplicates, verification and confirmation. Opening the page is never counted as a subscription. The Tools publication is unchanged.
- Route nine inquiry forms to the public Web3Forms access key already used by the existing Services form. Preserve organization, chosen service/plan, notes and order references. Add the missing general-contact message field. Show acceptance only for HTTP success plus JSON `success: true`; retain inputs on provider rejection, invalid responses, network failure and timeout. Prevent duplicate in-flight requests. Do not claim booking, payment, subscription or inbox delivery.
- Show existing assessment results without an email gate. Offer newsletter signup separately. Serve the existing public playbook PDF directly instead of promising unverified email delivery.
- Fix zero/invalid amounts and date handling in the legacy DCA calculator. State exactly when contributions occur; warn prominently when a requested period exceeds the available data. Numeric results work when the external chart library is unavailable.
- Preserve the legacy price values verbatim in `dca-data.js` and provide matching CSV. Their source/sampling method is undocumented: the UI explicitly labels them illustrative, not verified historical returns. This PR does **not** certify these market prices.
- Share one accessible navigation handler across legacy Bitcoin pages and the shared header: actual dropdown buttons, expanded state, keyboard/Escape handling, mobile focus containment, closed-menu inert state, scrollable mobile menu and resize cleanup. Remove duplicate handlers.
- Fix Programs' forced mobile columns, Book footer wrapping and animated-shadow overflow, the Book newsletter URL, and free labels that led to a paid kit. Label workshop and membership actions as availability/interest requests.
- A visit to the checkout return page no longer claims a completed purchase or registration. Only record a return-page view.
- Update privacy/integration documentation to match actual data routing.

The parent homepage, all `/tools/` files, CNAME, sitemaps, robots and existing PDF are unchanged. All existing URLs remain.

## Validation

Run from the repository root with Node and Python 3. Browser tests require Playwright and Chrome. Set `PLAYWRIGHT_PATH` if the module is installed outside the normal search path; `PREVIEW_URL` defaults to `http://127.0.0.1:8769`.

```sh
python3 -m http.server 8769 --bind 127.0.0.1
# In another terminal:
node tests/bitcoin-reliability.cjs
node tests/bitcoin-browser.cjs
python3 tests/bitcoin-static.py
node tests/v7-calculations.cjs
python3 tests/v7-links.py
```

- Calculation checks: known-value flat/rising-price cases, contribution timing, zero/negative/blank/non-finite inputs, duration bounds, date boundaries, truncated ranges, missing prices and CSV parity.
- Browser: seven pages at 320, 390, 768 and 1280 px; eight mobile menus and desktop keyboard dropdowns; calculator error/warning paths; assessment completion/retake; newsletter destinations; nine inquiry forms with intercepted provider acceptance; corporate field preservation and payloads across HTTP rejection, `success: false`, malformed JSON, network failure and 15-second timeout.
- Browser requests are intercepted: no real test inquiries, subscriptions or purchases are submitted.
- Static: 853 local references across 37 pages; inline and root JavaScript syntax; no unsupported Beehiiv POSTs; preservation checks against merged PR #9.
- Existing Money Tools: 17 calculation assertions and 278 local link/asset references pass.
- Separate read-only browser check: DCA chart loaded with no JavaScript errors; hosted Bitcoin Beehiiv signup page loaded with its subscription UI.

Older `homepage-migration.py` and `v7-preservation.py` were frozen checks for earlier redesigns that prohibited any legacy-script/privacy edits. This release intentionally changes those files; `bitcoin-static.py` supplies the current preservation boundary.

## Still requires operational verification before launch

1. Web3Forms destination mailbox, spam filtering and actual inbox delivery have not been verified. The configured routing key is reused from Services, not newly provisioned. Use an authorized address to test actual receipt and all submitted fields before deployment.
2. Beehiiv signup completion, duplicate behavior, confirmation emails and publisher automations are provider-owned and have not been retested with a real subscription in this PR.
3. Existing Stripe checkout, paid-product delivery, session scheduling and book-bonus fulfillment are not exercised. No live provider settings are changed. Blank workshop/membership checkout settings remain blank; requests do not create bookings or billing.
4. Replace the illustrative DCA prices with a documented, verified historical dataset in a future data-focused change before marketing the calculator as a historical backtest.
5. The static scan also found pre-existing missing `dashboard.css`, `dashboard.js`, `members.css` and `members.js` on legacy dashboard/member pages. This PR does not repair or activate those separate products.

Official sources: https://coldcard.com/security/status and https://coldcard.com/security/migrate (checked 2026-10-17).
