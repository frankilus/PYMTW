(function(root){'use strict';
function nonneg(v,max){var n=Number(v);return Number.isFinite(n)?Math.min(max===undefined?1e9:max,Math.max(0,n)):0;}
function percent(v){return nonneg(v,100)/100;}
function pmt(P, apr, n) {
  P=nonneg(P);apr=nonneg(apr,1);n=Math.floor(nonneg(n,1200));
  if (!(P > 0) || !(n > 0)) return 0;
  var r = apr / 12;
  return r ? P * r / (-Math.expm1(-n * Math.log1p(r))) : P / n;
}
/* Amortize month by month. Returns payment, total interest, and interest paid / balance left after `months`. */
function amortize(P, apr, n, months) {
  P=nonneg(P);apr=nonneg(apr,1);n=Math.floor(nonneg(n,1200));months=Math.floor(nonneg(months,1200));
  var pay = pmt(P, apr, n), bal = Math.max(0, P), r = apr / 12, intAll = 0, intUpTo = 0, balAt = bal;
  for (var m = 1; m <= n; m++) {
    var it = bal * r, prin = Math.min(bal, pay - it);
    bal = Math.max(0, bal - prin); intAll += it;
    if (m <= months) { intUpTo += it; balAt = bal; }
  }
  if (!(n > 0)) { balAt = bal; }
  return { payment: pay, totalInterest: intAll, interestUpTo: intUpTo, balanceAt: months >= n ? 0 : balAt };
}
function calculate(o){o=o||{};var guests=Math.floor(nonneg(o.guests)),perGuest=nonneg(o.perGuest),base=guests*perGuest,buffer=base*percent(o.buffer),ring=o.ring===true?4600:0,rehearsal=o.rehearsal===true?2800:0,honeymoon=o.honeymoon===true?5500:0,total=base+buffer+ring+rehearsal+honeymoon;
var yourShare=Math.max(0,total-nonneg(o.family)),gap=Math.max(0,yourShare-nonneg(o.saved)),months=nonneg(o.months),borrow=nonneg(o.borrow),payoff=Math.floor(nonneg(o.payoffMonths,1200)),payment=pmt(borrow,percent(o.apr),payoff),interest=payoff>0?Math.max(0,payment*payoff-borrow):0;
return {base:base,buffer:buffer,total:total,yourShare:yourShare,gap:gap,monthly:months>0?gap/months:gap,payment:payment,interest:interest,tenGuests:Math.min(10,guests)*perGuest,shareOfIncome:nonneg(o.income)>0?total/nonneg(o.income):null,dueNow:months===0,invalidTerm:borrow>0&&payoff===0,parts:[['Celebration',base],['Buffer',buffer],['Ring',ring],['Rehearsal dinner',rehearsal],['Honeymoon',honeymoon]]};}

var api={calculate:calculate,pmt:pmt};root.PT_WEDDING=api;if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);