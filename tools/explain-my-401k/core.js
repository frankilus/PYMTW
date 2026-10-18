/* Educational snapshot arithmetic. No network, storage or investment recommendations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Plan401k=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const kinds={us:'U.S. stock funds',international:'International stock funds',bond:'Bond funds',blend:'Target-date / balanced funds',cash:'Cash / stable value',employer:'Employer stock',other:'Other / not sure'};
function number(value,label,max=10000000,optional=true){const s=String(value??'').trim();if(!s){if(optional)return null;throw Error('Enter '+label+'.');}if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,4})?$|^\.\d{1,4}$/.test(s))throw Error('Use a non-negative number for '+label+'.');const n=Number(s.replace(/,/g,''));if(!Number.isFinite(n)||n>max)throw Error(label+' must be no more than '+max.toLocaleString('en-US')+'.');return n;}
function dollars(value,label,optional=true){const n=number(value,label,10000000,optional);if(n!==null&&String(value).trim().split('.')[1]?.length>2)throw Error('Use no more than two decimal places for '+label+'.');return n;}
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
function calculate(i){
 const pay=dollars(i.pay,'annual eligible pay'),rate=number(i.rate,'your contribution rate',100);
 if((pay===null)!==(rate===null))throw Error('Enter both eligible pay and your contribution rate, or leave both blank.');
 if(pay===0)throw Error('Eligible pay must be greater than zero, or leave pay and rate blank.');
 const mode=i.match||'unknown';if(!['unknown','none','simple','tiered'].includes(mode))throw Error('Choose a match formula.');
 let tiers=[],match=null,maxMatch=null,threshold=null;
 if(mode==='simple'||mode==='tiered'){
  const cap1=number(i.cap1,'first matching band',100,false),m1=number(i.m1,'first match rate',200,false);
  if(cap1<=0||m1<=0)throw Error('The first matching band and match rate must be greater than zero.');
  tiers.push([cap1,m1]);
  if(mode==='tiered'){const cap2=number(i.cap2,'additional matching band',100,false),m2=number(i.m2,'second match rate',200,false);if(cap2<=0||m2<=0||cap1+cap2>100)throw Error('Use positive second-tier values and combined bands of no more than 100% of pay.');tiers.push([cap2,m2]);}
  threshold=tiers.reduce((s,t)=>s+t[0],0);
  if(pay!==null){let remaining=rate;match=0;maxMatch=0;for(const[band,pct]of tiers){match+=pay*Math.min(remaining,band)/100*pct/100;maxMatch+=pay*band/100*pct/100;remaining=Math.max(0,remaining-band);}match=round(match);maxMatch=round(maxMatch);}
 }else if(mode==='none'&&pay!==null){match=0;maxMatch=0;threshold=0;}
 if(!Array.isArray(i.funds)||i.funds.length>20)throw Error('Use up to 20 investments.');
 const funds=i.funds.filter(f=>[f.name,f.balance,f.fee].some(v=>String(v??'').trim())).map((f,index)=>{
  const balance=dollars(f.balance,'balance for investment '+(index+1),false),fee=number(f.fee,'expense ratio',10);
  if(!Object.hasOwn(kinds,f.kind))throw Error('Choose an investment type.');
  return{name:String(f.name||'Investment '+(index+1)).trim().slice(0,80),kind:f.kind,balance,fee,cost:fee===null?null:balance*fee/100};
 });
 if(!funds.length&&pay===null)throw Error('Enter at least one investment balance, or eligible pay and your contribution rate.');
 const total=funds.reduce((s,f)=>s+f.balance,0),knownBalance=funds.reduce((s,f)=>s+(f.fee!==null?f.balance:0),0),fundCost=funds.reduce((s,f)=>s+(f.cost||0),0);
 const unknown=funds.filter(f=>f.balance>0&&f.fee===null).length;
 const admin=dollars(i.admin,'annual plan fee'),adminPct=number(i.adminPct,'annual asset-based plan fee',10);
 const assetFees=total*(adminPct||0)/100;
 const allFeesKnown=unknown===0&&admin!==null&&adminPct!==null&&total>0;
 const mix={};funds.forEach(f=>{mix[f.kind]=(mix[f.kind]||0)+f.balance;});
 const employer=dollars(i.employer,'employer-source balance'),vest=number(i.vest,'employer vesting percentage',100);
 if((employer===null)!==(vest===null))throw Error('Enter both the employer-source balance and its vested percentage, or leave both blank.');
 if(employer!==null&&funds.length&&employer>total)throw Error('The employer-source balance cannot exceed the investments you entered. Enter all holdings or leave the vesting section blank.');
 return{pay,rate,employee:pay===null?null:round(pay*rate/100),mode,match,maxMatch,threshold,gap:match===null?null:round(maxMatch-match),extra:pay===null||threshold===null?null:round(pay*Math.max(0,threshold-rate)/100),funds,total:round(total),knownBalance,unknown,fundCost:round(fundCost),weighted:knownBalance?fundCost/knownBalance*100:null,admin,adminPct,feeTotal:round(fundCost+(admin||0)+assetFees),allFeesKnown,mix,employer,vest,vested:employer===null?null:round(employer*vest/100)};
}
return{calculate,number,kinds};
});
