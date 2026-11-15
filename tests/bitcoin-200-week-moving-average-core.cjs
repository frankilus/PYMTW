// Bitcoin 200-week moving average tracker model: 200WMA = plain average of the latest 200 weekly prices (current week counts as newest), multiple, zones, "how often this cheap", zone history, and integrity of the saved weekly data.
const assert=require('node:assert/strict');const W=require('../tools/bitcoin-200-week-moving-average/core.js');const data=require('../tools/bitcoin-200-week-moving-average/data/weekly.json');
const near=(a,b,t=1e-9,m)=>assert.ok(Math.abs(a-b)<=t,(m||'')+' '+a+' vs '+b);
assert.equal(W.WEEKS,200);assert.deepEqual(W.ZONES.map(z=>[z.id,z.lo,z.hi]),[['deep',0,1.1],['fair',1.1,2],['stretched',2,3.5],['hot',3.5,Infinity]]);
assert.equal(W.zoneOf(0.5).id,'deep');assert.equal(W.zoneOf(1.0999).id,'deep');assert.equal(W.zoneOf(1.1).id,'fair');assert.equal(W.zoneOf(2).id,'stretched');assert.equal(W.zoneOf(3.5).id,'hot');assert.equal(W.zoneOf(15).id,'hot');
// synthetic: 250 flat weeks at $100 then the live current week at $50
const flat={firstWeek:'2020-01-05',weekly:Array(250).fill(100),latest:{date:'2024-11-10',price:100}};
let s=W.build(flat,{price:50,date:'2024-11-14'});// 2024-11-14 is after the last Sunday (2024-11-03? check by dates)
assert.equal(s.n,250-0+((W.parseDay('2024-11-14')>s.dates[249])?0:-1));
assert.equal(s.ma[198],null);near(s.ma[199],100);near(s.mult[199],1);
near(s.current.ma,(199*100+50)/200);near(s.current.mult,50/((199*100+50)/200));near(s.current.pct,s.current.price/s.current.ma-1);
// current day equal to the last Sunday replaces that week instead of adding one
const lastSun=W.isoDay(W.parseDay('2020-01-05')+249*7*86400000);s=W.build(flat,{price:70,date:lastSun});assert.equal(s.n,249);assert.equal(s.price[249],70);
// a live price of 0 or missing is ignored in favor of the saved latest
s=W.build(flat,{price:0,date:'2030-01-01'});assert.equal(s.current.date,flat.latest.date);
// shareAtOrBelow and zone stats on a ramp
const ramp={firstWeek:'2010-08-22',weekly:Array.from({length:400},(_,i)=>1+i),latest:{date:'2018-04-01',price:401}};s=W.build(ramp,null);
const t=s.n-s.firstMa+1;assert.equal(W.shareAtOrBelow(s,100),1);assert.equal(W.shareAtOrBelow(s,0),0);near(W.shareAtOrBelow(s,s.mult[s.n]),1/t);near(W.shareAtOrBelow(s,s.mult[s.firstMa+10]),1-10/t);
const zs=W.zoneStats(s);assert.equal(zs.reduce((a,z)=>a+z.weeks,0),t);near(zs.reduce((a,z)=>a+z.share,0),1,1e-9);
// the 52-week change only uses weeks with a full year after
for(const z of zs)assert.ok(z.n<=z.weeks);
// below-1.0x spells
const dip={firstWeek:'2010-08-22',weekly:Array(210).fill(100).concat([50,50,50],Array(10).fill(100)),latest:{date:'2010-08-22',price:100}};s=W.build(dip,null);const b=W.belowOne(s);assert.ok(b.length>=1&&b[0].weeks>=3&&b[0].low<1,JSON.stringify(b));
// real data integrity: Sunday-aligned, one price per week since 2010-08-22, no zeros, newest day recent and consistent
assert.equal(data.firstWeek,'2010-08-22');assert.equal(new Date(data.firstWeek+'T00:00:00Z').getUTCDay(),0);
assert.ok(data.weekly.length>=848&&data.weekly.every(p=>p>0&&isFinite(p)));
const lastWeek=W.isoDay(W.parseDay(data.firstWeek)+(data.weekly.length-1)*7*86400000);assert.ok(lastWeek<=data.latest.date&&W.parseDay(data.latest.date)-W.parseDay(lastWeek)<7*86400000,'latest day within a week of last Sunday');
assert.ok(data.latest.price>0&&data.updated===data.latest.date&&/^https:\/\//.test(data.sourceUrl)&&/Blockchain\.com/.test(data.source));
// known history: bitcoin's first 200WMA week is in mid-2014 and the multiple dipped below 1.0x in 2022-23
s=W.build(data,null);assert.equal(W.isoDay(s.dates[s.firstMa]).slice(0,4),'2014');near(s.ma[s.firstMa],data.weekly.slice(0,200).reduce((a,x)=>a+x,0)/200,1e-6);
const spells=W.belowOne(s);assert.ok(spells.some(x=>W.isoDay(x.start).startsWith('2022')&&x.weeks>=20),'2022-23 spell');assert.ok(spells.some(x=>W.isoDay(x.start).startsWith('2020-03')));
assert.ok(W.zoneStats(s)[0].share>0.05&&W.zoneStats(s)[0].share<0.3);
console.log('ok');
