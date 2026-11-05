/* Bitcoin Household Plan settings.
   paywall.enabled: when true, "Print or save as PDF" shows the unlock panel until this device has an
   unlock record. Filling out the plan, saving the answers file and the calendar reminder stay free.
   Since 2026-11-04 checkout is a Stripe Payment Link (Lemon Squeezy rejected the store on 2026-10-31).
   After payment Stripe redirects to ?unlock=1&session_id={CHECKOUT_SESSION_ID}; app.js stores the
   unlock in localStorage. The site is static with no server, so the session id is NOT verified with
   Stripe: this is an honor-system unlock. The Buy button is a plain top-level link to buy.stripe.com,
   so the page CSP keeps connect-src 'none' and the plan sends nothing anywhere.
   Stripe (live): product prod_VZQcKe29mE74J6, price price_1UYHl5RQVuoOLRg85NcBD5gB,
   payment link plink_1UYHlARQVuoOLRg8M2JwN1ZO. */
window.HHP_CONFIG = Object.freeze({
  paywall: Object.freeze({
    enabled: true,
    provider: 'stripe',
    message: 'Filling out your plan is free. A one-time $29 purchase unlocks printing and saving your binder as a PDF.',
    price: '$29',
    checkoutUrl: 'https://buy.stripe.com/bJe6oJfJqgLo0wq3U86EU03',
    storeKey: 'pymtw-hhp-unlock-v1'
  })
});
