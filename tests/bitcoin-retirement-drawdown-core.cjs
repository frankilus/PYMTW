// Bitcoin retirement drawdown planner model: 2026 IRS figures (Rev. Proc. 2025-32, NIIT, Pub 590-B Table III, RMD age 73/75), tax stacking, gross-up, scenarios and the safe-spend search.
const assert=require('node:assert/strict');const D=require('../tools/bitcoin-retirement-drawdown/core.js');
const near=(a,b,t=0.01,m)=>assert.ok(Math.abs(a-b)<=t,(m||'')+' '+a+' vs '+b);
// Rev. Proc. 2025-32 §4.01 tables: tax at the top of each bracket matches the IRS "plus" amounts
for(const [fs,x,tax] of [['mfj',24800,2480],['mfj',100800,11600],['mfj',211400,35932],['mfj',403550,82048],['mfj',512450,116896],['mfj',768700,206583.5],['hoh',17700,1770],['hoh',67450,7740],['hoh',105700,16155],['hoh',201750,39207],['hoh',256200,56631],['hoh',640600,191171],['single',12400,1240],['single',50400,5800],['single',105700,17966],['single',201775,41024],['single',256225,58448],['single',640600,192979.25]])near(D.ordinaryTax(fs,x),tax,0.01,fs+' '+x);
near(D.ordinaryTax('mfj',1e6),206583.5+0.37*(1e6-768700));
// standard deduction §4.14 and the extra amount at 65+
assert.deepEqual(D.STD,{mfj:32200,hoh:24150,single:16100});assert.equal(D.deduction('mfj',66),35500);assert.equal(D.deduction('single',65),18150);assert.equal(D.deduction('hoh',64),24150);
// 0%/15% capital gains thresholds §4.03 and NIIT
assert.deepEqual(D.LTCG,{mfj:[98900,613700],hoh:[66200,579600],single:[49450,545500]});assert.deepEqual(D.NIIT,{mfj:250000,hoh:200000,single:200000});assert.equal(D.NIIT_RATE,0.038);
// Uniform Lifetime Table spot checks and RMD age
assert.equal(D.divisor(73),26.5);assert.equal(D.divisor(75),24.6);assert.equal(D.divisor(80),20.2);assert.equal(D.divisor(95),8.9);assert.equal(D.divisor(100),6.4);assert.equal(D.divisor(125),2.0);
assert.equal(D.rmdAge(1959),73);assert.equal(D.rmdAge(1960),75);assert.equal(D.rmdAge(1955),73);
// Gains fill the 0% bracket exactly: MFJ with ordinary income equal to the deduction and $98,900 of gain owes nothing
let t=D.tax('mfj',32200,98900,60);assert.equal(t.total,0);near(t.gainAt0,98900);
// One more dollar of gain is taxed at 15%
t=D.tax('mfj',32200,98901,60);near(t.ltcg,0.15);
// Gains stack on ordinary income: single, $60,000 ordinary, $20,000 gain -> ordinary taxable 43,900, 0% room 5,550, 14,450 at 15%
t=D.tax('single',60000,20000,60);near(t.taxableOrdinary,43900);near(t.gainAt0,5550);near(t.ltcg,14450*0.15);near(t.ordinary,D.ordinaryTax('single',43900));
// NIIT only on MAGI above the threshold (not indexed)
t=D.tax('single',150000,100000,60);near(t.niit,0.038*50000);t=D.tax('mfj',100000,100000,60,2);near(t.niit,0,0.001,'NIIT threshold is not indexed but 200k < 250k');
// Bracket indexing doubles every bound when f=2
near(D.ordinaryTax('mfj',201600,2),23200);
const base={btc:2,btcPrice:100000,basis:60000,ira:600000,roth:50000,spend:70000,otherIncome:36000,otherAge:67,age:52,retireAge:60,planAge:95,filing:'mfj',btcGrowth:.10,iraReturn:.06,inflation:.03,order:'smart'};
const r=D.run(base),o=r.input;assert.equal(o.rmdStart,75);assert.equal(o.birthYear,1974);
// every retirement year meets its spending need net of federal tax, until depletion
for(const id of ['base','bear','badFirst','badLast','flat'])for(const row of r.scenarios[id].rows){if(!row.retired||row.shortfall)continue;const cash=row.other+row.iraDraw+row.sale+row.rothDraw;assert.ok(cash-row.tax>=row.need-0.05,id+' age '+row.age+' covers need');}
// spending is inflation-adjusted from today
const y60=r.scenarios.base.rows.find(x=>x.age===60);near(y60.need,70000*Math.pow(1.03,8),0.01);
// tax-smart order: tax-free 401(k)/IRA draw equals the indexed standard deduction in the first retirement year, and gains are taxed at 0%
near(y60.iraDraw,32200*Math.pow(1.03,8),0.01);near(y60.tax,0,0.01);
// RMDs start at 75 for someone born in 1974 and equal prior balance / Table III factor
const s=r.scenarios.base,y74=s.rows.find(x=>x.age===74),y75=s.rows.find(x=>x.age===75);assert.equal(y74.rmd,0);near(y75.rmd,y74.endIra/24.6,0.01);
// proportional basis: selling half the coins keeps the average basis per coin
const one=D.simulate(D.clean({...base,btc:1,basis:50000,ira:0,roth:0,otherIncome:0,age:60,retireAge:60,planAge:61,spend:20000,btcGrowth:0,inflation:0}),'base');const y=one.rows[0];near(y.gain,y.sale*0.5,0.01);
// scenario paths: the crash is 75% at retirement and back on the base path four years later; bad-first and bad-last end at the same price as base
const pb=D.pricePath(o,'base'),pc=D.pricePath(o,'bear'),pf=D.pricePath(o,'badFirst'),pl=D.pricePath(o,'badLast'),pz=D.pricePath(o,'flat'),k=8,n=43;
near(pc[k],pb[k]*0.25,1e-6);near(pc[k+4],pb[k+4],1e-6);near(pf[n],pb[n],1e-3);near(pl[n],pb[n],1e-3);near(pf[k+1],pf[k]*0.6,1e-6);near(pz[n],100000*Math.pow(1.03,n),1e-3);
// bad years first hurts more than bad years last (sequence-of-returns risk)
assert.ok(!r.scenarios.badFirst.lasts&&r.scenarios.badLast.lasts);
// safe spend: lasts through planAge in both stress scenarios, and $500 more does not
assert.ok(r.safe>0);for(const id of ['bear','badFirst'])assert.ok(D.simulate(o,id,r.safe).lasts,id);assert.ok(!['bear','badFirst'].every(id=>D.simulate(o,id,r.safe+500).lasts));
// with nothing saved and no income, nothing is safe; with only other income covering spending, it lasts
assert.equal(D.safeSpend(D.clean({...base,btc:0,ira:0,roth:0,otherIncome:0})),0);
assert.ok(D.simulate(D.clean({...base,btc:0,ira:0,roth:0,otherIncome:80000,otherAge:60,spend:40000}),'base').lasts);
// bad input is clamped, never NaN
const bad=D.run({btc:'x',btcPrice:-5,age:200,retireAge:10,planAge:5,filing:'zz',btcGrowth:9});assert.ok(isFinite(bad.safe));assert.equal(bad.input.filing,'single');
console.log('ok: 2026 IRS brackets, deduction, 0/15/20 thresholds, NIIT, Table III, RMD age, stacking, gross-up, scenarios and safe spend');
