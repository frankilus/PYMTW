/* Before you sign: deal math, red flags, offer-text extraction. Pure functions (tests/deal.test.js). */
(function (root) {
'use strict';
var S = {
  apr: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loans-interest-rate-and-its-apr-en-733/',
  addons: 'https://www.consumerfinance.gov/ask-cfpb/am-i-required-to-purchase-an-extended-warranty-or-guaranteed-asset-protection-gap-insurance-from-a-lender-or-dealer-to-get-an-auto-loan-en-807/',
  negotiate: 'https://www.consumerfinance.gov/ask-cfpb/what-things-can-i-negotiate-when-shopping-for-a-car-or-auto-loan-en-2132/',
  ftcCar: 'https://consumer.ftc.gov/financing-or-leasing-car',
  deferred: 'https://www.consumerfinance.gov/ask-cfpb/i-got-a-credit-card-promising-no-interest-for-a-purchase-if-i-pay-in-full-within-12-months-how-does-this-work-en-40/',
  btFee: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balance-transfer-fee-can-a-balance-transfer-fee-be-charged-on-a-zero-percent-interest-rate-offer-en-53/',
  consolidate: 'https://www.consumerfinance.gov/ask-cfpb/what-do-i-need-to-know-if-im-thinking-about-consolidating-my-credit-card-debt-en-1861/',
  bnpl: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-buy-now-pay-later-bnpl-loan-en-2119/',
  bnplBlog: 'https://www.consumerfinance.gov/archive/blog/should-you-buy-now-and-pay-later/',
  bnplFees: 'https://www.consumerfinance.gov/ask-cfpb/do-buy-now-pay-later-bnpl-loans-have-fees-en-2118/',
  bnplReport: 'https://files.consumerfinance.gov/f/documents/cfpb_buy-now-pay-later-market-trends-consumer-impacts_report_2022-09.pdf',
  prepay: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/'
};
function pmt(P, apr, n) { var r = apr / 12; if (n <= 0) return 0; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; }
/* APR that makes `payment` for n months repay `net` (bisection). */
function solveAPR(net, payment, n) {
  if (net <= 0 || payment <= 0 || n <= 0) return NaN;
  if (payment * n <= net + 1e-9) return 0;
  var lo = 0, hi = 2;
  for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (pmt(net, mid, n) > payment) hi = mid; else lo = mid; }
  return (lo + hi) / 2;
}
var flag = function (level, title, why, src) { return { level: level, title: title, why: why, src: src || null }; };

function analyze(type, v) {
  var r = { type: type, flags: [], questions: QUESTIONS[type] || [] }, F = r.flags;
  if (type === 'car' || type === 'personal') {
    var addons = type === 'car' ? (v.addons || 0) : 0, feesFin = v.feesFinanced || 0, negEq = type === 'car' ? (v.negEquity || 0) : 0;
    var base = type === 'car' ? Math.max(0, (v.price || 0) - (v.down || 0)) : (v.amount || 0);
    var origin = type === 'personal' ? (v.originPct || 0) * base + (v.originFlat || 0) : 0;
    var financed = base + addons + feesFin + negEq; // amount you repay with interest
    var n = v.term || 0, payment = pmt(financed, v.apr || 0, n);
    if (v.quotedPayment > 0) payment = v.quotedPayment;
    var totalPaid = payment * n, interest = totalPaid - financed;
    // Cash you actually get to use (car: the car itself, minus add-ons/fees/negative equity; personal: proceeds minus fee)
    var netUse = type === 'car' ? base : base - origin;
    var effAPR = solveAPR(netUse, payment, n);
    r.payment = payment; r.n = n; r.financed = financed; r.interest = Math.max(0, interest); r.extras = addons + feesFin + negEq + origin;
    r.totalCost = totalPaid + (type === 'car' ? (v.down || 0) : 0) + (type === 'personal' && v.originAdded ? 0 : 0);
    r.costOfCredit = totalPaid - netUse; r.statedAPR = v.apr || 0; r.effAPR = effAPR;
    if (v.quotedPayment > 0) { r.impliedAPR = solveAPR(financed, v.quotedPayment, n); if (r.impliedAPR - (v.apr || 0) > 0.0025) F.push(flag('red', 'The quoted payment doesn’t match the stated APR', 'At the stated rate, this loan would cost about ' + money(pmt(financed, v.apr || 0, n)) + ' a month. The quoted payment implies a rate of about ' + pct(r.impliedAPR) + '. Ask what’s been added.', S.apr)); }
    if (effAPR - (v.apr || 0) > 0.0025 && r.extras > 0) F.push(flag('amber', 'Your true cost of borrowing is higher than the advertised rate', 'Counting the fees' + (addons ? ' and add-ons' : '') + ' you’re financing, you pay the equivalent of about ' + pct(effAPR) + ' a year for the money you actually use, compared with the ' + pct(v.apr || 0) + ' stated. The CFPB explains that APR includes the interest rate plus certain lender fees.', S.apr));
    if (type === 'car' && n > 60) F.push(flag(n > 72 ? 'red' : 'amber', 'Long loan term (' + n + ' months)', 'The FTC warns that longer loans lower the monthly payment but cost more overall, and you could end up owing more than the car is worth.', S.ftcCar));
    if (addons > 0) F.push(flag('amber', 'Add-ons are being financed (' + money(addons) + ')', 'The CFPB says extended warranties, GAP and credit insurance are generally optional and negotiable, and financing them means paying interest on them too.', S.addons));
    if (negEq > 0) F.push(flag('red', 'Negative equity rolled into the loan (' + money(negEq) + ')', 'You’d be borrowing to pay off your old car as well as buying the new one. The FTC notes this can raise the amount you borrow, the loan length, or the payment.', S.ftcCar));
    if (v.prepay) F.push(flag('amber', 'Prepayment penalty', 'You could pay a fee for paying the loan off early. Ask exactly how it’s calculated and whether a loan without one is available.', S.prepay));
    if (type === 'personal' && origin > 0) F.push(flag('amber', 'Origination fee of ' + money(origin), 'If the fee comes out of your loan, you receive less than you borrow but repay the full amount, so your true cost is higher than the interest rate.', S.apr));
    r.headlineBig = money(r.costOfCredit); r.headlineLabel = 'Cost of borrowing';
  } else if (type === 'card') {
    var bal = v.balance || 0, fee = bal * (v.btFeePct || 0), b = bal + fee, pay = v.payment || 0, months = 0, interest2 = 0, promo = v.promoMonths || 0;
    var hist = [], balAtPromoEnd = null, deferredCharge = 0, accrued = 0;
    while (b > 0.005 && months < 600) {
      var rate = months < promo ? (v.promoApr || 0) : (v.goApr || 0);
      if (v.deferred && months < promo) accrued += b * (v.goApr || 0) / 12; // tracks interest that is deferred
      var it = b * rate / 12; b += it; interest2 += it; b -= Math.min(pay, b); months++;
      if (months === promo) { balAtPromoEnd = b; if (v.deferred && b > 0.005) { deferredCharge = accrued; b += accrued; interest2 += accrued; } }
      hist.push(b);
      if (pay <= 0 || (months > promo + 1 && hist[months - 1] >= hist[months - 2] - 0.001)) { months = Infinity; break; }
    }
    r.fee = fee; r.interest = interest2; r.months = months; r.balAtPromoEnd = balAtPromoEnd === null ? 0 : balAtPromoEnd; r.deferredCharge = deferredCharge;
    r.totalCost = isFinite(months) ? fee + interest2 : Infinity; r.payment = pay; r.needed = promo ? b0need(bal + fee, v.promoApr || 0, promo) : null;
    if (fee > 0) F.push(flag('amber', 'Balance transfer fee: ' + money(fee), 'The CFPB notes card companies can charge a transfer fee even on a 0% offer, so the transfer isn’t free.', S.btFee));
    if (promo && (v.goApr || 0) > (v.promoApr || 0)) F.push(flag(r.balAtPromoEnd > 0.005 ? 'red' : 'green', 'Rate jumps to ' + pct(v.goApr || 0) + ' after ' + promo + ' months', r.balAtPromoEnd > 0.005 ? 'At your planned payment, about ' + money(r.balAtPromoEnd) + ' will still be owed when the promo ends. To clear it in time, pay about ' + money(r.needed) + ' a month.' : 'At your planned payment, you clear the balance before the promo ends. Nice.', S.consolidate));
    if (v.deferred) F.push(flag('red', 'Deferred interest (“no interest if paid in full”)', 'If any balance is left when the promo ends, or you’re more than 60 days late, interest can be charged back to the original purchase date. ' + (deferredCharge > 0 ? 'At your planned payment, that would add about ' + money(deferredCharge) + '.' : ''), S.deferred));
    F.push(flag('amber', 'New purchases on the same card', 'The CFPB notes that if you make new purchases on the card you used for the transfer, you may not get a grace period on them. A late payment of more than 60 days can also raise your rate on all balances.', S.consolidate));
    r.headlineBig = isFinite(r.totalCost) ? money(r.totalCost) : 'Never paid off'; r.headlineLabel = 'Fees + interest';
  } else if (type === 'carlease') {
    var m = v.months || 0, years = m / 12, over = Math.max(0, (v.milesExpected || 0) - (v.milesAllowed || 0)) * years, overCost = over * (v.perMile || 0);
    r.totalCost = (v.dueAtSigning || 0) + (v.monthly || 0) * m + (v.dispositionFee || 0) + overCost; r.perMonth = m ? r.totalCost / m : 0; r.overMiles = over; r.overCost = overCost;
    if (overCost > 0) F.push(flag('red', 'You’ll likely go over the mileage limit', 'At your expected driving, that’s about ' + Math.round(over).toLocaleString() + ' extra miles, or about ' + money(overCost) + ' at turn-in. The FTC notes most standard leases allow 15,000 miles a year or less.', S.ftcCar));
    F.push(flag('amber', 'Ending early can be expensive', 'The FTC warns you may owe a substantial early termination charge, and that you’re responsible for excess wear and missing equipment.', S.ftcCar));
    if ((v.dueAtSigning || 0) > (v.monthly || 0) * 3) F.push(flag('amber', 'Large amount due at signing', 'Ask how much of the upfront amount is fees versus a payment toward the lease, and what happens to it if the car is totaled or stolen early.', null));
    r.headlineBig = money(r.totalCost); r.headlineLabel = 'Total lease cost';
  } else if (type === 'aptlease') {
    var mo = v.months || 0, extraMonthly = v.monthlyFees || 0;
    r.totalCost = ((v.rent || 0) + extraMonthly) * mo + (v.oneTimeFees || 0); r.perMonth = mo ? r.totalCost / mo : 0; r.feeShare = r.totalCost ? (extraMonthly * mo + (v.oneTimeFees || 0)) / r.totalCost : 0; r.deposit = v.deposit || 0;
    if (extraMonthly > 0) F.push(flag('amber', 'Monthly fees on top of rent (' + money(extraMonthly) + ')', 'Fees like amenity, trash or tech charges raise your real rent to ' + money((v.rent || 0) + extraMonthly) + ' a month. Ask which are optional.', null));
    if ((v.oneTimeFees || 0) > 0) F.push(flag('amber', 'Non-refundable fees (' + money(v.oneTimeFees) + ')', 'Ask for each fee to be itemized in writing, and whether it’s refundable if your application is denied.', null));
    if (v.autoRenew) F.push(flag('amber', 'Automatic renewal', 'Check how much notice you must give to leave, and whether the rent can change at renewal.', null));
    if (v.breakFee) F.push(flag('amber', 'Early termination fee', 'Know the cost of breaking the lease before you sign, in case you need to move.', null));
    r.headlineBig = money(r.totalCost); r.headlineLabel = 'Total cost of the lease';
  } else if (type === 'bnpl') {
    var parts = v.payments || 4, fee3 = (v.price || 0) * (v.feePct || 0);
    r.totalCost = (v.price || 0) + fee3; r.perPayment = parts ? r.totalCost / parts : 0; r.extra = fee3; r.weeks = (parts - 1) * (v.everyWeeks || 2);
    r.effAPR = fee3 > 0 && r.weeks > 0 ? solveAPRSchedule(v.price, r.perPayment, parts, v.everyWeeks || 2) : 0;
    if (fee3 > 0) F.push(flag('red', 'This plan isn’t interest-free', 'Fees of ' + money(fee3) + ' on a ' + (r.weeks) + '-week plan work out to an annual rate of about ' + pct(r.effAPR) + '.', S.bnplFees));
    F.push(flag('amber', 'Late fees and autopay', 'The CFPB says most BNPL loans charge late fees, and autopay from a bank account can trigger overdraft fees if the money isn’t there.', S.bnplFees));
    if ((v.otherPlans || 0) > 0) F.push(flag((v.otherPlans || 0) >= 2 ? 'red' : 'amber', 'You already have ' + v.otherPlans + ' other BNPL plan' + (v.otherPlans > 1 ? 's' : ''), 'The CFPB has flagged “loan stacking” (several BNPL loans at once) as a risk of overextension. Add up all your due dates first.', S.bnplReport));
    F.push(flag('amber', 'Returns and disputes', 'Check the lender’s terms and the store’s return policy. The CFPB has noted BNPL may not offer the same dispute protections as a credit card.', S.bnplBlog));
    r.headlineBig = money(r.perPayment); r.headlineLabel = parts + ' payments of';
  }
  var order = { red: 0, amber: 1, green: 2 }; F.sort(function (a, b) { return order[a.level] - order[b.level]; });
  r.redCount = F.filter(function (f) { return f.level === 'red'; }).length; r.flagCount = F.filter(function (f) { return f.level !== 'green'; }).length;
  return r;
}
function b0need(P, apr, n) { return pmt(P, apr, n); }
function solveAPRSchedule(price, each, parts, everyWeeks) { // first payment at checkout, then every k weeks
  var f = function (a) { var pv = 0, per = Math.pow(1 + a, everyWeeks / 52) - 1; for (var i = 0; i < parts; i++) pv += each / Math.pow(1 + per, i); return pv; };
  var lo = 0, hi = 50; for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (f(mid) > price) lo = mid; else hi = mid; } return (lo + hi) / 2;
}
var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
var pct = function (x) { return (Math.round(x * 1000) / 10).toFixed(1).replace(/\.0$/, '') + '%'; };

