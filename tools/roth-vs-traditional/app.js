(function () {
PT.wizard(PT.$('#wiz'), function (v) {
  var now = (+v.fed) + v.state, rv = PT.calc.roth({ contrib: v.contrib, taxNow: now, taxLater: v.taxLater, ret: v.ret, years: v.years });
  // yearly contributions: sum each year's contribution growing for the remaining years
  var roth = 0, trad = 0, pts = [];
  for (var y = 1; y <= v.years; y++) { roth = (roth + v.contrib) * (1 + v.ret); trad = (trad + v.contrib / (1 - now)) * (1 + v.ret); pts.push([y, roth, trad * (1 - v.taxLater)]); }
  var tradNet = trad * (1 - v.taxLater), win = roth >= tradNet ? 'Roth' : 'Traditional', diff = Math.abs(roth - tradNet);
  var same = diff < 1;
  PT.renderResult(PT.$('#out'), {
    label: 'Better for you', big: same ? 'It’s a tie' : win,
    sentence: same ? 'Your tax rate now and in retirement are the same, so both accounts leave you the same amount. Pick on flexibility.' : 'Because your tax rate now (' + PT.pct(now) + ') is ' + (win === 'Roth' ? 'lower' : 'higher') + ' than the ' + PT.pct(v.taxLater) + ' you expect in retirement, a <b>' + win + '</b> account leaves you about <b>' + PT.money(diff) + '</b> more to spend after tax over ' + v.years + ' years.',
    stats: [['Roth, after tax', PT.money(roth)], ['Traditional, after tax', PT.money(tradNet)], ['Breakeven retirement rate', PT.pct(now)]],
    chart: true,
    extra: '<div class="card"><h3>Good to know</h3><ul class="checklist"><li><b>Breakeven rule:</b> if you expect a higher tax rate in retirement than ' + PT.pct(now) + ', Roth wins. If you expect a lower one, traditional wins.</li><li><b>Roth flexibility:</b> you can usually withdraw your contributions (not your earnings) at any time, and Roth IRAs have no required minimum distributions.</li><li><b>Employer match:</b> get the full match first, whichever account type you choose.</li><li><b>Not sure?</b> Many people split their contributions to hedge against future tax changes.</li><li>Roth IRA eligibility phases out at higher incomes, and contribution limits change every year. Check the IRS website for this year’s numbers.</li></ul></div>',
    next: same ? 'Contribute to whichever account your plan makes easiest, and set it up as an automatic payroll or monthly contribution.' : 'Set your next contribution to ' + win + ', starting with any employer match.'
  });
  PT.lineChart(PT.$('#chart'), { series: [{ name: 'Roth (after tax)', color: '#0a7c55', points: [[0, 0]].concat(pts.map(function (p) { return [p[0], p[1]]; })) }, { name: 'Traditional (after tax)', color: '#8a8a92', points: [[0, 0]].concat(pts.map(function (p) { return [p[0], p[2]]; })), dash: true }], xFmt: function (y) { return y ? 'Yr ' + y : 'Now'; } });
});
if (PT.isDemo) for (var i = 0; i < 3; i++) PT.$('[data-next]').click();
})();
