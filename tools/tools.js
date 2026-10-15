/* PYMTW Tools - shared logic. Everything runs in your browser; nothing is sent anywhere. */
(function (root) {
'use strict';
var PT = {};

/* ---------- Formatting ---------- */
PT.money = function (n, dp) {
  if (!isFinite(n)) return '—';
  var neg = n < 0; n = Math.abs(n);
  var s = n.toLocaleString('en-US', { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 });
  return (neg ? '−$' : '$') + s;
};
PT.short = function (n) {
  var a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return s + '$' + Math.round(a);
};
PT.pct = function (n, dp) { return (n * 100).toFixed(dp == null ? 1 : dp).replace(/\.0$/, '') + '%'; };
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
PT.addMonths = function (d, m) { var x = new Date(d.getFullYear(), d.getMonth() + m, 1); return x; };
PT.monthName = function (d, long) { return (long ? ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] : MON[d.getMonth()]) + ' ' + d.getFullYear(); };
PT.duration = function (months) {
  if (!isFinite(months)) return 'never';
  var y = Math.floor(months / 12), m = Math.round(months - y * 12);
  if (m === 12) { y++; m = 0; }
  var p = [];
  if (y) p.push(y + (y === 1 ? ' year' : ' years'));
  if (m || !y) p.push(m + (m === 1 ? ' month' : ' months'));
  return p.join(', ');
};
PT.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

/* ---------- Calculators (pure functions, unit-tested) ---------- */
var C = PT.calc = {};

/* Debt payoff. debts: [{name, balance, apr (decimal), min}], extra: monthly $ on top of minimums.
   Freed-up minimums roll into the target debt. Returns months, interest, per-month total balance, payoff month per debt. */
C.debt = function (debts, extra, method) {
  var ds = debts.filter(function (d) { return d.balance > 0; }).map(function (d, i) {
    return { name: d.name || ('Debt ' + (i + 1)), bal: +d.balance, apr: +d.apr, min: +d.min, i: i, paidOff: null, interest: 0 };
  });
  var budget = ds.reduce(function (a, d) { return a + d.min; }, 0) + (+extra || 0);
  var month = 0, interest = 0, series = [ds.reduce(function (a, d) { return a + d.bal; }, 0)];
  var order = function () {
    var open = ds.filter(function (d) { return d.bal > 0.005; });
    open.sort(method === 'snowball'
      ? function (a, b) { return a.bal - b.bal || b.apr - a.apr; }
      : function (a, b) { return b.apr - a.apr || a.bal - b.bal; });
    return open;
  };
  while (ds.some(function (d) { return d.bal > 0.005; }) && month < 600) {
    month++;
    ds.forEach(function (d) { if (d.bal > 0.005) { var it = d.bal * d.apr / 12; d.bal += it; d.interest += it; interest += it; } });
    var left = budget;
    ds.forEach(function (d) { if (d.bal > 0.005) { var p = Math.min(d.min, d.bal); d.bal -= p; left -= p; } });
    order().forEach(function (d) { if (left > 0 && d.bal > 0.005) { var p = Math.min(left, d.bal); d.bal -= p; left -= p; } });
    ds.forEach(function (d) { if (d.bal <= 0.005 && d.paidOff === null) { d.bal = 0; d.paidOff = month; } });
    series.push(ds.reduce(function (a, d) { return a + Math.max(0, d.bal); }, 0));
    if (month > 1 && series[month] >= series[month - 1] - 0.01 && series[month] > 0.01) { return { months: Infinity, interest: Infinity, series: series, debts: ds, stuck: true, budget: budget }; }
  }
  if (month >= 600) return { months: Infinity, interest: Infinity, series: series, debts: ds, stuck: true, budget: budget };
  return { months: month, interest: interest, series: series, debts: ds, budget: budget };
};

/* Months to pay one loan: standard amortization check. */
C.amortPayment = function (P, apr, n) { var r = apr / 12; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; };

/* Cash runway simulation. inflows: {cash, severance, uiWeekly, uiWeeks, otherMonthly}, expenses monthly. */
C.runway = function (o) {
  var bal = (+o.cash || 0) + (+o.severance || 0), exp = +o.expenses || 0, ui = +o.uiWeekly || 0, uiWeeks = +o.uiWeeks || 0, other = +o.otherMonthly || 0;
  var pts = [[0, bal]], m = 0, runway = null, wpm = 52 / 12;
  while (m < 120) {
    var weeksThisMonth = Math.max(0, Math.min(wpm, uiWeeks - m * wpm));
    var inflow = ui * weeksThisMonth + other, net = inflow - exp;
    if (net >= 0 && weeksThisMonth === 0) { runway = Infinity; break; }
    if (bal + net < 0) { runway = m + (net < 0 ? bal / -net : 0); pts.push([runway, 0]); break; }
    bal += net; m++; pts.push([m, bal]);
  }
  if (runway === null) runway = Infinity;
  var uiTotal = ui * uiWeeks;
  return { months: runway, points: pts, uiTotal: uiTotal, start: (+o.cash || 0) + (+o.severance || 0), burn: exp - other };
};

/* Rent vs buy, year-by-year net worth comparison with opportunity cost. */
C.rentVsBuy = function (o) {
  var price = o.price, down = price * o.downPct, loan = price - down, r = o.rate / 12, n = o.termYears * 12;
  var pmt = C.amortPayment(loan, o.rate, n), closing = price * o.closingPct;
  var bal = loan, home = price, rent = o.rent, renterInv = down + closing, buyerInv = 0, inv = o.investReturn / 12;
  var years = [], breakeven = null, firstYear = null;
  for (var y = 1; y <= o.years; y++) {
    var yr = { tax: 0, maint: 0, ins: 0, pmi: 0, interest: 0, principal: 0, rent: 0 };
    for (var m = 0; m < 12; m++) {
      var it = bal * r, pr = Math.min(pmt - it, bal); if (bal <= 0) { it = 0; pr = 0; }
      bal -= pr; yr.interest += it; yr.principal += pr;
      var pmi = (bal / price > 0.8 && o.downPct < 0.2) ? loan * o.pmiPct / 12 : 0;
      var tax = home * o.taxPct / 12, maint = home * o.maintPct / 12, ins = o.insurance / 12;
      yr.tax += tax; yr.maint += maint; yr.ins += ins; yr.pmi += pmi; yr.rent += rent;
      var own = it + pr + tax + maint + ins + pmi;
      var rentCost = rent + (o.rentersIns || 0) / 12;
      renterInv *= 1 + inv; buyerInv *= 1 + inv;
      if (own > rentCost) renterInv += own - rentCost; else buyerInv += rentCost - own;
      home *= Math.pow(1 + o.appreciation, 1 / 12);
    }
    rent *= 1 + o.rentGrowth;
    var buyerNW = home * (1 - o.sellPct) - bal + buyerInv, renterNW = renterInv;
    yr.buyerNW = buyerNW; yr.renterNW = renterNW; yr.home = home; yr.bal = bal;
    yr.ownMonthly = (yr.interest + yr.principal + yr.tax + yr.maint + yr.ins + yr.pmi) / 12;
    if (y === 1) firstYear = yr;
    years.push(yr);
    if (breakeven === null && buyerNW >= renterNW) breakeven = y;
  }
  return { pmt: pmt, years: years, breakeven: breakeven, first: firstYear, down: down, closing: closing };
};

/* Emergency fund */
C.emergency = function (cash, essentials, targetMonths, monthlySave) {
  var covered = essentials > 0 ? cash / essentials : Infinity, target = essentials * targetMonths, gap = Math.max(0, target - cash);
  return { covered: covered, target: target, gap: gap, monthsToGoal: gap === 0 ? 0 : (monthlySave > 0 ? Math.ceil(gap / monthlySave) : Infinity) };
};

/* Roth vs traditional: same pre-tax dollars. Traditional's after-tax value = C(1+g)^n(1-tR). Roth = C(1-tN)(1+g)^n.
   If the person invests the same *after-tax* out-of-pocket, the traditional tax saving is invested in a taxable account (optional). */
C.roth = function (o) {
  var g = Math.pow(1 + o.ret, o.years), C0 = o.contrib;
  var roth = C0 * g;                          // contribute C0 to Roth (costs C0 of after-tax money)
  var tradGross = C0 / (1 - o.taxNow);        // same out-of-pocket: C0 after-tax buys C0/(1-t) pre-tax
  var trad = tradGross * g * (1 - o.taxLater);
  return { roth: roth, trad: trad, winner: roth >= trad ? 'roth' : 'trad', breakeven: o.taxNow, diff: Math.abs(roth - trad), tradGross: tradGross };
};

/* Fee drag */
C.fees = function (balance, monthly, ret, feeRate, years) {
  var a = balance, b = balance, pts = [[0, balance, balance]];
  for (var y = 1; y <= years; y++) {
    for (var m = 0; m < 12; m++) { a = a * (1 + ret / 12) + monthly; b = b * (1 + (ret - feeRate) / 12) + monthly; }
    pts.push([y, a, b]);
  }
  return { noFee: a, withFee: b, cost: a - b, points: pts };
};

/* DCA backtest on monthly averages. prices: {"YYYY-MM": price}. */
C.dca = function (prices, start, end, amount) {
  var keys = Object.keys(prices).sort().filter(function (k) { return k >= start && k <= end; });
  var units = 0, invested = 0, pts = [];
  keys.forEach(function (k) { units += amount / prices[k]; invested += amount; pts.push([k, invested, units * prices[k]]); });
  var last = prices[keys[keys.length - 1]], total = invested;
  var lumpUnits = keys.length ? total / prices[keys[0]] : 0;
  return { months: keys.length, invested: invested, units: units, value: units * last, avgCost: units ? invested / units : 0, lastPrice: last, lumpValue: lumpUnits * last, points: pts, keys: keys };
};

/* ---------- CSV ---------- */
PT.parseCSV = function (text) {
  text = text.replace(/^\uFEFF/, '');
  var delim = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : (text.indexOf('\t') > -1 && text.split('\n')[0].indexOf(',') < 0 ? '\t' : ',');
  var rows = [], row = [], f = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ''; }); });
};
PT.parseAmount = function (s) {
  if (s == null) return NaN; s = String(s).trim(); if (!s) return NaN;
  var neg = /^\(.*\)$/.test(s) || /^-/.test(s) || /-$/.test(s) || /\bDR\b/i.test(s);
  var n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? NaN : (neg ? -n : n);
};
PT.parseDate = function (s) {
  s = String(s || '').trim(); var m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return new Date(+m[1], m[2] - 1, +m[3]);
  if ((m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/))) { var y = +m[3]; if (y < 100) y += 2000; return new Date(y, m[1] - 1, +m[2]); }
  var d = new Date(s); return isNaN(d) ? null : d;
};
/* Turn CSV rows into transactions [{date, desc, amount}] where amount > 0 means money OUT. */
PT.toTransactions = function (rows) {
  if (!rows.length) return { tx: [], error: 'The file looks empty.' };
  var h = rows[0].map(function (x) { return x.toLowerCase().trim(); });
  var find = function (re) { for (var i = 0; i < h.length; i++) if (re.test(h[i])) return i; return -1; };
  var di = find(/date/), de = find(/desc|merchant|payee|name|memo|details|narrative/), ai = find(/^amount|amount$|^amt/), dr = find(/debit|withdraw|money out|^out/), cr = find(/credit|deposit|money in|^in$/);
  var cat = find(/category/);
  if (di < 0 || de < 0 || (ai < 0 && dr < 0)) return { tx: [], error: 'Couldn’t find Date, Description and Amount columns. Rename your headers to “Date, Description, Amount” and try again.' };
  var body = rows.slice(1), tx = [];
  // Decide sign convention: if most amounts are negative, negatives are spending.
  var negCount = 0, posCount = 0;
  if (ai >= 0) body.forEach(function (r) { var a = PT.parseAmount(r[ai]); if (a < 0) negCount++; else if (a > 0) posCount++; });
  var negIsOut = negCount >= posCount;
  body.forEach(function (r) {
    var d = PT.parseDate(r[di]); if (!d) return;
    var amt;
    if (ai >= 0) { var a = PT.parseAmount(r[ai]); if (isNaN(a)) return; amt = negIsOut ? -a : a; }
    else { var o = PT.parseAmount(r[dr]), i = cr >= 0 ? PT.parseAmount(r[cr]) : NaN; amt = (!isNaN(o) && o !== 0) ? Math.abs(o) : (!isNaN(i) ? -Math.abs(i) : NaN); if (isNaN(amt)) return; }
    tx.push({ date: d, desc: (r[de] || '').trim(), amount: amt, category: cat >= 0 ? (r[cat] || '') : '' });
  });
  return { tx: tx, error: tx.length ? null : 'No transactions with readable dates and amounts.' };
};

