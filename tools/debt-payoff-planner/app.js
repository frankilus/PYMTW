(function () {
var form = PT.$('#wiz'), body = PT.$('#debts tbody');
function addRow(d) {
  d = d || { name: '', balance: '', apr: '', min: '' };
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><input data-k="name" data-str placeholder="Card" value="' + PT.esc(d.name) + '"></td><td><input data-k="balance" inputmode="decimal" placeholder="5,000" value="' + d.balance + '"></td><td><input data-k="apr" inputmode="decimal" placeholder="22.9" value="' + d.apr + '"></td><td><input data-k="min" inputmode="decimal" placeholder="150" value="' + d.min + '"></td><td><button type="button" class="x" aria-label="Remove">×</button></td>';
  tr.querySelector('.x').onclick = function () { if (body.rows.length > 1) tr.remove(); };
  body.appendChild(tr);
}
[{ name: 'Visa', balance: 6400, apr: 24.9, min: 160 }, { name: 'Store card', balance: 1200, apr: 29.9, min: 40 }, { name: 'Car loan', balance: 11800, apr: 7.4, min: 310 }, { name: 'Student loan', balance: 9500, apr: 5.5, min: 210 }].forEach(addRow);
PT.$('#add').onclick = function () { addRow(); };
function debts() {
  return PT.$$('tr', body).map(function (tr) { var g = function (k) { var v = tr.querySelector('[data-k=' + k + ']').value; return k === 'name' ? v : parseFloat(v.replace(/[,$%]/g, '')) || 0; };
    return { name: g('name'), balance: g('balance'), apr: g('apr') / 100, min: g('min') }; }).filter(function (d) { return d.balance > 0; });
}
form._v_debts = function () { var d = debts(); if (!d.length) return 'Add at least one balance.'; if (d.some(function (x) { return x.min <= 0; })) return 'Each debt needs a minimum payment.'; };
PT.wizard(form, function (v) {
  var ds = debts(), av = PT.calc.debt(ds, v.extra, 'avalanche'), sb = PT.calc.debt(ds, v.extra, 'snowball'), mins = PT.calc.debt(ds, 0, 'avalanche');
  var out = PT.$('#out'), now = new Date();
  if (av.stuck) { PT.renderResult(out, { label: 'Debt-free date', big: 'Not yet', sentence: 'At these payments the interest grows faster than you pay it down, so the balance never reaches zero.', next: 'Raise the extra payment until the chart slopes down, or call your highest-rate lender and ask for a lower rate or a hardship plan.' }); return; }
  var best = av.interest <= sb.interest ? 'avalanche' : 'snowball', b = best === 'avalanche' ? av : sb;
  var date = PT.addMonths(now, b.months), saved = Math.abs(sb.interest - av.interest), vsMin = mins.stuck ? null : mins.interest - b.interest;
  var first = b.debts.slice().sort(function (x, y) { return x.paidOff - y.paidOff; });
  PT.renderResult(out, {
    label: 'You could be debt-free by', big: PT.monthName(date, true),
    sentence: 'Paying ' + PT.money(b.budget) + ' a month with the <b>' + best + '</b> method clears ' + PT.money(ds.reduce(function (a, d) { return a + d.balance; }, 0)) + ' in ' + PT.duration(b.months) + (saved >= 1 ? ' and saves ' + PT.money(saved) + ' in interest compared with the ' + (best === 'avalanche' ? 'snowball' : 'avalanche') + ' method' : ' (both methods pay your debts in the same order here)') + (vsMin != null ? ', or ' + PT.money(vsMin) + ' compared with paying only the minimums' : '') + '.',
    stats: [['Avalanche interest', PT.money(av.interest)], ['Snowball interest', PT.money(sb.interest)], ['Minimums only', mins.stuck ? 'Never' : PT.duration(mins.months)]],
    chart: true,
    extra: '<div class="card"><h3>Month-by-month order (' + best + ')</h3><p class="hint">' + (best === 'avalanche' ? 'Avalanche targets the highest interest rate first. It saves the most money.' : 'Snowball targets the smallest balance first. Quick wins keep you motivated.') + '</p><table class="tbl"><thead><tr><th>Debt</th><th class="n">Paid off</th><th class="n">Interest paid</th></tr></thead><tbody>' +
      first.map(function (d) { return '<tr><td>' + PT.esc(d.name) + '</td><td class="n">' + PT.monthName(PT.addMonths(now, d.paidOff)) + '</td><td class="n">' + PT.money(d.interest) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<details style="margin-top:16px"><summary class="linkbtn">Show the full month-by-month balance</summary><div class="scroll" style="max-height:320px;margin-top:10px"><table class="tbl"><thead><tr><th>Month</th><th class="n">Avalanche</th><th class="n">Snowball</th></tr></thead><tbody>' +
      av.series.map(function (x, i) { return i ? '<tr><td>' + PT.monthName(PT.addMonths(now, i)) + '</td><td class="n">' + PT.money(x) + '</td><td class="n">' + PT.money(sb.series[i] || 0) + '</td></tr>' : ''; }).join('') + '</tbody></table></div></details></div>',
    next: 'Set up an automatic payment of ' + PT.money(b.budget) + ' a month. Put everything above the minimums toward <b>' + PT.esc(first[0].name) + '</b> first.'
  });
  var toPts = function (s) { return s.map(function (y, i) { return [i, y]; }); };
  PT.lineChart(PT.$('#chart'), { title: 'Total balance over time', series: [{ name: 'Avalanche', color: '#0a7c55', points: toPts(av.series), area: true }, { name: 'Snowball', color: '#8a8a92', points: toPts(sb.series), dash: true, width: 2 }],
    xFmt: function (m) { return String(PT.addMonths(now, m).getFullYear()); }, xTicks: (function () { var st = b.months > 72 ? 24 : 12, t = []; for (var m = 0; m <= b.months; m += st) t.push(m); return t; })(),
    markers: [{ x: b.months, y: 0, label: 'Debt-free' }] });
});
if (PT.isDemo) PT.$('[data-next]').click(), PT.$('[data-next]').click();
})();
