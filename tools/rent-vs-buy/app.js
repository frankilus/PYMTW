(function () {
PT.wizard(PT.$('#wiz'), function (v) {
  var r = PT.calc.rentVsBuy(v), last = r.years[r.years.length - 1], f = r.first, adv = last.buyerNW - last.renterNW;
  PT.renderResult(PT.$('#out'), { share: ['rent-vs-buy', {breakeven: r.breakeven}],
    label: 'Buying pays off after', big: r.breakeven ? r.breakeven + (r.breakeven === 1 ? ' year' : ' years') : 'Not within ' + v.years + ' yrs',
    sentence: r.breakeven ? 'If you stay ' + v.years + ' years, buying leaves you about <b>' + PT.money(Math.abs(adv)) + ' ' + (adv >= 0 ? 'ahead' : 'behind') + '</b> of renting and investing the difference. Owning costs about ' + PT.money(f.ownMonthly) + ' a month in year one, compared with ' + PT.money(v.rent) + ' in rent.'
      : 'Over ' + v.years + ' years, renting and investing the difference comes out about <b>' + PT.money(Math.abs(adv)) + ' ahead</b>. Owning costs about ' + PT.money(f.ownMonthly) + ' a month in year one, compared with ' + PT.money(v.rent) + ' in rent.',
    stats: [['Mortgage (P&I)', PT.money(r.pmt) + '/mo'], ['Cash to close', PT.money(r.down + r.closing)], ['Home value, yr ' + v.years, PT.money(last.home)]],
    chart: true,
    extra: '<div class="card"><h3>True monthly cost of owning, year one</h3><div id="bars"></div><p class="hint" style="margin-top:8px">Principal builds equity, so it isn’t lost money. Interest, tax, insurance, maintenance and PMI are. We don’t include the mortgage interest tax deduction, because most households take the standard deduction.</p></div>',
    next: r.breakeven && r.breakeven <= v.years ? 'Before you shop, get a preapproval and a real property tax and insurance quote. Then rerun this with those numbers.' : 'Keep renting for now and invest your would-be down payment. Rerun this if you expect to stay longer.'
  });
  PT.lineChart(PT.$('#chart'), { series: [{ name: 'Net worth if you buy', color: '#0a7c55', points: [[0, r.down * 0 + (v.price * (1 - v.sellPct) - (v.price - r.down))]].concat(r.years.map(function (y, i) { return [i + 1, y.buyerNW]; })) }, { name: 'Net worth if you rent and invest', color: '#8a8a92', points: [[0, r.down + r.closing]].concat(r.years.map(function (y, i) { return [i + 1, y.renterNW]; })), dash: true }],
    xFmt: function (y) { return y ? 'Yr ' + y : 'Now'; }, markers: r.breakeven ? [{ x: r.breakeven, y: r.years[r.breakeven - 1].buyerNW, label: 'Breakeven' }] : [] });
  PT.barChart(PT.$('#bars'), { items: [['Interest', f.interest], ['Principal (equity)', f.principal], ['Property tax', f.tax], ['Maintenance', f.maint], ['Insurance', f.ins], ['PMI', f.pmi]].filter(function (x) { return x[1] > 0; }).map(function (x) { return { label: x[0], value: x[1] / 12, color: x[0].indexOf('Principal') === 0 ? '#9fd8bf' : '#0a7c55' }; }) });
});
if (PT.isDemo) for (var i = 0; i < 4; i++) PT.$('[data-next]').click();
})();
