/* Money Checkup: questions and blind-spot rules. Pure logic, no DOM (unit-tested in tests/checkup.test.js).
   No score. Each topic gets a status: red (act soon), amber (worth a look), green (looks covered), or is skipped. */
(function (root) {
'use strict';
var Q = [
 { id: 'ef', q: 'If your income stopped, how long could your savings cover essentials?', hint: 'Rent, food, utilities, insurance, minimum payments.', opts: [['lt1', 'Less than a month'], ['1to3', '1 to 3 months'], ['3to6', '3 to 6 months'], ['6plus', 'More than 6 months']] },
 { id: 'debt', q: 'Do you carry credit card or other high-interest debt from month to month?', opts: [['none', 'No, I pay cards in full'], ['plan', 'Yes, and I have a payoff plan'], ['noplan', 'Yes, and it isn’t shrinking']] },
 { id: 'plan', q: 'Does your employer offer a retirement plan with a match?', hint: 'For example a 401(k) or 403(b) where your employer adds money when you contribute.', opts: [['full', 'Yes, and I contribute enough to get the full match'], ['below', 'Yes, but I contribute less than the match'], ['unsure', 'Yes, but I’m not sure about the match'], ['none', 'No employer plan or match']] },
 { id: 'age', q: 'How old are you?', hint: 'Used only to pick a rule-of-thumb retirement benchmark.', opts: [['u30', 'Under 30'], ['30s', '30 to 39'], ['40s', '40 to 49'], ['50s', '50 to 59'], ['60p', '60 or older']] },
 { id: 'ret', q: 'Roughly how much have you saved for retirement, compared with your yearly income?', hint: 'All retirement accounts together. A rough guess is fine.', opts: [['0', 'Nothing yet'], ['lt1', 'Less than 1× my income'], ['1to3', '1× to 3×'], ['3to6', '3× to 6×'], ['6to8', '6× to 8×'], ['8p', 'More than 8×'], ['unsure', 'Not sure']] },
 { id: 'taxadv', q: 'Do you use tax-advantaged accounts, such as a 401(k), IRA or HSA?', opts: [['yes', 'Yes, regularly'], ['some', 'Sometimes, or only a little'], ['no', 'No'], ['unsure', 'Not sure what counts']] },
 { id: 'hdhp', q: 'Is your health insurance a high-deductible health plan (HDHP)?', hint: 'If you’re not sure, your plan documents or HR can tell you.', opts: [['hsa', 'Yes, and I have an HSA'], ['nohsa', 'Yes, but no HSA'], ['no', 'No'], ['unsure', 'Not sure']] },
 { id: 'dependents', q: 'Does anyone depend on your income?', hint: 'Children, a partner, a parent you support.', opts: [['yes', 'Yes'], ['no', 'No']] },
 { id: 'ins', q: 'Do you have life and disability insurance?', hint: 'Through work or on your own.', when: function (a) { return a.dependents === 'yes'; }, opts: [['both', 'Both'], ['one', 'Only one of them'], ['neither', 'Neither'], ['unsure', 'Not sure']] },
 { id: 'benef', q: 'Have you named beneficiaries on your retirement accounts and insurance?', hint: 'These often take priority over what a will says, so they matter a lot.', opts: [['yes', 'Yes, and they’re up to date'], ['old', 'Yes, but not reviewed in years'], ['no', 'No'], ['unsure', 'Not sure']] },
 { id: 'will', q: 'Do you have a will?', opts: [['yes', 'Yes, and it’s current'], ['old', 'Yes, but it’s out of date'], ['no', 'No']] },
 { id: 'fees', q: 'Do you know what you pay in investment fees each year?', hint: 'Fund expense ratios plus any advisor fee.', opts: [['low', 'Yes, and they’re low'], ['high', 'Yes, and they seem high'], ['unknown', 'No idea'], ['none', 'I don’t have investments']] },
 { id: 'subs', q: 'When did you last review your subscriptions and recurring charges?', opts: [['recent', 'In the last 3 months'], ['year', 'Sometime this year'], ['never', 'Can’t remember']] },
 { id: 'credit', q: 'Have you checked your credit reports this year, or frozen your credit?', opts: [['both', 'Checked and frozen'], ['checked', 'Checked, not frozen'], ['frozen', 'Frozen, not checked recently'], ['neither', 'Neither']] },
 { id: 'events', q: 'Anything big coming up in the next year?', hint: 'Pick all that apply.', multi: true, opts: [['job', 'Job change or layoff'], ['baby', 'A baby'], ['home', 'Buying a home'], ['marriage', 'Marriage'], ['parent', 'Caring for a parent'], ['none', 'Nothing planned']] }
];

/* Rule-of-thumb benchmark: Fidelity Investments' widely cited retirement savings guideline
   ("Aim to save at least 1x your salary by 30, 3x by 40, 6x by 50, 8x by 60, and 10x by 67"). Index into the 'ret' bands. */
var BANDS = ['0', 'lt1', '1to3', '3to6', '6to8', '8p'];
var TARGET = { u30: 1, '30s': 2, '40s': 3, '50s': 4, '60p': 5 }; // band index meeting the guideline's lower milestone for that decade
var LINK = function (slug, label) { return { href: '../' + slug + '/', label: label }; };
var SOON = { soon: true, label: 'Guide coming soon' };

function evaluate(a) {
  var out = [], add = function (id, status, title, why, step, link) { out.push({ id: id, status: status, title: title, why: why, step: step, link: link || SOON }); };
  // 1 Emergency fund (3-6 months is a common rule of thumb)
  if (a.ef) add('ef', a.ef === 'lt1' ? 'red' : a.ef === '1to3' ? 'amber' : 'green', 'Emergency fund',
    a.ef === 'lt1' ? 'Without a cushion, one surprise bill or a gap in income can push you onto a credit card.' : a.ef === '1to3' ? 'You have a start. A common rule of thumb is 3 to 6 months of essentials.' : 'Your cushion meets the common 3-to-6-month rule of thumb.',
    a.ef === '3to6' || a.ef === '6plus' ? 'Keep it in a separate savings account so it isn’t spent by accident.' : 'Work out your exact target and set up an automatic monthly transfer.', LINK('emergency-fund-runway', 'Emergency fund runway'));
  // 2 High-interest debt
  if (a.debt) add('debt', a.debt === 'noplan' ? 'red' : a.debt === 'plan' ? 'amber' : 'green', 'High-interest debt',
    a.debt === 'none' ? 'Paying cards in full means you aren’t paying card interest.' : 'Credit card interest often costs more than savings or investments earn, so paying it down is often one of the best returns available.',
    a.debt === 'none' ? 'Keep autopay set to the full statement balance.' : 'Get your debt-free date and the fastest order to pay things off.', LINK('debt-payoff-planner', 'Debt payoff planner'));
  // 3 Employer match
  if (a.plan && a.plan !== 'none') add('match', a.plan === 'below' ? 'red' : a.plan === 'unsure' ? 'amber' : 'green', 'Employer match',
    a.plan === 'full' ? 'You’re collecting all the money your employer offers.' : 'A match is money your employer adds only when you contribute. Contributing less than the match leaves it unclaimed.',
    a.plan === 'full' ? 'Check the match formula again whenever you change jobs.' : 'Ask HR or check your plan website for the match formula, then raise your contribution to at least that level.', SOON);
  // 4 Retirement savings vs. rule of thumb
  if (a.ret && a.age) {
    var st;
    if (a.ret === 'unsure') st = 'amber';
    else if (a.age === 'u30') st = a.ret === '0' ? 'amber' : 'green';
    else { var gap = TARGET[a.age] - BANDS.indexOf(a.ret); st = gap <= 0 ? 'green' : gap === 1 ? 'amber' : 'red'; }
    add('ret', st, 'Retirement savings',
      a.ret === 'unsure' ? 'Knowing roughly where you stand is the first step to knowing whether you’re on track.' : st === 'green' ? 'You’re at or above Fidelity’s rule-of-thumb savings milestone for your age.' : 'You’re below Fidelity’s rule-of-thumb savings milestone for your age. Time and steady contributions can still make a big difference.',
      a.ret === 'unsure' ? 'Add up your retirement balances and compare them with your yearly income.' : st === 'green' ? 'Keep contributing, and check that your fees are low.' : 'Try to raise your contribution by 1% of pay, and again each time you get a raise.', LINK('roth-vs-traditional', 'Roth vs. traditional'));
  }
  // 5 Tax-advantaged accounts
  if (a.taxadv) add('taxadv', a.taxadv === 'no' ? 'red' : a.taxadv === 'yes' ? 'green' : 'amber', 'Tax-advantaged accounts',
    a.taxadv === 'yes' ? 'You’re using accounts that cut or defer your taxes.' : 'Accounts like a 401(k), IRA or HSA can lower your taxes now or later. Money in a regular account doesn’t get that break.',
    a.taxadv === 'yes' ? 'Decide whether Roth or traditional contributions suit you better.' : 'Start with your workplace plan, or an IRA if you don’t have one at work.', LINK('roth-vs-traditional', 'Roth vs. traditional'));
  // 6 HSA (eligibility requires an HSA-qualified high-deductible plan; see IRS Publication 969)
  if (a.hdhp && a.hdhp !== 'no') add('hsa', a.hdhp === 'nohsa' ? 'amber' : a.hdhp === 'unsure' ? 'amber' : 'green', 'Health savings account (HSA)',
    a.hdhp === 'hsa' ? 'Per IRS Publication 969, HSA contributions can be tax-deductible, earnings grow tax-free, and withdrawals for qualified medical expenses can be tax-free.' : a.hdhp === 'nohsa' ? 'If your plan is HSA-qualified, you may be able to open an HSA. Per IRS Publication 969, contributions can be deductible, growth is tax-free, and qualified medical withdrawals can be tax-free.' : 'If your plan is an HSA-qualified high-deductible plan, an HSA can offer tax benefits on the way in, while it grows, and on qualified medical withdrawals.',
    a.hdhp === 'hsa' ? 'Check that you’re contributing, and that the money is invested if you don’t need it soon.' : 'Ask HR or your insurer whether your plan is HSA-qualified (IRS Publication 969 has the rules).', SOON);
  // 7 Insurance (only if dependents)
  if (a.dependents === 'yes' && a.ins) add('ins', a.ins === 'both' ? 'green' : a.ins === 'neither' ? 'red' : 'amber', 'Life & disability insurance',
    a.ins === 'both' ? 'The people who rely on your income have protection if something happens to you.' : 'If people rely on your income, insurance replaces it if you die or can’t work. Disability is often the coverage people overlook.',
    a.ins === 'both' ? 'Check that the coverage amounts still fit your family.' : 'See what your employer offers, then get quotes for what’s missing.', SOON);
  // 8 Beneficiaries
  if (a.benef) add('benef', a.benef === 'yes' ? 'green' : a.benef === 'no' ? 'red' : 'amber', 'Beneficiaries',
    a.benef === 'yes' ? 'Your accounts will go to the people you chose.' : 'The beneficiary named on a retirement account or policy often takes priority over a will. An old or missing name can send money somewhere you didn’t intend.',
    a.benef === 'yes' ? 'Check them again after any marriage, divorce, or birth.' : 'Log in to each retirement account and insurance policy and check the beneficiary page. It usually takes a few minutes per account.', SOON);
  // 9 Will
  if (a.will) add('will', a.will === 'yes' ? 'green' : (a.will === 'no' && a.dependents === 'yes') ? 'red' : 'amber', 'Will & estate basics',
    a.will === 'yes' ? 'Your wishes are written down.' : 'Without a will, state law often decides who inherits, and in many states a court may decide who cares for minor children.',
    a.will === 'yes' ? 'Review it every few years, or after a big life change.' : 'Write down your wishes and talk to an estate attorney or use a reputable will service.', SOON);
  // 10 Fees
  if (a.fees && a.fees !== 'none') add('fees', a.fees === 'low' ? 'green' : a.fees === 'high' ? 'red' : 'amber', 'Investment fees',
    a.fees === 'low' ? 'Low fees leave more of your returns with you.' : 'Fees come out every year whether you gain or lose money, and over decades they compound.',
    a.fees === 'low' ? 'Recheck them when you change funds or advisors.' : 'Enter your funds and expense ratios to see the dollar cost over time.', LINK('fee-x-ray', 'Fee x-ray'));
  // 11 Subscriptions
  if (a.subs) add('subs', a.subs === 'recent' ? 'green' : 'amber', 'Subscriptions',
    a.subs === 'recent' ? 'You’re on top of your recurring charges.' : 'Recurring charges are easy to forget, and prices can rise quietly.',
    a.subs === 'recent' ? 'Set a reminder to review again in a few months.' : 'Load a bank or card CSV and see every recurring charge at once.', LINK('subscription-leak-finder', 'Subscription leak finder'));
  // 12 Credit (FTC: freezes are free to place and lift; free weekly reports at AnnualCreditReport.com)
  if (a.credit) add('credit', a.credit === 'both' ? 'green' : a.credit === 'neither' ? 'red' : 'amber', 'Credit report & freeze',
    a.credit === 'both' ? 'You know what’s on your reports, and new credit can’t be opened in your name without you.' : 'Errors and identity theft show up on credit reports first. The FTC says a freeze stops new credit accounts being opened in your name, is free to place and lift, and doesn’t affect your score.',
    a.credit === 'both' ? 'Temporarily lift the freeze only when you apply for credit.' : 'Get your free reports at AnnualCreditReport.com (now available weekly) and place a freeze with all three bureaus: Equifax, Experian and TransUnion.', { href: 'https://www.annualcreditreport.com/', label: 'AnnualCreditReport.com', ext: true });
  // 13 Life events
  var ev = (a.events || []).filter(function (e) { return e !== 'none'; }), E = {
    job: ['Job change ahead', 'Know your runway, your 401(k) options, and your health coverage choices before your last day.', LINK('severance-runway', 'Severance runway')],
    baby: ['Baby on the way', 'Update beneficiaries, review life and disability coverage, and plan your leave budget.', SOON],
    home: ['Buying a home', 'Compare the full cost of owning with renting, and keep your emergency fund separate from your down payment.', LINK('rent-vs-buy', 'Rent vs. buy')],
    marriage: ['Getting married', 'Talk about money early, update beneficiaries afterward, and compare your workplace benefits.', SOON],
    parent: ['Caring for a parent', 'Caregiving can affect your time, income and savings. Build extra cushion and learn what help is available.', LINK('emergency-fund-runway', 'Emergency fund runway')] };
  ev.forEach(function (e) { if (E[e]) add('event-' + e, 'amber', E[e][0], 'Big life changes are when money gaps tend to open.', E[e][1], E[e][2]); });
  // Priority: red, then amber, then green; within a status, keep the order above (cash flow and safety first).
  var rank = { red: 0, amber: 1, green: 2 };
  out.forEach(function (x, i) { x.order = i; });
  out.sort(function (x, y) { return rank[x.status] - rank[y.status] || x.order - y.order; });
  return out;
}
function visible(a) { return Q.filter(function (q) { return !q.when || q.when(a); }); }
var api = { QUESTIONS: Q, evaluate: evaluate, visible: visible, BENCHMARK_SOURCE: 'Fidelity: Aim to save at least 1x your salary by 30, 3x by 40, 6x by 50, 8x by 60, and 10x by 67. https://www.fidelity.com/viewpoints/retirement/how-much-do-i-need-to-retire' };
root.PT_CHECKUP = api;
if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
