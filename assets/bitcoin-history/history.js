/* Self-contained, local-only timeline. No tracking, accounts or external requests. */
(() => {
  'use strict';
  const data = window.BITCOIN_HISTORY;
  if (!data || !data.events.length) return;
  const { events, chapters } = data;
  const byId = new Map(events.map((event, index) => [event.id, index]));
  const $ = id => document.getElementById(id);
  const chapterGroup = document.querySelector('.chapters');
  const momentGroup = $('moments');
  let current = -1;
  let chapter = -1;
  let motionTimer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const drawings = {
    paper: '<path d="M44 8h90l23 23v117H44Z"/><path d="M134 8v25h23M65 56h71M65 65h71M65 74h52M65 92h71M65 101h71M65 110h40"/><circle cx="139" cy="130" r="26" fill="#17292e"/><path d="m126 130 9 9 17-19"/>',
    block: '<path d="m97 13 62 35v71l-62 35-62-35V48Z"/><path d="m35 48 62 36 62-36M97 84v70M66 31l62 36v70"/><path d="M9 84h26m124 0h26" stroke-dasharray="3 5"/><circle cx="9" cy="84" r="4"/><circle cx="185" cy="84" r="4"/>',
    transfer: '<circle cx="42" cy="79" r="29"/><circle cx="154" cy="79" r="29"/><path d="M42 50V28m112 22V28M72 79h52m-11-9 11 9-11 9"/><path d="M22 130h40m72 0h40"/><text x="42" y="84" text-anchor="middle" fill="currentColor" stroke="none" font-family="Georgia" font-size="19">S</text><text x="154" y="84" text-anchor="middle" fill="currentColor" stroke="none" font-family="Georgia" font-size="19">H</text>',
    pizza: '<circle cx="91" cy="81" r="64"/><circle cx="91" cy="81" r="53"/><path d="m91 81 0-53m0 53 46-26M91 81l46 27M91 81v53m0-53-46 27M91 81 45 55"/><g fill="currentColor" stroke="none"><circle cx="77" cy="46" r="5"/><circle cx="114" cy="51" r="5"/><circle cx="129" cy="81" r="5"/><circle cx="112" cy="111" r="5"/><circle cx="74" cy="113" r="5"/><circle cx="55" cy="82" r="5"/></g><path d="m154 36 25-9m-14 23 21-1"/>',
    halving: '<circle cx="53" cy="81" r="42"/><path d="M53 39v84" stroke-dasharray="3 4"/><path d="M112 81h20m-8-7 8 7-8 7"/><path d="M162 39a42 42 0 0 1 0 84Z" fill="#e5b783" fill-opacity=".12"/><path d="M13 143h174" stroke-opacity=".3"/>',
    fork: '<path d="M99 144V109c0-25-55-30-55-56V19m55 90c0-25 55-30 55-56V19"/><rect x="33" y="7" width="22" height="22" fill="#17292e"/><rect x="143" y="7" width="22" height="22" fill="#17292e"/><rect x="88" y="134" width="22" height="22" fill="#17292e"/><path d="m58 54 67 0m-10-7 10 7-10 7" stroke-dasharray="3 4"/>',
    custody: '<rect x="32" y="24" width="130" height="122" rx="5"/><rect x="44" y="36" width="106" height="98" rx="2"/><circle cx="97" cy="85" r="27"/><circle cx="97" cy="85" r="7"/><path d="m97 58 0 20m7 7h20M97 92v20M70 85h20M21 52h11m-11 62h11"/><path d="m152 9 30 30m-30 0 30-30" stroke="#e5b783"/>',
    layers: '<path d="m97 13 82 39-82 39-82-39Z"/><path d="m15 76 82 39 82-39M15 101l82 39 82-39"/><path d="M97 91v49" stroke-dasharray="3 4"/>',
    lightning: '<circle cx="97" cy="81" r="66" stroke-opacity=".45"/><path d="m111 15-63 77h45l-12 57 63-78h-45Z" fill="#e5b783" fill-opacity=".12"/><circle cx="23" cy="30" r="5"/><circle cx="173" cy="130" r="5"/><path d="m27 34 19 18m104 59 19 15" stroke-dasharray="3 4"/>',
    tree: '<path d="M97 145v-40M97 105 48 64m49 41 49-41M48 64 23 27m25 37 25-37m73 37-25-37m25 37 25-37"/><g fill="#17292e"><circle cx="97" cy="145" r="9"/><circle cx="48" cy="64" r="7"/><circle cx="146" cy="64" r="7"/><circle cx="23" cy="21" r="6"/><circle cx="73" cy="21" r="6"/><circle cx="121" cy="21" r="6"/><circle cx="171" cy="21" r="6"/></g>',
    institution: '<path d="m16 54 81-39 81 39ZM24 142h146v12H24ZM34 131V68h21v63m31 0V68h21v63m31 0V68h21v63"/><circle cx="97" cy="40" r="8"/><path d="M12 160h170" stroke-opacity=".4"/>'
  };
  function illustration(event) {
    // The content is our own static editorial data; external text is never inserted.
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 196 170');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.innerHTML = drawings[event.kind] || drawings.block;
    const stat = document.createElement('div');
    stat.className = 'art-stat';
    const value = document.createElement('strong');
    value.textContent = event.stat;
    const caption = document.createElement('span');
    caption.textContent = event.unit;
    stat.append(value, caption);
    $('event-illustration').replaceChildren(svg, stat);
  }
  function renderChapter(number) {
    chapter = number;
    chapterGroup.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === chapter)));
    const chapterEvents = events.filter(event => event.chapter === chapter);
    $('chapter-range').textContent = chapters[chapter][1];
    $('chapter-count').textContent = chapterEvents.length + ' MOMENTS';
    momentGroup.replaceChildren(...chapterEvents.map(event => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'moment';
      button.dataset.id = event.id;
      button.setAttribute('aria-controls', 'event-title');
      const label = document.createElement('span');
      const year = document.createElement('small');
      year.textContent = event.year;
      const title = document.createElement('strong');
      title.textContent = event.short;
      label.append(year, title);
      button.append(label);
      button.addEventListener('click', () => select(byId.get(event.id)));
      return button;
    }));
  }
  function select(index, updateURL = true, announce = true) {
    if (index < 0 || index >= events.length) return;
    current = index;
    const event = events[index];
    if (event.chapter !== chapter) renderChapter(event.chapter);
    momentGroup.querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(button.dataset.id === event.id)));
    $('event-date').textContent = event.date;
    $('event-title').textContent = event.title;
    $('event-body').textContent = event.body;
    $('event-why').textContent = event.why;
    $('event-perspective').textContent = event.perspective;
    document.querySelector('.perspective').open = false;
    $('event-art-year').textContent = event.year;
    $('event-art-label').textContent = String(index + 1).padStart(2, '0') + ' / ' + event.short.toUpperCase();
    $('event-position').textContent = String(index + 1).padStart(2, '0') + ' OF ' + events.length;
    $('progress-label').textContent = String(index + 1).padStart(2, '0') + ' / ' + events.length;
    $('progress-fill').style.width = ((index + 1) / events.length * 100) + '%';
    $('previous').disabled = index === 0;
    $('next').disabled = index === events.length - 1;
    $('event-sources').replaceChildren(...event.sources.map(source => {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label + ' ↗';
      // Same-tab links keep navigation predictable; browser Back restores this moment.
      return link;
    }));
    illustration(event);
    if (updateURL) history.replaceState(null, '', '#' + event.id);
    if (announce) $('announcement').textContent = 'Moment ' + (index + 1) + ' of ' + events.length + '. ' + event.date + '. ' + event.title;
    const card = document.querySelector('.event-card');
    card.classList.remove('changing');
    clearTimeout(motionTimer);
    if (announce && !reducedMotion.matches) {
      requestAnimationFrame(() => card.classList.add('changing'));
      motionTimer = setTimeout(() => card.classList.remove('changing'), 400);
    }
  }
  chapters.forEach((item, number) => {
    const button = document.createElement('button');
    button.className = 'chapter';
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    const line = document.createElement('small');
    line.textContent = '0' + (number + 1) + ' / ' + item[1];
    const label = document.createElement('strong');
    label.textContent = item[0];
    button.append(line, label);
    button.addEventListener('click', () => select(events.findIndex(event => event.chapter === number)));
    chapterGroup.append(button);
  });
  function arrowNavigation(group) {
    group.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...group.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      let next = index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      next = (next + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    });
  }
  arrowNavigation(chapterGroup);
  arrowNavigation(momentGroup);
  $('previous').addEventListener('click', () => select(current - 1));
  $('next').addEventListener('click', () => select(current + 1));
  document.querySelectorAll('[data-jump]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    select(byId.get(link.dataset.jump));
    $('timeline').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    const active = momentGroup.querySelector('[aria-current=true]');
    active.focus({ preventScroll: true });
  }));
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (byId.has(id)) select(byId.get(id), false);
  });
  const initial = byId.get(location.hash.slice(1)) ?? 0;
  select(initial, false, false);
  $('all-records').open = false;
  $('interactive').hidden = false;
  // With JavaScript absent, the full source-linked chronology remains open.
})();
