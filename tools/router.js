/* "What help do you need?" router: weighted keyword matching, runs locally (no AI service). */
(function () {
var ALL = PT_CATS.flatMap(function (c) { return c.tools; });
var lib = document.getElementById('library');
lib.innerHTML = PT_CATS.map(function (c) { return '<div class="cat"><div class="cat-title"><h3>' + c.name + '</h3><span>' + c.note + '</span></div><div class="grid">' +
  c.tools.map(function (t) { return '<a class="tool" id="tool-' + t.slug + '" href="' + t.slug + '/"><div><div class="icon">' + t.icon + '</div><h4>' + t.name + (t.live ? '' : '<span class="soon-tag">Soon</span>') + '</h4><p>' + t.desc + '</p></div><div class="time">' + (t.live ? '⏱ ' + t.time : 'Coming soon') + '</div><span class="arrow">→</span></a>'; }).join('') + '</div></div>'; }).join('');
var examples = ['I just lost my job', 'Am I paying too much in fees?', 'How do I get out of credit card debt?', 'Should I buy a home or keep renting?', 'Which credit card should I get?', 'Roth or traditional IRA?'];
var ex = 0, q = document.getElementById('q');
setInterval(function () { if (!q.value && document.activeElement !== q) { ex = (ex + 1) % examples.length; q.placeholder = examples[ex]; } }, 2800);
function route(text) {
  var s = ' ' + text.toLowerCase().replace(/[^a-z0-9()\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
  return ALL.map(function (t) { return { t: t, score: t.kw.reduce(function (a, k) { return a + (s.indexOf(k) > -1 ? k.split(' ').length * 2 + (k.length > 6 ? 1 : 0) : 0); }, 0) + (t.live ? 0.5 : 0) }; })
    .filter(function (r) { return r.score > 0.5; }).sort(function (a, b) { return b.score - a.score; });
}
window.PT_route = route;
var answer = document.getElementById('answer');
function ask(text) {
  PT.$$('.tool').forEach(function (el) { el.classList.remove('match', 'dim'); });
  if (!text.trim()) { answer.classList.remove('show'); return; }
  var hits = route(text);
  if (!hits.length) {
    answer.innerHTML = '<div class="k">Not sure yet</div><div class="best"><div><h3>Tell us a little more</h3><p>Try “I have $12k in credit card debt” or “what are my fund fees costing me?” Or browse all tools below.</p></div><a class="open" href="#tools">Browse tools</a></div>';
    answer.classList.add('show'); return;
  }
  var best = hits[0].t, others = hits.slice(1, 3).map(function (h) { return h.t; });
  answer.innerHTML = '<div class="k">Best tool for you</div><div class="best"><div><h3>' + best.icon + ' ' + best.name + '</h3><p>' + best.desc + '</p></div><a class="open" href="' + best.slug + '/">' + (best.live ? 'Start · ' + best.time : 'Preview · coming soon') + '</a></div>' +
    (others.length ? '<div class="also">Also helpful:' + others.map(function (o) { return '<a href="' + o.slug + '/">' + o.name + '</a>'; }).join(' ·') + '</div>' : '');
  answer.classList.add('show');
  var ids = {}; hits.slice(0, 3).forEach(function (h) { ids[h.t.slug] = 1; });
  PT.$$('.tool').forEach(function (el) { var id = el.id.replace('tool-', ''); if (id === best.slug) el.classList.add('match'); else if (!ids[id]) el.classList.add('dim'); });
}
document.getElementById('askForm').addEventListener('submit', function (e) { e.preventDefault(); ask(q.value); });
PT.$$('.chip').forEach(function (c) { c.addEventListener('click', function () { q.value = c.dataset.q; ask(q.value); }); });
q.addEventListener('input', function () { if (!q.value) ask(''); });
var pre = new URLSearchParams(location.search).get('q'); if (pre) { q.value = pre; ask(pre); }
})();
