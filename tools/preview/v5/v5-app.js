/* PYMTW Tools v5 preview: catalog router, filter tabs, growth simulator. Runs locally; no AI service. */
(function (root) {
  'use strict';
  function fv(pmt, years, ratePct) {
    var n = Math.round(years * 12), i = ratePct / 100 / 12;
    if (i === 0) return pmt * n;
    return pmt * ((Math.pow(1 + i, n) - 1) / i);
  }
  root.PT_fv = fv;
  if (typeof document === 'undefined') { if (typeof module !== 'undefined') module.exports = { fv: fv }; return; }
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var BASE = '/tools/';
  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---- Catalog + router (same weighting as tools/router.js) ---- */
  var ALL = (root.PT_CATS || []).flatMap(function (c) { return c.tools; });
  var liveCount = ALL.filter(function (t) { return t.live; }).length;
  ALL.push({ slug: 'checkup', icon: '✳', name: '2-minute money checkup', desc: 'Quick questions that surface the blind spots you didn’t know you had.', time: '2 min', live: true,
    kw: ['where do i start', 'where to start', 'where should i start', 'am i on track', 'on track', 'checkup', 'check up', 'check-up', 'blind spot', 'blind spots', 'what am i missing', 'missing anything', 'financial health', 'money health', 'get my finances', 'finances in order', 'get organized', 'overwhelmed', 'beginner', 'not sure', 'everything', 'big picture', 'overall'] });
  ALL.push({ slug: 'guides/lost-my-job', icon: '↗', name: 'Guide: Just lost your job?', desc: 'What to do this week, this month and this year: unemployment, COBRA vs. Marketplace, your 401(k).', time: '5 min read', live: true, boost: 2,
    kw: ['lost my job', 'just lost', 'laid off', 'layoff', 'fired', 'let go', 'job loss', 'lost job', 'terminated', 'unemployed', 'what do i do now', 'cobra', 'unemployment'] });
  ALL.push({ slug: 'guides/first-home', icon: '⌂', name: 'Guide: Buying your first home', desc: 'The real upfront cash, affordability, rates, PMI, pre-approval, inspections, escrow and year-one costs.', time: '6 min read', live: true, boost: 1,
    kw: ['first home', 'first-time', 'first time buyer', 'buying a home', 'buy a home', 'buy a house', 'buying a house', 'home', 'house', 'mortgage', 'pmi', 'closing costs', 'down payment', 'pre-approval', 'preapproval', 'prequalification', 'home inspection', 'escrow'] });
  ALL.push({ slug: 'guides/true-cost-of-a-car', icon: '◐', name: 'Guide: The true cost of owning a car', desc: 'Where AAA’s $12,863 a year goes, a 5-year cost calculator, and what to ask before you sign.', time: '7 min read', live: true, boost: 1,
    kw: ['true cost of a car', 'cost of owning a car', 'cost to own a car', 'owning a car', 'own a car', 'buy a car', 'buying a car', 'new car', 'used car', 'new or used', 'car insurance', 'afford a car', 'car can i afford', 'car budget', 'car cost', 'cost per mile', 'depreciation', 'lease or buy', '20/4/10', '20 4 10'] });
  function route(text) {
    var s = ' ' + text.toLowerCase().replace(/[^a-z0-9()\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
    return ALL.map(function (t) {
      var kw = t.kw.reduce(function (a, k) { return a + (s.indexOf(k) > -1 ? k.split(' ').length * 2 + (k.length > 6 ? 1 : 0) : 0); }, 0);
      return { t: t, kw: kw, score: kw + (t.live ? 0.5 : 0) + (kw ? (t.boost || 0) : 0) };
    }).filter(function (r) { return r.kw > 0; }).sort(function (a, b) { return b.score - a.score; });
  }
  root.PT_route = route;

  // Count badge always reflects the catalog.
  var lc = $('#live-count'); if (lc) lc.textContent = liveCount;
  var note = $('#toolbar-note'); if (note) note.innerHTML = '<span class="orange-dot"></span> ' + liveCount + ' live tools · ' + (ALL.length - 4 - liveCount) + ' coming soon · plus a checkup and guides';

  var form = $('#finder-form'), q = $('#finder-input'), results = $('#finder-results');
  function ask(text) {
    $$('.tool-card').forEach(function (el) { el.classList.remove('is-match'); });
    if (!text.trim()) { results.hidden = true; results.innerHTML = ''; return; }
    var hits = route(text);
    results.hidden = false;
    if (!hits.length) {
      results.innerHTML = '<div class="result-label">Not sure yet</div><p class="no-match">Try “I have $12k in credit card debt” or “what are my fund fees costing me?”, or <a class="text-link" href="/tools/checkup/">take the 2-minute checkup</a>. You can also <a class="text-link" href="#tools">browse all tools</a>.</p>';
      return;
    }
    var top = hits.slice(0, 3).map(function (h) { return h.t; });
    if (root.goatcounter && typeof goatcounter.count === 'function') { try { goatcounter.count({ path: 'event/' + top[0].slug + '/router-query-matched', title: 'Router → ' + top[0].name, event: true }); } catch (e) {} }
    results.innerHTML = '<div class="result-label">A good place to start</div><div class="matching-tools">' + top.map(function (t, i) {
      return '<a' + (i ? '' : ' class="best"') + ' href="' + BASE + t.slug + '/"><span aria-hidden="true">' + esc(t.icon) + '</span><div>' + (i ? '' : '<span class="rt">Best match</span>') + '<strong>' + esc(t.name) + '</strong><small>' + esc(t.desc) + '</small></div>' + (t.live ? esc(t.time) : 'Soon') + '</a>';
    }).join('') + '</div>';
    var m = document.getElementById('tool-' + top[0].slug.replace(/\//g, '-')); if (m) m.classList.add('is-match');
  }
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); ask(q.value); });
  $$('.search-chips button').forEach(function (b) { b.addEventListener('click', function () { q.value = b.dataset.query; ask(q.value); }); });
  if (q) q.addEventListener('input', function () { if (!q.value) ask(''); });
  var pre = new URLSearchParams(location.search).get('q'); if (pre && q) { q.value = pre; ask(pre); }

  /* ---- Filter tabs ---- */
  var tabs = $$('.filter');
  function setFilter(f) {
    tabs.forEach(function (b) { var on = b.dataset.filter === f; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    $$('#tools-grid .tool-card').forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.category === f); });
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.dataset.filter); }); });
  $$('[data-jump]').forEach(function (a) { a.addEventListener('click', function () { setFilter(a.dataset.jump); }); });

  /* ---- Mobile menu ---- */
  var menu = $('#menu-toggle'), nav = $('#main-nav');
  if (menu) menu.addEventListener('click', function () { var open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); nav.classList.toggle('open', open); });
  $$('#main-nav a').forEach(function (a) { a.addEventListener('click', function () { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }); });

  /* ---- Growth simulator ---- */
  var monthly = $('#monthly'), years = $('#years'), rate = $('#return'), chart = $('#projection-chart'), raf = 0;
  function fill(el) { var p = (el.value - el.min) / (el.max - el.min) * 100; el.style.background = 'linear-gradient(90deg,#f27b18 ' + p + '%,#455156 ' + p + '%)'; }
  function draw() {
    raf = 0;
    var m = +monthly.value, y = +years.value, r = +rate.value, total = fv(m, y, r), invested = m * 12 * y;
    [monthly, years, rate].forEach(fill);
    $('#monthly-value').textContent = usd.format(m); $('#years-value').textContent = y + (y === 1 ? ' year' : ' years'); $('#return-value').textContent = r + '%';
    $('#chart-total').textContent = usd.format(total); $('#chart-invested').textContent = usd.format(invested);
    $('#chart-growth').textContent = usd.format(total - invested); $('#chart-time').textContent = y + (y === 1 ? ' year' : ' years');
    var W = 630, H = 250, base = 218, top = 24, steps = 8, gap = 14, bw = (W - 40 - (steps - 1) * gap) / steps;
    var pts = []; for (var i = 0; i < steps; i++) { var yr = Math.max(1, Math.round((i + 1) / steps * y)); pts.push({ year: yr, v: fv(m, yr, r), paid: m * 12 * yr }); }
    var max = Math.max.apply(null, pts.map(function (p) { return p.v; }).concat([1])) * 1.05;
    chart.setAttribute('aria-label', 'Illustrative projection over ' + y + ' years: ' + usd.format(invested) + ' contributed grows to ' + usd.format(total) + '.');
    chart.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
      [0, 1, 2, 3].map(function (k) { var yy = top + (base - top) / 3 * k; return '<line x1="15" y1="' + yy + '" x2="' + (W - 15) + '" y2="' + yy + '" stroke="#2b4246" stroke-width="1"/>'; }).join('') +
      pts.map(function (p, k) { var x = 22 + k * (bw + gap), bh = Math.max(2, p.v / max * (base - top)), ph = Math.min(bh, p.paid / max * (base - top));
        return '<g><rect x="' + x + '" y="' + (base - bh) + '" width="' + bw + '" height="' + bh + '" rx="3" fill="#f18b34" opacity="' + (0.45 + k * 0.075) + '"/><rect x="' + x + '" y="' + (base - ph) + '" width="' + bw + '" height="' + ph + '" rx="2" fill="#ffcb93" opacity=".85"/><text x="' + (x + bw / 2) + '" y="' + (base + 18) + '" fill="#98abb0" text-anchor="middle" font-size="11">' + p.year + 'y</text></g>'; }).join('') + '</svg>';
  }
  if (monthly && chart) { [monthly, years, rate].forEach(function (el) { el.addEventListener('input', function () { if (!raf) raf = requestAnimationFrame(draw); }); }); draw(); }
})(typeof window !== 'undefined' ? window : globalThis);
