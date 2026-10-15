(function () {
var C = window.PT_CHECKUP, KEY = 'pymtw-checkup-v1', a = {}, i = 0;
var $ = function (s) { return document.querySelector(s); };
var remember = $('#remember');
try { var saved = localStorage.getItem(KEY); if (saved) { a = JSON.parse(saved); remember.checked = true; } } catch (e) {}
function save() { try { if (remember.checked) localStorage.setItem(KEY, JSON.stringify(a)); else localStorage.removeItem(KEY); } catch (e) {} }
remember.onchange = save;
function list() { return C.visible(a); }
function render() {
  var qs = list(); if (i >= qs.length) return report();
  var q = qs[i], cur = a[q.id];
  $('#bar').style.width = (i / qs.length * 100) + '%';
  $('#count').textContent = 'Question ' + (i + 1) + ' of ' + qs.length;
  $('#back').style.visibility = i ? 'visible' : 'hidden';
  $('#cont').style.display = q.multi ? '' : 'none';
  $('#qwrap').innerHTML = '<h2 class="ck-q">' + q.q + '</h2>' + (q.hint ? '<p class="ck-hint">' + q.hint + '</p>' : '') + '<div class="ck-opts">' +
    q.opts.map(function (o) { var on = q.multi ? (cur || []).indexOf(o[0]) > -1 : cur === o[0]; return '<button type="button" class="ck-opt' + (q.multi ? ' multi' : '') + (on ? ' on' : '') + '" data-v="' + o[0] + '" aria-pressed="' + on + '">' + o[1] + '</button>'; }).join('') + '</div>';
  PT.$$('.ck-opt').forEach(function (b) { b.onclick = function () {
    var v = b.dataset.v;
    if (q.multi) { var s = (a[q.id] || []).slice(); if (v === 'none') s = ['none']; else { s = s.filter(function (x) { return x !== 'none'; }); var k = s.indexOf(v); k > -1 ? s.splice(k, 1) : s.push(v); } a[q.id] = s; save(); render(); return; }
    a[q.id] = v; save(); PT.$$('.ck-opt').forEach(function (x) { x.classList.toggle('on', x === b); });
    setTimeout(function () { i++; render(); }, 220);
  }; });
}
$('#back').onclick = function () { if (i) { i--; render(); } };
$('#cont').onclick = function () { var q = list()[i]; if (!a[q.id] || !a[q.id].length) a[q.id] = ['none']; save(); i++; render(); };
function report() {
  var items = C.evaluate(a), n = { red: 0, amber: 0, green: 0 }; items.forEach(function (x) { n[x.status]++; });
  var cls = { red: 'r', amber: 'a', green: 'g' }, label = { red: 'Act soon', amber: 'Worth a look', green: 'Looks covered' }, col = { red: '#d23b3b', amber: '#d98a00', green: '#0a7c55' };
  var todo = items.filter(function (x) { return x.status !== 'green'; }), ok = items.filter(function (x) { return x.status === 'green'; });
  var card = function (x, k) { var l = x.link; return '<div class="spot ' + cls[x.status] + '"><div class="n">' + (k + 1) + '</div><div><h4>' + x.title + ' <span class="st">' + label[x.status] + '</span></h4><p>' + x.why + '</p><p class="do"><b>Next step:</b> ' + x.step + '</p>' +
    (l.soon ? '<span class="lk lk-soon">📘 Guide coming soon</span>' : '<a class="lk" href="' + l.href + '"' + (l.ext ? ' target="_blank" rel="noopener"' : '') + '>' + (l.ext ? 'Visit ' + l.label + ' ↗' : 'Open ' + l.label + ' →') + '</a>') + '</div></div>'; };
  var first = todo[0];
  $('#quiz').style.display = 'none';
  var r = $('#report');
  r.innerHTML = '<header class="rp-head"><div class="eyebrow">Your blind spots report</div><h1 style="font-size:clamp(34px,5.5vw,56px)">' + (todo.length ? (todo.length > 5 ? 'Start with these <em>five.</em>' : todo.length + (todo.length === 1 ? ' thing' : ' things') + ' <em>worth your attention.</em>') : 'No blind spots <em>found.</em>') + '</h1>' +
    '<p class="sentence">' + (first ? 'Start with <b>' + first.title.toLowerCase() + '</b>. ' + first.why : 'From your answers, the basics look covered. Keep reviewing once a year, or whenever life changes.') + '</p>' +
    '<div class="spect" role="img" aria-label="' + n.red + ' act soon, ' + n.amber + ' worth a look, ' + n.green + ' looks covered">' + ['red', 'amber', 'green'].map(function (s) { return n[s] ? '<i style="flex:' + n[s] + ';background:' + col[s] + '"></i>' : ''; }).join('') + '</div>' +
    '<div class="keys">' + ['red', 'amber', 'green'].map(function (s) { return '<span><span class="dot" style="background:' + col[s] + '"></span><b>' + n[s] + '</b> ' + label[s].toLowerCase() + '</span>'; }).join('') + '</div></header>' +
    (todo.length ? '<div class="group-h">Your top ' + Math.min(5, todo.length) + ' priorities</div>' + todo.slice(0, 5).map(card).join('') +
      (todo.length > 5 ? '<details class="more"><summary class="btn ghost">Show ' + (todo.length - 5) + ' more</summary>' + todo.slice(5).map(function (x, k) { return card(x, 5 + k); }).join('') + '</details>' : '') : '') +
    (ok.length ? '<details class="greens"><summary class="group-h">Looks covered (' + ok.length + ') ▾</summary>' + ok.map(function (x, k) { return card(x, todo.length + k); }).join('') + '</details>' : '') +
    '<p class="note" style="margin-top:24px"><strong>Sources and rules of thumb.</strong> Retirement milestone: Fidelity Investments suggests aiming to save at least 1x your salary by 30, 3x by 40, 6x by 50, 8x by 60, and 10x by 67, assuming retirement at 67 (<a style="color:var(--accent)" href="https://www.fidelity.com/viewpoints/retirement/how-much-do-i-need-to-retire" target="_blank" rel="noopener">Fidelity</a>). Your own target depends on when you retire, your lifestyle, and other income. The 3-to-6-month emergency fund is a common rule of thumb, not a requirement. Credit freezes: <a style="color:var(--accent)" href="https://consumer.ftc.gov/articles/what-know-about-credit-freezes-fraud-alerts" target="_blank" rel="noopener">FTC</a>. Free credit reports: <a style="color:var(--accent)" href="https://www.annualcreditreport.com/" target="_blank" rel="noopener">AnnualCreditReport.com</a>. HSA rules: <a style="color:var(--accent)" href="https://www.irs.gov/publications/p969" target="_blank" rel="noopener">IRS Publication 969</a>. Legal rules vary by state. Talk to an estate attorney about wills and guardianship.</p>' +
    '<div class="share-host" id="ckshare"></div>' +
    '<div class="rp-actions"><button class="btn ghost" id="redo">↺ Change my answers</button><button class="btn ghost" id="forget">Forget my answers</button><a class="btn" href="../">Browse all tools</a></div>';
  r.classList.add('show'); window.scrollTo(0, 0);
  PT.shareButton(document.getElementById('ckshare'), 'checkup', { count: todo.length });
  $('#redo').onclick = function () { i = 0; r.classList.remove('show'); $('#quiz').style.display = ''; render(); };
  $('#forget').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} a = {}; remember.checked = false; i = 0; r.classList.remove('show'); $('#quiz').style.display = ''; render(); var m = document.getElementById('forgot'); m.style.display = 'block'; };
}
// Demo/screenshot support: ?demo=1 fills sample answers, ?demo=step shows a question mid-way
if (/demo=1/.test(location.search)) { a = { ef: '1to3', debt: 'noplan', plan: 'below', age: '30s', ret: 'lt1', taxadv: 'some', hdhp: 'nohsa', dependents: 'yes', ins: 'one', benef: 'old', will: 'no', fees: 'unknown', subs: 'year', credit: 'checked', events: ['baby', 'home'] }; i = 99; }
if (/demo=step/.test(location.search)) { a = { ef: '1to3', debt: 'plan', plan: 'below' }; i = 3; }
render();
})();
