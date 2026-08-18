# PYMTW Starter Kit Launch Checklist

Goal: turn `starter-kit.html` from an interest-capture page into the first live paid product.

## Product Files

- [ ] Create the nine promised assets:
  - Personal Bitcoin Policy
  - DCA Planning Worksheet
  - Exchange Comparison Checklist
  - Hardware-Wallet Prep Checklist
  - Seed-Backup Planning Worksheet
  - Inheritance Discussion Guide
  - Annual Security Review
  - Bitcoin Recordkeeping Template
  - 90-Day Implementation Calendar
- [ ] Export polished PDF versions.
- [ ] Export editable Word/Google Docs-ready versions where useful.
- [ ] Export spreadsheet files for recordkeeping and calendar assets.
- [ ] Add a `Read This First` safety note that says never to type seed phrases, private keys, passwords, authentication codes, API keys, or account credentials into any PYMTW file.

## Checkout

- [ ] Create the `$29` product in Stripe, Lemon Squeezy, or Gumroad.
- [ ] Set the post-purchase redirect to `https://www.pymtw.com/thank-you.html?source=starter-kit`.
- [ ] Upload the product files or connect the delivery email.
- [ ] Paste the live checkout URL into `pymtw-config.js` under `checkout["starter-kit"]`.
- [ ] Confirm the page price matches the checkout price.

## Email Delivery

- [ ] Send a receipt/delivery email immediately after purchase.
- [ ] Add a 7-day onboarding sequence:
  - Day 0: download link + safety note
  - Day 1: start with Personal Bitcoin Policy
  - Day 2: DCA worksheet and recordkeeping setup
  - Day 4: custody prep and seed-backup planning
  - Day 7: annual review, family discussion, and next-step offer
- [ ] Add a soft upsell to the relevant workshop:
  - Beginner/Accumulator: Bitcoin for Busy Professionals
  - Security-focused buyers: Self-Custody Without the Fear
  - Household buyers: Bitcoin for Couples & Families

## QA

- [ ] Click the Starter Kit CTA before checkout config is set; confirm it still routes to the launch list.
- [ ] Add the checkout URL; confirm the CTA routes to checkout.
- [ ] Confirm `checkout_started` fires on live checkout click.
- [ ] Complete one test purchase.
- [ ] Confirm redirect to `thank-you.html?source=starter-kit`.
- [ ] Confirm `checkout_completed` fires after redirect.
- [ ] Confirm buyer receives all files and no email asks for sensitive information.

