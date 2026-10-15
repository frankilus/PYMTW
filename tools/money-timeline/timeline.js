/* Money timeline: month-by-month projection of goals. Pure (tests/timeline.test.js).
 * Assumptions (shown to the user): amounts are in today's dollars; the return assumption is after inflation;
 * cash goals (emergency fund, down payment, college) earn nothing; savings fill goals one at a time, in order of target year,
 * after the emergency fund; once the debt is gone its payment is added to savings; leftover savings go to retirement. */
(function (root) {
'use strict';
var VERB = { emergency: ['fully fund your emergency fund', 'fund your emergency fund'], debt: ['be debt-free', 'be debt-free'], home: ['save your home down payment', 'save your down payment'], college: ['fund college', 'fund college'], retire: ['hit your retirement target', 'hit your retirement target'] };
var LABEL = { emergency: 'Emergency fund', debt: 'Debt-free', home: 'Home down payment', college: 'College fund', retire: 'Retirement target' };
function project(p, w) {
  w = w || {}; var r = w.ret != null ? w.ret : 0.05, mr = Math.pow(1 + r, 1 / 12) - 1;
  var now = p.startYear + (p.startMonth || 0) / 12, G = p.goals || {}, out = {}, maxM = Math.max(12, (100 - p.age) * 12);
  var debt = p.debt || 0, debtPay = (p.debtPayment || 0) + (w.extraDebt || 0), R = p.retirement || 0;
  var buckets = []; // cash goals, waterfall order
  if (G.emergency) buckets.push({ id: 'emergency', target: (p.expenses || 0) * (G.emergency.months || 6), bal: 0, ty: G.emergency.year });
  ['home', 'college'].filter(function (k) { return G[k]; }).sort(function (a, b) { return (G[a].year || 9999) - (G[b].year || 9999); }).forEach(function (k) { buckets.push({ id: k, target: G[k].amount || 0, bal: 0, ty: G[k].year }); });
  var cash = p.cash || 0; buckets.forEach(function (b) { var t = Math.min(cash, b.target); b.bal = t; cash -= t; }); R += 0; var spare = cash; // leftover cash stays aside
  var retTarget = G.retire ? (G.retire.amount || 0) : 0, retAge = G.retire ? (G.retire.age || 67) : 67;
  var hit = function (id, m) { if (out[id] == null) out[id] = m; };
  buckets.forEach(function (b) { if (b.bal >= b.target - 0.5) hit(b.id, 0); });
  if (G.debt && debt <= 0) hit('debt', 0);
  if (G.retire && R >= retTarget) hit('retire', 0);
  var series = [];
  for (var m = 1; m <= maxM; m++) {
    var freed = 0;
    if (debt > 0) { debt += debt * (p.debtApr || 0) / 12; var pay = Math.min(debt, debtPay); debt -= pay; freed = debtPay - pay; if (debt < 0.01) { debt = 0; if (G.debt) hit('debt', m); } if (pay <= debt * (p.debtApr || 0) / 12 && m > 600) break; }
    else freed = debtPay;
    var pool = (p.monthlySave || 0) + (w.extraSave || 0) + freed;
    for (var i = 0; i < buckets.length && pool > 0; i++) { var b = buckets[i]; if (b.bal >= b.target) continue; var add = Math.min(pool, b.target - b.bal); b.bal += add; pool -= add; if (b.bal >= b.target - 0.5) hit(b.id, m); }
    R = R * (1 + mr) + (p.retireContrib || 0) + pool;
    if (G.retire && R >= retTarget) hit('retire', m);
    if (m % 12 === 0) series.push([m / 12, R, debt]);
    var done = Object.keys(G).every(function (k) { return out[k] != null; });
    if (done && m > 12 && (p.age + m / 12) > retAge + 1) break;
  }
  var ms = Object.keys(G).map(function (k) {
    var mo = out[k], yr = mo == null ? null : now + mo / 12, ty = k === 'retire' ? p.startYear + (retAge - p.age) : (G[k].year || null);
    var status = mo == null ? 'red' : ty == null ? 'green' : Math.floor(yr) <= ty ? 'green' : Math.floor(yr) - ty <= 2 ? 'amber' : 'red';
    return { id: k, label: LABEL[k], months: mo, when: yr, year: yr == null ? null : Math.floor(yr), age: mo == null ? null : Math.floor(p.age + mo / 12), targetYear: ty, status: status };
  }).sort(function (a, b) { return (a.months == null ? 1e9 : a.months) - (b.months == null ? 1e9 : b.months); });
  return { milestones: ms, retireBalanceAtAge: R, series: series };
}
/* Smallest extra monthly amount (lever 'extraSave' or 'extraDebt') that makes goal `id` reach its target year. */
function needed(p, w, id, lever) {
  var ok = function (x) { var ww = Object.assign({}, w); ww[lever] = (w[lever] || 0) + x; var m = project(p, ww).milestones.filter(function (z) { return z.id === id; })[0]; return m && m.status === 'green'; };
  if (ok(0)) return 0; if (!ok(20000)) return null;
  var lo = 0, hi = 20000; for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; } return Math.ceil(hi / 10) * 10;
}
function summary(p, w) {
  var res = project(p, w), ms = res.milestones, late = ms.filter(function (m) { return m.status !== 'green'; });
  var parts = ms.filter(function (m) { return m.year != null; }).slice(0, 3).map(function (m) { return VERB[m.id][0] + ' by ' + m.year + ' (age ' + m.age + ')'; });
  var s = parts.length ? 'At this pace you’ll ' + (parts.length > 1 ? parts.slice(0, -1).join(', ') + (parts.length > 2 ? ',' : '') + ' and ' + parts[parts.length - 1] : parts[0]) + '.' : 'At this pace, none of your goals are reached yet.';
  var next;
  if (!late.length) next = { text: 'Every goal lands on or before its target year. Automate your monthly savings so the plan runs by itself.' };
  else { var g = late[0], lever = g.id === 'debt' ? 'extraDebt' : 'extraSave', n = needed(p, w, g.id, lever);
    next = { id: g.id, amount: n, text: n == null ? 'Your ' + g.label.toLowerCase() + ' goal looks out of reach as entered. Try a later target year or a smaller amount.' : 'Add about $' + n.toLocaleString('en-US') + ' a month ' + (g.id === 'debt' ? 'to your debt payment' : 'to savings') + ' to ' + VERB[g.id][1] + ' by ' + g.targetYear + '.' }; }
  return { milestones: ms, sentence: s, next: next, late: late.length, series: res.series };
}
var api = { project: project, needed: needed, summary: summary, LABEL: LABEL };
root.PT_TIMELINE = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
