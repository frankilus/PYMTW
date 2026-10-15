(function () {
var form = PT.$('#wiz');
PT.wizard(form, function (v) {
  var r = PT.calc.runway(v), out = PT.$('#out'), now = new Date(), inf = !isFinite(r.months);
  var end = inf ? null : PT.addMonths(now, Math.floor(r.months));
  var cut = PT.calc.runway(Object.assign({}, v, { expenses: v.expenses * 0.85 }));
  PT.renderResult(out, { share: ['severance-runway', {months: r.months}],
    label: 'Your runway', big: inf ? 'Covered' : (r.months >= 120 ? '10+ years' : (Math.floor(r.months * 10) / 10).toFixed(1).replace(/\.0$/, '') + ' months'),
    sentence: inf ? 'Your income after the job covers your expenses, so your savings aren’t shrinking.' : 'At ' + PT.money(v.expenses) + ' a month, your cash, severance and benefits last until about <b>' + PT.monthName(end, true) + '</b>' + (isFinite(cut.months) ? ', and cutting spending by 15% would stretch that to ' + cut.months.toFixed(1).replace(/\.0$/, '') + ' months.' : '.'),
    stats: [['Cash + severance', PT.money(r.start)], ['Benefits (est.)', PT.money(r.uiTotal)], ['Net monthly burn', PT.money(r.burn)]],
    chart: true,
    extra: '<div class="card"><h3>Your first-week checklist</h3><ul class="checklist">' +
      '<li><b>File for unemployment now.</b> Most states let you apply in your first week, and benefits often start from your filing date, not your last day. Your state labor department’s website has the official estimate.</li>' +
      '<li><b>Choose your health coverage within the deadline.</b> <i>COBRA</i> keeps your exact plan, but you usually pay the full premium plus up to 2%, and you typically have 60 days to elect it. A <i>Marketplace plan</i> (HealthCare.gov or your state’s exchange) may cost less, with savings based on your new, lower income. Losing job coverage opens a special enrollment period, usually 60 days. Compare both before you decide.</li>' +
      '<li><b>Leave your 401(k) invested and avoid cashing out.</b> Your choices are usually: keep it in the old plan, roll it into an IRA or a new employer’s plan, or cash out. Cashing out is usually taxed, and before age 59½ may add a 10% penalty. A direct rollover avoids withholding.</li>' +
      '<li><b>Read your severance agreement before signing.</b> Check the payment timing, any release of claims, non-compete terms, and the deadline. Ask HR about unused PTO and your final paycheck.</li>' +
      '<li><b>Trim the budget for now.</b> Pause subscriptions and extras. <a style="color:var(--accent);font-weight:600" href="../subscription-leak-finder/">Find recurring charges →</a></li>' +
      '<li><b>Call lenders before you miss a payment.</b> Many offer hardship programs. For federal student loans, ask about income-driven repayment.</li></ul><p class="hint" style="margin-top:12px">General education only. Rules vary by state, plan and employer. Check with your plan administrator, state agency or a professional.</p></div>',
    next: inf ? 'Use this breathing room to build your emergency fund before your next role starts.' : 'File your unemployment claim today. Then compare COBRA with a Marketplace plan before the election deadline.',
    nextLink: ['Emergency fund tool', '../emergency-fund-runway/']
  });
  var pts = r.points.map(function (p) { return [p[0], Math.max(0, p[1])]; });
  PT.lineChart(PT.$('#chart'), { title: 'Cash over time', series: [{ name: 'Cash remaining', color: '#0a7c55', points: pts, area: true }].concat(isFinite(cut.months) && cut.months < 120 ? [{ name: 'If you cut spending 15%', color: '#8a8a92', points: cut.points.map(function (p) { return [p[0], Math.max(0, p[1])]; }), dash: true, width: 2 }] : []),
    xFmt: function (m) { return m === 0 ? 'Now' : 'Mo ' + m; }, markers: inf ? [] : [{ x: r.months, y: 0, label: 'Cash runs out' }].concat(v.uiWeeks > 0 ? [{ x: v.uiWeeks / (52 / 12), y: 0, label: '', color: '#c9c9cf' }] : []) });
});
if (PT.isDemo) for (var i = 0; i < 5; i++) PT.$('[data-next]').click();
})();
