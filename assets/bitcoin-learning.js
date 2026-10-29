/* Preserve deep links to existing program sections inside expandable details. */
(function () {
  'use strict';
  function revealSection() {
    var id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var element = target;
    var expanded = false;
    while (element) {
      if (element.tagName === 'DETAILS' && !element.open) {
        element.open = true;
        expanded = true;
      }
      element = element.parentElement;
    }
    if (expanded) requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
  }
  window.addEventListener('hashchange', revealSection);
  // Also reopen a disclosure if its existing fragment link is clicked again.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash === location.hash) {
      revealSection();
    }
  });
  revealSection();
})();
