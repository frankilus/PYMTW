/* Bitcoin Retirement Drawdown Planner: pure year-by-year model (no DOM, unit-tested in tests/bitcoin-retirement-drawdown-core.cjs).
   Federal tax only, 2026 figures. Sources: IRS Rev. Proc. 2025-32 (brackets, standard deduction, 0%/15%/20% capital gains
   thresholds, additional standard deduction for age 65+); IRS Net Investment Income Tax page (3.8%, thresholds not indexed);
   IRS Publication 590-B Appendix B Table III (Uniform Lifetime); IRS RMD FAQs (age 73) and Treasury final regulations
   89 FR 58886 (age 75 if born 1960 or later). Everything runs in the browser; nothing is sent anywhere. */
(function (root) {
'use strict';
var DD = {};
var INF = Infinity;
/* 2026 ordinary income brackets: [upper bound of taxable income, rate]. Rev. Proc. 2025-32 §4.01, Tables 1-3. */
DD.BRACKETS = {
  mfj: [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [INF, 0.37]],
  hoh: [[17700, 0.10], [67450, 0.12], [105700, 0.22], [201750, 0.24], [256200, 0.32], [640600, 0.35], [INF, 0.37]],
  single: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [INF, 0.37]]
};
/* 2026 standard deduction, Rev. Proc. 2025-32 §4.14(1); additional amount for age 65+, §4.14(3). */
DD.STD = { mfj: 32200, hoh: 24150, single: 16100 };
DD.AGED = { mfj: 1650 * 2, hoh: 2050, single: 2050 }; // married: $1,650 each (assumes both spouses are 65+ together)
/* 2026 maximum zero-rate and 15%-rate amounts for long-term capital gains, Rev. Proc. 2025-32 §4.03. */
DD.LTCG = { mfj: [98900, 613700], hoh: [66200, 579600], single: [49450, 545500] };
/* Net Investment Income Tax: 3.8% above modified AGI thresholds that are fixed in the law (not indexed). IRS NIIT page. */
DD.NIIT_RATE = 0.038;
DD.NIIT = { mfj: 250000, hoh: 200000, single: 200000 };
/* Uniform Lifetime Table (Table III), IRS Publication 590-B Appendix B. Age 72..120+. */
DD.ULT = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0 };
DD.TAX_YEAR = 2026;
DD.divisor = function (age) { return age >= 120 ? 2.0 : DD.ULT[Math.floor(age)] || null; };
/* RMD applicable age by birth year: 73 if born 1951-1959, 75 if born 1960 or later (SECURE 2.0 §107; 89 FR 58886). */
DD.rmdAge = function (birthYear) { return birthYear >= 1960 ? 75 : 73; };

function fsKey(fs) { return fs === 'mfj' || fs === 'hoh' ? fs : 'single'; }
/* Ordinary income tax on taxable income x, with every bracket bound scaled by f (inflation indexing). */
DD.ordinaryTax = function (fs, x, f) {
  f = f || 1; var b = DD.BRACKETS[fsKey(fs)], tax = 0, lo = 0;
  for (var i = 0; i < b.length && x > lo; i++) { var hi = b[i][0] * f; tax += (Math.min(x, hi) - lo) * b[i][1]; lo = hi; }
  return tax;
};
DD.deduction = function (fs, age, f) { fs = fsKey(fs); return (DD.STD[fs] + (age >= 65 ? DD.AGED[fs] : 0)) * (f || 1); };
/* Federal tax for one year. ordinary: IRA/401(k) withdrawals + other income. gain: long-term gain from bitcoin sales.
   Gains stack on top of ordinary taxable income; NIIT applies to the lesser of the gain and MAGI above the threshold. */
