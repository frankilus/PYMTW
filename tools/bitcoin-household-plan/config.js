/* Bitcoin Household Plan settings.
   paywall.enabled: when true, "Print or save as PDF" shows the unlock panel until a valid
   Lemon Squeezy license key is entered. Filling out the plan, saving the answers file and the
   calendar reminder stay free either way. It was ON from 2026-10-26 and is OFF since 2026-11-04:
   Lemon Squeezy rejected the store, so checkoutUrl can never take a real payment. Printing and the
   PDF are free. The Lemon Squeezy ids below are kept for reference only and are not used while
   enabled is false; index.html no longer loads license.js or contains the unlock panel, and its CSP
   blocks all network requests (connect-src 'none'). Turning it back on needs those restored too. */
window.HHP_CONFIG = Object.freeze({
  paywall: Object.freeze({
    enabled: false,
    message: 'Filling out your plan is free. A one-time purchase unlocks printing and saving your binder as a PDF.',
    price: '$29',
    checkoutUrl: 'https://pymtw.lemonsqueezy.com/checkout/buy/257dd002-75eb-4224-8fd6-2b9cce985c73',
    licenseApi: 'https://api.lemonsqueezy.com/v1/licenses/activate',
    storeId: 508088,      // Lemon Squeezy store "pymtw"
    productId: 1475812,   // "Bitcoin Household Plan: Binder Export"
    instanceName: 'pymtw.com household plan'
  })
});
