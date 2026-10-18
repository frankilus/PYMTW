/* Suggestions only: no automatic inclusion, balances or expense-ratio inference. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlanStatementParser=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function classify(s){if(/\b(?:target|retirement\s+20\d\d|balanced|lifecycle|life.?cycle)\b/i.test(s))return'blend';if(/\b(?:employer|company) stock\b/i.test(s))return'employer';if(/\b(?:bond|fixed income|treasury)\b/i.test(s))return'bond';if(/\b(?:international|foreign|emerging markets|ex.?us)\b/i.test(s))return'international';if(/\b(?:money market|stable value|cash)\b/i.test(s))return'cash';if(/\b(?:u\.?s\.? stock|s&p|sp500|500 index|domestic equity|total stock market)\b/i.test(s))return'us';return'other';}
const amountPattern=/(?<![\d.])(?:\(?[−-]?\$?\s*)?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?[−-]?(?!\d)/g;
function parse(text){const all=String(text),source=all.slice(0,100000).split(/\r?\n/).slice(0,1500),rows=[];
 for(const raw of source){const s=raw.trim().replace(/\s+/g,' ');if(!s||s.length>450)continue;
 if(/\b(?:ssn|social security|account\s*(?:number|no\b|#|id)|participant|employee\s*(?:name|id|number)|routing|address|phone|date of birth)\b/i.test(s))continue;
 if(/^(?:total\b|subtotal\b|account\b|beginning\b|ending\b|opening\b|closing\b|vested\b|unvested\b|contribution\b|distribution\b|withdrawal\b|rollover\b|loan\b|dividend\b|interest\b|gain\b|loss\b|change\b|fees?\b|administration\b|recordkeeping\b|investment (?:gain|loss|return|income)|(?:employee|employer|roth|traditional|pre.tax) (?:contribution|match|source|money|balance))/i.test(s))continue;
 const matches=[...s.matchAll(amountPattern)].filter(m=>!/^\s*%/.test(s.slice(m.index+m[0].length)));if(!matches.length)continue;
 const label=s.slice(0,matches[0].index).replace(/[|:]+$/,'').trim();if(!/[a-z]/i.test(label)||label.length<3)continue;
 const amounts=matches.map(m=>{const raw=m[0].trim(),negative=/[−\-()]/.test(raw);return{raw,value:negative?'':raw.replace(/[$,\s]/g,''),negative};});
 rows.push({label:label.slice(0,80),kind:classify(label),amounts,source:s,note:'Select only an actual investment holding. Verify its ending/current balance—not shares, price, contributions or a prior balance. Expense ratios remain blank unless you enter them.'});if(rows.length===60)break;
 }
 return{rows,hasColumns:rows.some(r=>r.amounts.length>1),truncated:all.length>100000||source.length>=1500||rows.length>=60};
}
return{parse,classify};
});