DD.tax = function (fs, ordinary, gain, age, f) {
  fs = fsKey(fs); f = f || 1; ordinary = Math.max(0, ordinary); gain = Math.max(0, gain);
  var ded = DD.deduction(fs, age, f), ti = Math.max(0, ordinary + gain - ded), ltcgPart = Math.min(gain, ti), ordTaxable = ti - ltcgPart;
  var z = DD.LTCG[fs][0] * f, q = DD.LTCG[fs][1] * f;
  var at0 = Math.max(0, Math.min(ti, z) - ordTaxable), at15 = Math.max(0, Math.min(ti, q) - Math.max(ordTaxable, z)), at20 = Math.max(0, ti - Math.max(ordTaxable, q));
  var ord = DD.ordinaryTax(fs, ordTaxable, f), cg = at15 * 0.15 + at20 * 0.20;
  var niit = DD.NIIT_RATE * Math.min(gain, Math.max(0, ordinary + gain - DD.NIIT[fs]));
  return { ordinary: ord, ltcg: cg, niit: niit, total: ord + cg + niit, deduction: ded, taxableOrdinary: ordTaxable, gainAt0: at0 + (gain - ltcgPart), gainAt15: at15, gainAt20: at20,
    zeroRoom: Math.max(0, z - Math.max(ti, ordTaxable)) + Math.max(0, ded - ordinary - gain) };
};

/* Bitcoin price multipliers versus the base path, per scenario. k = index of the first retirement year, n = last index. */
DD.SCENARIOS = [
  { id: 'base', name: 'Base case', short: 'Base' },
  { id: 'bear', name: '75% crash at retirement', short: 'Crash' },
  { id: 'badFirst', name: 'Bad years first', short: 'Bad first' },
  { id: 'badLast', name: 'Bad years last', short: 'Bad last' },
  { id: 'flat', name: 'Low growth', short: 'Low growth' }
];
DD.BAD = [-0.40, -0.30, -0.10]; // the three bad years used for the sequence scenarios
/* Returns the bitcoin price for each year index 0..n under a scenario. */
DD.pricePath = function (o, id) {
  var n = o.planAge - o.age, k = Math.max(0, o.retireAge - o.age), g = o.btcGrowth, p = [], i;
  if (id === 'flat') { for (i = 0; i <= n; i++) p.push(o.btcPrice * Math.pow(1 + o.inflation, i)); return p; }
  for (i = 0; i <= n; i++) p.push(o.btcPrice * Math.pow(1 + g, i));
  if (id === 'bear') { for (i = k; i <= n; i++) { var j = i - k; p[i] *= j >= 4 ? 1 : 0.25 * Math.pow(4, j / 4); } return p; }
  if (id === 'badFirst' || id === 'badLast') {
    var m = n - k; if (m < 1) return p; // returns between retirement years k..n (m steps)
    var bad = DD.BAD.slice(0, Math.min(3, m)), badProd = bad.reduce(function (a, r) { return a * (1 + r); }, 1), good = m > bad.length ? Math.pow(Math.pow(1 + g, m) / badProd, 1 / (m - bad.length)) - 1 : null;
    var rets = []; for (i = 0; i < m; i++) rets.push(good);
    for (i = 0; i < bad.length; i++) { if (id === 'badFirst') rets[i] = bad[i]; else rets[m - bad.length + i] = bad[i]; }
    for (i = 0; i < m; i++) if (rets[i] === null) rets[i] = g;
    for (i = k + 1; i <= n; i++) p[i] = p[i - 1] * (1 + rets[i - k - 1]);
    return p;
  }
  return p;
};

/* Find the smallest x in [0, max] with fn(x) >= target (fn increasing). Returns max if never reached. */
function solve(fn, target, max) {
  if (max <= 0 || fn(0) >= target) return 0;
  if (fn(max) < target) return max;
  var lo = 0, hi = max;
  for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (fn(mid) >= target) hi = mid; else lo = mid; if (hi - lo < 0.005) break; }
  return hi;
}

