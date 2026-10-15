(function () {
var D = window.PT_DATA, form = PT.$('#wiz');
var endEl = form.querySelector('[name=end]'), startEl = form.querySelector('[name=start]');
endEl.value = D.btcRange[1]; endEl.max = D.btcRange[1]; startEl.max = D.btcRange[1]; startEl.min = D.btcRange[0];
PT.$('#asof').textContent = (function (k) { var p = k.split('-'); return PT.monthName(new Date(+p[0], p[1] - 1, 1), true); })(D.btcRange[1]);
var lbl = function (k) { var p = k.split('-'); return PT.monthName(new Date(+p[0], p[1] - 1, 1)); };
PT.wizard(form, function (v) {
  var s = v.start < D.btcRange[0] ? D.btcRange[0] : v.start, e = v.end > D.btcRange[1] ? D.btcRange[1] : v.end;
  if (e < s) { var t = s; s = e; e = t; }
  var b = PT.calc.dca(D.btc, s, e, v.amount), spxOK = s >= D.spxRange[0], x = spxOK ? PT.calc.dca(D.spx, s, e, v.amount) : null;
  var gain = b.value / b.invested - 1;
  PT.renderResult(PT.$('#out'), { share: ['bitcoin-dca-backtester', {gainPct: gain}],
    label: 'Your ' + PT.money(b.invested) + ' would be worth', big: PT.money(b.value),
    sentence: 'Buying ' + PT.money(v.amount) + ' of bitcoin every month from ' + lbl(s) + ' to ' + lbl(e) + ' would have turned ' + PT.money(b.invested) + ' into <b>' + PT.money(b.value) + '</b> (' + (gain >= 0 ? '+' : '') + PT.pct(gain, 0) + ')' + (x ? ', compared with ' + PT.money(x.value) + ' in the S&amp;P 500 price index.' : '. The S&amp;P 500 comparison needs a start date of November 2016 or later.'),
    stats: [['Bitcoin bought', b.units.toFixed(4) + ' BTC'], ['Average cost', PT.money(b.avgCost)], ['Lump sum on day one', PT.money(b.lumpValue)]],
    chart: true,
    extra: '<div class="card"><h3>The honest part</h3><p class="hint" style="margin:0">Bitcoin has had several drawdowns of more than 70%. DCA spreads out your timing risk but doesn’t remove price risk. A backtest shows what happened, not what will happen.</p></div>',
    next: 'If you want to start a DCA plan, pick an amount you could keep buying through a 70% drop, and learn self-custody before your balance gets big.',
    nextLink: ['PYMTW Bitcoin guides', 'https://pymtw.com/start-here.html']
  });
  var series = [{ name: 'Bitcoin DCA value', color: '#0a7c55', points: b.points.map(function (p, i) { return [i, p[2]]; }), area: true }, { name: 'Total invested', color: '#c3c3ca', points: b.points.map(function (p, i) { return [i, p[1]]; }), width: 2, dash: true }];
  if (x) series.splice(1, 0, { name: 'S&P 500 DCA value', color: '#3a3a3f', points: x.points.map(function (p, i) { return [i, p[2]]; }), width: 2 });
  var ticks = []; b.keys.forEach(function (k, i) { if (k.slice(5) === '01' && (b.keys.length < 60 || +k.slice(0, 4) % 2 === 0)) ticks.push(i); });
  PT.lineChart(PT.$('#chart'), { series: series, xTicks: ticks, xFmt: function (i) { return b.keys[i] ? b.keys[i].slice(0, 4) : ''; } });
});
if (PT.isDemo) for (var i = 0; i < 2; i++) PT.$('[data-next]').click();
})();
