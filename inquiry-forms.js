/* Inquiry intake uses the site's existing Web3Forms endpoint, never a newsletter form. */
(function () {
  'use strict';
  document.querySelectorAll('form[data-inquiry-form]').forEach(function (form) {
    var status = form.querySelector('[role="status"]');
    var button = form.querySelector('button[type="submit"]');
    var label = button.querySelector('span') || button;
    var idleLabel = label.textContent;
    var pending = false;
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (pending || !form.reportValidity()) return;
      if (form.elements.botcheck.checked) return;
      pending = true;
      button.disabled = true;
      label.textContent = 'Sending request…';
      status.className = 'form-status';
      status.textContent = 'Waiting for the inquiry service…';
      form.setAttribute('aria-busy', 'true');
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 15000);
      try {
        var response = await fetch(form.action, {
          method: 'POST', body: new FormData(form), signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Request rejected');
        var result = await response.json();
        if (result.success !== true) throw new Error('Request not accepted');
        status.textContent = 'The inquiry service accepted your request. This is not a booking, payment or newsletter subscription. PYMTW will reply separately.';
        status.className = 'form-status success';
        window.pymtwTrack && window.pymtwTrack('inquiry_accepted', { source: form.id });
        form.reset();
      } catch (error) {
        status.textContent = 'We could not confirm your request. Your details are still here. Check your connection and try again later, or reply to a previous PYMTW email. If you already received a reply, do not submit again.';
        status.className = 'form-status error';
      } finally {
        clearTimeout(timeout);
        pending = false;
        button.disabled = false;
        label.textContent = idleLabel;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
