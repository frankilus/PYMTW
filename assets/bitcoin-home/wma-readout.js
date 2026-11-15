/* Homepage context panel. Uses the tracker's unchanged model and public data.
   Relative price is historical context, not a valuation or a trading signal. */
(function () {
  var section = document.getElementById('when-to-buy');
  if (!section || !window.WMA) return;
  var lastSeries = null;
  var TICK = 'https://api.exchange.coinbase.com/products/BTC-USD/ticker';
  function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function historyDate(data) {
    var ms = Date.parse(data.updated + 'T00:00:00Z');
    return isFinite(ms) ? new Date(ms).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : '';
  }
  function asofText(data, live) {
    var hist = historyDate(data);
    if (!live) return 'Saved daily price and weekly history as of ' + hist + '. Live price unavailable.';
    var stamp = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date());
    return 'Price live as of ' + stamp + '; weekly history as of ' + hist + '.';
  }
  function relative(pct) {
    var magnitude = Math.abs(pct * 100);
    if (magnitude < 0.05) return 'Approximately equal to its 200-week average';
    return 'About ' + magnitude.toFixed(1) + '% ' + (pct < 0 ? 'below' : 'above') + ' its 200-week average';
  }
  function rangeText(z) {
    if (!z.lo) return 'Below ' + z.hi + '×';
    if (!isFinite(z.hi)) return z.lo + '× or more';
    return z.lo + '× to under ' + z.hi + '×';
  }
  function paintSpark(s) {
    var host = document.getElementById('wma-when-spark');
    if (!host || !host.clientWidth) return;
    var end = s.dates[s.n], start = end - 5 * 365.25 * 86400000, pts = [];
    for (var i = 0; i <= s.n; i++) {
      if (s.ma[i] && s.dates[i] >= start) pts.push({date:s.dates[i],price:s.price[i],ma:s.ma[i]});
    }
    if (pts.length < 2) return;
    var w = Math.max(260, host.clientWidth), h = 138, left = 5, right = 7, top = 8, bottom = 26;
    var min = Infinity, max = 0;
    pts.forEach(function (p) {min = Math.min(min,p.price,p.ma);max = Math.max(max,p.price,p.ma);});
    if (!(min > 0) || !(max > min)) return;
    var t0 = pts[0].date, t1 = pts[pts.length-1].date;
    function x(t) {return left + (t-t0)/(t1-t0)*(w-left-right);}
    function y(p) {return top + (Math.log(max)-Math.log(p))/(Math.log(max)-Math.log(min))*(h-top-bottom);}
    function path(key) {return pts.map(function (p,i) {return (i?'L':'M')+x(p.date).toFixed(1)+' '+y(p[key]).toFixed(1);}).join(' ');}
    var axes = '', firstYear = new Date(t0).getUTCFullYear(), lastYear = new Date(t1).getUTCFullYear();
    var yearStep = w < 380 ? 2 : 1;
    for (var yr = firstYear+1; yr <= lastYear; yr++) {
      if ((lastYear-yr)%yearStep) continue;
      var xx = x(Date.UTC(yr,0,1));
      if (xx < left+15 || xx > w-right-15) continue;
      axes += '<line x1="'+xx+'" x2="'+xx+'" y1="'+top+'" y2="'+(h-bottom)+'" class="wma-year-line"/><text x="'+xx+'" y="'+(h-6)+'" text-anchor="middle">'+yr+'</text>';
    }
    var last = pts[pts.length-1];
    host.innerHTML = '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-labelledby="wma-spark-title"><title id="wma-spark-title">Bitcoin price and 200-week average over five years, on a logarithmic scale</title>'+axes+'<path d="'+path('ma')+'" class="wma-line-average"/><path d="'+path('price')+'" class="wma-line-price"/><circle cx="'+x(last.date).toFixed(1)+'" cy="'+y(last.price).toFixed(1)+'" r="3" class="wma-price-dot"/></svg><ul class="wma-when-legend"><li><span class="wma-when-swatch price" aria-hidden="true"></span>Bitcoin price</li><li><span class="wma-when-swatch ma" aria-hidden="true"></span>200-week average</li></ul>';
  }
  function paint(data, live) {
    var s = WMA.build(data, live), c = s && s.current;
    if (!c || !(c.mult > 0)) return;
    lastSeries = s;
    document.getElementById('wma-when-mult').textContent = c.mult.toFixed(2) + '×';
    document.getElementById('wma-when-relative').textContent = relative(c.pct);
    document.getElementById('wma-when-zone').textContent = c.zone.name + ' · ' + rangeText(c.zone);
    document.getElementById('wma-when-price').textContent = usd(c.price);
    document.getElementById('wma-when-ma').textContent = usd(c.ma);
    document.getElementById('wma-when-asof').textContent = asofText(data, live);
    section.classList.add('is-ready');
    section.setAttribute('aria-busy','false');
    paintSpark(s);
  }
  section.setAttribute('aria-busy','true');
  fetch('/tools/bitcoin-200-week-moving-average/data/weekly.json', {cache:'no-cache'}).then(function(r) {
    if (!r.ok) throw new Error(r.status);return r.json();
  }).then(function(data) {
    paint(data,null);
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timeout = setTimeout(function(){if(ctl)ctl.abort();},5000);
    fetch(TICK,ctl?{signal:ctl.signal}:{}).then(function(r) {
      if(!r.ok)throw new Error(r.status);return r.json();
    }).then(function(t) {
      clearTimeout(timeout);
      var p = parseFloat(t.price), last = data.latest && data.latest.price;
      if(!(p > 0)||!last||p < last*0.5||p > last*2)return;
      var day = new Date().toISOString().slice(0,10);
      if(data.latest.date && day < data.latest.date)day=data.latest.date;
      paint(data,{price:p,date:day});
    }).catch(function(){clearTimeout(timeout);});
  }).catch(function(){section.setAttribute('aria-busy','false');});
  var resize;
  window.addEventListener('resize',function(){clearTimeout(resize);resize=setTimeout(function(){if(lastSeries)paintSpark(lastSeries);},120);});
})();
