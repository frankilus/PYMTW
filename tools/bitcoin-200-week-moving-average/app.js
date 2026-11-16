/* Page-local interactive research UI. Public data only; original 200-week model retained. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s);}, Z=WMA.ZONES, NS='http://www.w3.org/2000/svg';
var BAND_COLORS={deep:'#b9aa8b',fair:'#ae8b4b',stretched:'#b77040',hot:'#914b32'};
var data,series,history,range='5',view='price',bands=false,moment=null,hoverIdx=null,liveInfo=null;
var moments={
 expansion:{title:'2017–18 · Expansion & reversal',start:'2016-01-01',end:'2019-07-01',from:'2017-01-01',to:'2018-12-31',note:'A wide distance from the average can persist before narrowing. A high multiple alone does not tell you when a reversal will begin.'},
 shock:{title:'March 2020 · A sharp shock',start:'2019-07-01',end:'2021-04-01',from:'2020-03-01',to:'2020-04-30',note:'A sudden fall can carry price below a slow-moving average. Compare this brief shock with the much longer period below the line in 2022–23.'},
 drawdown:{title:'2022–23 · A longer test',start:'2021-11-01',end:'2023-12-31',from:'2022-06-01',to:'2023-03-31',note:'Price spent extended stretches below the average. Reaching a historical reference did not guarantee an immediate recovery or prevent further losses.'}
};
function usd(n){return '$'+Math.round(n).toLocaleString('en-US');}
function pct(n){return n===null?'Not enough history':(n>0?'+':n<0?'−':'')+Math.abs(n*100).toFixed(1)+'%';}
function day(ms){return new Date(ms).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});}
function stamp(d){return d.toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});}
function node(name,attrs){var e=document.createElementNS(NS,name);Object.keys(attrs||{}).forEach(function(k){e.setAttribute(k,attrs[k]);});return e;}
function rangeLabel(z){return z.lo===0?'Below '+z.hi+'×':!isFinite(z.hi)?z.lo+'× or more':z.lo+'× to under '+z.hi+'×';}
function asof(){
 var date=day(WMA.parseDay(data.updated||data.latest.date));
 var line=liveInfo?'Coinbase snapshot fetched '+liveInfo+'; history as of '+date+'.':'Saved daily price and history as of '+date+'. Live quote unavailable.';
 var age=(Date.now()-WMA.parseDay(data.updated))/86400000;
 return line+(age>4?' History is more than three days old; interpret the reading cautiously.':'');
}
function scaleMarkup(c){
 var lo=.5,hi=5;
 function position(m){return Math.log(Math.max(lo,Math.min(hi,m))/lo)/Math.log(hi/lo)*100;}
 var edges=[lo,1.1,2,3.5,hi],segments='',ticks='';
 for(var i=0;i<edges.length-1;i++)segments+='<span style="width:'+(position(edges[i+1])-position(edges[i])).toFixed(3)+'%;background:'+BAND_COLORS[Z[i].id]+'"></span>';
 edges.forEach(function(m,i){ticks+='<span style="left:'+position(m).toFixed(3)+'%">'+(i===0?'≤':i===edges.length-1?'≥':'')+m+'×</span>';});
 var left=position(c.mult).toFixed(3),label=c.mult.toFixed(2)+'×';
 var notes={deep:'Some past bear-market lows occurred near or below this average. Price can still fall further, and lower multiples do not guarantee future gains.',fair:'Above the long-term average. This describes a relative price range, not an estimate of fair value.',stretched:'At least twice the long-term average. A high multiple describes distance; it cannot time a reversal.',hot:'At least 3.5 times the long-term average. Historical extremes are context, not a sell signal.'};
 return '<section class="wm-scale" aria-labelledby="wm-scale-title"><div class="wm-scale-heading"><h3 id="wm-scale-title">Where today sits</h3><span>Price ÷ 200-week average</span></div><div class="wm-scale-gauge" role="img" aria-label="Today '+label+', '+c.zone.name+'. Descriptive ranges: below 1.1 times, 1.1 to under 2 times, 2 to under 3.5 times, and 3.5 times or more. The scale is logarithmic, from 0.5 to 5 times; values beyond the ends are pinned to the edge."><span class="wm-scale-marker" style="left:clamp(48px,'+left+'%,calc(100% - 48px))">Today '+label+'</span><span class="wm-scale-pointer" style="left:'+left+'%" aria-hidden="true"></span><div class="wm-scale-bar" aria-hidden="true">'+segments+'</div><div class="wm-scale-ticks" aria-hidden="true">'+ticks+'</div></div><ul class="wm-scale-legend">'+Z.map(function(z){return '<li'+(z.id===c.zone.id?' class="is-current"':'')+'><span class="wm-scale-key" style="background:'+BAND_COLORS[z.id]+'" aria-hidden="true"></span><span><strong>'+z.name+'</strong><small>'+rangeLabel(z)+'</small></span></li>';}).join('')+'</ul><p class="wm-scale-context">'+notes[c.zone.id]+' <a href="#wm-history" data-scale-history>See historical results ↓</a></p></section>';
}
function renderToday(){
 var c=series.current,below=c.pct<0,amount=Math.abs(c.pct*100);
 var difference=amount<0.05?'≈ 0%':(below?'−':'+')+amount.toFixed(1)+'%';
 $('#wm-today').innerHTML='<dl class="wm-snapshot-grid"><div class="wm-metric"><dt>Bitcoin price</dt><dd id="wm-price">'+usd(c.price)+'</dd><dd>'+(liveInfo?'Coinbase snapshot':'Saved daily average')+'</dd></div><div class="wm-metric"><dt>200-week average</dt><dd id="wm-ma">'+usd(c.ma)+'</dd><dd>Current week provisional</dd></div><div class="wm-metric"><dt>'+(amount<0.05?'At':below?'Below':'Above')+' the average</dt><dd>'+difference+'</dd><dd id="wm-mult">'+c.mult.toFixed(2)+'× the average</dd></div></dl>'+scaleMarkup(c)+'<p class="wm-asof" id="wm-asof">'+asof()+'</p>';
}
function renderOutcomes(){
 if(!history||history.n<history.firstMa+52){$('#wm-history-period').textContent='There is not enough completed history for a 52-week comparison.';return;}
 var lastStart=history.n-52;
 $('#wm-history-period').textContent='Eligible starting observations: '+day(history.dates[history.firstMa])+' – '+day(history.dates[lastStart])+'. Outcomes through '+day(history.dates[history.n])+'. Newer readings do not yet have a full 52-week follow-up.';
 $('#wm-zones').innerHTML=WMAResearch.outcomes(history).map(function(s){
  return '<article class="wm-zone"><h3>'+s.zone.name+'</h3><p class="rng">'+rangeLabel(s.zone)+'</p><dl><div><dt>Eligible weekly observations</dt><dd>'+s.n+'</dd></div><div><dt>Observed stretches</dt><dd>'+s.stretches+'</dd></div><div><dt>Median 52-week return</dt><dd>'+pct(s.median)+'</dd></div><div><dt>Worst 52-week return</dt><dd>'+pct(s.worst)+'</dd></div><div><dt>Worst drop along the way</dt><dd class="wm-loss">'+pct(s.interimLoss)+'</dd></div></dl></article>';
 }).join('');
}
function visible(){
 var a=0,b=series.n,start=range==='all'?series.dates[0]:series.dates[b]-Number(range)*365.25*86400000;
 if(moment){start=WMA.parseDay(moment.start);var end=WMA.parseDay(moment.end);while(b>0&&series.dates[b]>end)b--;}
 while(a<b&&series.dates[a]<start)a++;
 if(view==='distance')a=Math.max(a,series.firstMa);
 return [a,b];
}
function labelPrice(n){if(n>=1e6)return '$'+n/1e6+'m';if(n>=1000)return '$'+n/1000+'k';if(n>=1)return '$'+n;return '$'+n.toFixed(n<.1?2:1);}
function draw(){
 if(!series)return;
 var host=$('#wm-chart'), width=Math.max(260,host.clientWidth),small=width<600,H=small?300:405;
 var ml=small?43:53,mr=16,mt=16,mb=29,pw=width-ml-mr,ph=H-mt-mb,s=series,v=visible(),a=v[0],b=v[1];
 if(b<=a)return;
 var min=Infinity,max=0;
 for(var i=a;i<=b;i++){
  var val=view==='price'?s.price[i]:s.mult[i];
  if(val>0){min=Math.min(min,val);max=Math.max(max,val);}
  if(view==='price'&&s.ma[i]){min=Math.min(min,s.ma[i]);max=Math.max(max,s.ma[i]);if(bands){min=Math.min(min,s.ma[i]*.5);max=Math.max(max,s.ma[i]*3.5);}}
 }
 if(view==='distance'){min=Math.min(min,1);max=Math.max(max,1);if(bands){min=Math.min(min,.5);max=Math.max(max,3.5);}}
 min/=1.16;max*=1.16;
 var lm=Math.log10(min),lx=Math.log10(max),t0=s.dates[a],t1=s.dates[b];
 function X(t){return ml+(t-t0)/(t1-t0)*pw;}
 function Y(p){return mt+(lx-Math.log10(Math.max(p,min)))/(lx-lm)*ph;}
 function path(key){var d='';for(var k=a;k<=b;k++){var value=s[key][k];if(!(value>0))continue;d+=(d?'L':'M')+X(s.dates[k]).toFixed(1)+' '+Y(value).toFixed(1);}return d;}
 var svg=node('svg',{viewBox:'0 0 '+width+' '+H,role:'img',tabindex:'0','aria-labelledby':'wm-chart-title wm-chart-description'});
 var title=node('title',{id:'wm-chart-title'});title.textContent=view==='price'?'Bitcoin price and 200-week average, log scale':'Bitcoin price divided by its 200-week average, log scale';svg.appendChild(title);
 var desc=node('desc',{id:'wm-chart-description'});desc.textContent='From '+day(t0)+' to '+day(t1)+'. '+(view==='distance'?'The dashed 1× line means price equals the average. ':'')+'Use Left and Right arrow keys to inspect each observation; Home and End jump to the first and last.';svg.appendChild(desc);
 var defs=node('defs'),clip=node('clipPath',{id:'wm-clip'});clip.appendChild(node('rect',{x:ml,y:mt,width:pw,height:ph}));defs.appendChild(clip);svg.appendChild(defs);
 var plot=node('g',{'clip-path':'url(#wm-clip)'});
 if(bands){
  Z.forEach(function(z){
   var lower=z.lo||.000001,upper=isFinite(z.hi)?z.hi:1e12;
   if(view==='distance'){
    var topY=Math.max(mt,Y(upper)),bottomY=Math.min(mt+ph,Y(lower));
    if(bottomY>topY)plot.appendChild(node('rect',{x:ml,y:topY,width:pw,height:bottomY-topY,fill:BAND_COLORS[z.id],'fill-opacity':'.07'}));
   }else{
    var front=[],back=[];
    for(var k=Math.max(a,s.firstMa);k<=b;k++)front.push(X(s.dates[k]).toFixed(1)+','+Y(s.ma[k]*upper).toFixed(1));
    for(var j=b;j>=Math.max(a,s.firstMa);j--)back.push(X(s.dates[j]).toFixed(1)+','+Y(s.ma[j]*lower).toFixed(1));
    if(front.length>1)plot.appendChild(node('polygon',{points:front.concat(back).join(' '),fill:BAND_COLORS[z.id],'fill-opacity':'.07'}));
   }
  });
 }
 if(moment){var x0=Math.max(ml,X(WMA.parseDay(moment.from))),x1=Math.min(ml+pw,X(WMA.parseDay(moment.to)));if(x1>x0)plot.appendChild(node('rect',{x:x0,y:mt,width:x1-x0,height:ph,fill:'#927139','fill-opacity':'.09'}));}
 var grid=node('g');
 function tick(n){
  if(n<min||n>max)return;
  var yy=Y(n),ref=view==='distance'&&Math.abs(n-1)<.00001;
  grid.appendChild(node('line',{x1:ml,x2:ml+pw,y1:yy,y2:yy,stroke:ref?'#927139':'#e8e8df','stroke-width':ref?1.5:1,'stroke-dasharray':ref?'5 4':'none'}));
  var tx=node('text',{x:ml-7,y:yy+4,'text-anchor':'end'});tx.textContent=view==='price'?labelPrice(n):n+'×';grid.appendChild(tx);
 }
 var ticks=[];
 for(var exp=Math.floor(lm);exp<=Math.ceil(lx);exp++)[1,2,5].forEach(function(k){var n=k*Math.pow(10,exp);if(n>=min&&n<=max)ticks.push(n);});
 if(ticks.length>7)ticks=ticks.filter(function(_,i){return i%2===0;});
 if(view==='distance'&&!ticks.some(function(n){return Math.abs(n-1)<.00001;}))ticks.push(1);
 ticks.forEach(tick);
 var y0=new Date(t0).getUTCFullYear(),y1=new Date(t1).getUTCFullYear(),step=Math.max(1,Math.ceil((y1-y0)/(small?4:9)));
 for(var yr=y0;yr<=y1;yr++){
  if((y1-yr)%step)continue;
  var xx=X(Date.UTC(yr,0,1));if(xx<ml+12||xx>ml+pw-12)continue;
  grid.appendChild(node('line',{x1:xx,x2:xx,y1:mt,y2:mt+ph,stroke:'#f1f0e9'}));
  var tx=node('text',{x:xx,y:H-7,'text-anchor':'middle'});tx.textContent=yr;grid.appendChild(tx);
 }
 svg.appendChild(plot);svg.appendChild(grid);
 var lines=node('g',{'clip-path':'url(#wm-clip)'});
 if(view==='price')lines.appendChild(node('path',{d:path('ma'),fill:'none',stroke:'#927139','stroke-width':2.5,'stroke-linejoin':'round'}));
 lines.appendChild(node('path',{d:path(view==='price'?'price':'mult'),fill:'none',stroke:'#29261f','stroke-width':1.9,'stroke-linejoin':'round'}));
 var lastY=Y(view==='price'?s.price[b]:s.mult[b]);lines.appendChild(node('circle',{cx:X(s.dates[b]),cy:lastY,r:4,fill:'#29261f',stroke:'white','stroke-width':1.5}));
 svg.appendChild(lines);
 var cross=node('line',{y1:mt,y2:mt+ph,stroke:'#6f7a78','stroke-dasharray':'3 4',visibility:'hidden'}),dot=node('circle',{r:4,fill:'white',stroke:'#29261f','stroke-width':2,visibility:'hidden'});svg.appendChild(cross);svg.appendChild(dot);
 function show(idx){
  idx=Math.max(a,Math.min(b,idx));hoverIdx=idx;
  var value=view==='price'?s.price[idx]:s.mult[idx],xx=X(s.dates[idx]);
  cross.setAttribute('x1',xx);cross.setAttribute('x2',xx);cross.setAttribute('visibility','visible');dot.setAttribute('cx',xx);dot.setAttribute('cy',Y(value));dot.setAttribute('visibility','visible');
  var current=idx===s.n;
  var line='<b>'+day(s.dates[idx])+(current?' · provisional snapshot':' · Sunday sample')+'</b> · Bitcoin <b>'+usd(s.price[idx])+'</b>';
  line+=s.ma[idx]?' · average <b>'+usd(s.ma[idx])+'</b> · <b>'+s.mult[idx].toFixed(2)+'×</b> ('+pct(s.mult[idx]-1)+')':' · 200 observations needed before an average is available';
  $('#wm-hover').innerHTML=line;
 }
 function indexAt(ev){var rect=svg.getBoundingClientRect(),xx=(ev.clientX-rect.left)/rect.width*width,t=t0+(xx-ml)/pw*(t1-t0),best=a;for(var k=a+1;k<=b;k++)if(Math.abs(s.dates[k]-t)<Math.abs(s.dates[best]-t))best=k;return best;}
 svg.addEventListener('pointermove',function(e){show(indexAt(e));});svg.addEventListener('pointerdown',function(e){show(indexAt(e));});
 svg.addEventListener('keydown',function(e){var delta=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='Home'?-99999:e.key==='End'?99999:0;if(!delta)return;e.preventDefault();show((hoverIdx===null?b:hoverIdx)+delta);});
 host.innerHTML='';host.appendChild(svg);host.setAttribute('aria-busy','false');
 if(hoverIdx!==null&&hoverIdx>=a&&hoverIdx<=b)show(hoverIdx);
 $('#chart-h').textContent=moment?moment.title:'Price, with perspective.';
 var viewNote=view==='price'?'Bitcoin’s price alongside its 200-week average. Logarithmic scale: equal percentage moves take up equal space.':'Price divided by its 200-week average. 1× means equal to the average; 2× means double. Logarithmic scale.';
 $('#wm-view-note').textContent=(moment?moment.note+' ':'')+viewNote;
 $('#wm-legend').innerHTML=view==='price'?'<span><i class="wm-price-swatch"></i>Bitcoin price</span><span><i class="wm-average-swatch"></i>200-week average</span>':'<span><i class="wm-price-swatch"></i>Price ÷ average</span><span><i class="wm-reference-swatch"></i>1× · equal to the average</span>';
 if(bands)$('#wm-legend').innerHTML+=Z.map(function(z){return '<span><i class="wm-band-key" style="background:'+BAND_COLORS[z.id]+'"></i>'+z.name+'</span>';}).join('');
}
function resetHover(){hoverIdx=null;$('#wm-hover').textContent='Hover or tap to inspect a week. Keyboard: focus the chart and use the arrow keys.';}
function clearMoment(){moment=null;$('#wm-reset').hidden=true;$('#wm-moment-detail').hidden=true;document.querySelectorAll('[data-moment]').forEach(function(b){b.setAttribute('aria-pressed','false');});}
function selectMoment(id){
 if(!series)return;
 moment=moments[id];resetHover();$('#wm-reset').hidden=false;document.querySelectorAll('[data-moment]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.moment===id));});document.querySelectorAll('input[name="wm-range"]').forEach(function(r){r.checked=false;});
 var facts=history?WMAResearch.period(history,moment.from,moment.to):null;
 var extra=facts?'<p>Highlighted window: '+facts.n+' completed Sunday samples; '+facts.below+' below 1×. Multiple ranged from '+facts.low.toFixed(2)+'× to '+facts.high.toFixed(2)+'×.</p>':'';
 $('#wm-moment-detail').innerHTML='<p><strong>'+moment.title+'.</strong> '+moment.note+'</p>'+extra+'<a href="#wm-chart-panel">Return to the highlighted chart ↑</a>';$('#wm-moment-detail').hidden=false;
 draw();
 $('#wm-chart-panel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
function start(live){series=WMA.build(data,live);renderToday();draw();$('#wm-controls').disabled=false;}
var tracked=false;
function afterFirst(){if(tracked)return;tracked=true;if(window.PT&&PT.track)PT.track('results-shown','Results shown');}
fetch('data/weekly.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){
 data=d;history=WMAResearch.historicalSeries(d);start(null);renderOutcomes();afterFirst();
 var ctl=typeof AbortController==='function'?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort();},5000);
 fetch('https://api.exchange.coinbase.com/products/BTC-USD/ticker',ctl?{signal:ctl.signal}:{}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(t){
  clearTimeout(to);var p=parseFloat(t.price),last=d.latest.price;if(!(p>0)||p<last*.5||p>last*2)return;
  var now=new Date(),date=now.toISOString().slice(0,10);if(date<d.latest.date)date=d.latest.date;liveInfo=stamp(now);start({price:p,date:date});
 }).catch(function(){clearTimeout(to);});
}).catch(function(){var loading=$('#wm-loading');if(loading)loading.textContent='Price history could not be loaded. Please reload to try again; the explanations and sources remain available.';$('#wm-chart').setAttribute('aria-busy','false');});
$('#wm-today').addEventListener('click',function(e){if(e.target.closest('[data-scale-history]'))$('#wm-history').open=true;});
document.querySelectorAll('input[name="wm-view"]').forEach(function(r){r.addEventListener('change',function(){view=r.value;resetHover();draw();});});
document.querySelectorAll('input[name="wm-range"]').forEach(function(r){r.addEventListener('change',function(){range=r.value;clearMoment();resetHover();draw();});});
$('#wm-bands').addEventListener('change',function(e){bands=e.target.checked;draw();});
document.querySelectorAll('[data-moment]').forEach(function(b){b.addEventListener('click',function(){selectMoment(b.dataset.moment);});});
$('#wm-reset').addEventListener('click',function(){clearMoment();range='5';document.querySelector('input[name="wm-range"][value="5"]').checked=true;resetHover();draw();});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(draw,120);});
})();
