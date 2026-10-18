/* Local reading controls only: no cookies, requests or analytics events. */
(function () {
  'use strict';
  function init() {
    var search = document.getElementById('resource-search');
    if (search) {
      var topic = document.getElementById('resource-topic');
      var groups = Array.from(document.querySelectorAll('.res-cat')).map(function (section) {
        return { section: section, cards: Array.from(section.querySelectorAll('.res-card, .p-card')).map(function (card) {
          return { element: card, text: card.textContent.toLowerCase() };
        }) };
      });
      function filter() {
        var words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var count = 0;
        groups.forEach(function (group) {
          var matches = 0;
          group.cards.forEach(function (card) {
            var visible = (topic.value === 'all' || topic.value === group.section.id) && words.every(function (word) { return card.text.includes(word); });
            card.element.hidden = !visible;
            if (visible) matches++;
          });
          group.section.hidden = matches === 0;
          count += matches;
        });
        document.getElementById('resource-count').textContent = count + (count === 1 ? ' resource' : ' resources') + ' shown';
        document.getElementById('resource-empty').hidden = count !== 0;
      }
      function followCategory() {
        var id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
        var group = groups.find(function (g) { return g.section.id === id; });
        if (!group) return;
        search.value = ''; topic.value = id; filter();
        requestAnimationFrame(function () { group.section.scrollIntoView(); });
      }
      search.addEventListener('input', filter);
      topic.addEventListener('change', filter);
      document.getElementById('resource-reset').addEventListener('click', function () {
        search.value = ''; topic.value = 'all'; filter(); search.focus();
      });
      document.querySelector('.library-controls').hidden = false;
      document.body.classList.add('library-enhanced');
      window.addEventListener('hashchange', followCategory);
      filter(); followCategory();
    }
    // Opening a bookmarked subsection must never strand it inside a disclosure.
    function revealAnchor() {
      var id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      var target = document.getElementById(id);
      if (!target) return;
      for (var parent = target.parentElement; parent; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
      if (target.matches('.wp-section-card, #outcomes, #chapters')) {
        var detail = target.querySelector('details');
        if (detail) detail.open = true;
      }
    }
    document.addEventListener('click', function (event) {
      var anchor = event.target.closest('a[href^="#"]');
      if (anchor && anchor.hash === location.hash) revealAnchor();
      var link = event.target.closest('.wp-sidebar-link, .wp-mobile-pill');
      if (!link) return;
      var target = document.getElementById('wp-section-' + link.dataset.section);
      if (target && target.querySelector('details')) target.querySelector('details').open = true;
    }, true);
    window.addEventListener('hashchange', revealAnchor);
    revealAnchor();
    var readingActions = document.querySelector('.reading-actions');
    if (readingActions) {
      readingActions.hidden = false;
      readingActions.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-reading]');
        if (!button) return;
        document.querySelectorAll('.wp-section-card details').forEach(function (detail) { detail.open = button.dataset.reading === 'expand'; });
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
