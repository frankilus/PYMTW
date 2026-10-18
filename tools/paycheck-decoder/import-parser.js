/* Conservative extraction: suggestions only; every import requires review. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaycheckImportParser=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const patterns=[
 ['employer',/\b(?:employer|er)\b/i],
 ['roth',/\broth\b/i],['traditional',/\b(?:401\s*\(?k\)?|403\s*\(?b\)?|457\s*\(?b\)?|pre.?tax retirement|retirement)\b/i],
 ['federal',/\b(?:fitw?|fwt|fed(?:eral)?(?: income)?(?: tax| wh| withholding))\b/i],
 ['ss',/\b(?:oasdi|social security|fica[ -]?ss|ss tax)\b/i],['medicare',/\b(?:medicare|fica[ -]?med|med tax)\b/i],['fica',/\bfica\b/i],
 ['state',/\b(?:sitw?|swt|state(?: income)?(?: tax| wh| withholding)?|local(?: income)? tax|city tax)\b/i],
 ['otherTax',/\b(?:sdi|sui|pfl|disability|paid family leave)\b/i],['healthSaving',/\b(?:hsa|fsa|flexible spending|health savings)\b/i],
 ['benefit',/\b(?:health|medical|dental|vision|insurance|premium)\b/i],['addition',/\b(?:reimbursement|expense refund|deduction refund)\b/i],
 ['otherDeduction',/\b(?:union|garnish\w*|dues|loan repayment|parking|transit)\b/i]
];
function classify(label){
 if(/\b(?:ytd|year.to.date|taxable|imputed|total (?:tax|deduction|benefit)|check amount|direct deposit|account|routing|employee id|employee number|ssn)\b/i.test(label))return 'skip';
 if(/^(?:total\s+)?(?:cash\s+)?gross(?:\s+(?:pay|wages|earnings|cash pay))?\s*:?$/i.test(label))return 'gross';
 if(/^(?:total\s+)?net(?:\s+(?:pay|wages|earnings))?\s*:?$/i.test(label))return 'net';
 if(/\b(?:regular|salary|overtime|bonus|hours|rate|earnings|pto|vacation|commission)\b/i.test(label))return 'skip';
 return patterns.find(([,pattern])=>pattern.test(label))?.[0]||'unknown';
}
function parse(text){
 const limited=String(text).slice(0,100000),source=limited.split(/\r?\n/).slice(0,1500),rows=[];
 const ytdOnly=source.some(s=>/\bytd\b|year.to.date/i.test(s))&&!source.some(s=>/\bcurrent\b|this (?:check|period)|period (?:pay|amount)/i.test(s));
 for(const raw of source){const s=raw.trim().replace(/\s+/g,' ');if(!s||s.length>350)continue;
 const matches=[...s.matchAll(/(?:\(?-?\$?\s*)?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?-?(?!\d)/g)];if(!matches.length)continue;
 const label=s.slice(0,matches[0].index).trim().replace(/[:|]+$/,'').trim();if(!label||!/[a-z]/i.test(label))continue;
 // Never promote identifying or banking lines into payroll suggestions.
 if(/\b(?:ssn|social security (?:number|no)|routing|account|employee (?:id|number|name)|address|phone|birth|bank)\b/i.test(label))continue;
 const type=classify(label),tail=s.slice(matches[0].index);
 const extraWords=tail.replace(/(?:\(?-?\$?\s*)?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}\)?-?(?!\d)/g,'').replace(/[\s|$]/g,'');
 const ambiguous=/[a-z]/i.test(extraWords); // Side-by-side categories or words after amounts: do not guess.
 const amounts=matches.map(m=>{const raw=m[0].trim(),negative=/[-()]/.test(raw);return{raw,value:negative?'':raw.replace(/[$,\s]/g,''),negative};});
 const supported=type!=='unknown'&&type!=='skip'&&!ambiguous;
 rows.push({label:label.slice(0,80),source:s,type:ambiguous?'unknown':type,amounts,include:supported,selected:amounts.length===1&&!amounts[0].negative&&!ytdOnly?'0':'',note:ambiguous?'More than one label may be on this row. Check the original.':type==='skip'?'Subtotal, earnings detail, YTD or memo: excluded to avoid double counting.':type==='unknown'?'Unrecognized label. Choose a type before including it.':amounts.some(a=>a.negative)?'Negative/reversed amount: enter that adjustment manually.':amounts.length>1?'Choose the current-period amount, not YTD.':ytdOnly?'No current-period heading found. Verify that this is not a YTD amount.':'Check against the original.'});
 if(rows.length>=60)break;
 }
 return{rows,hasColumns:rows.some(r=>r.amounts.length>1),ytdOnly,truncated:String(text).length>100000||source.length>=1500||rows.length>=60};
}
return{parse,classify};
});
