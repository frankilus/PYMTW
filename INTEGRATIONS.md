# PYMTW — Integrations Setup Guide

GA4 is off until configured. The Starter Kit checkout and Web3Forms inquiry endpoint are already configured; other checkout and scheduling destinations remain blank. Configuration is not evidence of successful fulfillment. Central config lives in [`pymtw-config.js`](pymtw-config.js) (loaded in the `<head>` of every page).

---

## 1. Analytics (Google Analytics 4)

**Turn on:** open `pymtw-config.js` and set `analytics.ga4Id` to your Measurement ID (`G-XXXXXXXXXX`). That's it — the GA4 script then loads on every page, with `anonymize_ip: true` and Google Signals disabled by default.

**How events flow:** the whole site calls `pymtwTrack('event_name', { …props })`. That helper (a) pushes to `window.dataLayer` and (b) forwards to GA4 as a `gtag('event', …)` when an ID is set. A regex guard **drops any property whose key looks financial/sensitive** (`amount, value, balance, networth, price, holdings, account, seed, key, password`, …) so calculator figures can never leak into analytics. Calculators also never call `pymtwTrack` with values in the first place.

**Recommended events** (already firing where noted; wire the rest in GA4 as conversions):

| Event | Fires from |
|---|---|
| `assessment_started` / `assessment_completed` / `assessment_result_viewed` | `assessment.html` (with `profile`) |
| `newsletter_signup_opened` | Opens hosted Bitcoin newsletter signup; not a confirmed subscription |
| `inquiry_accepted` | Web3Forms returns HTTP success and JSON `success: true`; source form ID only |
| `workshop_interest` / `private_interest` / `membership_interest` | Offer-link intent, not a booking |
| `resource_link_click` | Resource Library outbound links (`data-track`) |
| `checkout_started` / `checkout_return_viewed` | live checkout-link click / return page viewed; neither confirms a payment |
| `calculator_completed` | **add** on calc run — **never include values** |

To add tracking to any link/button: `data-track="event_name"` (optional `data-track-label="…"`). No code needed — `pymtw-config.js` delegates the click.

**Alternative:** for a lighter, cookieless option, Plausible/Fathom can replace GA — point `pymtwTrack`'s forwarder at their API instead of `gtag`.

---

## 2. Checkout (Stripe / Lemon Squeezy / Gumroad)

**Turn on:** create a payment link/product for each item and paste the URL into the `checkout` map in `pymtw-config.js`:

```js
checkout: {
  "starter-kit": "https://buy.stripe.com/…",
  "workshop-professionals": "https://…",
  "membership-monthly": "https://…",
  …
}
```

**How it works:** any `<a data-checkout="starter-kit">…</a>` is automatically rewritten to that URL on page load, and a `checkout_started` event fires on click. **Until a URL is set, the link keeps its current href** (the waitlist/inquiry form) — so nothing breaks pre-launch.

**To wire a button:** add `data-checkout="<key>"` to the relevant CTA (e.g. the Starter Kit "Get the Kit" button, workshop "Request a Seat", membership "Join"). Keys already reserved in config: `starter-kit`, `workshop-professionals`, `workshop-self-custody`, `workshop-family`, `clarity`, `intensive`, `self-custody-readiness`, `membership-monthly`, `membership-annual`.

**Recommended flow:** Select → pay (checkout link) → intake form → schedule (§3) → preparation email → attend → follow-up. Use Stripe/Lemon Squeezy's post-purchase redirect to `thank-you.html?source=<checkout-key>`, which records only `checkout_return_viewed`. A redirect URL is not proof of payment; only a verified provider webhook should record completed purchases.

> Do **not** hard-code prices in checkout that contradict the pages. Keep the page price and the payment-link price in sync.

---

## 3. Scheduling (Calendly / SavvyCal)

**Turn on:** set `scheduling.calendlyUrl` in `pymtw-config.js`. Then either link to it from post-purchase/intake, or embed it. Recommended: use per-program Calendly event types and send the right link in the post-purchase email. Inquiry forms (corporate, private) can stay form-first; standardized workshops can go straight to checkout → schedule.

---

## 4. Newsletter and inquiries

Bitcoin newsletter links open `https://pymtw.beehiiv.com/subscribe`. Beehiiv owns validation, duplicate handling, human verification and confirmation. The site does not infer a subscription from opening this page. This is separate from the Tools publication. No credentials are placed in the frontend.

Nine former Beehiiv inquiry forms now use the same public Web3Forms access key already present in `services.html`. These keys are public routing identifiers, not private API credentials. `inquiry-forms.js` requires an HTTP-success response and JSON `success: true`; it preserves fields on rejection, malformed response, network error or timeout. All inquiry fields, including organization, request type, notes and order reference, are submitted. A provider acceptance message does not claim inbox delivery, a booking, a purchase or newsletter enrollment.

Assessment results require no email; no answers are posted. The existing playbook is a direct PDF download. Any future newsletter sequences need separate opt-in and publisher configuration.

Before deploying, use an authorized address to verify the Web3Forms destination inbox, spam filtering and every request's payload. Local tests intercept requests and do not prove delivery. Confirm Beehiiv signup/duplicate/confirmation behavior in the publisher account separately.

---

## 5. Proof-of-purchase (book bonus)

`book/index.html` collects email + order number. It requests manual review through Web3Forms; submission acceptance is not proof of purchase verification or delivery. To automate: validate order numbers against your retailer/Stripe, then trigger the toolkit-delivery automation in Beehiiv (or a Zapier/Make step).

---

## Go-live checklist
- [ ] Set `ga4Id`; confirm events appear in GA4 DebugView (and **no** financial values).
- [ ] Create checkout links; paste into `checkout`; add `data-checkout` to the CTAs.
- [ ] Confirm purchases through verified provider events; never use a visit to `thank-you.html` as proof.
- [ ] Set `calendlyUrl`; connect post-purchase scheduling.
- [ ] Verify newsletter opt-in and publisher automations separately from inquiry delivery.
- [ ] Re-test every form end-to-end.
