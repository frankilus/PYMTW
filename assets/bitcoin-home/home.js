const paths = {
 understand: {title:'Start with <br>the foundations.',description:'Build a little context before making any decisions. You can explore these resources in any order.',lessons:[['Begin with the basics','Get oriented with the beginner starting points.','start-here.html','Start here'],['Explore the original idea','Read the Bitcoin whitepaper with supporting explanations.','whitepaper.html','Explore the whitepaper'],['Find a way you like to learn','Browse the video library and follow your curiosity.','videos.html','Browse videos']]},
 evaluate: {title:'Make room for <br>the trade-offs.',description:'Explore the choices and responsibilities without rushing a decision. “Not now” is a useful answer, too.',lessons:[['Look at your wider money picture','Use the money checkup to organize everyday priorities.','tools/checkup/','Take the checkup'],['Explore ownership choices','Start with the guide to keeping Bitcoin on an exchange.','bitcoin-on-exchange.html','Read the guide'],['Try a contribution example','Use illustrative prices to explore DCA. Read the assumptions before the results.','dca.html','Explore the calculator']]},
 protect: {title:'Give your security <br>some attention.',description:'Review how you hold Bitcoin and the responsibilities that come with it. Keep all private recovery information offline and out of this website.',lessons:[['Understand wallet choices','Compare hardware-wallet approaches and their trade-offs.','compare-hardware-wallets.html','Compare wallets'],['Check current security guidance','Existing COLDCARD owner? Start with the updated advisory links.','compare-coldcard-trezor-bitbox.html','Read the security update'],['Explore shared custody approaches','Learn about collaborative custody and multisignature arrangements.','compare-collaborative-vs-multisig.html','Read the comparison'],['Bitcoin Household Plan',"Make Bitcoin part of your family’s plan: document what exists, who can help, and the first safe steps. Free to build; one-time $29 to print or save the binder as a PDF.",'tools/bitcoin-household-plan/','Start your plan']]}
};

const legacyIds = new Set(["btc-price-bar", "btc-price-value", "btc-price-change", "btc-change-arrow", "btc-change-value", "btc-market-cap", "btc-volume", "btc-price-updated", "particle-canvas", "navbar", "nav-links", "nav-toggle", "hero", "assessment-band", "pathways", "why-bitcoin", "getting-started", "edu-books", "edu-podcasts", "edu-articles", "edu-mobile-wallets", "edu-hardware-wallets", "edu-multisig", "edu-exchanges", "edu-dca-tools", "edu-buying-guides", "edu-self-custody", "edu-seed-phrase", "edu-cold-storage", "resources", "resources-grid", "learn", "quiz-container", "quiz-progress-bar", "quiz-difficulty-badge", "quiz-counter", "quiz-question", "quiz-options", "quiz-feedback", "quiz-next", "quiz-score", "featured-programs", "testimonials", "faq", "subscribe-modal", "subscribe-modal-close"]);

(function () {
  'use strict';
  const detail = document.getElementById('path-detail');
  function currentHash() {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (_) { return ''; }
  }
  function routeLegacyFragment() {
    const id = currentHash();
    if (!legacyIds.has(id)) return false;
    location.replace('/bitcoin/explore/' + location.search + location.hash);
    return true;
  }
  if (routeLegacyFragment()) return;

  // Real links remain useful with scripts disabled; enhance them to disclosures.
  document.querySelectorAll('a[data-path]').forEach(link => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = link.className;
    button.id = link.id;
    button.dataset.path = link.dataset.path;
    button.setAttribute('aria-controls', 'path-detail');
    button.innerHTML = link.innerHTML;
    link.replaceWith(button);
  });
  const resetLink = document.getElementById('start-simple');
  const reset = document.createElement('button');
  reset.type = 'button'; reset.id = resetLink.id; reset.textContent = resetLink.textContent;
  resetLink.replaceWith(reset);

  function selectPath(name, focus) {
    const data = paths[name];
    document.querySelectorAll('[data-path]').forEach(button => {
      const selected = button.dataset.path === name;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-expanded', String(selected));
    });
    document.getElementById('detail-kicker').textContent = 'YOUR ' + name.toUpperCase() + ' PATH';
    document.getElementById('detail-title').innerHTML = data.title;
    document.getElementById('detail-description').textContent = data.description;
    const lessons = document.getElementById('lessons');
    lessons.replaceChildren();
    data.lessons.forEach((item, i) => {
      const link = document.createElement('a');
      link.className = 'lesson'; link.href = '/' + item[2];
      const number = document.createElement('span'); number.className = 'lesson-number'; number.textContent = '0' + (i + 1);
      const copy = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = item[0];
      const description = document.createElement('p'); description.textContent = item[1];
      const action = document.createElement('span'); action.textContent = item[3] + ' ↗';
      copy.append(title, description, action); link.append(number, copy); lessons.append(link);
    });
    if (focus) {
      detail.focus({preventScroll:true});
      detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'nearest'});
    }
  }
  function choose(name) {
    if (currentHash() !== name) history.pushState(null, '', '#' + name);
    selectPath(name, true);
  }
  document.querySelectorAll('[data-path]').forEach(button => button.addEventListener('click', () => choose(button.dataset.path)));
  reset.addEventListener('click', () => choose('understand'));
  window.addEventListener('hashchange', () => {
    if (routeLegacyFragment()) return;
    if (Object.hasOwn(paths, currentHash())) selectPath(currentHash(), false);
    else if (!location.hash) selectPath('understand', false);
  });
  selectPath(Object.hasOwn(paths, currentHash()) ? currentHash() : 'understand', false);
})();
