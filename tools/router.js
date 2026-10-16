/* "What help do you need?" router: weighted keyword matching, runs locally (no AI service). */
(function () {
var ALL = PT_CATS.flatMap(function (c) { return c.tools; });
var CHECKUP = { slug: 'checkup', icon: '🩺', name: '2-minute money checkup', desc: 'Quick questions that surface the blind spots you didn’t know you had.', time: '2 min', live: true,
  kw: ['where do i start', 'where to start', 'where should i start', 'am i on track', 'on track', 'checkup', 'check up', 'check-up', 'blind spot', 'blind spots', 'what am i missing', 'missing anything', 'financial health', 'money health', 'get my finances', 'finances in order', 'get organized', 'overwhelmed', 'beginner', 'not sure', 'everything', 'big picture', 'overall'] };
ALL.push(CHECKUP);
var GUIDE_JOB = { slug: 'guides/lost-my-job', icon: '📘', name: 'Guide: Just lost your job?', desc: 'What to do this week, this month and this year: unemployment, COBRA vs. Marketplace, your 401(k).', time: '5 min read', live: true, boost: 2,
  kw: ['lost my job', 'just lost', 'laid off', 'layoff', 'fired', 'let go', 'job loss', 'lost job', 'terminated', 'unemployed', 'what do i do now', 'cobra', 'unemployment'] };
ALL.push(GUIDE_JOB);
var GUIDE_HOME = { slug: 'guides/first-home', icon: '🏠', name: 'Guide: Buying your first home', desc: 'The real upfront cash, affordability, rates, PMI, pre-approval, inspections, escrow and year-one costs.', time: '6 min read', live: true, boost: 1,
  kw: ['first home', 'first-time', 'first time buyer', 'buying a home', 'buy a home', 'buy a house', 'buying a house', 'home', 'house', 'mortgage', 'pmi', 'closing costs', 'down payment', 'pre-approval', 'preapproval', 'prequalification', 'home inspection', 'escrow'] };
ALL.push(GUIDE_HOME);
var I = { // line icons, 24x24
 'subscription-leak-finder':'<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/><path d="m20.2 18.2 1.8 1.8"/>',
 'credit-card-optimizer':'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6 15h4"/>',
 'paycheck-decoder':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 'debt-payoff-planner':'<path d="M3 5c4 0 6 3 9 7s5 6 9 7"/><path d="M17 19h4v-4"/>',
 'severance-runway':'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
 'rent-vs-buy':'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-5h4v5"/>',
 'emergency-fund-runway':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m9 9-3.4-3.4M15 9l3.4-3.4M9 15l-3.4 3.4M15 15l3.4 3.4"/>',
 'explain-my-401k':'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 'fee-x-ray':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',
 'roth-vs-traditional':'<path d="M12 4v16M5 20h14M4 8h16M4 8l-2.5 6a3 3 0 0 0 5 0zM20 8l-2.5 6a3 3 0 0 0 5 0z"/>',
 'bitcoin-tax-lot-cleanup':'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h8"/>',
 'before-you-sign':'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h4"/><path d="m15 17 1.5 1.5L19 16"/>',
 'money-timeline':'<path d="M2 12h20"/><circle cx="6" cy="12" r="2.2"/><circle cx="13" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M6 9.8V5M13 14.2V19M19 9.8V6"/>',
 'bitcoin-dca-backtester':'<path d="M9 5v14M9 5h5a3 3 0 0 1 0 6H9h6a3 3 0 0 1 0 6H9M11 3v2M11 19v2M7 5h2M7 19h2"/>'};
var X = { // example outcome lines + tint
 'subscription-leak-finder':['“10 recurring charges, $4,274 a year”','#fdf1e7','#c2571a'],
 'credit-card-optimizer':['“Grocery booster wins for this budget”','#eef0fd','#3b4cc0'],
 'paycheck-decoder':['Every line on your stub, decoded','#f1f1f4','#55555c'],
 'debt-payoff-planner':['“Debt-free by July 2029”','#e7f4ee','#0a7c55'],
 'severance-runway':['“8 months of runway”','#e7f4ee','#0a7c55'],
 'rent-vs-buy':['“Renting wins by $37,866 over 10 yrs”','#fbf3dc','#9a6a00'],
 'emergency-fund-runway':['“2.3 months covered, goal by 2029”','#e6f3fb','#1769a8'],
 'explain-my-401k':['Holdings, fees and match, at a glance','#f1f1f4','#55555c'],
 'fee-x-ray':['“Fees cost $551k over 30 years”','#fdecec','#b42727'],
 'roth-vs-traditional':['“Traditional wins: 27% now vs. 20% later”','#f2ecfc','#6b3fc4'],
 'bitcoin-tax-lot-cleanup':['FIFO, HIFO or spec-ID, 8949-ready','#f1f1f4','#55555c'],
 'before-you-sign':['“2 red flags, true rate 10.2% vs. 6.9%”','#fdecec','#b42727'],
 'money-timeline':['“Debt-free by 2030, down payment by 2031”','#e7f4ee','#0a7c55'],
 'bitcoin-dca-backtester':['“$100/mo since 2019 → $37,867”','#fff1e0','#d9730d']};
var TAG = { 'before-you-sign':['new','New'], 'money-timeline':['new','New'], 'debt-payoff-planner':['hot','Start here'], 'subscription-leak-finder':['hot','Start here'], 'severance-runway':['new','New'], 'fee-x-ray':['new','New'], 'bitcoin-dca-backtester':['new','New'] };
var svg = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>'; };
var BY = {}; ALL.forEach(function (t) { BY[t.slug] = t; });
// Featured row with mini result previews (sample numbers from each tool's demo)
document.getElementById('feat').innerHTML =
 '<a class="fc dark" href="debt-payoff-planner/"><span class="tag">Start here · 60 sec</span><h3>Know your debt-free date.</h3><p class="d">Snowball vs. avalanche, month by month.</p><div class="viz"><div class="vz-sub" style="margin:0 0 6px">Sample result</div><div class="vz-big">July 2029</div><svg viewBox="0 0 320 90" style="width:100%;margin-top:14px"><defs><linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2fd39a" stop-opacity=".45"/><stop offset="1" stop-color="#2fd39a" stop-opacity="0"/></linearGradient></defs><path d="M0 8 C80 22 150 40 210 60 S290 84 316 86 L316 90 L0 90Z" fill="url(#g1)"/><path d="M0 8 C80 22 150 40 210 60 S290 84 316 86" fill="none" stroke="#2fd39a" stroke-width="3" stroke-linecap="round"/><path d="M0 8 C90 18 170 34 240 54 S300 80 316 84" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="5 6"/><circle cx="316" cy="86" r="5" fill="#2fd39a"/></svg><div class="runlbl"><span>$37,900 today</span><span>$0</span></div></div><span class="cta">Plan my payoff <i>→</i></span></a>' +
 '<a class="fc green" href="severance-runway/"><span class="tag">New · 60 sec</span><h3>Lost your job? See your runway.</h3><p class="d">Savings, severance and benefits, plus a first-week checklist.</p><div class="viz"><div class="vz-sub" style="margin:0 0 6px">Sample result</div><div class="vz-big">8 months</div><div class="runbar">' + [1,1,1,1,1,1,2,2,0,0].map(function (x) { return '<span class="' + (x === 2 ? 'ui' : x === 0 ? 'off' : '') + '"></span>'; }).join('') + '</div><div class="runlbl"><span>Now</span><span>June 2027</span></div></div><span class="cta">Check my runway <i>→</i></span></a>' +
 '<a class="fc light" href="subscription-leak-finder/"><span class="tag">Start here · 30 sec</span><h3>Find the subscriptions you forgot.</h3><p class="d">Load a bank CSV. It never leaves your device.</p><div class="viz"><div class="rcpt"><div><span>Adobe Creative</span><b>$59.99</b></div><div><span>Hulu</span><b>$18.99</b></div><div><span>Netflix</span><b>$17.99</b></div><div><span>Spotify<span class="up">↑ $1</span></span><b>$12.99</b></div><div class="tot"><span>10 found</span><b>$356/mo</b></div></div></div><span class="cta">Find my leaks <i>→</i></span></a>';
document.getElementById('feat2').innerHTML =
 '<a class="fc light" href="before-you-sign/"><span class="tag">New · 2 min</span><h3>Before you sign, see the real cost.</h3><p class="d">Car loans, card offers, leases and pay-later plans. Paste the offer and we flag what to ask.</p><div class="viz"><div class="vz-sub" style="margin:0 0 10px">Sample: 84-month car loan</div><div class="flags-mini"><div><i style="background:#d23b3b"></i>Long loan term (84 months)</div><div><i style="background:#d98a00"></i>True rate 10.2% vs. 6.9% stated</div><div><i style="background:#d98a00"></i>Add-ons financed: $2,400</div></div></div><span class="cta">Check my deal <i>→</i></span></a>' +
 '<a class="fc dark" href="money-timeline/"><span class="tag">New · 3 min</span><h3>Your money, on one timeline.</h3><p class="d">Every goal with a projected date. Drag a slider and watch them move.</p><div class="viz"><div class="vz-sub" style="margin:0 0 6px">Sample timeline</div><svg viewBox="0 0 320 70" style="width:100%"><line x1="8" x2="312" y1="40" y2="40" stroke="#ffffff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/><line x1="8" x2="40" y1="40" y2="40" stroke="#2fd39a" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="40" r="5" fill="#fff"/><g fill="#2fd39a"><circle cx="70" cy="40" r="7"/><circle cx="135" cy="40" r="7" fill="#f2b33d"/><circle cx="168" cy="40" r="7"/><circle cx="292" cy="40" r="7"/></g><g font-size="10" fill="#fff" font-family="inherit" text-anchor="middle" font-weight="600"><text x="70" y="20">Emergency</text><text x="135" y="64">Debt-free</text><text x="168" y="20">Home</text><text x="292" y="20">Retire</text></g></svg></div><span class="cta">Map my timeline <i>→</i></span></a>';
var lib = document.getElementById('library');
lib.innerHTML = PT_CATS.map(function (c) {
  var n = c.tools.length;
  return '<div class="cat"><div class="cat-title"><h3>' + c.name + '</h3><span>' + c.note + '</span></div><div class="grid n' + Math.min(n, 3) + (n === 1 ? ' wide' : '') + '">' +
  c.tools.map(function (t) { var x = X[t.slug], tg = t.live ? TAG[t.slug] : ['soon', 'Coming soon'];
    return '<a class="tool' + (t.live ? '' : ' is-soon') + '" id="tool-' + t.slug + '" href="' + t.slug + '/" style="--t:' + x[1] + ';--c:' + x[2] + '"><div class="top"><div class="ic">' + svg(t.slug) + '</div>' + (tg ? '<span class="badge ' + tg[0] + '">' + tg[1] + '</span>' : '') + '</div><div class="body"><h4>' + t.name + '</h4><p>' + t.desc + '</p><div class="ex">' + x[0] + (t.live ? '<em>' + t.time + '</em>' : '') + '</div></div><span class="arrow">→</span></a>'; }).join('') + '</div></div>'; }).join('');
/* Outbound sister-project card in the Bitcoin section (not part of the tool catalog). */
(function () {
  var bt = document.getElementById('tool-bitcoin-dca-backtester'); if (!bt) return;
  var g = bt.parentNode; g.className = g.className.replace(/\bn\d\b/, 'n3');
  var d = document.createElement('div');
  d.className = 'tool ext'; d.id = 'tool-stackcost'; d.style.cssText = '--t:#fff1e0;--c:#d9730d';
  d.innerHTML = '<div class="top"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M6 16v-4M10 16V8M14 16v-6M18 16V5"/></svg></div><span class="badge ext">External site</span></div><div class="body"><h4><a href="https://stackcost-pink.vercel.app" target="_blank" rel="noopener">StackCost</a></h4><p>See the real all-in cost to DCA Bitcoin by platform (fees, spread, withdrawal).</p><div class="ex"><a href="https://stackcost-pink.vercel.app/compare" target="_blank" rel="noopener">Compare platforms →</a></div></div><span class="arrow" aria-hidden="true">↗</span>';
  bt.insertAdjacentElement('afterend', d);
})();
var examples = ['I just lost my job', 'Is this car loan a good deal?', 'When can I afford a house?', 'Am I paying too much in fees?', 'How do I get out of credit card debt?', 'Should I buy a home or keep renting?', 'Which credit card should I get?', 'Roth or traditional IRA?'];
var ex = 0, q = document.getElementById('q');
setInterval(function () { if (!q.value && document.activeElement !== q) { ex = (ex + 1) % examples.length; q.placeholder = examples[ex]; } }, 2800);
function route(text) {
  var s = ' ' + text.toLowerCase().replace(/[^a-z0-9()\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
  return ALL.map(function (t) { var kw = t.kw.reduce(function (a, k) { return a + (s.indexOf(k) > -1 ? k.split(' ').length * 2 + (k.length > 6 ? 1 : 0) : 0); }, 0); return { t: t, kw: kw, score: kw + (t.live ? 0.5 : 0) + (kw ? (t.boost || 0) : 0) }; })
    .filter(function (r) { return r.kw > 0; }).sort(function (a, b) { return b.score - a.score; });
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
  if (window.goatcounter && typeof goatcounter.count === 'function') { try { goatcounter.count({ path: 'event/' + best.slug + '/router-query-matched', title: 'Router → ' + best.name, event: true }); } catch (e) {} }
  answer.innerHTML = '<div class="k">Best tool for you</div><div class="best"><div><h3>' + best.icon + ' ' + best.name + '</h3><p>' + best.desc + '</p></div><a class="open" href="' + best.slug + '/">' + (best.live ? 'Start · ' + best.time : 'Preview · coming soon') + '</a></div>' +
    (others.length ? '<div class="also">Also helpful:' + others.map(function (o) { return '<a href="' + o.slug + '/">' + o.name + '</a>'; }).join(' ·') + '</div>' : '');
  answer.classList.add('show');
  var ids = {}; hits.slice(0, 3).forEach(function (h) { ids[h.t.slug] = 1; });
  PT.$$('.tool').forEach(function (el) { var id = el.id.replace('tool-', ''); if (id === best.slug) el.classList.add('match');  });
}
document.getElementById('askForm').addEventListener('submit', function (e) { e.preventDefault(); ask(q.value); });
PT.$$('.chip').forEach(function (c) { c.addEventListener('click', function () { q.value = c.dataset.q; ask(q.value); }); });
q.addEventListener('input', function () { if (!q.value) ask(''); });
var pre = new URLSearchParams(location.search).get('q'); if (pre) { q.value = pre; ask(pre); }
})();
