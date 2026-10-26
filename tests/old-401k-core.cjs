// Old 401(k) guide: cash-out vs. rollover math (pure functions, no browser).
const assert=require('node:assert/strict');const K=require('../tools/guides/old-401k/calc.js');
const near=(a,b,m)=>assert.ok(Math.abs(a-b)<.005,`${m||''} ${a} ≠ ${b}`);
let r=K.cashOut({balance:50000,age:40,fed:.22,state:.05,rule55:false});
near(r.penalty,5000,'penalty');near(r.fed,11000,'fed');near(r.state,2500,'state');near(r.net,31500,'net');near(r.cost,18500,'cost');
near(r.withheld,10000,'withheld');near(r.check,40000,'check');near(r.makeUp,10000,'makeUp');near(r.lostShare,.37,'share');near(r.rollover.keeps,50000,'rollover');
assert.equal(r.penaltyApplies,true);
// Rule of 55 and 59½ remove only the 10% additional tax
r=K.cashOut({balance:50000,age:56,fed:.22,state:.05,rule55:true});near(r.penalty,0);near(r.net,36500);
r=K.cashOut({balance:50000,age:56,fed:.22,state:.05,rule55:false});near(r.penalty,5000);
r=K.cashOut({balance:50000,age:59.5,fed:.22,state:0});near(r.penalty,0);near(r.net,39000);
r=K.cashOut({balance:50000,age:59,fed:.22,state:0});near(r.penalty,5000);
// bad input is clamped, never NaN
r=K.cashOut({balance:'abc',age:NaN,fed:9,state:-1});assert.ok(Object.values(r).every(v=>typeof v!=='number'||isFinite(v)));near(r.net,0);
r=K.cashOut({balance:-500,age:30,fed:.12,state:.03});near(r.balance,0);near(r.lostShare,0);
// pure: no network/storage references in the calculator source
const src=require('node:fs').readFileSync(require.resolve('../tools/guides/old-401k/calc.js'),'utf8');
for(const bad of ['fetch(','XMLHttpRequest','localStorage','sessionStorage','document.cookie','sendBeacon','location'])assert.ok(!src.includes(bad),bad);
console.log('PASS old-401k core: $50k at 40 (22%/5%) → $5,000 + $11,000 + $2,500, keep $31,500; 20% withholding, Rule of 55, 59½, input clamping, no network/storage.');
