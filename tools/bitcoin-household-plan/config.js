/* Bitcoin Household Plan settings.
   paywall.enabled: when true, "Print or save as PDF" shows the unlock panel until a valid
   Lemon Squeezy license key is entered. Filling out the plan, saving the answers file and the
   calendar reminder stay free either way. It ships OFF: the full binder is free.
   To turn it on, change false to true on the enabled line below (see SITE_ARCHITECTURE.md).
   Only the license key is ever sent, to licenseApi below; the plan's answers never leave the page.
   If licenseApi's host changes, the page CSP (connect-src in index.html) must change with it. */
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
