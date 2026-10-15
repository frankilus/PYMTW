(function () {
var D = window.PT_DEAL, form = PT.$('#wiz'), auto = {};
var F = { // name, label, kind ($,%,n,chk), default, unit
  car: [['price', 'Vehicle price (out the door)', '$', 32000], ['down', 'Down payment + trade-in', '$', 3000], ['apr', 'Stated APR', '%', 6.9], ['term', 'Loan term', 'n', 84, 'months'], ['addons', 'Add-ons financed (GAP, warranty, etc.)', '$', 2400], ['feesFinanced', 'Dealer fees financed', '$', 800], ['negEquity', 'Old loan rolled in (negative equity)', '$', 0], ['quotedPayment', 'Monthly payment you were quoted (optional)', '$', 0], ['prepay', 'There’s a prepayment penalty', 'chk', false]],
  personal: [['amount', 'Loan amount', '$', 10000], ['apr', 'Interest rate or stated APR', '%', 11.9], ['term', 'Loan term', 'n', 36, 'months'], ['originPct', 'Origination fee (taken from the loan)', '%', 5], ['prepay', 'There’s a prepayment penalty', 'chk', false]],
  card: [['balance', 'Balance to transfer or purchase amount', '$', 6000], ['btFeePct', 'Transfer fee', '%', 3], ['promoApr', 'Promo APR', '%', 0], ['promoMonths', 'Promo length', 'n', 15, 'months'], ['goApr', 'APR after the promo', '%', 24.99], ['payment', 'What you plan to pay each month', '$', 300], ['deferred', 'It says “no interest if paid in full” (deferred interest)', 'chk', false]],
  carlease: [['monthly', 'Monthly payment', '$', 389], ['months', 'Lease length', 'n', 36, 'months'], ['dueAtSigning', 'Due at signing', '$', 3999], ['dispositionFee', 'Turn-in (disposition) fee', '$', 395], ['milesAllowed', 'Miles allowed per year', 'n', 10000, 'miles'], ['milesExpected', 'Miles you expect to drive per year', 'n', 14000, 'miles'], ['perMile', 'Charge per extra mile', '$', 0.25]],
  aptlease: [['rent', 'Monthly rent', '$', 2100], ['monthlyFees', 'Monthly fees (amenity, trash, parking, tech)', '$', 85], ['months', 'Lease length', 'n', 12, 'months'], ['oneTimeFees', 'Non-refundable fees (application, admin)', '$', 450], ['deposit', 'Refundable security deposit', '$', 2100], ['autoRenew', 'It renews automatically', 'chk', true], ['breakFee', 'There’s an early termination fee', 'chk', true]],
  bnpl: [['price', 'Purchase amount', '$', 600], ['payments', 'Number of payments', 'n', 4, 'payments'], ['everyWeeks', 'Weeks between payments', 'n', 2, 'weeks'], ['feePct', 'Fees or interest, as % of purchase', '%', 0], ['otherPlans', 'Other BNPL plans you’re paying now', 'n', 1, 'plans']]
};
var MAP = { car: { amount: 'price', apr: 'apr', term: 'term', prepay: 'prepay' }, personal: { amount: 'amount', apr: 'apr', term: 'term', feePct: 'originPct', prepay: 'prepay' }, card: { amount: 'balance', feePct: 'btFeePct', promoMonths: 'promoMonths', apr: 'goApr', promoApr: 'promoApr', deferred: 'deferred' }, carlease: { term: 'months' }, aptlease: { term: 'months' }, bnpl: { amount: 'price', feePct: 'feePct' } };
var NAMES = { car: 'car loan', personal: 'personal loan', card: 'card offer', carlease: 'car lease', aptlease: 'apartment lease', bnpl: 'pay-later plan' };
var type = function () { return (form.querySelector('[name=dtype]:checked') || {}).value || 'car'; };
function renderFields() {
  var t = type(), a = {}; Object.keys(auto).forEach(function (k) { if (MAP[t][k]) a[MAP[t][k]] = auto[k]; });
  PT.$('#tlegend').textContent = 'Confirm the key terms of your ' + NAMES[t];
  PT.$('#fields').innerHTML = '<div class="row2">' + F[t].filter(function (f) { return f[2] !== 'chk'; }).map(function (f) {
    var v = a[f[0]] != null ? a[f[0]] : f[3], tag = a[f[0]] != null ? '<span class="auto">from your text</span>' : '';
    return '<label class="field"><span>' + f[1] + tag + '</span><div class="inp">' + (f[2] === '$' ? '<b>$</b>' : '') + '<input name="' + f[0] + '" inputmode="decimal" value="' + v + '"' + (f[2] === '%' ? ' data-pct' : '') + '>' + (f[2] === '%' ? '<b>%</b>' : f[4] ? '<b>' + f[4] + '</b>' : '') + '</div></label>';
  }).join('') + '</div>' + F[t].filter(function (f) { return f[2] === 'chk'; }).map(function (f) { var on = a[f[0]] != null ? a[f[0]] : f[3]; return '<label class="chk"><input type="checkbox" name="' + f[0] + '"' + (on ? ' checked' : '') + '> ' + f[1] + (a[f[0]] != null ? '<span class="auto">from your text</span>' : '') + '</label>'; }).join('');
}
PT.$$('[name=dtype]').forEach(function (r) { r.addEventListener('change', renderFields); });
PT.$('#find').onclick = function () {
  auto = D.extract(PT.$('#paste').value);
  var keys = Object.keys(auto), lbl = { apr: 'APR', term: 'term', feePct: 'fee %', amount: 'amount', feeFlat: 'fee', promoEnd: 'promo end', promoMonths: 'promo length', promoApr: 'promo APR', deferred: 'deferred interest', prepay: 'prepayment penalty' };
  PT.$('#found').innerHTML = keys.length ? 'Found: ' + keys.map(function (k) { return '<b>' + lbl[k] + '</b> ' + (auto[k] === true ? '✓' : PT.esc(auto[k]) + (k === 'apr' || k === 'feePct' || k === 'promoApr' ? '%' : '')); }).join(' · ') + '. You’ll confirm these next.' : 'Nothing recognizable found. You can enter the terms on the next step.';
  renderFields();
};
form._v_terms = function () { var v = PT.values(form), t = type(); if (t === 'card' && !(v.payment > 0)) return 'Enter what you plan to pay each month.'; if ((t === 'car' || t === 'personal') && !(v.term > 0)) return 'Enter the loan term in months.'; };
renderFields();
var M = function (n) { return PT.money(n); }, P = function (x) { return PT.pct(x, 1); };
PT.wizard(form, function (v) {
  var t = type(), r = D.analyze(t, v), out = PT.$('#out'), stats, items, sentence, next;
  if (t === 'car' || t === 'personal') {
    stats = [['Monthly payment', M(r.payment)], ['Total interest', M(r.interest)], ['True rate with fees', isFinite(r.effAPR) ? P(r.effAPR) : '—']];
    items = [{ label: t === 'car' ? 'Car (after down payment)' : 'Money you receive', value: t === 'car' ? Math.max(0, v.price - v.down) : v.amount - r.extras, color: '#9fd8bf' }, { label: 'Interest', value: r.interest, color: '#0a7c55' }, { label: t === 'car' ? 'Add-ons, fees and rolled-in debt' : 'Origination fee', value: r.extras, color: '#d98a00' }];
    sentence = 'Over ' + r.n + ' months you’d pay <b>' + M(r.payment * r.n) + '</b> in total, which includes <b>' + M(r.costOfCredit) + '</b> on top of ' + (t === 'car' ? 'the car itself' : 'the money you actually receive') + '. Counting fees, that’s like paying ' + P(r.effAPR) + ' a year, compared with the ' + P(r.statedAPR) + ' stated.';
    next = r.flags.length ? 'Before you sign, ask the lender about “' + r.flags[0].title.replace(/ \(.*\)$/, '') + '”, and get a competing quote from a bank or credit union.' : 'Get one competing quote from a bank or credit union, then compare total cost, not just the monthly payment.';
  } else if (t === 'card') {
    stats = [['Transfer fee', M(r.fee)], ['Interest', M(r.interest)], ['Paid off in', isFinite(r.months) ? PT.duration(r.months) : 'never']];
    items = [{ label: 'Transfer fee', value: r.fee, color: '#d98a00' }, { label: 'Interest during and after the promo', value: r.interest - r.deferredCharge, color: '#0a7c55' }].concat(r.deferredCharge ? [{ label: 'Deferred interest charged back', value: r.deferredCharge, color: '#d23b3b' }] : []);
    sentence = isFinite(r.months) ? 'Paying ' + M(v.payment) + ' a month, this offer costs about <b>' + M(r.totalCost) + '</b> in fees and interest' + (r.balAtPromoEnd > 0.005 ? ', and <b>' + M(r.balAtPromoEnd) + '</b> is still owed when the promo ends.' : ', and you’re clear before the promo ends.') : 'At ' + M(v.payment) + ' a month, interest grows faster than you pay, so the balance never reaches zero.';
    next = r.balAtPromoEnd > 0.005 ? 'To clear it before the promo ends, set autopay to about ' + M(r.needed) + ' a month, or transfer less.' : 'Set autopay for your planned amount, and don’t use this card for new purchases.';
  } else if (t === 'carlease') {
    stats = [['Real cost per month', M(r.perMonth)], ['Extra-mile charges', M(r.overCost)], ['Due at signing', M(v.dueAtSigning)]];
    items = [{ label: 'Monthly payments', value: v.monthly * v.months, color: '#0a7c55' }, { label: 'Due at signing', value: v.dueAtSigning, color: '#9fd8bf' }, { label: 'Turn-in fee', value: v.dispositionFee, color: '#d98a00' }, { label: 'Estimated extra miles', value: r.overCost, color: '#d23b3b' }];
    sentence = 'Counting the upfront payment, fees and your likely mileage, this lease really costs about <b>' + M(r.perMonth) + ' a month</b>, not the ' + M(v.monthly) + ' advertised.';
    next = r.overCost > 0 ? 'Ask for a higher mileage allowance now. It’s usually cheaper than paying per mile at turn-in.' : 'Ask for the money factor and residual value in writing, and compare them with one other dealer.';
  } else if (t === 'aptlease') {
    stats = [['Real monthly cost', M(r.perMonth)], ['Fees share of total', PT.pct(r.feeShare, 0)], ['Deposit (refundable)', M(r.deposit)]];
    items = [{ label: 'Rent', value: v.rent * v.months, color: '#0a7c55' }, { label: 'Monthly fees', value: v.monthlyFees * v.months, color: '#d98a00' }, { label: 'One-time fees', value: v.oneTimeFees, color: '#d23b3b' }];
    sentence = 'Over ' + v.months + ' months this lease costs about <b>' + M(r.totalCost) + '</b>, or ' + M(r.perMonth) + ' a month once fees are included.';
    next = 'Ask for every fee to be itemized in writing, and get the move-out notice period and renewal terms before you sign.';
  } else {
    stats = [['Each payment', M(r.perPayment)], ['Extra cost', M(r.extra)], ['Last payment in', r.weeks + ' weeks']];
    items = [{ label: 'Purchase', value: v.price, color: '#0a7c55' }, { label: 'Fees or interest', value: r.extra, color: '#d23b3b' }];
    sentence = 'You’d pay <b>' + v.payments + ' payments of ' + M(r.perPayment) + '</b> over ' + r.weeks + ' weeks' + (r.extra ? ', including ' + M(r.extra) + ' in fees.' : ', with no extra cost if every payment is on time.') + (v.otherPlans ? ' With ' + v.otherPlans + ' other plan' + (v.otherPlans > 1 ? 's' : '') + ' running, check that all the due dates fit your paydays.' : '');
    next = 'Put every payment date in your calendar, and make sure the money will be in the account on each one.';
  }
  var flagsHtml = r.flags.map(function (f) { return '<div class="flag ' + f.level + '"><span class="d"></span><div><h4>' + f.title + '</h4><p>' + f.why + '</p>' + (f.src ? '<a href="' + f.src + '" target="_blank" rel="noopener">Source ↗</a>' : '') + '</div></div>'; }).join('');
  var srcs = r.flags.filter(function (f) { return f.src; }).map(function (f) { return f.src; }).filter(function (x, i, a) { return a.indexOf(x) === i; });
  PT.renderResult(out, {
    share: ['before-you-sign', { kind: NAMES[t], flags: r.flagCount }],
    label: r.headlineLabel, big: r.headlineBig, sentence: sentence, stats: stats, chart: true,
    extra: '<div class="card"><h3>' + (r.flagCount ? r.flagCount + ' thing' + (r.flagCount === 1 ? '' : 's') + ' to check' : 'Things to check') + '</h3>' + (flagsHtml || '<p class="hint">No common red flags in what you entered. Still read every page.</p>') + '</div>' +
      '<div class="card"><h3>Questions to ask before you sign</h3><ol class="qs">' + r.questions.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ol></div>' +
      (srcs.length ? '<p class="srcs">Consumer-protection sources: ' + srcs.map(function (s) { return '<a href="' + s + '" target="_blank" rel="noopener">' + (s.indexOf('ftc.gov') > -1 ? 'FTC' : 'CFPB') + '</a>'; }).join(' · ') + '</p>' : ''),
    next: next
  });
  PT.barChart(PT.$('#chart'), { title: 'Where your money goes', items: items.filter(function (x) { return x.value > 0.5; }) });
});
if (PT.isDemo) {
  PT.$('#paste').value = 'Finance offer: 84-month term at 6.9% APR. Amount financed includes Vehicle Service Contract and GAP. No prepayment penalty.';
  PT.$('[data-next]').click(); PT.$('#find').click(); PT.$('[data-next]').click(); PT.$('[data-next]').click();
}
})();
