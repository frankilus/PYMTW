/* Bitcoin Retirement Drawdown Planner UI. All math is in core.js; nothing typed here leaves the browser. */
(function () {
var form = PT.$('#wiz'), last = null;
form._v_ages = function () {
  var v = PT.values(form);
  if (v.age < 18 || v.age > 100) return 'Enter your age now (18 to 100).';
  if (v.retireAge < v.age) return 'Your retirement age can’t be earlier than your age now. Enter your age now to retire today.';
  if (v.planAge <= v.retireAge || v.planAge > 110) return 'Plan to an age after you retire (up to 110).';
  return '';
};
var COLORS = { base: '#0a7c55', bear: '#b42727', badFirst: '#d9730d', badLast: '#1769a8', flat: '#8a8a92' };
function btc(n) { return (n >= 10 ? n.toFixed(2) : n >= 1 ? n.toFixed(3) : n.toFixed(4)) + ' BTC'; }
function today(row, o) { return row.endTotal / Math.pow(1 + o.inflation, row.t + 1); }
function outcome(s, o) { return s.lasts ? 'Lasts past ' + o.planAge : 'Runs out at ' + s.depletedAge; }

function table(r, id) {
  var o = r.input, s = r.scenarios[id], rows = s.rows.filter(function (x) { return x.retired; });
  var h = '<div class="scroll dd-tbl-wrap" tabindex="0" role="region" aria-label="Year-by-year table"><table class="tbl dd-tbl"><caption class="sr-only">Year by year, ' + PT.esc(DD.SCENARIOS.filter(function (x) { return x.id === id; })[0].name) + ', in future dollars</caption><thead><tr><th>Age</th><th class="n">BTC price</th><th class="n">BTC sold</th><th class="n">BTC left</th><th class="n">401(k)/IRA out</th><th class="n">Roth out</th><th class="n">Federal tax</th><th class="n">Gain at 0%</th><th class="n">End balance</th></tr></thead><tbody>';
  rows.forEach(function (x) {
    var out = x.shortfall > 0;
    h += '<tr' + (out ? ' class="out"' : '') + '><td>' + x.age + ' <span style="color:var(--ink-3)">(' + x.year + ')</span></td><td class="n">' + PT.short(x.price) + '</td><td class="n">' + (x.sold > 0 ? x.sold.toFixed(4) : '0') + '</td><td class="n">' + (x.btcLeft > 0 ? x.btcLeft.toFixed(4) : '0') + '</td><td class="n">' + PT.short(x.iraDraw) + (x.rmd > 0 ? '<span class="tag">RMD</span>' : '') + '</td><td class="n">' + PT.short(x.rothDraw) + '</td><td class="n">' + PT.money(x.tax) + '</td><td class="n">' + PT.money(x.gainAt0) + '</td><td class="n">' + (out ? 'Short ' + PT.short(x.shortfall) : PT.short(x.endTotal)) + '</td></tr>';
  });
  return h + '</tbody></table></div>';
}

function render(v) {
  var r = DD.run(v), o = r.input, sc = r.scenarios, base = sc.base, out = PT.$('#out');
  last = r;
  var alt = DD.safeSpend(Object.assign({}, o, { order: o.order === 'smart' ? 'ira' : 'smart' }));
  var lasting = DD.SCENARIOS.filter(function (s) { return sc[s.id].lasts; }).length;
  var first = r.safeRun.rows.filter(function (x) { return x.retired; })[0] || {};
  var rmdYear = DD.TAX_YEAR + (o.rmdStart - o.age);
  var fits = o.spend <= r.safe;
  var sentence = r.safe > 0
    ? 'You can spend about <b>' + PT.money(r.safe) + ' a year</b> in today’s dollars, rising with inflation, from age ' + o.retireAge + ' to ' + o.planAge + ', even if bitcoin drops 75% the year you retire or has its worst years first. ' + (fits ? 'Your plan of ' + PT.money(o.spend) + ' fits inside that.' : 'Your plan of ' + PT.money(o.spend) + ' is ' + PT.money(o.spend - r.safe) + ' a year above it.')
    : 'In the stress scenarios your savings don’t last to ' + o.planAge + ' even with no spending beyond your other income. Try a later retirement age or check your numbers.';
  var cards = DD.SCENARIOS.map(function (s) { var x = sc[s.id]; return '<div class="sc ' + (x.lasts ? 'ok' : 'bad') + '"><small>' + s.name + '</small><b>' + outcome(x, o) + '</b><span>' + (x.lasts ? 'Leaves ' + PT.short(x.endReal) + ' in today’s dollars' : 'At your ' + PT.money(o.spend) + ' a year') + '</span></div>'; }).join('');
  var baseFirst = base.rows.filter(function (x) { return x.retired; })[0] || {};
  var zero = '<div class="card dd-zero"><h3>Fill the 0% capital gains bracket</h3><p>' +
    (baseFirst.sold > 0
      ? 'In your first year of retirement (base case) you sell ' + btc(baseFirst.sold) + ' for ' + PT.money(baseFirst.sale) + '. Of the ' + PT.money(baseFirst.gain) + ' gain, <b>' + (baseFirst.gainAt0 >= baseFirst.gain - 1 ? 'all of it is taxed at 0%' : PT.money(baseFirst.gainAt0) + ' is taxed at 0%') + '</b>' + (baseFirst.zeroRoom > 1 ? ', and you still have about ' + PT.money(baseFirst.zeroRoom) + ' of room left in the 0% bracket that year.' : '.')
      : 'In your first year of retirement (base case) you don’t sell bitcoin, so about ' + PT.money(baseFirst.zeroRoom || 0) + ' of the 0% bracket goes unused that year.') +
    ' In the base case, ' + base.zeroYears + ' of the ' + base.gainYears + ' years with bitcoin gains keep every dollar of gain at 0%.</p><p class="hint" style="margin:10px 0 0">For 2026 the 0% rate covers long-term gains while taxable income stays at or below ' + PT.money(DD.LTCG[o.filing][0]) + ' (' + { mfj: 'married filing jointly', hoh: 'head of household', single: 'single' }[o.filing] + '). 401(k)/IRA withdrawals and RMDs fill that room first. Some holders sell and rebuy in low-income years to raise their cost basis at 0%; ask a tax professional before you do.</p></div>';
  var summary = '<div class="card"><h3>What this means</h3><ul class="checklist">' +
    '<li><b>Base case:</b> at ' + PT.money(o.spend) + ' a year and ' + PT.pct(o.btcGrowth) + ' bitcoin growth, your money ' + (base.lasts ? 'lasts past ' + o.planAge + ' and leaves about ' + PT.short(base.endReal) + ' in today’s dollars.' : 'runs out at age ' + base.depletedAge + '.') + ' Federal tax over the plan: about ' + PT.short(base.totalTax) + '.</li>' +
    '<li><b>Crash at retirement:</b> ' + (sc.bear.lasts ? 'you still make it past ' + o.planAge + '.' : 'you run out at ' + sc.bear.depletedAge + (base.lasts ? ', even though the price gets back to the base path within four years. Selling coins low early is what hurts.' : '.')) + '</li>' +
    '<li><b>Sequence risk:</b> the same long-run growth with the bad years first ' + (sc.badFirst.lasts ? 'lasts past ' + o.planAge : 'runs out at ' + sc.badFirst.depletedAge) + '; with the bad years last it ' + (sc.badLast.lasts ? 'lasts past ' + o.planAge : 'runs out at ' + sc.badLast.depletedAge) + '.</li>' +
    '<li><b>RMDs</b> start at age ' + o.rmdStart + ' (in ' + rmdYear + ') because you were born around ' + o.birthYear + '. They count as ordinary income and use up 0% bracket room.</li>' +
    '<li><b>Order matters:</b> ' + (o.order === 'smart' ? 'using your 401(k)/IRA first and selling bitcoin last' : 'selling bitcoin first, with tax-free 401(k)/IRA withdrawals up to your standard deduction,') + ' would make the stress-tested safe amount ' + PT.money(alt) + ' a year.</li></ul></div>';
  var pick = '<h3 style="font-size:20px;letter-spacing:-.02em;margin:28px 0 8px">Year by year</h3><p class="hint" style="margin-bottom:8px">Future dollars, from the year you retire. Swipe sideways on a phone to see every column.</p><div class="dd-pick"><div class="seg" role="radiogroup" aria-label="Scenario for the table">' + DD.SCENARIOS.map(function (s, i) { return '<label><input type="radio" name="dd-scn" value="' + s.id + '"' + (i ? '' : ' checked') + '><span>' + s.name + '</span></label>'; }).join('') + '</div></div><div id="dd-table">' + table(r, 'base') + '</div>';
  PT.renderResult(out, {
    label: 'Safe yearly spending (stress-tested)',
    big: PT.money(r.safe) + '<span style="font-size:.4em;letter-spacing:-.02em">/yr</span>',
    sentence: sentence,
    stats: [['Year-one sale at that level if bitcoin crashes', first.sold > 0 ? btc(first.sold) : 'None'], ['Your plan lasts in', lasting + ' of 5 scenarios'], ['RMDs start', 'Age ' + o.rmdStart]],
    chart: true,
    extra: '<div class="dd-scen" id="dd-scen">' + cards + '</div>' + zero + summary + pick,
    next: 'Turn this into your written plan: how much you’ll sell, when and from where, plus what your family should do.',
    nextLink: ['Turn this into your written plan →', '../bitcoin-household-plan/']
  });
  PT.lineChart(PT.$('#chart'), { title: 'Total savings by scenario, in today’s dollars',
    series: DD.SCENARIOS.map(function (s) { var x = sc[s.id]; return { name: s.name, color: COLORS[s.id], width: 2, dash: s.id === 'flat', points: [[o.age, o.btc * o.btcPrice + o.ira + o.roth]].concat(x.rows.map(function (row) { return [row.age + 1, Math.max(0, row.shortfall > 0 ? 0 : today(row, o))]; })) }; }),
    xFmt: function (a) { return 'Age ' + Math.round(a); } });
  PT.$$('input[name="dd-scn"]', out).forEach(function (el) { el.addEventListener('change', function () { PT.$('#dd-table').innerHTML = table(last, el.value); }); });
}
PT.wizard(form, render);
if (PT.isDemo) for (var i = 0; i < 6; i++) PT.$('[data-next]').click();
})();
