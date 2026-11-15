const assert=require('node:assert/strict');
const W=require('../tools/bitcoin-200-week-moving-average/core.js');
const R=require('../tools/bitcoin-200-week-moving-average/research.js');
const raw=require('../tools/bitcoin-200-week-moving-average/data/weekly.json');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' vs '+b);
function saved(prices){const firstWeek='2020-01-05';const latestDate=W.isoDay(W.parseDay(firstWeek)+(prices.length-1)*7*86400000);return {firstWeek,weekly:prices,latest:{date:latestDate,price:prices.at(-1)},updated:latestDate};}
// A provisional Sunday value must not affect historical outcomes.
let d=saved(Array(300).fill(100));d.weekly[299]=10000;d.latest.price=10000;
let h=R.historicalSeries(d);assert.equal(h.price.length,299);assert.ok(h.price.every(x=>x===100));
let z=R.outcomes(h);let deep=z.find(x=>x.zone.id==='deep');
assert.equal(deep.n,48);assert.equal(deep.stretches,1);near(deep.median,0);near(deep.worst,0);near(deep.interimLoss,0);
for(const other of z.filter(x=>x.zone.id!=='deep')){assert.equal(other.n,0);assert.equal(other.median,null);}
// A positive 52-week finish can conceal a large interim loss.
let prices=Array(300).fill(100);prices[205]=50;for(let i=206;i<prices.length;i++)prices[i]=120;
h=R.historicalSeries(saved(prices));deep=R.outcomes(h).find(x=>x.zone.id==='deep');
near(deep.interimLoss,-.5);assert.ok(deep.worst>=0);assert.ok(deep.n>0);
// Every eligible observation has exactly 52 later completed observations; recent ones are excluded.
assert.equal(R.outcomes(h).reduce((n,x)=>n+x.n,0),h.n-h.firstMa-52+1);
const range=R.period(h,W.isoDay(h.dates[200]),W.isoDay(h.dates[206]));assert.equal(range.n,7);assert.equal(range.below,1);assert.ok(range.low<1&&range.high>1);
// Real saved series: no live quote or newest saved day; real drawdown appears in the period summary.
h=R.historicalSeries(raw);assert.ok(h.dates.at(-1)<W.parseDay(raw.latest.date));
const episode=R.period(h,'2022-06-01','2023-03-31');assert.ok(episode.below>=30);assert.ok(episode.low<1);
for(const s of R.outcomes(h)){assert.ok(s.stretches<=s.n);if(s.n){assert.ok(s.worst<=s.median);assert.ok(s.interimLoss<=0);}}
console.log('PASS research outcomes: provisional exclusion, full follow-up, overlapping sample counts, interim losses and historical periods.');
