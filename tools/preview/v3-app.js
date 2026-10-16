/* v3 preview homepage router; tool hrefs use ../../ from v3-orange or v3-green. */
(function () {
  var BASE = '../../';
  var ALL = PT_CATS.flatMap(function (c) { return c.tools; });
  ALL.push({
    slug: 'checkup', icon: '🩺', name: '2-minute money checkup',
    desc: 'Quick questions that surface the blind spots you didn’t know you had.',
    time: '2 min', live: true,
    kw: ['where do i start', 'where to start', 'where should i start', 'am i on track', 'on track', 'checkup', 'check up', 'check-up', 'blind spot', 'blind spots', 'what am i missing', 'missing anything', 'financial health', 'money health', 'get my finances', 'finances in order', 'get organized', 'overwhelmed', 'beginner', 'not sure', 'everything', 'big picture', 'overall']
  });
  ALL.push({
    slug: 'guides/lost-my-job', icon: '📘', name: 'Guide: Just lost your job?',
    desc: 'What to do this week, this month and this year: unemployment, COBRA vs. Marketplace, your 401(k).',
    time: '5 min read', live: true, boost: 2,
    kw: ['lost my job', 'just lost', 'laid off', 'layoff', 'fired', 'let go', 'job loss', 'lost job', 'terminated', 'unemployed', 'what do i do now', 'cobra', 'unemployment']
  });
  ALL.push({
    slug: 'guides/first-home', icon: '🏠', name: 'Guide: Buying your first home',
    desc: 'The real upfront cash, affordability, rates, PMI, pre-approval, inspections, escrow and year-one costs.',
    time: '6 min read', live: true, boost: 1,
    kw: ['first home', 'first-time', 'first time buyer', 'buying a home', 'buy a home', 'buy a house', 'buying a house', 'home', 'house', 'mortgage', 'pmi', 'closing costs', 'down payment', 'pre-approval', 'preapproval', 'prequalification', 'home inspection', 'escrow']
  });

  var examples = [
    'Should I pay off my debt?',
    'Can I afford a home?',
    'Roth or traditional IRA?',
    'I just lost my job',
    'What if I’d DCA’d bitcoin?'
  ];
  var ex = 0, q = document.getElementById('q');
  setInterval(function () {
    if (q && !q.value && document.activeElement !== q) {
      ex = (ex + 1) % examples.length;
      q.placeholder = examples[ex];
    }
  }, 2800);

  function route(text) {
    var s = ' ' + text.toLowerCase().replace(/[^a-z0-9()\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
    return ALL.map(function (t) {
      var kw = t.kw.reduce(function (a, k) {
        return a + (s.indexOf(k) > -1 ? k.split(' ').length * 2 + (k.length > 6 ? 1 : 0) : 0);
      }, 0);
      return { t: t, kw: kw, score: kw + (t.live ? 0.5 : 0) + (kw ? (t.boost || 0) : 0) };
    }).filter(function (r) { return r.kw > 0; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  window.PT_route = route;

  var answer = document.getElementById('answer');
  function ask(text) {
    var tools = document.querySelectorAll('.tool');
    tools.forEach(function (el) { el.classList.remove('match'); });
    if (!text.trim()) { answer.classList.remove('show'); return; }
    var hits = route(text);
    if (!hits.length) {
      answer.innerHTML = '<div class="k">Not sure yet</div><div class="best"><div><h3>Tell us a little more</h3><p>Try “I have $12k in credit card debt” or “what are my fund fees costing me?” Or browse all tools below.</p></div><a class="open" href="#tools">Browse tools</a></div>';
      answer.classList.add('show');
      return;
    }
    var best = hits[0].t;
    var others = hits.slice(1, 3).map(function (h) { return h.t; });
    if (window.goatcounter && typeof goatcounter.count === 'function') {
      try { goatcounter.count({ path: 'event/' + best.slug + '/router-query-matched', title: 'Router → ' + best.name, event: true }); } catch (e) {}
    }
    answer.innerHTML =
      '<div class="k">Best tool for you</div><div class="best"><div><h3>' + best.icon + ' ' + best.name + '</h3><p>' + best.desc + '</p></div>' +
      '<a class="open" href="' + BASE + best.slug + '/">' + (best.live ? 'Start · ' + best.time : 'Preview · coming soon') + '</a></div>' +
      (others.length ? '<div class="also">Also helpful:' + others.map(function (o) {
        return '<a href="' + BASE + o.slug + '/">' + o.name + '</a>';
      }).join(' ·') + '</div>' : '');
    answer.classList.add('show');
    var bestId = 'tool-' + best.slug.replace(/\//g, '-');
    var match = document.getElementById(bestId) || document.getElementById('tool-' + best.slug);
    if (match) match.classList.add('match');
  }

  var form = document.getElementById('askForm');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); ask(q.value); });
  document.querySelectorAll('.chip').forEach(function (c) {
    c.addEventListener('click', function () { q.value = c.dataset.q; ask(q.value); });
  });
  if (q) q.addEventListener('input', function () { if (!q.value) ask(''); });
  var pre = new URLSearchParams(location.search).get('q');
  if (pre) { q.value = pre; ask(pre); }
})();