/* ---------- Recurring charge detection ---------- */
PT.merchantKey = function (desc) {
  var s = desc.toLowerCase()
    .replace(/^(pos|debit|card|purchase|recurring|ach|pre-?auth|checkcard|visa|dda)\s+(purchase\s+)?/g, '')
    .replace(/^(sq|tst|pp|paypal|sp|dd|py|apl|in)\s*\*\s*/g, '')
    .replace(/https?:\/\/|www\.|\.com|\.net|\.co\b/g, ' ')
    .replace(/[#*]\s*\w*\d\w*/g, ' ')
    .replace(/\b\d[\d\-\/]*\b/g, ' ')
    .replace(/\b(ca|ny|tx|fl|wa|il|us|usa|inc|llc|ltd|help|bill|billing|payment|pmt|purchase|online)\b/g, ' ')
    .replace(/[^a-z& ]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.split(' ').slice(0, 2).join(' ') || desc.toLowerCase().slice(0, 12);
};
var CADENCES = [{ name: 'Weekly', days: 7, tol: 2, perYear: 52 }, { name: 'Every 2 weeks', days: 14, tol: 3, perYear: 26 }, { name: 'Monthly', days: 30.4, tol: 5, perYear: 12 }, { name: 'Quarterly', days: 91, tol: 12, perYear: 4 }, { name: 'Yearly', days: 365, tol: 25, perYear: 1 }];
PT.findRecurring = function (tx) {
  var groups = {};
  tx.filter(function (t) { return t.amount > 0; }).forEach(function (t) {
    if (/transfer|payment thank|autopay|zelle|venmo|atm|withdrawal|deposit|credit card payment|online payment/i.test(t.desc)) return;
    var k = PT.merchantKey(t.desc); (groups[k] = groups[k] || []).push(t);
  });
  var out = [];
  Object.keys(groups).forEach(function (k) {
    var g = groups[k].sort(function (a, b) { return a.date - b.date; });
    if (g.length < 2) return;
    var amts = g.map(function (t) { return t.amount; }).sort(function (a, b) { return a - b; });
    var med = amts[Math.floor(amts.length / 2)];
    var similar = g.filter(function (t) { return Math.abs(t.amount - med) <= Math.max(1.5, med * 0.15); });
    if (similar.length < 2) return;
    var gaps = [];
    for (var i = 1; i < similar.length; i++) gaps.push((similar[i].date - similar[i - 1].date) / 864e5);
    gaps.sort(function (a, b) { return a - b; });
    var mg = gaps[Math.floor(gaps.length / 2)];
    var cad = CADENCES.filter(function (c) { return Math.abs(mg - c.days) <= c.tol; })[0];
    if (!cad) return;
    var ok = gaps.filter(function (x) { return Math.abs(x - cad.days) <= cad.tol * 2; }).length / gaps.length;
    if (ok < 0.6) return;
    if (cad.perYear >= 26 && similar.length < 3) return;
    var last = similar[similar.length - 1], typical = similar.reduce(function (a, t) { return a + t.amount; }, 0) / similar.length;
    var amountChanged = similar.length > 2 && Math.abs(last.amount - similar[0].amount) > 0.009;
    out.push({ key: k, name: prettyName(similar[similar.length - 1].desc, k), cadence: cad.name, perYear: cad.perYear, count: similar.length, amount: last.amount, typical: typical,
      monthly: last.amount * cad.perYear / 12, annual: last.amount * cad.perYear, first: similar[0].date, last: last.date, priceUp: amountChanged && last.amount > similar[0].amount, from: similar[0].amount });
  });
  return out.sort(function (a, b) { return b.annual - a.annual; });
};
function prettyName(desc, key) {
  return key.split(' ').map(function (w) { return w === '&' ? w : w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}

/* ---------- Spending categories (credit card optimizer) ---------- */
PT.CATS = [
  { id: 'dining', name: 'Dining & takeout', re: /restaurant|cafe|coffee|starbucks|dunkin|mcdonald|chipotle|pizza|burger|grill|taco|sushi|doordash|uber ?eats|grubhub|bar\b|pub\b|diner|bakery|kitchen|bistro|panera|chick|wendy|subway|eatery/i },
  { id: 'groceries', name: 'Groceries', re: /grocery|market|whole foods|trader joe|kroger|safeway|aldi|publix|wegmans|costco|sam'?s club|h-?e-?b|food lion|giant|stop & shop|sprouts|albertsons|instacart|fresh/i },
  { id: 'gas', name: 'Gas & EV charging', re: /\bgas\b|fuel|shell|exxon|chevron|\bbp\b|mobil|sunoco|citgo|marathon|speedway|wawa|sheetz|valero|circle k|chargepoint|electrify|supercharg/i },
  { id: 'travel', name: 'Travel & transit', re: /airline|airways|delta|united|american air|southwest|jetblue|hotel|marriott|hilton|hyatt|airbnb|expedia|booking|uber(?! ?eats)|lyft|amtrak|transit|metro|parking|toll|rental car|hertz|avis|enterprise/i },
  { id: 'streaming', name: 'Streaming & subscriptions', re: /netflix|spotify|hulu|disney|hbo|max\b|youtube|apple\.com|icloud|prime video|paramount|peacock|audible|patreon|substack|xbox|playstation|nintendo|adobe|dropbox|microsoft/i },
  { id: 'online', name: 'Online shopping', re: /amazon|amzn|ebay|etsy|target\.com|walmart\.com|shopify|wayfair|best buy|bestbuy/i },
  { id: 'drugstore', name: 'Drugstores', re: /cvs|walgreens|rite aid|pharmacy/i },
  { id: 'other', name: 'Everything else', re: /.^/ }
];
PT.categorize = function (desc, hint) {
  var s = (desc || '') + ' ' + (hint || '');
  for (var i = 0; i < PT.CATS.length - 1; i++) if (PT.CATS[i].re.test(s)) return PT.CATS[i].id;
  return 'other';
};
/* Generic card archetypes (not real products). rates are cash-back fractions. */
PT.ARCHETYPES = [
  { id: 'flat2', name: 'Flat 2% cash back', fee: 0, rates: { other: 0.02 }, blurb: '2% on everything, no annual fee.' },
  { id: 'flat15', name: 'Flat 1.5% cash back', fee: 0, rates: { other: 0.015 }, blurb: '1.5% on everything, no annual fee.' },
  { id: 'dine3', name: '3% dining & entertainment', fee: 0, rates: { dining: 0.03, streaming: 0.03, groceries: 0.03, other: 0.01 }, blurb: '3% on dining, groceries and streaming, 1% on the rest, no annual fee.' },
  { id: 'grocery6', name: 'Grocery & gas booster', fee: 95, rates: { groceries: 0.06, streaming: 0.06, gas: 0.03, travel: 0.03, other: 0.01 }, caps: { groceries: 6000 }, blurb: '6% groceries (first $6k/yr) and streaming, 3% gas and transit, 1% else, $95 fee.' },
  { id: 'travel3', name: 'Travel rewards card', fee: 95, rates: { travel: 0.03, dining: 0.03, other: 0.01 }, blurb: '3 points per $ on travel and dining (valued at 1¢), 1 point elsewhere, $95 fee.' },
  { id: 'rotate5', name: 'Rotating 5% categories', fee: 0, rates: { other: 0.01 }, rotating: 0.05, rotCap: 6000, blurb: '5% on categories that change each quarter (up to $1,500/qtr), 1% else, no fee. We assume a quarter of your spending lands in the bonus category.' }
];
PT.scoreCard = function (card, spendByCat) {
  var total = 0, gross = 0;
  Object.keys(spendByCat).forEach(function (c) {
    var amt = spendByCat[c], rate = card.rates[c] != null ? card.rates[c] : card.rates.other;
    total += amt;
    if (card.caps && card.caps[c] && amt > card.caps[c]) gross += card.caps[c] * rate + (amt - card.caps[c]) * card.rates.other;
    else gross += amt * rate;
  });
  if (card.rotating) { var bonus = Math.min(total * 0.25, card.rotCap); gross += bonus * (card.rotating - card.rates.other); }
  return { gross: gross, net: gross - card.fee, effective: total ? (gross - card.fee) / total : 0 };
};


/* ---------- Sharing (privacy: only the headline result, never inputs) ---------- */
var TOOL_NAMES = { 'debt-payoff-planner': 'Debt payoff planner', 'severance-runway': 'Severance & job-loss runway', 'rent-vs-buy': 'Rent vs. buy reality check', 'emergency-fund-runway': 'Emergency fund runway',
  'roth-vs-traditional': 'Roth vs. traditional', 'fee-x-ray': 'Fee x-ray', 'bitcoin-dca-backtester': 'Bitcoin DCA backtester', 'subscription-leak-finder': 'Subscription leak finder', 'credit-card-optimizer': 'Credit card optimizer', 'checkup': '2-minute money checkup' };
var plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
var oneDp = function (x) { return (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, ''); };
/* Each builder receives only result values (never balances, incomes, CSV rows or merchant names). */
PT.SHARE = {
  'debt-payoff-planner': function (s) { return s.stuck ? 'I made a plan to get out of debt' : 'Debt-free by ' + s.date; },
  'severance-runway': function (s) { return isFinite(s.months) ? oneDp(s.months) + ' months of runway' : 'My runway is covered'; },
  'rent-vs-buy': function (s) { return s.breakeven ? 'Buying pays off in year ' + s.breakeven : 'Renting wins for my timeline'; },
  'emergency-fund-runway': function (s) { return 'My safety net covers ' + oneDp(s.covered) + ' months'; },
  'roth-vs-traditional': function (s) { return s.tie ? 'Roth vs. traditional: a tie for me' : s.winner + ' wins for me'; },
  'fee-x-ray': function (s) { return 'Fees could cost me ' + PT.short(s.cost); },
  'bitcoin-dca-backtester': function (s) { return 'Bitcoin DCA backtest: ' + (s.gainPct >= 0 ? '+' : '') + Math.round(s.gainPct * 100) + '%'; },
  'subscription-leak-finder': function (s) { return 'I found ' + plural(s.count, 'recurring charge') + ' to review'; },
  'credit-card-optimizer': function (s) { return 'My best card type: ' + s.card; },
  'checkup': function (s) { return s.count ? 'I found my top ' + Math.min(5, s.count) + ' money ' + (Math.min(5, s.count) === 1 ? 'blind spot' : 'blind spots') : 'My money checkup: no blind spots found'; }
};
PT.shareCopy = function (slug, s) {
  var headline = PT.SHARE[slug](s), url = 'https://pymtw.com/tools/' + slug + '/';
  return { headline: headline, tool: TOOL_NAMES[slug], url: url, text: headline + '. Figured out in 60 seconds with the free ' + TOOL_NAMES[slug] + ' from PYMTW Tools.' };
};
PT.xIntent = function (c) { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(c.text) + '&url=' + encodeURIComponent(c.url); };

/* ---------- Browser-only UI ---------- */
if (typeof document !== 'undefined') {
  PT.$ = function (s, el) { return (el || document).querySelector(s); };
  PT.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* Wizard: one question per step. */
  PT.wizard = function (form, onDone) {
    var steps = PT.$$('.step', form), i = 0, bar = PT.$('.progress i', form), back = PT.$('[data-back]', form), next = PT.$('[data-next]', form), count = PT.$('.stepcount', form), err = PT.$('.err', form);
    function show() {
      steps.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      back.style.visibility = i ? 'visible' : 'hidden';
      next.textContent = i === steps.length - 1 ? 'See my results →' : 'Next →';
      count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      if (err) err.textContent = '';
    }
    function valid() {
      var bad = PT.$$('input[required]', steps[i]).filter(function (x) { return !x.checkValidity(); })[0];
      if (bad) { err.textContent = 'Please fill this in to continue.'; bad.focus(); return false; }
      var v = steps[i].dataset.validate; if (v && form['_v_' + v]) { var m = form['_v_' + v](); if (m) { err.textContent = m; return false; } }
      return true;
    }
    next.addEventListener('click', function () { if (!valid()) return; if (i < steps.length - 1) { i++; show(); var f = PT.$('input,select', steps[i]); if (f && window.innerWidth > 640) f.focus(); } else finish(); });
    back.addEventListener('click', function () { if (i) { i--; show(); } });
    form.addEventListener('submit', function (e) { e.preventDefault(); next.click(); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') { e.preventDefault(); next.click(); } });
    function finish() { var r = PT.$('.results'); onDone(PT.values(form)); r.classList.add('show'); r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    show();
    return { finish: finish, go: function (n) { i = n; show(); } };
  };
  PT.values = function (form) {
    var v = {};
    PT.$$('input[name],select[name]', form).forEach(function (el) {
      if (el.type === 'radio') { if (el.checked) v[el.name] = el.value; return; }
      if (el.type === 'checkbox') { v[el.name] = el.checked; return; }
      var n = parseFloat(String(el.value).replace(/[,$%\s]/g, ''));
      if (el.type === 'month' || el.dataset.str != null || (el.tagName === 'SELECT' && isNaN(n))) { v[el.name] = el.value; return; }
      v[el.name] = isNaN(n) ? 0 : (el.dataset.pct != null ? n / 100 : n);
    });
    return v;
  };
  PT.fill = function (form, vals) { Object.keys(vals).forEach(function (k) { var el = form.querySelector('[name="' + k + '"]'); if (!el) return; if (el.type === 'radio') { var r = form.querySelector('[name="' + k + '"][value="' + vals[k] + '"]'); if (r) r.checked = true; } else el.value = vals[k]; }); };
  PT.isDemo = /[?&]demo=1/.test(location.search);

  /* Results block helper */
  PT.renderResult = function (el, o) {
    el.innerHTML = '<div class="big-label">' + o.label + '</div><div class="big">' + o.big + '</div>' +
      '<p class="sentence">' + o.sentence + '</p>' +
      (o.stats ? '<div class="stats">' + o.stats.map(function (s) { return '<div class="stat"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join('') + '</div>' : '') +
      (o.chart ? '<div class="chart" id="chart"></div>' : '') + (o.extra || '') +
      (o.share ? '<div class="share-host"></div>' : '') +
      '<div class="next"><div><div class="k">Your next step</div><p>' + o.next + '</p></div>' + (o.nextLink ? '<a href="' + o.nextLink[1] + '">' + o.nextLink[0] + '</a>' : '') + '</div>' +
      '<p class="again"><button class="linkbtn" type="button" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">↺ Change my answers</button></p>';
    if (o.share) PT.shareButton(el.querySelector('.share-host'), o.share[0], o.share[1]);
  };


  /* Share image: 1200x630 canvas */
  PT.drawShareImage = function (c) {
    var cv = document.createElement('canvas'); cv.width = 1200; cv.height = 630; var x = cv.getContext('2d'), F = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    var g = x.createLinearGradient(0, 0, 1200, 630); g.addColorStop(0, '#0a7c55'); g.addColorStop(1, '#06573c'); x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
    x.globalAlpha = .09; x.fillStyle = '#fff'; x.beginPath(); x.arc(1080, 90, 260, 0, 7); x.fill(); x.beginPath(); x.arc(1150, 600, 180, 0, 7); x.fill(); x.globalAlpha = 1;
    var rr = function (X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
    x.fillStyle = '#fff'; rr(80, 72, 52, 52, 15); x.fill(); x.fillStyle = '#0a7c55'; x.font = '800 28px ' + F; x.textAlign = 'center'; x.fillText('P', 106, 108);
    x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = '700 30px ' + F; x.fillText('PYMTW', 150, 109); var w1 = x.measureText('PYMTW ').width; x.globalAlpha = .7; x.font = '500 30px ' + F; x.fillText('Tools', 150 + w1, 109); x.globalAlpha = 1;
    x.font = '700 22px ' + F; var tag = c.tool.toUpperCase(); x.globalAlpha = .75; x.fillText(tag, 80, 228); x.globalAlpha = 1;
    // headline: wrap and fit
    var size = 92, lines; do { x.font = '800 ' + size + 'px ' + F; lines = wrap(x, c.headline, 1040); size -= 4; } while ((lines.length > 3 || lines.length * size * 1.08 > 300) && size > 40);
    size += 4; x.font = '800 ' + size + 'px ' + F; lines.forEach(function (l, i) { x.fillText(l, 78, 300 + i * size * 1.06 + size * .55); });
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(80, 528, 1040, 2);
    x.fillStyle = '#fff'; x.font = '700 28px ' + F; x.fillText('pymtw.com/tools', 80, 578);
    x.globalAlpha = .75; x.font = '500 24px ' + F; x.textAlign = 'right'; x.fillText('Free · Private · No signup', 1120, 578); x.globalAlpha = 1; x.textAlign = 'left';
    return cv;
  };
  function wrap(x, t, w) { var words = t.split(' '), lines = [], l = ''; words.forEach(function (wd) { var test = l ? l + ' ' + wd : wd; if (x.measureText(test).width > w && l) { lines.push(l); l = wd; } else l = test; }); if (l) lines.push(l); return lines; }

  /* Share UI: one button that opens native share when available, plus fallbacks. */
  PT.shareButton = function (host, slug, summary) {
    var c = PT.shareCopy(slug, summary), cv = PT.drawShareImage(c), id = 'sh' + Math.random().toString(36).slice(2, 7);
    host.innerHTML = '<div class="share-box"><div class="share-row"><button type="button" class="btn accent" data-share>↗ Share my result</button><span class="share-note">Shares only “' + PT.esc(c.headline) + '”. None of your numbers or files.</span></div>' +
      '<div class="share-sheet" hidden><img alt="Share image preview" class="share-img"><div class="share-opts"><button type="button" class="btn ghost" data-copy>Copy link</button><a class="btn ghost" data-x target="_blank" rel="noopener">Post on X</a><button type="button" class="btn ghost" data-dl>Download image</button></div><p class="share-msg" aria-live="polite"></p></div></div>';
    var sheet = host.querySelector('.share-sheet'), msg = host.querySelector('.share-msg');
    host.querySelector('.share-img').src = cv.toDataURL('image/png');
    host.querySelector('[data-x]').href = PT.xIntent(c);
    host.querySelector('[data-copy]').onclick = function () {
      var done = function () { msg.textContent = '✓ Link copied'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c.text + ' ' + c.url).then(done, function () { fallbackCopy(c.text + ' ' + c.url); done(); }); else { fallbackCopy(c.text + ' ' + c.url); done(); }
    };
    host.querySelector('[data-dl]').onclick = function () { var a = document.createElement('a'); a.download = 'pymtw-' + slug + '.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); msg.textContent = '✓ Image saved'; };
    host.querySelector('[data-share]').onclick = function () {
      sheet.hidden = false;
      if (!navigator.share) return;
      cv.toBlob(function (b) {
        var data = { title: c.headline, text: c.text, url: c.url };
        try { var f = new File([b], 'pymtw-' + slug + '.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f]; } catch (e) {}
        navigator.share(data).catch(function () {});
      }, 'image/png');
    };
    PT._lastShare = { copy: c, canvas: cv };
  };
  function fallbackCopy(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }

  /* SVG line/area chart. series: [{name, color, points:[[x,y]], area, dash}] */
  PT.lineChart = function (el, o) {
    var W = 720, H = o.height || 300, L = 62, R = 16, T = 14, B = 34;
    var all = []; o.series.forEach(function (s) { s.points.forEach(function (p) { all.push(p); }); });
    var xmin = o.xmin != null ? o.xmin : Math.min.apply(null, all.map(function (p) { return p[0]; })), xmax = Math.max.apply(null, all.map(function (p) { return p[0]; }));
    var ymin = Math.min(0, Math.min.apply(null, all.map(function (p) { return p[1]; }))), ymax = Math.max.apply(null, all.map(function (p) { return p[1]; })) * 1.06 || 1;
    var nice = niceTicks(ymin, ymax, 5); ymax = nice[nice.length - 1]; ymin = nice[0];
    if (xmax === xmin) xmax = xmin + 1;
    var X = function (x) { return L + (x - xmin) / (xmax - xmin) * (W - L - R); }, Y = function (y) { return T + (1 - (y - ymin) / (ymax - ymin)) * (H - T - B); };
    var yf = o.yFmt || PT.short, xf = o.xFmt || function (x) { return x; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + PT.esc(o.title || 'Chart') + '" font-family="inherit" font-size="12">';
    nice.forEach(function (t) { s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="#eeeef1"/><text x="' + (L - 10) + '" y="' + (Y(t) + 4) + '" text-anchor="end" fill="#8a8a92">' + yf(t) + '</text>'; });
    var xt = o.xTicks || niceTicks(xmin, xmax, 6).filter(function (t) { return t >= xmin && t <= xmax; });
    xt.forEach(function (t) { s += '<text x="' + X(t) + '" y="' + (H - 10) + '" text-anchor="middle" fill="#8a8a92">' + xf(t) + '</text>'; });
    o.series.forEach(function (sr) {
      var d = sr.points.map(function (p, j) { return (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join('');
      if (sr.area) s += '<path d="' + d + 'L' + X(sr.points[sr.points.length - 1][0]) + ',' + Y(Math.max(0, ymin)) + 'L' + X(sr.points[0][0]) + ',' + Y(Math.max(0, ymin)) + 'Z" fill="' + sr.color + '" opacity=".1"/>';
      s += '<path d="' + d + '" fill="none" stroke="' + sr.color + '" stroke-width="' + (sr.width || 3) + '" stroke-linejoin="round" stroke-linecap="round"' + (sr.dash ? ' stroke-dasharray="6 6"' : '') + '/>';
    });
    (o.markers || []).forEach(function (m) { s += '<line x1="' + X(m.x) + '" x2="' + X(m.x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="' + (m.color || '#0a7c55') + '" stroke-dasharray="3 4"/><circle cx="' + X(m.x) + '" cy="' + Y(m.y || 0) + '" r="5" fill="' + (m.color || '#0a7c55') + '"/><text x="' + Math.min(X(m.x) + 8, W - 120) + '" y="' + (T + 14) + '" fill="' + (m.color || '#0a7c55') + '" font-weight="700">' + PT.esc(m.label) + '</text>'; });
    s += '</svg>';
    el.innerHTML = '<div class="legend">' + o.series.filter(function (x) { return x.name; }).map(function (x) { return '<span><i style="background:' + x.color + '"></i>' + PT.esc(x.name) + '</span>'; }).join('') + '</div>' + s;
  };
  /* Horizontal bar chart. items: [{label, value, color, note}] */
  PT.barChart = function (el, o) {
    var max = Math.max.apply(null, o.items.map(function (i) { return Math.abs(i.value); })) || 1, f = o.fmt || PT.money;
    el.innerHTML = (o.title ? '<div class="legend"><b>' + o.title + '</b></div>' : '') + o.items.map(function (it) {
      return '<div style="padding:8px 8px"><div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:6px"><span>' + PT.esc(it.label) + '</span><b style="font-variant-numeric:tabular-nums">' + f(it.value) + '</b></div>' +
        '<div style="height:12px;background:#f0f0f3;border-radius:6px;overflow:hidden"><div style="height:100%;width:' + Math.max(1.5, Math.abs(it.value) / max * 100) + '%;background:' + (it.color || '#0a7c55') + ';border-radius:6px"></div></div></div>';
    }).join('');
  };
  function niceTicks(a, b, n) {
    var span = b - a || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), err = n / span * step;
    if (err <= 0.15) step *= 10; else if (err <= 0.35) step *= 5; else if (err <= 0.75) step *= 2;
    var t = [], s = Math.floor(a / step) * step; for (var v = s; v <= b + step * 0.999; v += step) t.push(Math.round(v * 1e6) / 1e6);
    return t;
  }
  PT.niceTicks = niceTicks;

  /* File drop helper: reads text locally with FileReader. */
  PT.dropZone = function (zone, cb) {
    var input = PT.$('input[type=file]', zone);
    input.addEventListener('change', function () { if (input.files[0]) read(input.files[0]); });
    ['dragover', 'dragenter'].forEach(function (e) { zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (e) { zone.addEventListener(e, function () { zone.classList.remove('over'); }); });
    zone.addEventListener('drop', function (ev) { ev.preventDefault(); if (ev.dataTransfer.files[0]) read(ev.dataTransfer.files[0]); });
    function read(file) { var r = new FileReader(); r.onload = function () { cb(String(r.result), file.name); }; r.readAsText(file); }
  };
}

root.PT = PT;
if (typeof module !== 'undefined') module.exports = PT;
})(typeof window !== 'undefined' ? window : globalThis);
