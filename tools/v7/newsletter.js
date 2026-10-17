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
    const timer = window.setTimeout(() => {
      status.textContent = 'If the form has not appeared, use Subscribe free on Beehiiv above.';
    }, 10000);
    script.onload = () => {
      window.clearTimeout(timer);
      status.textContent = 'Complete the form below. If it stalls, continue on Beehiiv using the orange button above.';
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      status.textContent = 'The embedded form could not load. Use Subscribe free on Beehiiv above.';
    };
    box.appendChild(script);
    const attribution = document.createElement('script');
    attribution.async = true;
    attribution.src = 'https://subscribe-forms.beehiiv.com/attribution.js';
    document.body.appendChild(attribution);
  }
  details.addEventListener('toggle', load);
  load();
})();
