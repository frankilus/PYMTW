/* Integer-satoshi / integer-cent, account-scoped FIFO review engine. No I/O. */
(function(root){
'use strict';
const fields=['timestamp','type','account','destination','btc','amount_usd','btc_fee','reference'];
const MAX_ROWS=500;
function decimal(value,places){
 const s=String(value??'').trim();
 if(!new RegExp('^\\d{1,12}(?:\\.\\d{1,'+places+'})?$').test(s))return null;
 const [a,b='']=s.split('.');return BigInt(a)*10n**BigInt(places)+BigInt(b.padEnd(places,'0'));
}
function fixed(n,p){const sign=n<0n?'-':'';n=n<0n?-n:n;const s=n.toString().padStart(p+1,'0');return sign+s.slice(0,-p)+'.'+s.slice(-p);}
function time(value){
 const s=String(value??'').trim();
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s))return null;
 const d=new Date(s);return Number.isFinite(+d)&&d.toISOString().slice(0,19)+'Z'===s&&s>='2009-01-03T00:00:00Z'?s:null;
}
function parseCSV(text){
 if(text.length>2*1024*1024)throw Error('CSV is too large. Use a file under 2 MB.');
 text=text.replace(/^\uFEFF/,'');
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
  else if(c==='"'){if(cell||closed)throw Error('Unexpected quote in CSV. Use standard comma-separated CSV.');quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){
   row.push(cell);cell='';closed=false;
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v!==''))rows.push(row);row=[];}
  }else{if(closed)throw Error('Unexpected text after a quoted CSV cell.');cell+=c;}
  if(cell.length>2000||row.length>60||rows.length>MAX_ROWS+1)throw Error('CSV exceeds the limit: 500 records, 60 columns, 2,000 characters per cell.');
 }
 if(quoted)throw Error('A CSV quote is not closed.');
 row.push(cell);if(row.some(v=>v!==''))rows.push(row);
 if(rows.length<2||rows.length>MAX_ROWS+1)throw Error('CSV must have a header and 1–500 records.');
 const headers=rows.shift().map(s=>s.trim());
 if(headers.some(h=>!h)||new Set(headers.map(h=>h.toLowerCase())).size!==headers.length)throw Error('Every column needs a unique, nonempty header.');
 if(headers.length>60||rows.some(r=>r.length!==headers.length))throw Error('Every CSV row must have the same number of columns as the header.');
 return {headers,rows};
}
function mapped(csv,mapping,source){
 const required=['timestamp','type','account','btc','amount_usd','btc_fee'];
 for(const f of required)if(!Number.isInteger(mapping[f])||mapping[f]<0||mapping[f]>=csv.headers.length)throw Error('Choose a column for '+f+'.');
 const used=Object.values(mapping).filter(i=>i>=0);if(new Set(used).size!==used.length)throw Error('Use a different source column for each field.');
 return csv.rows.map((cells,i)=>Object.assign(Object.fromEntries(fields.map(f=>[f,mapping[f]>=0?cells[mapping[f]].trim():''])),{source:source+' · row '+(i+2),included:true}));
}
function analyze(records){
 const issues=[];const add=(i,message)=>issues.push({row:i+1,message});
 if(records.length>MAX_ROWS)return {issues:[{row:0,message:'Use at most 500 records.'}],sales:[],wallets:[],lots:[]};
 const valid=[];
 records.forEach((r,i)=>{
  if(r.included===false)return;
  const stamp=time(r.timestamp),qty=decimal(r.btc,8),usd=decimal(r.amount_usd,2),fee=decimal(r.btc_fee,8);
  const type=String(r.type||'').trim().toLowerCase(),account=String(r.account||'').trim(),destination=String(r.destination||'').trim();
  if(!stamp)add(i,'Use a valid UTC timestamp: YYYY-MM-DDTHH:MM:SSZ.');
  if(stamp&&stamp>new Date().toISOString())add(i,'This transaction is in the future. Check its timestamp.');
  if(!['buy','sell','transfer'].includes(type))add(i,'Unsupported activity. Only USD buys, USD sales and transfers between your own accounts are modeled. Keep other activity for your preparer.');
  if(stamp&&type!=='buy'&&stamp<'2025-01-01T00:00:00Z')add(i,'Pre-2025 sales/transfers are outside this tool’s scope. A preparer must reconcile your opening lots.');
  if(!account||account.length>80)add(i,'Enter a wallet/account name of 1–80 characters.');
  if(qty===null||qty<=0n||qty>21000000n*100000000n)add(i,'Enter a positive BTC amount, at most 8 decimal places and no more than 21 million BTC.');
  if(fee===null)add(i,'Confirm the BTC fee. Enter 0 only when no fee was paid in BTC.');
  else if(fee>0n)add(i,'A fee paid in BTC needs a separate disposition/basis review. This tool cannot calculate it.');
  if(type==='buy'||type==='sell'){
   if(usd===null)add(i,type==='buy'?'Missing or invalid cost basis. Enter total USD cost including USD purchase fees; do not guess.':'Missing or invalid net USD proceeds. Subtract eligible USD selling fees first.');
   if(destination)add(i,'Destination is only for a transfer. Clear it for a buy or sale.');
  }
  if(type==='transfer'){
   if(!destination||destination.length>80||destination.toLowerCase()===account.toLowerCase())add(i,'Enter a different destination account you own.');
   if(String(r.amount_usd||'').trim()!==''&&usd!==0n)add(i,'For a fee-free own-account transfer, leave USD amount empty or 0. Transfers with fees need separate review.');
  }
  if(String(r.reference||'').length>160)add(i,'Keep the reference to 160 characters or fewer.');
  valid.push({i,stamp,qty,usd,type,account,destination,ref:String(r.reference||'').trim()});
 });
 // Case-only account variants are ambiguous: do not silently combine or split accounts.
 const names=new Map();for(const r of valid)for(const name of [r.account,r.destination].filter(Boolean)){const key=name.toLowerCase();if(names.has(key)&&names.get(key)!==name)add(r.i,'Account spelling differs only by capitalization. Use exactly the same account name throughout.');else names.set(key,name);}
 const signature=new Map(),refs=new Map(),stamps=new Map();
 for(const r of valid){
  const key=JSON.stringify([r.stamp,r.type,r.account,r.destination,String(r.qty),String(r.usd)]);
  if(signature.has(key)){add(r.i,'Possible duplicate of record '+(signature.get(key)+1)+'. Verify and exclude one copy if duplicated.');add(signature.get(key),'Possible duplicate of record '+(r.i+1)+'.');}else signature.set(key,r.i);
  const refkey=JSON.stringify([r.account,r.ref]);if(r.ref&&refs.has(refkey)){add(r.i,'Reference repeats within this account. Check for overlapping exports or split fills.');}else if(r.ref)refs.set(refkey,r.i);
  if(r.stamp)for(const a of [r.account,r.destination].filter(Boolean)){
   const key=JSON.stringify([r.stamp,a]);if(stamps.has(key))add(r.i,'Another record touches this account at the same second. Verify execution order/timestamps; the tool will not guess.');else stamps.set(key,r.i);
  }
 }
 const empty={issues,active:valid.length,sales:[],wallets:[],lots:[],proceeds:0n,basis:0n,gain:0n};
 if(issues.length||!valid.length)return empty;
 const wallets=new Map(),sales=[];
 const get=a=>{if(!wallets.has(a))wallets.set(a,[]);return wallets.get(a);};
 // Each split conserves cents: half-up allocation, remainder stays with the lot.
 const portion=(money,q,total)=>(money*q+total/2n)/total;
 for(const r of valid.sort((a,b)=>a.stamp.localeCompare(b.stamp))){
  const lots=get(r.account);
  if(r.type==='buy'){lots.push({qty:r.qty,basis:r.usd,acquired:r.stamp,origin:r.i+1});continue;}
  lots.sort((a,b)=>a.acquired.localeCompare(b.acquired)||a.origin-b.origin);
  const activeLots=lots.filter(l=>l.qty>0n);
  if(activeLots.some((l,i)=>i>0&&l.acquired===activeLots[i-1].acquired&&l.origin!==activeLots[i-1].origin)){add(r.i,'Distinct source lots in this account share an acquisition timestamp. Verify their original execution times before matching lots.');break;}
  const available=lots.reduce((s,l)=>s+l.qty,0n);
  if(available<r.qty){add(r.i,'This account is short '+fixed(r.qty-available,8)+' BTC. Add missing acquisition/transfer history; coins in another account cannot cover this record.');break;}
  let remaining=r.qty,proceedsLeft=r.usd;
  while(remaining>0n){
   const lot=lots.find(l=>l.qty>0n),q=remaining<lot.qty?remaining:lot.qty;
   const cost=portion(lot.basis,q,lot.qty);
   if(r.type==='transfer')get(r.destination).push({qty:q,basis:cost,acquired:lot.acquired,origin:lot.origin});
   else{const proceeds=portion(proceedsLeft,q,remaining);proceedsLeft-=proceeds;sales.push({record:r.i+1,account:r.account,acquired:lot.acquired,sold:r.stamp,origin:lot.origin,qty:q,basis:cost,proceeds,gain:proceeds-cost});}
   lot.qty-=q;lot.basis-=cost;remaining-=q;
  }
 }
 if(issues.length)return empty; // Never publish partial gains after an inventory failure.
 const remainingLots=[...wallets].flatMap(([account,lots])=>lots.filter(l=>l.qty>0n).map(l=>({...l,account})));
 const walletSummary=[...wallets].map(([account,lots])=>({account,qty:lots.reduce((s,l)=>s+l.qty,0n),basis:lots.reduce((s,l)=>s+l.basis,0n)}));
 const proceeds=sales.reduce((s,l)=>s+l.proceeds,0n),basis=sales.reduce((s,l)=>s+l.basis,0n);
 return {...empty,sales,wallets:walletSummary,lots:remainingLots,proceeds,basis,gain:proceeds-basis};
}
function csv(rows){return rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n')+'\r\n';}
const api={fields,MAX_ROWS,decimal,fixed,time,parseCSV,mapped,analyze,csv};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TaxLots=api;
})(typeof globalThis!=='undefined'?globalThis:this);
