# PYMTW — Integrations Setup Guide

Everything below is **scaffolded and off by default**. No third-party scripts load and no analytics events are sent until you fill in the values. Central config lives in [`pymtw-config.js`](pymtw-config.js) (loaded in the `<head>` of every page).

---

## 1. Analytics (Google Analytics 4)

**Turn on:** open `pymtw-config.js` and set `analytics.ga4Id` to your Measurement ID (`G-XXXXXXXXXX`). That's it — the GA4 script then loads on every page, with `anonymize_ip: true` and Google Signals disabled by default.

**How events flow:** the whole site calls `pymtwTrack('event_name', { …props })`. That helper (a) pushes to `window.dataLayer` and (b) forwards to GA4 as a `gtag('event', …)` when an ID is set. A regex guard **drops any property whose key looks financial/sensitive** (`amount, value, balance, networth, price, holdings, account, seed, key, password`, …) so calculator figures can never leak into analytics. Calculators also never call `pymtwTrack` with values in the first place.

**Recommended events** (already firing where noted; wire the rest in GA4 as conversions):

| Event | Fires from |
|---|---|
| `assessment_started` / `assessment_completed` / `assessment_result_viewed` | `assessment.html` (with `profile`) |
| `newsletter_signup` | assessment + newsletter forms (`source`) |
| `workshop_interest` | Programs hub workshop cards (`data-track`) |
| `workshop_register` | workshop pages (`workshop`) |
| `program_inquiry` / `private_interest` | `programs.html` |
| `membership_interest` / `membership_waitlist` | membership + hub (`plan`) |
| `corporate_inquiry` | `corporate.html` (`format`) |
| `contact_submitted` | `about.html` |
| `book_bonus_claim` / `book_waitlist` | `book/` + `digital-credit.html` |
| `resource_link_click` | Resource Library outbound links (`data-track`) |
| `checkout_started` / `checkout_completed` | auto on live `data-checkout` links / add on thank-you page |
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

**Recommended flow:** Select → pay (checkout link) → intake form → schedule (§3) → preparation email → attend → follow-up. Use Stripe/Lemon Squeezy's post-purchase redirect to `thank-you.html?source=<checkout-key>`, which fires `checkout_completed` without sending any financial values.

> Do **not** hard-code prices in checkout that contradict the pages. Keep the page price and the payment-link price in sync.

---

## 3. Scheduling (Calendly / SavvyCal)

**Turn on:** set `scheduling.calendlyUrl` in `pymtw-config.js`. Then either link to it from post-purchase/intake, or embed it. Recommended: use per-program Calendly event types and send the right link in the post-purchase email. Inquiry forms (corporate, private) can stay form-first; standardized workshops can go straight to checkout → schedule.

---

## 4. Email platform (Beehiiv) — segmentation + sequences

Forms already POST to Beehiiv (`form_id b4a2c81e-45db-403c-8b9d-9e317a677a67`) and carry `utm_source` / `utm_medium` identifying the source (assessment, programs, corporate, book, membership, workshop_*). The assessment also knows the visitor's **profile** (beginner/accumulator/security).

**To set up segmentation:**
1. In Beehiiv, create **Automations** triggered on subscribe, branching on the `utm_source`/`utm_medium` (and, if you map it as a custom field, the assessment `profile`).
2. Map custom fields (`first_name`, `interest`, `plan`, `format`, `order_number`, `profile`) in the Beehiiv form settings so they're captured.
3. Build the three nurture sequences below (full copy prompts in `CONTENT_AND_COPY_PLAN.md`).

**Beginner sequence** → 1) Bitcoin in plain English 2) Bitcoin vs. other crypto 3) How to buy safely 4) Common beginner mistakes 5) Invite: Bitcoin for Busy Professionals.
**Accumulator sequence** → 1) Building a recurring-buy process 2) Understanding volatility 3) Recordkeeping 4) Reviewing your process 5) Invite: Implementation Intensive.
**Security sequence** → 1) Exchange risk 2) Custody choices 3) Hardware-wallet prep 4) Backup mistakes 5) Invite: Self-Custody Without the Fear.

Additional lists to tag: Book Reader (`book`, `digital_credit`), Workshop Attendee (`workshop_*`), Corporate Inquiry (`corporate`).

> The assessment currently sends **only** the email/name/UTM to Beehiiv — not the individual answers. If you later POST the profile, disclose it in the privacy policy.

---

## 5. Proof-of-purchase (book bonus)

`book/index.html` collects email + order number. Today it's reviewed manually. To automate: validate order numbers against your retailer/Stripe, then trigger the toolkit-delivery automation in Beehiiv (or a Zapier/Make step).

---

## Go-live checklist
- [ ] Set `ga4Id`; confirm events appear in GA4 DebugView (and **no** financial values).
- [ ] Create checkout links; paste into `checkout`; add `data-checkout` to the CTAs.
- [x] Add a `thank-you.html` firing `checkout_completed`.
- [ ] Set `calendlyUrl`; connect post-purchase scheduling.
- [ ] Build Beehiiv automations + the 3 sequences; map custom fields.
- [ ] Re-test every form end-to-end.
