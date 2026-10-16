/* True cost of a car: loan + 5-year ownership math. Pure functions, runs in the browser (and in Node for tests). */
(function (root) {
'use strict';
/* Monthly payment on a fixed-rate installment loan. P = amount financed, apr = decimal (0.0635), n = months. */
function pmt(P, apr, n) {
  if (!(P > 0) || !(n > 0)) return 0;
  var r = apr / 12;
  return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
}
/* Amortize month by month. Returns payment, total interest, and interest paid / balance left after `months`. */
function amortize(P, apr, n, months) {
  var pay = pmt(P, apr, n), bal = Math.max(0, P), r = apr / 12, intAll = 0, intUpTo = 0, balAt = bal;
  for (var m = 1; m <= n; m++) {
    var it = bal * r, prin = Math.min(bal, pay - it);
    bal = Math.max(0, bal - prin); intAll += it;
    if (m <= months) { intUpTo += it; balAt = bal; }
  }
  if (!(n > 0)) { balAt = bal; }
  return { payment: pay, totalInterest: intAll, interestUpTo: intUpTo, balanceAt: months >= n ? 0 : balAt };
}
/* Five-year (or `years`) cost of owning, AAA-style: depreciation + finance charges + fuel + insurance
   + maintenance + taxes/fees + anything else you add (parking, tolls). All inputs are plain numbers:
   price, down ($), apr (decimal), term (months), miles (per year), mpg, gas ($/gal), insurance ($/yr),
   maint ($ per mile), fees ($/yr), resale (share of price kept after `years`, 0-1), other ($/month), income ($/yr, optional). */
function tco(o) {
  var years = o.years || 5, months = years * 12;
  var price = Math.max(0, +o.price || 0), down = Math.min(price, Math.max(0, +o.down || 0));
  var loan = price - down, apr = Math.max(0, +o.apr || 0), term = Math.max(0, Math.round(+o.term || 0));
  var A = amortize(loan, apr, term, months);
  var B = amortize(loan, apr + 0.01, term, months); // same loan, APR one point higher
  var miles = Math.max(0, +o.miles || 0), mpg = +o.mpg || 0;
  var fuelYr = mpg > 0 ? miles / mpg * (+o.gas || 0) : 0;
  var value = price * Math.min(1, Math.max(0, +o.resale || 0));
  var parts = [
    { key: 'depreciation', label: 'Depreciation', amount: price - value },
    { key: 'insurance', label: 'Insurance', amount: (+o.insurance || 0) * years },
    { key: 'fuel', label: 'Fuel', amount: fuelYr * years },
    { key: 'maintenance', label: 'Maintenance, repair & tires', amount: (+o.maint || 0) * miles * years },
    { key: 'finance', label: 'Finance charges', amount: A.interestUpTo },
    { key: 'fees', label: 'Taxes, registration & fees', amount: (+o.fees || 0) * years },
    { key: 'other', label: 'Parking, tolls & other', amount: (+o.other || 0) * months }
  ];
  var total = parts.reduce(function (a, p) { return a + p.amount; }, 0);
  var running = (fuelYr + (+o.insurance || 0) + (+o.maint || 0) * miles) / 12 + (+o.other || 0);
  var monthlyCarCost = A.payment + running; // while the loan is being paid
  var income = +o.income || 0;
  var rule = {
    down20: price > 0 ? down / price >= 0.2 : false,
    term4: term <= 48,
    income10: income > 0 ? monthlyCarCost <= income / 12 * 0.10 : null,
    shareOfIncome: income > 0 ? monthlyCarCost / (income / 12) : null
  };
  return {
    loan: loan, payment: A.payment, totalInterest: A.totalInterest,
    interest5: A.interestUpTo, balance5: A.balanceAt, value5: value, equity5: value - A.balanceAt,
    totalInterestPlus1: B.totalInterest, extraInterestPlus1: B.totalInterest - A.totalInterest, paymentPlus1: B.payment,
    parts: parts, total: total, perYear: total / years, perMonth: total / months,
    perMile: miles > 0 ? total / (miles * years) : 0,
    monthlyCarCost: monthlyCarCost, rule: rule, years: years
  };
}
var api = { pmt: pmt, amortize: amortize, tco: tco };
root.PT_CAR = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
