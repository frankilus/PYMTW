(function(root){'use strict';
function nonneg(v,max){var n=Number(v);return Number.isFinite(n)?Math.min(max===undefined?1e9:max,Math.max(0,n)):0;}
function percent(v){return nonneg(v,100)/100;}
function calculate(o){o=o||{};var v={};['birth','care','diapers','food','health','trans','housing','clothes','gear','leaveWeeks','weeklyPay','ctc','fsa'].forEach(function(k){v[k]=nonneg(o[k]);});
var core=v.housing+v.food+v.clothes+v.trans+v.health,lostIncome=v.leaveWeeks*v.weeklyPay,fsaSavings=Math.min(v.fsa,7500,v.care)*percent(o.taxRate);
var perYearCare=core+v.care-v.ctc-fsaSavings,perYearAfter=core-v.ctc,extras=v.birth+v.gear+lostIncome+12*v.diapers;
var parts=[['Child care',v.care],['Food',v.food],['Transportation',v.trans],['Health premiums',v.health],['Housing',v.housing],['Diapers',12*v.diapers],['Birth costs',v.birth],['Gear',v.gear],['Lost pay',lostIncome],['Clothing',v.clothes]];
return {core:core,lostIncome:lostIncome,fsaSavings:fsaSavings,credit:v.ctc,firstYear:extras+perYearCare,perYearCare:perYearCare,perYearAfter:perYearAfter,total18:extras+5*perYearCare+13*perYearAfter,parts:parts};}

var api={calculate:calculate};root.PT_BABY=api;if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);