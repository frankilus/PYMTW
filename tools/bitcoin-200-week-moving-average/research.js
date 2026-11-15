/* Research helpers: completed saved observations only; no network or visitor data. */
(function(root){
'use strict';
var W = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.WMA;
function historicalSeries(data) {
  var cutoff=W.parseDay(data.latest.date), first=W.parseDay(data.firstWeek);
  var prices=data.weekly.filter(function(_,i){return first+i*7*86400000<cutoff;});
  if(prices.length<W.WEEKS) return null;
  var date=W.isoDay(first+(prices.length-1)*7*86400000);
  return W.build({firstWeek:data.firstWeek,weekly:prices,latest:{date:date,price:prices[prices.length-1]}},null);
}
function outcomes(s) {
  if(!s)return [];
  return W.ZONES.map(function(zone){
    var values=[],worstDip=0,stretches=0,previous=false;
    for(var i=s.firstMa;i+52<=s.n;i++){
      var inside=s.mult[i]>=zone.lo&&s.mult[i]<zone.hi;
      if(inside){
        if(!previous)stretches++;
        values.push(s.price[i+52]/s.price[i]-1);
        for(var j=i+1;j<=i+52;j++)worstDip=Math.min(worstDip,s.price[j]/s.price[i]-1);
      }
      previous=inside;
    }
    values.sort(function(a,b){return a-b;});
    var n=values.length;
    return {zone:zone,n:n,stretches:stretches,median:n?(n%2?values[(n-1)/2]:(values[n/2-1]+values[n/2])/2):null,worst:n?values[0]:null,interimLoss:n?worstDip:null};
  });
}
function period(s,start,end){
  var a=W.parseDay(start),b=W.parseDay(end),pts=[];
  for(var i=s.firstMa;i<=s.n;i++)if(s.dates[i]>=a&&s.dates[i]<=b)pts.push(i);
  if(!pts.length)return null;
  return {n:pts.length,below:pts.filter(function(i){return s.mult[i]<1;}).length,low:Math.min.apply(null,pts.map(function(i){return s.mult[i];})),high:Math.max.apply(null,pts.map(function(i){return s.mult[i];}))};
}
var api={historicalSeries:historicalSeries,outcomes:outcomes,period:period};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WMAResearch=api;
})(typeof window!=='undefined'?window:globalThis);
