/* The entire chronology is already in HTML. This only adds navigation conveniences. */
(() => {
  'use strict';
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  const milestones = [...timeline.querySelectorAll('details.milestone')];
  const yearLinks = [...document.querySelectorAll('.year-nav a')];
  const expandAll = document.querySelector('.expand-all');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function syncExpandButton() {
    const allOpen = milestones.every(item => item.open);
    expandAll.setAttribute('aria-pressed', String(allOpen));
    expandAll.replaceChildren(document.createTextNode(allOpen ? 'Collapse all ' : 'Expand all '));
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = allOpen ? '−' : '+';
    expandAll.append(symbol);
  }
  milestones.forEach(item => item.addEventListener('toggle', syncExpandButton));
  expandAll.hidden = false;
  expandAll.addEventListener('click', () => {
    const shouldOpen = !milestones.every(item => item.open);
    milestones.forEach(item => { item.open = shouldOpen; });
    syncExpandButton();
  });
  function openHash(scroll = false) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    // Retain old bookmarks to fallback records from the first version.
    id = id.replace(/^record-/, '');
    const target = document.getElementById(id);
    if (!target || !timeline.contains(target)) return;
    if (target.matches('details.milestone')) target.open = true;
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'}));
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    link.addEventListener('click', () => {
      const item = document.getElementById(id);
      if (item?.matches('details.milestone')) item.open = true;
    });
  });
  window.addEventListener('hashchange', () => openHash(true));
  openHash(true);
  // Keep the year navigator useful without hiding or replacing any part of the timeline.
  let queued = false;
  let activeYear = '';
  const sections = [...document.querySelectorAll('.year-section')];
  function updateReadingYear(force = false) {
    queued = false;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 140) current = section;
      else break;
    }
    if (!current || (current.id === activeYear && !force)) return;
    activeYear = current.id;
    yearLinks.forEach(link => {
      if (link.hash === '#' + activeYear) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const activeLink = yearLinks.find(link => link.hash === '#' + activeYear);
    const nav = activeLink?.parentElement;
    if (activeLink && nav) {
      // Adjust only the navigator, never the visitor's vertical reading position.
      const item = activeLink.getBoundingClientRect(), bounds = nav.getBoundingClientRect();
      if (item.left < bounds.left || item.right > bounds.right) nav.scrollLeft += item.left - bounds.left - (bounds.width - item.width) / 2;
    }
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateReadingYear); }
  }, { passive:true });
  addEventListener('resize', () => updateReadingYear(true));
  updateReadingYear();
})();
