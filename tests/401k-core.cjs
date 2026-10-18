const assert=require('node:assert/strict'),D=require('../tools/explain-my-401k/core.js');let n=0;
const example={pay:'80000',rate:'4',match:'simple',m1:'50',cap1:'6',admin:'60',adminPct:'0',employer:'20000',vest:'60',funds:[{name:'Stocks',kind:'us',balance:30000,fee:.05},{name:'International',kind:'international',balance:15000,fee:.08},{name:'Bonds',kind:'bond',balance:15000,fee:.1}]};
function test(name,f){f();n++;console.log('PASS',name);}
function run(extra={}){return D.calculate({...example,...extra});}
test('Example: contributions, match, fee dollars, weighted ratio and vesting',()=>{const r=run();assert.equal(r.employee,3200);assert.equal(r.match,1600);assert.equal(r.maxMatch,2400);assert.equal(r.gap,800);assert.equal(r.extra,1600);assert.equal(r.total,60000);assert.equal(r.fundCost,42);assert.equal(r.feeTotal,102);assert.ok(Math.abs(r.weighted-.07)<1e-12);assert.equal(r.vested,12000);});
test('Match caps at band, including excess contributions',()=>{assert.equal(run({rate:10}).match,2400);assert.equal(run({rate:10}).gap,0);});
test('Two tier matching applies sequential bands',()=>{const i={match:'tiered',cap1:3,m1:100,cap2:2,m2:50};assert.equal(run({...i,rate:2}).match,1600);assert.equal(run({...i,rate:4}).match,2800);assert.equal(run({...i,rate:5}).match,3200);assert.equal(run({...i,rate:10}).match,3200);});
test('Unknown match distinct from no match and zero contributions',()=>{assert.equal(run({match:'unknown'}).match,null);assert.equal(run({match:'none'}).match,0);assert.equal(run({rate:0}).match,0);assert.equal(run({rate:0}).gap,2400);});
test('Investments-only and contributions-only work',()=>{assert.equal(run({pay:'',rate:''}).match,null);assert.equal(run({funds:[],employer:'',vest:''}).total,0);});
test('Unknown fee coverage uses only known holdings',()=>{const r=run({funds:[{kind:'us',balance:20000,fee:.5},{kind:'bond',balance:40000,fee:''}]});assert.equal(r.knownBalance,20000);assert.equal(r.fundCost,100);assert.equal(r.weighted,.5);assert.equal(r.unknown,1);assert.equal(r.allFeesKnown,false);});
test('Zero fees are known; blank plan fee stays unknown',()=>{const r=run({admin:0,adminPct:0,funds:[{kind:'cash',balance:60000,fee:0}]});assert.equal(r.allFeesKnown,true);assert.equal(r.feeTotal,0);assert.equal(run({admin:''}).allFeesKnown,false);});
test('Asset-based fees plus flat fees without fund double count',()=>{assert.equal(run({adminPct:.25}).feeTotal,252);});
test('Zero balances produce no NaN, unknown ratios preserved',()=>{const r=run({funds:[{kind:'other',balance:0,fee:''}],employer:'',vest:''});assert.equal(r.weighted,null);assert.equal(r.total,0);assert.equal(r.allFeesKnown,false);});
test('Vesting accepts zero and 100%; rounds fractional cents',()=>{assert.equal(run({vest:0}).vested,0);assert.equal(run({vest:100}).vested,20000);assert.equal(run({employer:99.99,vest:33.33}).vested,33.33);});
test('Incomplete pay and vesting inputs rejected',()=>{for(const i of [{pay:''},{rate:''},{employer:''},{vest:''}])assert.throws(()=>run(i));});
test('Malformed negative excessive and overprecision amounts rejected',()=>{for(const pay of ['-1','Infinity','12,34','1e4','10000001','1.001'])assert.throws(()=>run({pay}));assert.throws(()=>run({rate:101}));assert.throws(()=>run({vest:101}));assert.throws(()=>run({pay:0}));});
test('Invalid bands, classifications and oversized employer balance rejected',()=>{for(const i of [{cap1:0},{m1:0},{match:'tiered',cap1:99,cap2:2,m2:50},{match:'bad'},{employer:70000},{funds:[{kind:'bad',balance:5}]}])assert.throws(()=>run(i));});
test('No entries and missing fund balance rejected',()=>{assert.throws(()=>D.calculate({funds:[]}));assert.throws(()=>run({funds:[{name:'Fund',kind:'us',balance:''}]}));});
test('Limits 20 funds; unknown types do not infer allocations',()=>{assert.throws(()=>run({funds:Array.from({length:21},()=>({kind:'us',balance:1}))}));assert.equal(run({employer:'',vest:'',funds:[{kind:'blend',balance:1}]}).mix.blend,1);});
test('Formatted currency numbers and leading decimals accepted',()=>{assert.equal(run({pay:'80,000.00'}).employee,3200);assert.equal(D.number('.05','ratio'),.05);});
console.log(n+' calculation scenarios passed');
