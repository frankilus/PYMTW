/* Cookieless page counts and fixed outbound event names only.
   Never inspect forms, calculator output, search text, URL queries or fragments. */
(function () {
  'use strict';
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const counter = window.goatcounter = window.goatcounter || {};
  const pagePath = location.pathname;
  counter.path = function () { return pagePath; };
  counter.referrer = function () { return ''; };
  counter.title = document.title;
  counter.allow_local = false;
  // The provider also includes location.search in its default payload. Disable
  // automatic sending until that field has been explicitly removed.
  counter.no_onload = true;
  counter.no_events = true;
  function load() {
    if (document.querySelector('script[data-goatcounter]')) return;
    const script = document.createElement('script');
    script.src = 'https://gc.zgo.at/count.js';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.dataset.goatcounter = 'https://pymtw.goatcounter.com/count';
    script.onload = function () {
      if (typeof counter.get_data !== 'function') { counter.count = function () {}; return; }
      const getData = counter.get_data;
      counter.get_data = function (vars) {
        const data = getData(vars);
        delete data.q;
        data.r = '';
        if (typeof data.p === 'string') data.p = data.p.split(/[?#]/)[0];
        return data;
      };
      counter.count();
    };
    document.head.appendChild(script);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(load, {timeout: 2000});
  else setTimeout(load, 1000);
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || typeof counter.count !== 'function') return;
    let url;
    try { url = new URL(link.href); } catch (_) { return; }
    let name;
    if (['amzn.to', 'a.co', 'amazon.com', 'www.amazon.com'].includes(url.hostname)) name = 'amazon-click';
    else if (url.hostname === 'pymtwtools.beehiiv.com') name = 'money-newsletter-click';
    else if (url.hostname === 'pymtw.beehiiv.com') name = 'bitcoin-newsletter-click';
    if (name) {
      try { counter.count({path: 'event' + pagePath + '/' + name, title: name, event: true, referrer: ''}); } catch (_) {}
    }
  });
})();
