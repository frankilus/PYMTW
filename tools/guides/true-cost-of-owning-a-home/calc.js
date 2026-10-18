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
function calculate(o){o=o||{};var price=nonneg(o.price),down=price*percent(o.down),loan=price-down,rate=percent(o.rate),term=Math.floor(nonneg(o.term,100))*12;
var A=amortize(loan,rate,term,12),B=amortize(loan,Math.min(1,rate+.01),term,12),pmiYr=percent(o.down)<.2?loan/100000*nonneg(o.pmiPer100k)*12:0;
var taxYr=price*percent(o.taxRate),maintYr=price*percent(o.maint),parts=[['Maintenance',maintYr],['Utilities',nonneg(o.util)],['Property tax',taxYr],['Insurance',nonneg(o.ins)],['Internet',nonneg(o.net)],['HOA',12*nonneg(o.hoa)],['PMI',pmiYr]],beyondYr=parts.reduce(function(a,p){return a+p[1];},0),upfront=down+price*percent(o.close),oppYr=upfront*percent(o.oppRate);
return {loan:loan,PI:A.payment,pmiYr:pmiYr,taxYr:taxYr,maintYr:maintYr,beyondYr:beyondYr,allInMo:A.payment+beyondYr/12,upfront:upfront,oppYr:oppYr,yr1Int:A.interestUpTo,trueYr1:A.interestUpTo+beyondYr+oppYr,extraPayment:B.payment-A.payment,parts:parts,invalidTerm:loan>0&&term===0};}

var api={calculate:calculate,pmt:pmt,amortize:amortize};root.PT_HOME=api;if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);