/* Normalize inputs. Rates are decimals. spend and otherIncome are in today's dollars. */
DD.clean = function (v) {
  var n = function (x, d) { x = +x; return isFinite(x) ? x : d; };
  var o = {
    btc: Math.max(0, n(v.btc, 0)), btcPrice: Math.max(0, n(v.btcPrice, 0)), basis: Math.max(0, n(v.basis, 0)),
    ira: Math.max(0, n(v.ira, 0)), roth: Math.max(0, n(v.roth, 0)), spend: Math.max(0, n(v.spend, 0)),
    otherIncome: Math.max(0, n(v.otherIncome, 0)), otherAge: Math.round(n(v.otherAge, 0)),
    age: Math.round(n(v.age, 50)), retireAge: Math.round(n(v.retireAge, 60)), planAge: Math.round(n(v.planAge, 95)),
    filing: fsKey(v.filing), btcGrowth: n(v.btcGrowth, 0), iraReturn: n(v.iraReturn, 0), inflation: n(v.inflation, 0),
    order: v.order === 'ira' ? 'ira' : 'smart'
  };
  o.age = Math.min(Math.max(o.age, 18), 100); o.retireAge = Math.min(Math.max(o.retireAge, o.age), 100); o.planAge = Math.min(Math.max(o.planAge, o.retireAge + 1, o.age + 1), 110);
  o.btcGrowth = Math.min(Math.max(o.btcGrowth, -0.5), 1); o.iraReturn = Math.min(Math.max(o.iraReturn, -0.5), 0.5); o.inflation = Math.min(Math.max(o.inflation, 0), 0.2);
  o.birthYear = DD.TAX_YEAR - o.age; o.rmdStart = DD.rmdAge(o.birthYear);
  return o;
};

