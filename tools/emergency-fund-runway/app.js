(function () {
PT.wizard(PT.$('#wiz'), function (v) {
  var t = +v.target, r = PT.calc.emergency(v.cash, v.essentials, t, v.save), now = new Date();
  var done = r.gap === 0;
  PT.renderResult(PT.$('#out'), { share: ['emergency-fund-runway', {covered: r.covered}],
    label: 'Your savings cover', big: isFinite(r.covered) ? r.covered.toFixed(1).replace(/\.0$/, '') + ' months' : '—',
    sentence: done ? 'You’ve reached your ' + t + '-month target of ' + PT.money(r.target) + '. Nice work.' : 'Your ' + t + '-month target is ' + PT.money(r.target) + '. You’re ' + PT.money(r.gap) + ' short' + (isFinite(r.monthsToGoal) ? ', and saving ' + PT.money(v.save) + ' a month gets you there by <b>' + PT.monthName(PT.addMonths(now, r.monthsToGoal), true) + '</b>.' : '. Even a small monthly amount will start closing the gap.'),
    stats: [['Target', PT.money(r.target)], ['Gap', PT.money(r.gap)], ['Time to goal', done ? 'Done' : PT.duration(r.monthsToGoal)]],
    chart: true,
    next: done ? 'Keep it in a high-yield savings account, and send new savings toward investing or debt.' : 'Set up an automatic transfer of ' + PT.money(v.save) + ' to a separate high-yield savings account on payday.'
  });
  var n = Math.min(isFinite(r.monthsToGoal) ? r.monthsToGoal : 24, 120), pts = [];
  for (var m = 0; m <= Math.max(n, 6); m++) pts.push([m, Math.min(r.target, v.cash + v.save * m)]);
  PT.lineChart(PT.$('#chart'), { series: [{ name: 'Your fund', color: '#0a7c55', points: pts, area: true }, { name: 'Target', color: '#8a8a92', points: [[0, r.target], [pts.length - 1, r.target]], dash: true, width: 2 }], xFmt: function (m) { return m ? 'Mo ' + m : 'Now'; } });
});
if (PT.isDemo) for (var i = 0; i < 4; i++) PT.$('[data-next]').click();
})();
