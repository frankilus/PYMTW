(function () {
var form = PT.$('#wiz'), loaded = false;
function load(text, label) {
  var r = PT.toTransactions(PT.parseCSV(text));
  if (r.error) { PT.$('#fname').textContent = r.error; return; }
  var tx = r.tx.filter(function (t) { return t.amount > 0 && !/payment|transfer|autopay|payroll|deposit|atm|zelle|venmo/i.test(t.desc); });
  var months = Math.max(1, (Math.max.apply(null, tx.map(function (t) { return t.date; })) - Math.min.apply(null, tx.map(function (t) { return t.date; }))) / 864e5 / 30.4);
  var by = {}; PT.CATS.forEach(function (c) { by[c.id] = 0; });
  tx.forEach(function (t) { by[PT.categorize(t.desc, t.category)] += t.amount; });
  var vals = {}; Object.keys(by).forEach(function (k) { vals[k] = Math.round(by[k] / months); });
  PT.fill(form, vals); loaded = true;
  PT.$('#fname').textContent = '✓ ' + label + ': ' + tx.length + ' purchases over ' + Math.round(months) + ' months, sorted into categories';
}
PT.dropZone(PT.$('#drop'), function (t, n) { load(t, n); });
PT.$('#sample').onclick = function () { load(window.PT_SAMPLE_CSV, 'Sample statement (fictional)'); };
PT.wizard(form, function (v) {
  var spend = {}; PT.CATS.forEach(function (c) { spend[c.id] = (v[c.id] || 0) * 12; });
  var total = Object.keys(spend).reduce(function (a, k) { return a + spend[k]; }, 0);
  var ranked = PT.ARCHETYPES.map(function (c) { return { c: c, s: PT.scoreCard(c, spend) }; }).sort(function (a, b) { return b.s.net - a.s.net; });
  var best = ranked[0], flat = ranked.filter(function (r) { return r.c.id === 'flat2'; })[0];
  var payFull = v.payFull === 'yes';
  PT.renderResult(PT.$('#out'), {
    label: payFull ? 'Best card type for you' : 'Before rewards', big: payFull ? best.c.name : 'Pay it off first',
    sentence: payFull ? 'On ' + PT.money(total) + ' of yearly spending, a <b>' + best.c.name.toLowerCase() + '</b> card would earn about <b>' + PT.money(best.s.net) + ' a year</b> after fees' + (best.c.id !== 'flat2' ? ', ' + PT.money(best.s.net - flat.s.net) + ' more than a simple flat 2% card.' : '. That’s the simplest card to beat.')
      : 'If you carry a balance, interest at a typical 20%+ APR usually costs more than any card earns in rewards. The best card for you right now is the one with the lowest rate.',
    chart: true,
    extra: '<div class="card"><h3>Your spending, by category (per year)</h3><div id="bars"></div></div><div class="card"><h3>How each card type would do</h3><table class="tbl"><thead><tr><th>Card type</th><th class="n">Fee</th><th class="n">Net / yr</th></tr></thead><tbody>' +
      ranked.map(function (r) { return '<tr><td><b>' + r.c.name + '</b><br><small style="color:var(--ink-3)">' + r.c.blurb + '</small></td><td class="n">' + PT.money(r.c.fee) + '</td><td class="n">' + PT.money(r.s.net) + '</td></tr>'; }).join('') +
      '</tbody></table><p class="hint" style="margin-top:12px">These are generic card types, not specific products. Real cards have caps, sign-up bonuses, point values and approval rules that vary. Compare the current terms on the issuer’s site.</p></div>',
    next: payFull ? 'Look for a card with this reward structure and no foreign transaction fees if you travel. Check the rewards cap and annual fee before you apply.' : 'Use the debt payoff planner to clear your balance. Then come back and pick a rewards card.',
    nextLink: payFull ? null : ['Debt payoff planner', '../debt-payoff-planner/']
  });
  PT.barChart(PT.$('#chart'), { title: 'Net rewards per year, after annual fee', items: ranked.map(function (r, i) { return { label: r.c.name, value: r.s.net, color: i ? '#c3c3ca' : '#0a7c55' }; }) });
  PT.barChart(PT.$('#bars'), { items: PT.CATS.map(function (c) { return { label: c.name, value: spend[c.id] }; }).filter(function (x) { return x.value > 0; }).sort(function (a, b) { return b.value - a.value; }) });
});
if (PT.isDemo) { PT.$('#sample').click(); for (var i = 0; i < 3; i++) PT.$('[data-next]').click(); }
})();