/* Year-by-year simulation of one scenario. spendOverride (today's $) is used by the safe-spend search. */
DD.simulate = function (o, id, spendOverride) {
  var spend0 = spendOverride == null ? o.spend : spendOverride, prices = DD.pricePath(o, id), n = o.planAge - o.age;
  var btc = o.btc, basis = o.basis, ira = o.ira, roth = o.roth, cash = 0, rows = [], depletedAge = null, totalTax = 0, zeroYears = 0, gainYears = 0;
  for (var t = 0; t <= n; t++) {
    var age = o.age + t, f = Math.pow(1 + o.inflation, t), price = prices[t], retired = age >= o.retireAge;
    var need = retired ? spend0 * f : 0, other = retired && age >= o.otherAge ? o.otherIncome * f : 0;
    var btcValue = btc * price, basisRatio = btcValue > 0 ? Math.min(basis / btcValue, 1e9) : 0;
    var rmd = 0, d = age >= o.rmdStart ? DD.divisor(age) : null; if (d && ira > 0) rmd = Math.min(ira, ira / d);
    var iraFree = 0; // tax-free IRA draw that just uses up the standard deduction ("smart" order only)
    if (retired && o.order === 'smart') iraFree = Math.max(0, Math.min(ira - rmd, DD.deduction(o.filing, age, f) - other - rmd));
    var baseIra = rmd + iraFree;
    var taxOf = function (iraDraw, sale) { return DD.tax(o.filing, iraDraw + other, sale * (1 - basisRatio), age, f); };
    var net = function (iraDraw, sale, rothDraw) { return other + iraDraw + sale + rothDraw + cash - taxOf(iraDraw, sale).total; };
    var sale = 0, iraExtra = 0, rothDraw = 0, iraLeft = ira - baseIra;
    if (need > 0) {
      if (o.order === 'smart') {
        sale = solve(function (x) { return net(baseIra, x, 0); }, need, btcValue);
        if (net(baseIra, sale, 0) < need - 0.01) iraExtra = solve(function (x) { return net(baseIra + x, sale, 0); }, need, iraLeft);
      } else {
        iraExtra = solve(function (x) { return net(baseIra + x, 0, 0); }, need, iraLeft);
        if (net(baseIra + iraExtra, 0, 0) < need - 0.01) sale = solve(function (x) { return net(baseIra + iraExtra, x, 0); }, need, btcValue);
      }
      var gap = need - net(baseIra + iraExtra, sale, 0);
      if (gap > 0.01) rothDraw = Math.min(roth, gap);
    }
    var iraDraw = baseIra + iraExtra, tx = taxOf(iraDraw, sale), got = net(iraDraw, sale, rothDraw), short = need - got;
    var sold = price > 0 ? sale / price : 0, gain = sale * (1 - basisRatio);
    if (sold > 0) { basis *= Math.max(0, 1 - sold / btc); btc = Math.max(0, btc - sold); if (btc < 1e-9) { btc = 0; basis = 0; } }
    ira = Math.max(0, ira - iraDraw); roth = Math.max(0, roth - rothDraw);
    cash = short < -0.01 ? -short : 0; // surplus (e.g. an RMD bigger than the need) is kept as cash for next year, earning nothing
    totalTax += tx.total;
    if (sale > 0 && gain > 0) { gainYears++; if (tx.gainAt15 + tx.gainAt20 < 0.5) zeroYears++; }
    var depleted = short > 1;
    var nextPrice = t < n ? prices[t + 1] : price * (1 + (id === 'flat' ? o.inflation : o.btcGrowth));
    ira *= 1 + o.iraReturn; roth *= 1 + o.iraReturn;
    rows.push({ t: t, year: DD.TAX_YEAR + t, age: age, retired: retired, price: price, need: need, other: other, rmd: rmd, iraDraw: iraDraw, sale: sale, sold: sold, gain: gain,
      rothDraw: rothDraw, tax: tx.total, ltcgTax: tx.ltcg + tx.niit, gainAt0: sale > 0 ? Math.min(gain, tx.gainAt0) : 0, zeroRoom: tx.zeroRoom, btcLeft: btc,
      endBtcValue: btc * nextPrice, endIra: ira, endRoth: roth, cash: cash, endTotal: btc * nextPrice + ira + roth + cash, f: f, shortfall: depleted ? short : 0 });
    if (depleted) { depletedAge = age; break; }
  }
  var last = rows[rows.length - 1];
  return { id: id, rows: rows, depletedAge: depletedAge, lasts: depletedAge === null, totalTax: totalTax, zeroYears: zeroYears, gainYears: gainYears,
    endTotal: depletedAge === null ? last.endTotal : 0, endReal: depletedAge === null ? last.endTotal / Math.pow(1 + o.inflation, last.t + 1) : 0 };
};

/* Highest inflation-adjusted yearly spend (today's $) that lasts through planAge in every stress scenario listed. */
DD.safeSpend = function (o, ids) {
  ids = ids || ['bear', 'badFirst'];
  var ok = function (s) { return ids.every(function (id) { return DD.simulate(o, id, s).lasts; }); };
  var years = Math.max(1, o.planAge - o.retireAge + 1), total = o.btc * o.btcPrice + o.ira + o.roth;
  var hi = Math.max(1000, (total / years + o.otherIncome) * 4);
  if (!ok(0)) return 0;
  while (ok(hi) && hi < 1e10) hi *= 2;
  var lo = 0;
  for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid; if (hi - lo < 10) break; }
  return Math.floor(lo / 10) * 10;
};

DD.run = function (v) {
  var o = DD.clean(v), res = {};
  DD.SCENARIOS.forEach(function (s) { res[s.id] = DD.simulate(o, s.id); });
  var safe = DD.safeSpend(o), safeRun = DD.simulate(o, 'bear', safe);
  return { input: o, scenarios: res, safe: safe, safeRun: safeRun };
};

root.DD = DD;
if (typeof module !== 'undefined' && module.exports) module.exports = DD;
})(typeof window !== 'undefined' ? window : this);
