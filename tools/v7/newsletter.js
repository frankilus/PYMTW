/* Provider-owned form: never infer subscription success from iframe/script load. */
(() => {
  'use strict';
  const details = document.getElementById('newsletter-inline');
  const box = document.getElementById('beehiiv-signup-widget');
  const status = document.getElementById('newsletter-form-status');
  if (!details || !box || !status) return;
  let loaded = false;
  function load() {
    if (!details.open || loaded) return;
    loaded = true;
    status.textContent = 'Loading the optional Beehiiv form…';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
    script.setAttribute('data-beehiiv-form', box.dataset.formId);
    // loader.js can load yet render nothing (config fetch fails, or a prior
    // signup cookie suppresses all forms), so judge by the iframe, not onload.
    const timer = window.setTimeout(() => {
      if (!box.querySelector('iframe')) status.textContent = 'If the form has not appeared, use Subscribe free on Beehiiv above.';
    }, 10000);
    script.onload = () => {
      status.textContent = 'Complete the form below. If it stalls, continue on Beehiiv using the orange button above.';
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      status.textContent = 'The embedded form could not load. Use Subscribe free on Beehiiv above.';
    };
    box.appendChild(script); // v3 loader.js already includes attribution.js
  }
  details.addEventListener('toggle', load);
  load();
})();