var QUESTIONS = {
  car: ['What is the out-the-door price, in writing, including taxes and fees?', 'Is this APR the best you can offer? I have a pre-approval to compare.', 'Which add-ons are in this contract, what does each cost, and can I remove them?', 'Is the financing final, or could I be called back to sign new terms?', 'Is there a prepayment penalty?'],
  personal: ['Is the origination fee taken out of my loan, or added to it?', 'What is the APR, including all fees?', 'Is the rate fixed or variable?', 'Can I pay extra or pay it off early without a penalty?', 'What happens if I pay late: fees, rate changes, credit reporting?'],
  card: ['What is the balance transfer fee, and the minimum fee?', 'Exactly when does the promo rate end, and what is the rate after?', 'Is this 0% interest, or deferred interest if not paid in full?', 'How are payments above the minimum applied across balances?', 'Will new purchases on this card get a grace period?'],
  carlease: ['What is the capitalized cost, money factor, and residual value?', 'How many miles a year are included, and what is the charge per extra mile?', 'What is the early termination charge?', 'What counts as excess wear, and what does turn-in cost?', 'Is GAP coverage included?'],
  aptlease: ['Can I see every fee, itemized and in writing? Which are optional?', 'Which fees are refundable if my application is denied?', 'How much notice do I need to give to move out, and does it auto-renew?', 'What does it cost to break the lease early?', 'What are the conditions for getting my deposit back?'],
  bnpl: ['What is the total I will pay, including any fees?', 'What is the late fee, and when is it charged?', 'Can I pay with a credit card instead of a bank account?', 'How do returns and disputes work with this lender?', 'Will this plan be reported to the credit bureaus?']
};

