/* Bitcoin Household Plan settings.
   paywall.enabled: when true, "Print / save binder" and "Download binder" show the unlock
   panel instead of printing. It ships OFF: the full binder is free. Nothing here talks to a
   server; a future paywall would need its own reviewed change (checkout link, CSP, tests). */
window.HHP_CONFIG = Object.freeze({
  paywall: Object.freeze({
    enabled: false,
    message: 'Unlock the printable binder to save or print your plan.',
    unlockUrl: ''
  })
});
