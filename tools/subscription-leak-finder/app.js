(function () {
var form = PT.$('#wiz'), csv = null;
PT.dropZone(PT.$('#drop'), function (text, name) { csv = text; PT.$('#fname').textContent = '✓ ' + name + ' loaded on your device'; PT.$('.err').textContent = ''; });
PT.$('#sample').onclick = function () { csv = window.PT_SAMPLE_CSV; PT.$('#fname').textContent = '✓ Sample statement loaded (fictional data)'; };
form._v_csv = function () { if (!csv) return 'Choose a CSV file first, or try the sample.'; var r = PT.toTransactions(PT.parseCSV(csv)); if (r.error) return r.error; };
PT.wizard(form, function () {
  var t = PT.toTransactions(PT.parseCSV(csv)).tx, subs = PT.findRecurring(t);
  var monthly = subs.reduce(function (a, s) { return a + s.monthly; }, 0), annual = monthly * 12;
  var span = t.length ? (Math.max.apply(null, t.map(function (x) { return x.date; })) - Math.min.apply(null, t.map(function (x) { return x.date; }))) / 864e5 : 0;
  var ups = subs.filter(function (s) { return s.priceUp; });
  var out = PT.$('#out');
  if (!subs.length) { PT.renderResult(out, { share: ['subscription-leak-finder', {count: 0}], label: 'Recurring charges found', big: '0', sentence: 'We didn’t find charges that repeat on a regular schedule in ' + t.length + ' transactions. Try a longer export (3 months or more) or a card statement.', next: 'Most subscriptions are billed to credit cards. Try exporting your card’s statement too.' }); return; }
  var top = subs[0];
  PT.renderResult(out, { share: ['subscription-leak-finder', {count: subs.length}],
    label: 'Your recurring charges cost', big: PT.money(annual) + '<span style="font-size:.4em;color:var(--ink-3);letter-spacing:-.02em"> /year</span>',
    sentence: 'We found <b>' + subs.length + ' recurring charges</b> in ' + t.length + ' transactions over about ' + Math.round(span / 30.4) + ' months, totalling <b>' + PT.money(monthly) + ' a month</b>.' + (ups.length ? ' ' + ups.length + (ups.length === 1 ? ' went' : ' went') + ' up in price while you were subscribed.' : ''),
    stats: [['Per month', PT.money(monthly)], ['Per year', PT.money(annual)], ['Biggest', PT.esc(top.name)]],
    chart: true,
    extra: '<div class="card"><h3>Every recurring charge</h3><div class="scroll"><table class="tbl" id="subtbl"><thead><tr><th>Merchant</th><th>How often</th><th class="n">Charge</th><th class="n">Per year</th><th class="n">Keep?</th></tr></thead><tbody>' +
      subs.map(function (s, i) { return '<tr><td><b>' + PT.esc(s.name) + '</b>' + (s.priceUp ? ' <span class="pill" style="background:#fbeee5;color:#b4541a">↑ from ' + PT.money(s.from, 2) + '</span>' : '') + '<br><small style="color:var(--ink-3)">' + s.count + ' charges, last ' + s.last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</small></td><td>' + s.cadence + '</td><td class="n">' + PT.money(s.amount, 2) + '</td><td class="n">' + PT.money(s.annual) + '</td><td class="n"><input type="checkbox" checked data-i="' + i + '" aria-label="Keep ' + PT.esc(s.name) + '" style="width:20px;height:20px;accent-color:#0a7c55"></td></tr>'; }).join('') +
      '</tbody></table></div><p class="sentence" id="savings" style="font-size:18px"></p></div>' +
      '<div class="card"><h3>How to cancel, without the runaround</h3><ul class="checklist">' +
      '<li><b>App store subscriptions:</b> if you signed up in an iPhone or Android app, cancel in your phone’s Settings (Apple ID → Subscriptions) or the Google Play Store (Profile → Payments &amp; subscriptions).</li>' +
      '<li><b>Everything else:</b> sign in to the merchant’s website and look under Account, Billing, or Membership. Search “cancel” on their help page.</li>' +
      '<li><b>Gyms and memberships:</b> some need a written notice or an in-person visit. Ask for a cancellation confirmation number.</li>' +
      '<li><b>Ask for a cheaper plan first.</b> Many services offer an ad-supported or annual plan, or a retention discount.</li>' +
      '<li><b>Still being charged?</b> Your card issuer can help you dispute charges after you’ve cancelled. Some banks can also block a merchant.</li></ul></div>',
    next: 'Untick the charges you don’t need above, then cancel those this week. Put a reminder on your calendar 3 days before any yearly renewal.'
  });
  function upd() { var cut = PT.$$('#subtbl input').filter(function (c) { return !c.checked; }).reduce(function (a, c) { return a + subs[c.dataset.i].annual; }, 0); PT.$('#savings').innerHTML = cut ? 'Cancelling the unticked ones saves <b style="color:var(--accent)">' + PT.money(cut) + ' a year</b>.' : 'Untick anything you’d cancel to see your savings.'; }
  PT.$$('#subtbl input').forEach(function (c) { c.onchange = upd; }); upd();
  PT.barChart(PT.$('#chart'), { title: 'Yearly cost by charge', items: subs.slice(0, 10).map(function (s) { return { label: s.name, value: s.annual }; }), fmt: function (x) { return PT.money(x) + '/yr'; } });
});
if (PT.isDemo) { PT.$('#sample').click(); PT.$('[data-next]').click(); }
})();
