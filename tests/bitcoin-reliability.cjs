const assert = require('node:assert/strict');
const fs = require('node:fs');
const {calculate} = require('../dca-core.js');
const prices = require('../dca-data.js');
const legacy=require('node:child_process').execFileSync('git',['show','48f4f8227785bd41085d1c9ea09cf8ac86322c44:dca.js'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'});
assert.deepEqual(prices,JSON.parse(legacy.match(/const BTC_PRICES = (\{[\s\S]*?\});/)[1]),'Legacy price values must stay unchanged');
const flat = Object.fromEntries(Array.from({length:13},(_,i)=>[`${2020+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`,100]));
let r=calculate(flat,{initial:1000,monthly:200,start:'2020-01',years:1});
assert.equal(r.invested,3400); assert.equal(r.btc,34); assert.equal(r.value,3400); assert.equal(r.roi,0); assert.equal(r.months,12); assert.equal(r.truncated,false);
const rising={...flat,'2021-01':200};r=calculate(rising,{initial:1000,monthly:200,start:'2020-01',years:1});
assert.equal(r.invested,3400);assert.equal(r.btc,33);assert.equal(r.value,6600);assert.equal(r.averagePrice,3400/33);assert.equal(r.vsLump,(6600-6800)/6800*100);
for(const input of [{initial:0,monthly:0},{initial:-1,monthly:1},{initial:'',monthly:1},{initial:Infinity,monthly:1},{initial:1,monthly:NaN},{initial:1,monthly:1,years:0},{initial:1,monthly:1,years:1.5},{initial:1,monthly:1,start:'2026-13'}])assert.throws(()=>calculate(prices,{start:'2020-01',years:1,...input}));
for(const start of ['2010-12','2026-04','2026-03']) assert.throws(()=>calculate(prices,{initial:1000,monthly:200,start,years:1}));
r=calculate(prices,{initial:1000,monthly:200,start:'2026-01',years:10});assert.equal(r.end,'2026-03');assert.equal(r.requestedEnd,'2036-01');assert.equal(r.truncated,true);assert.equal(r.invested,1400);assert.ok(Math.abs(r.value-(1000/98000+200/95000+200/92000)*92000)<1e-8);
for(const amounts of [{initial:100,monthly:0},{initial:0,monthly:100}]){r=calculate(flat,{...amounts,start:'2020-01',years:1});assert.equal(r.roi,0);assert.equal(r.vsLump,0);}
const missing={...flat};delete missing['2020-05'];assert.throws(()=>calculate(missing,{initial:100,monthly:10,start:'2020-01',years:1}),/missing/);
const csv=fs.readFileSync(require.resolve('../assets/dca-prices.csv'),'utf8').trim().split('\n').slice(1);assert.equal(csv.length,Object.keys(prices).length);for(const row of csv){const[k,v]=row.split(',');assert.equal(Number(v),prices[k]);}
console.log('Bitcoin DCA: timing, known-value returns, zero/invalid inputs, date boundaries, truncation, missing prices and CSV parity passed.');
