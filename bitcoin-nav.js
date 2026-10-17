/* One accessible disclosure menu for both legacy and shared Bitcoin headers. */
(function () {
  'use strict';
  window.pymtwInitNav = function () {
    var nav = document.getElementById('navbar');
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!nav || !toggle || !links || nav.dataset.navReady) return;
    nav.dataset.navReady = 'true';
    var mobile = window.matchMedia('(max-width: 768px)');
    var previousOverflow = '';
    var disclosures = [];
    function setDropdown(item, open) {
      item.parent.classList.toggle('open', open);
      item.button.setAttribute('aria-expanded', String(open));
      item.menu.hidden = !open;
    }
    function closeDropdowns() { disclosures.forEach(function (item) { setDropdown(item, false); }); }
    function setMenu(open) {
      if (open && !links.classList.contains('active')) previousOverflow = document.body.style.overflow;
      links.classList.toggle('active', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      links.inert = mobile.matches && !open;
      document.body.style.overflow = open && mobile.matches ? 'hidden' : previousOverflow;
      if (!open) closeDropdowns();
    }
    nav.querySelectorAll('.nav-dropdown-trigger').forEach(function (old, index) {
      var button = old;
      if (old.tagName !== 'BUTTON') {
        button = document.createElement('button');
        button.className = old.className;
        button.innerHTML = old.innerHTML;
        old.replaceWith(button);
      }
      button.type = 'button';
      var menu = button.parentElement.querySelector('.nav-dropdown-menu');
      menu.id = menu.id || 'bitcoin-nav-menu-' + index;
      button.setAttribute('aria-controls', menu.id);
      var item = { button: button, menu: menu, parent: button.parentElement };
      disclosures.push(item);
      setDropdown(item, false);
      button.addEventListener('click', function () {
        var open = button.getAttribute('aria-expanded') !== 'true';
        closeDropdowns();
        setDropdown(item, open);
      });
      item.parent.addEventListener('focusout', function (event) {
        if (!item.parent.contains(event.relatedTarget)) setDropdown(item, false);
      });
    });
    toggle.setAttribute('aria-controls', links.id);
    toggle.addEventListener('click', function () { setMenu(!links.classList.contains('active')); });
    links.addEventListener('click', function (event) { if (event.target.closest('a[href]')) setMenu(false); });
    document.addEventListener('click', function (event) { if (!nav.contains(event.target)) setMenu(false); });
    nav.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        var item = disclosures.find(function (d) { return d.parent.contains(event.target) && !d.menu.hidden; });
        if (item) { setDropdown(item, false); item.button.focus(); }
        else { setMenu(false); toggle.focus(); }
        event.preventDefault();
      }
      if (event.key === 'Tab' && mobile.matches && links.classList.contains('active')) {
        var items = Array.from(nav.querySelectorAll('a[href], button')).filter(function (el) {
          return el.getClientRects().length && !el.closest('[hidden]');
        });
        var first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
        if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
      }
    });
    mobile.addEventListener('change', function () { setMenu(false); });
    function scrollState() { nav.classList.toggle('scrolled', window.scrollY > 20); }
    window.addEventListener('scroll', scrollState, { passive: true });
    scrollState();
    setMenu(false);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.pymtwInitNav);
  else window.pymtwInitNav();
})();