/* Offer-text extraction (user confirms every value) */
function extract(text) {
  var t = String(text || '').replace(/\s+/g, ' '), out = {};
  var num = function (s) { return parseFloat(String(s).replace(/,/g, '')); };
  var m;
  var aprs = [], re = /(\d{1,2}(?:\.\d{1,3})?)\s*%\s*(?:intro(?:ductory)?\s+|promo(?:tional)?\s+|fixed\s+|variable\s+)?(?:APR|annual percentage rate)|APR\s*(?:of|is|:)?\s*(\d{1,2}(?:\.\d{1,3})?)\s*%/gi;
  while ((m = re.exec(t))) aprs.push(num(m[1] || m[2]));
  if (aprs.length) { out.apr = Math.max.apply(null, aprs); if (aprs.length > 1 && Math.min.apply(null, aprs) < out.apr) out.promoApr = Math.min.apply(null, aprs); }
  var terms = (t.match(/\d{1,3}[\s-]*(?:months?|mos?\b)/gi) || []).map(function (x) { return num(x); }).filter(function (n) { return n >= 3 && n <= 120; });
  if (terms.length) out.term = Math.max.apply(null, terms);
  if ((m = t.match(/(\d(?:\.\d{1,2})?)\s*%\s*(?:balance\s+transfer|transfer|origination)\s*fee/i)) || (m = t.match(/(?:balance\s+transfer|transfer|origination)\s*fee\s*(?:of|is|:)?\s*(\d(?:\.\d{1,2})?)\s*%/i))) out.feePct = num(m[1]);
  if ((m = t.match(/(?:amount financed|loan amount|borrow|balance(?: transfer)?(?: amount)?|purchase(?: price)?|price)\s*(?:of|is|:)?\s*\$\s?([\d,]+(?:\.\d{2})?)/i)) || (m = t.match(/\$\s?([\d,]{4,}(?:\.\d{2})?)/))) out.amount = num(m[1]);
  if ((m = t.match(/(?:fee[s]?|charge)\s*(?:of|:)?\s*\$\s?([\d,]+(?:\.\d{2})?)/i))) out.feeFlat = num(m[1]);
  if ((m = t.match(/(?:until|through|thru|ends?|expires?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i))) out.promoEnd = m[1];
  if ((m = t.match(/(\d{1,2})\s*months?\s+(?:of\s+)?(?:0|0\.0)\s*%/i)) || (m = t.match(/0\s*%[^.]{0,40}?(?:for|first)\s+(\d{1,2})\s*months?/i))) out.promoMonths = num(m[1]);
  if (/if paid in full|deferred interest/i.test(t)) out.deferred = true;
  if (/prepayment penalty/i.test(t) && !/no prepayment penalty/i.test(t)) out.prepay = true;
  return out;
}
var api = { analyze: analyze, extract: extract, pmt: pmt, solveAPR: solveAPR, solveAPRSchedule: solveAPRSchedule, SOURCES: S, QUESTIONS: QUESTIONS };
root.PT_DEAL = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
