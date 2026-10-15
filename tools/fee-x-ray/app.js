(function () {
var form = PT.$('#wiz'), body = PT.$('#funds tbody');
function addRow(d) {
  d = d || { name: '', bal: '', er: '' };
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><input data-k="name" placeholder="Fund name or ticker" value="' + PT.esc(d.name) + '"></td><td><input data-k="bal" inputmode="decimal" placeholder="25,000" value="' + d.bal + '"></td><td><input data-k="er" inputmode="decimal" placeholder="0.50" value="' + d.er + '"></td><td><button type="button" class="x" aria-label="Remove">×</button></td>';
  tr.querySelector('.x').onclick = function () { if (body.rows.length > 1) tr.remove(); };
  body.appendChild(tr);
}
[{ name: 'Large-cap growth fund', bal: 60000, er: 0.85 }, { name: 'Target-date 2050', bal: 40000, er: 0.45 }, { name: 'Bond fund', bal: 20000, er: 0.6 }].forEach(addRow);
PT.$('#add').onclick = function () { addRow(); };
function funds() { return PT.$$('tr', body).map(function (tr) { var g = function (k) { return tr.querySelector('[data-k=' + k + ']').value; }; return { name: g('name') || 'Fund', bal: parseFloat(g('bal').replace(/[,$]/g, '')) || 0, er: (parseFloat(g('er')) || 0) / 100 }; }).filter(function (f) { return f.bal > 0; }); }
form._v_funds = function () { if (!funds().length) return 'Add at least one fund with a balance.'; };
PT.wizard(form, function (v) {
  var fs = funds(), total = fs.reduce(function (a, f) { return a + f.bal; }, 0), wer = fs.reduce(function (a, f) { return a + f.bal * f.er; }, 0) / total, fee = wer + v.advisor;
  var r = PT.calc.fees(total, v.monthly, v.ret, fee, v.years), low = PT.calc.fees(total, v.monthly, v.ret, 0.0005, v.years);
  PT.renderResult(PT.$('#out'), {
    label: 'Fees could cost you', big: PT.money(r.cost),
    sentence: 'You pay about <b>' + PT.pct(fee, 2) + ' a year</b> (' + PT.money(total * fee) + ' this year). Over ' + v.years + ' years that adds up to ' + PT.money(r.cost) + ', or ' + PT.pct(r.cost / r.noFee, 0) + ' of what your money could have grown to. A portfolio of 0.05% index funds would keep about ' + PT.money(low.withFee - r.withFee) + ' more of it.',
    stats: [['Weighted expense ratio', PT.pct(wer, 2)], ['Advisor fee', PT.pct(v.advisor, 2)], ['Fees this year', PT.money(total * fee)]],
    chart: true,
    extra: '<div class="card"><h3>Your funds, by yearly cost</h3><div id="bars"></div></div>',
    next: 'Check whether your plan or brokerage offers a low-cost index fund for each of your highest-fee holdings. If you pay an advisor, ask exactly what the fee covers.'
  });
  PT.lineChart(PT.$('#chart'), { series: [{ name: 'With no fees', color: '#8a8a92', points: r.points.map(function (p) { return [p[0], p[1]]; }), dash: true, width: 2 }, { name: 'With your fees', color: '#0a7c55', points: r.points.map(function (p) { return [p[0], p[2]]; }), area: true }], xFmt: function (y) { return y ? 'Yr ' + y : 'Now'; } });
  PT.barChart(PT.$('#bars'), { items: fs.map(function (f) { return { label: f.name + ' · ' + PT.pct(f.er, 2), value: f.bal * f.er }; }).concat(v.advisor ? [{ label: 'Advisor · ' + PT.pct(v.advisor, 2), value: total * v.advisor, color: '#b4541a' }] : []).sort(function (a, b) { return b.value - a.value; }), fmt: function (x) { return PT.money(x) + '/yr'; } });
});
if (PT.isDemo) for (var i = 0; i < 3; i++) PT.$('[data-next]').click();
})();
