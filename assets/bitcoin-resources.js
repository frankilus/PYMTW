/* Browser-only library navigation: no network requests, cookies or storage. */
(function () {
  'use strict';
  const search = document.getElementById('search');
  const title = document.getElementById('results-title');
  const label = document.getElementById('results-label');
  const count = document.getElementById('count');
  const links = Array.from(document.querySelectorAll('[data-category]'));
  const groups = Array.from(document.querySelectorAll('.goal-library .category')).map(el => ({
    el, id: el.id,
    resources: Array.from(el.querySelectorAll('.resource')).map(node => ({
      node, text: node.textContent.toLowerCase()
    }))
  }));
  const totalResources = groups.reduce((total, group) => total + group.resources.length, 0);
  // Keep existing category bookmarks useful after regrouping the collection.
  const legacy = {
    beginner: 'learn', books: 'learn', podcasts: 'learn', exchanges: 'buy',
    wallets: 'protect', custody: 'protect', security: 'protect',
    tax: 'plan', estate: 'plan', guides: 'all'
  };
  let selected = 'learn';

  function render() {
    const query = search.value.trim();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let total = 0, protect = false;
    groups.forEach(group => {
      let matches = 0;
      group.resources.forEach(resource => {
        const show = (query || selected === 'all' || selected === group.id) &&
          words.every(word => resource.text.includes(word));
        resource.node.hidden = !show;
        if (show) matches++;
      });
      group.el.hidden = matches === 0;
      total += matches;
      if (group.id === 'protect' && matches) protect = true;
    });
    links.forEach(link => {
      if (!query && link.dataset.category === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const active = links.find(link => link.dataset.category === selected);
    title.textContent = query ? 'Search results' : selected === 'all' ? 'All resources' : active.querySelector('strong').textContent;
    label.textContent = query ? 'SEARCHING ALL ' + totalResources + ' RESOURCES' : selected === 'all' ? 'THE COMPLETE COLLECTION' : active.querySelector('small').textContent;
    count.textContent = total + ' resource' + (total === 1 ? '' : 's');
    document.getElementById('empty').hidden = total !== 0;
    document.getElementById('security-notes').hidden = !protect;
    document.body.classList.toggle('browsing-all', Boolean(query) || selected === 'all');
  }

  function choose(id, move) {
    id = legacy[id] || id;
    selected = links.some(link => link.dataset.category === id) ? id : 'learn';
    search.value = '';
    render();
    if (move) {
      title.focus({preventScroll: true});
      if (matchMedia('(max-width:700px)').matches) document.getElementById('results').scrollIntoView();
    }
  }
  function followHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { id = ''; }
    choose(id, false);
  }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const id = link.dataset.category;
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    choose(id, true);
  }));
  window.addEventListener('popstate', followHash);
  window.addEventListener('hashchange', followHash);
  search.addEventListener('input', render);
  document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    render();
    title.focus({preventScroll: true});
    document.getElementById('results').scrollIntoView();
  });
  document.getElementById('clear').addEventListener('click', () => {
    history.pushState(null, '', '#all');
    choose('all', false);
    search.focus();
  });
  document.getElementById('search-form').hidden = false;
  document.body.classList.add('enhanced');
  document.querySelector('.results-bar').hidden = false;
  followHash();
})();
