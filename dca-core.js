/* Pure calculation logic; no network, storage or analytics. */
(function (root) {
  'use strict';
  function ordinal(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a valid starting month.');
    var parts = month.split('-').map(Number);
    return parts[0] * 12 + parts[1] - 1;
  }
  function key(n) { return Math.floor(n / 12) + '-' + String(n % 12 + 1).padStart(2, '0'); }
  function calculate(prices, input) {
    var initial = Number(input.initial), monthly = Number(input.monthly), years = Number(input.years);
    if (String(input.initial).trim() === '' || String(input.monthly).trim() === '' ||
        !Number.isFinite(initial) || !Number.isFinite(monthly) || initial < 0 || monthly < 0) {
      throw new Error('Enter non-negative amounts for the initial and monthly contributions.');
    }
    if (initial === 0 && monthly === 0) throw new Error('Enter a contribution greater than zero.');
    if (!Number.isInteger(years) || years < 1 || years > 100) throw new Error('Choose a duration from 1 to 100 whole years.');
    var months = Object.keys(prices).sort();
    var start = ordinal(input.start), first = ordinal(months[0]), last = ordinal(months[months.length - 1]);
    if (start < first || start > last) throw new Error('Choose a start between ' + key(first) + ' and ' + key(last) + '.');
    var requestedEnd = start + years * 12, end = Math.min(requestedEnd, last);
    if (end === start) throw new Error('Choose an earlier start: at least two monthly prices are needed.');
    var invested = 0, btc = 0, points = [];
    for (var month = start; month <= end; month++) {
      var price = prices[key(month)];
      if (!Number.isFinite(price) || price <= 0) throw new Error('A valid price is missing for ' + key(month) + '. No result was calculated.');
      var contribution = month === start ? initial : monthly;
      invested += contribution;
      btc += contribution / price;
      points.push({ month: key(month), invested: invested, value: btc * price });
    }
    var value = points[points.length - 1].value;
    var lumpValue = invested / prices[key(start)] * prices[key(end)];
    var result = {
      invested: invested, btc: btc, value: value, roi: (value - invested) / invested * 100,
      averagePrice: invested / btc, vsLump: (value - lumpValue) / lumpValue * 100,
      start: key(start), end: key(end), requestedEnd: key(requestedEnd),
      truncated: end < requestedEnd, months: end - start, points: points
    };
    if (![result.invested, result.btc, result.value, result.roi, result.averagePrice, result.vsLump].every(Number.isFinite)) {
      throw new Error('These inputs exceed the calculator’s supported numeric range. Use smaller amounts.');
    }
    return result;
  }
  var api = { calculate: calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PYMTW_DCA = api;
})(typeof window !== 'undefined' ? window : globalThis);
