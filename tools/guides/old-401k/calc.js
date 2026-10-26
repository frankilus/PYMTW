/* Old 401(k): cash out vs. roll over. Pure functions, runs in the browser (and in Node for tests). Educational estimate only. */
(function (root) {
'use strict';
var EARLY_AGE = 59.5, RULE55_AGE = 55, PENALTY = 0.10, WITHHOLD = 0.20;
function clamp(x, lo, hi) { x = +x; if (!isFinite(x)) x = 0; return Math.min(hi, Math.max(lo, x)); }
function round2(x) { return Math.round(x * 100) / 100; }
/* Is the 10% additional tax on early distributions likely to apply?
   age = your age when the money is paid out; rule55 = you left this employer in or after the year you turned 55
   (50 for qualified public safety employees). Other IRS exceptions exist and are not modeled. */
function penaltyApplies(age, rule55) {
  if (age >= EARLY_AGE) return false;
  if (rule55) return false;
  return true;
}
/* Cash out a pre-tax balance vs. a direct rollover.
   o = { balance, age, fed (decimal, e.g. 0.22), state (decimal, e.g. 0.05), rule55 (bool) }
   Flat-rate estimate: the whole taxable amount is taxed at the rates you enter. */
function cashOut(o) {
  var balance = clamp(o.balance, 0, 1e9), age = clamp(o.age, 0, 120);
  var fedRate = clamp(o.fed, 0, 0.5), stateRate = clamp(o.state, 0, 0.2);
  var pen = penaltyApplies(age, !!o.rule55);
  var penalty = round2(pen ? balance * PENALTY : 0);
  var fed = round2(balance * fedRate);
  var state = round2(balance * stateRate);
  var cost = round2(penalty + fed + state);
  var net = round2(balance - cost);
  var withheld = round2(balance * WITHHOLD);
  return {
    balance: balance, penaltyApplies: pen, penalty: penalty, fed: fed, state: state,
    cost: cost, net: net, lostShare: balance > 0 ? cost / balance : 0,
    withheld: withheld, check: round2(balance - withheld),
    /* if the check is paid to you and you still want to roll over everything within 60 days,
       you must add the withheld 20% from other money */
    makeUp: withheld,
    /* after the tax return: positive = more tax still due, negative = refund of over-withholding (federal only) */
    fedDueAtFiling: round2(fed + penalty - withheld),
    rollover: { tax: 0, penalty: 0, keeps: balance }
  };
}
var api = { penaltyApplies: penaltyApplies, cashOut: cashOut, EARLY_AGE: EARLY_AGE, RULE55_AGE: RULE55_AGE, PENALTY: PENALTY, WITHHOLD: WITHHOLD };
root.PT_OLD401K = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
