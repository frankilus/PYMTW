/* Bitcoin 200-Week Moving Average Tracker UI. Math is in core.js. Only network calls: the saved weekly.json (same site)
   and one public Coinbase Exchange ticker request for a live price; nothing is sent from the visitor. */
(function () {
var Z = WMA.ZONES, $ = function (s, r) { return (r || document).querySelector(s); };
var data = null, series = null, range = 'all', hoverIdx = null, liveInfo = null;
var NS = 'http://www.w3.org/2000/svg';
function usd(n) { return n >= 100 ? '$' + Math.round(n).toLocaleString('en-US') : '$' + n.toFixed(2); }
function axisUsd(n) { return n >= 1e6 ? '$' + n / 1e6 + 'M' : n >= 1e3 ? '$' + n / 1e3 + 'k' : '$' + n; }
function pct(x) { return (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(x * 100 >= 1000 || x * 100 <= -1000 ? 0 : 1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '%'; }
function pct0(x) { return (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100)).toLocaleString('en-US') + '%'; }
function dateLong(ms) { return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
function liveStamp(d) { return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' }); }
function historyAsOf() { return dateLong(WMA.parseDay(data.updated || data.latest.date)); }
function asofHtml() {
  var hist = historyAsOf();
  return liveInfo
    ? 'Price live as of <b>' + liveInfo + '</b>; weekly history as of <b>' + hist + '</b>.'
    : 'Data as of <b>' + hist + '</b>. A live price was not available, so this uses the daily average from the saved file.';
}
function mult(m) { return m.toFixed(2) + 'x'; }
function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }

function renderToday() {
  var c = series.current, z = c.zone, share = WMA.shareAtOrBelow(series, c.mult), nweeks = series.n - series.firstMa + 1;
  var rel = c.pct >= 0 ? 'above' : 'below';
  var sentence = 'Bitcoin is ' + usd(c.price) + ', which is <b>' + Math.abs(c.pct * 100).toFixed(1) + '% ' + rel + '</b> its 200-week moving average of ' + usd(c.ma) + '. That puts it in the <b>' + z.name + '</b> zone. ' + z.text;
  var cheap = share < 0.005 ? 'under 1%' : (share * 100 < 10 ? (share * 100).toFixed(1) : Math.round(share * 100)) + '%';
  var edges = [0.5, 1.1, 2, 3.5, 5], gmin = 0.5, gmax = 5;
  var seg = Z.map(function (zz) { var lo = Math.max(zz.lo, gmin), hi = Math.min(zz.hi, gmax); return '<i style="width:' + ((hi - lo) / (gmax - gmin) * 100) + '%;background:' + zz.color + '"></i>'; }).join('');
  var pos = Math.min(gmax, Math.max(gmin, c.mult)); var left = (pos - gmin) / (gmax - gmin) * 100;
  var ticks = [[gmin, '0.5x'], [1.1, '1.1x'], [2, '2x'], [3.5, '3.5x'], [5, '5x+']].map(function (t, i) { return '<span style="left:' + ((t[0] - gmin) / (gmax - gmin) * 100) + '%"' + (i === 4 ? ' class="r"' : '') + '>' + t[1] + '</span>'; }).join('');
  var asof = asofHtml();
  var chartAsof = $('#wm-chart-asof'); if (chartAsof) chartAsof.innerHTML = asof;
  $('#wm-today').innerHTML = '<div class="big-label">Price ÷ 200-week average</div>' +
    '<div class="wm-chip" style="background:' + z.color + '">' + z.name + '</div>' +
    '<div class="wm-big" style="color:' + z.color + '" id="wm-mult">' + c.mult.toFixed(2) + '<small>x</small></div>' +
    '<p class="sentence" style="margin-top:14px">' + sentence + '</p>' +
    '<div class="wm-gauge" role="img" aria-label="Today’s multiple of ' + c.mult.toFixed(2) + ' on a scale from 0.5x to 5x, zone ' + z.name + '"><div class="wm-gauge-bar">' + seg + '<span class="wm-gauge-pin" style="left:' + left + '%"></span></div><div class="wm-gauge-lab" aria-hidden="true">' + ticks + '</div></div>' +
    '<div class="wm-stats">' +
    '<div class="stat"><small>Bitcoin price</small><b id="wm-price">' + usd(c.price) + '</b></div>' +
    '<div class="stat"><small>200-week average</small><b id="wm-ma">' + usd(c.ma) + '</b></div>' +
    '<div class="stat"><small>' + (c.pct >= 0 ? 'Above' : 'Below') + ' the average</small><b>' + pct(c.pct) + '</b></div>' +
    '<div class="stat"><small>Zone</small><b style="color:' + z.color + '">' + z.name + '</b></div>' +
    '<div class="stat"><small>Weeks this cheap or cheaper</small><b id="wm-cheap">' + cheap + '</b></div>' +
    '<div class="stat"><small>Weeks tracked</small><b>' + nweeks + '</b></div></div>' +
    '<p class="wm-asof" id="wm-asof">' + asof + '</p>';
  var gl = $('.wm-gauge-lab'); if (gl) gl.querySelectorAll('span.r').forEach(function (s) { s.style.transform = 'translateX(-100%)'; });
  var spells = WMA.belowOne(series).filter(function (b) { return b.weeks >= 1; }), tot = spells.reduce(function (a, b) { return a + b.weeks; }, 0);
  $('#wm-rare').textContent = 'Since the first 200-week average (mid-2014), bitcoin closed a week below it ' + tot + ' times out of ' + nweeks + ' (' + Math.round(tot / nweeks * 1000) / 10 + '% of weeks), in a handful of separate stretches. The longest ran from mid-2022 to early 2023.';
  var st = WMA.zoneStats(series);
  $('#wm-zones').innerHTML = st.map(function (s) {
    var zz = s.zone, rng = zz.lo === 0 ? 'Below ' + zz.hi + 'x' : zz.hi === Infinity ? 'Above ' + zz.lo + 'x' : zz.lo + 'x to ' + zz.hi + 'x';
    return '<div class="wm-zone' + (zz.id === z.id ? ' now' : '') + '" style="--zc:' + zz.color + '"><h3>' + zz.name + (zz.id === z.id ? ' · now' : '') + '</h3><div class="rng">' + rng + ' the 200-week average</div><dl><dt>Share of weeks</dt><dd>' + Math.round(s.share * 100) + '%</dd><dt>Median price change 52 weeks later</dt><dd>' + (s.median === null ? 'n/a' : pct0(s.median)) + '</dd><dt>Price higher 52 weeks later</dt><dd>' + (s.upShare === null ? 'n/a' : Math.round(s.upShare * 100) + '% of weeks') + '</dd></dl></div>';
  }).join('');
  $('#wm-legend').innerHTML = '<span><i class="ln" style="background:#0b0b0c"></i>Weekly price</span><span><i class="ln" style="background:#6e1fd1;height:5px"></i>200-week average</span>' + Z.map(function (zz) { return '<span><i style="background:' + zz.color + ';opacity:.5"></i>' + zz.name + '</span>'; }).join('');
}

function visible() {
  var s = series, end = s.n, startMs = range === 'all' ? WMA.parseDay('2011-01-02') : s.dates[end] - (+range) * 365.25 * 86400000, i0 = 0;
  while (i0 < end && s.dates[i0] < startMs) i0++;
  return [i0, end];
}
function drawChart() {
  var host = $('#wm-chart'), s = series, W = Math.max(280, host.clientWidth - 8), H = W < 520 ? 340 : 440;
  var ml = W < 520 ? 44 : 54, mr = 10, mt = 10, mb = 26, pw = W - ml - mr, ph = H - mt - mb;
  var v = visible(), i0 = v[0], i1 = v[1], lo = Infinity, hi = 0;
  for (var i = i0; i <= i1; i++) { lo = Math.min(lo, s.price[i]); hi = Math.max(hi, s.price[i]); if (s.ma[i]) { lo = Math.min(lo, s.ma[i] * 0.55); hi = Math.max(hi, s.ma[i] * 3.6); } }
  hi = Math.max(hi, s.price[i1]) * 1.15; lo = lo / 1.15;
  var lmin = Math.log10(lo), lmax = Math.log10(hi);
  var t0 = s.dates[i0], t1 = s.dates[i1];
  var X = function (t) { return ml + (t - t0) / (t1 - t0) * pw; };
  var Y = function (p) { return mt + (1 - (Math.log10(Math.max(p, lo)) - lmin) / (lmax - lmin)) * ph; };
  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', tabindex: '0', 'aria-labelledby': 'wm-t wm-d' });
  var t = el('title', { id: 'wm-t' }); t.textContent = 'Bitcoin weekly price and 200-week moving average, log scale'; svg.appendChild(t);
  var c = s.current, dsc = el('desc', { id: 'wm-d' }); dsc.textContent = 'Today bitcoin is ' + usd(c.price) + ', ' + mult(c.mult) + ' its 200-week average of ' + usd(c.ma) + ', in the ' + c.zone.name + ' zone. Use the left and right arrow keys to read each week.'; svg.appendChild(dsc);
  var defs = el('defs', {}), cp = el('clipPath', { id: 'wm-clip' }); cp.appendChild(el('rect', { x: ml, y: mt, width: pw, height: ph })); defs.appendChild(cp); svg.appendChild(defs);
  // y grid
  var g = el('g', {});
  for (var e = Math.ceil(lmin); e <= Math.floor(lmax); e++) {
    var y = Y(Math.pow(10, e)); g.appendChild(el('line', { x1: ml, x2: ml + pw, y1: y, y2: y, stroke: '#ececf0', 'stroke-width': 1 }));
    var tx = el('text', { x: ml - 6, y: y + 4, 'text-anchor': 'end' }); tx.textContent = axisUsd(Math.pow(10, e)); g.appendChild(tx);
  }
  // x ticks by year
  var y0 = new Date(t0).getUTCFullYear(), y1 = new Date(t1).getUTCFullYear(), step = Math.max(1, Math.ceil((y1 - y0) / (W < 520 ? 4 : 8)));
  for (var yr = y0 + 1; yr <= y1; yr++) { if ((yr - y0) % step) continue; var xx = X(Date.UTC(yr, 0, 1)); if (xx < ml + 12 || xx > ml + pw - 8) continue; g.appendChild(el('line', { x1: xx, x2: xx, y1: mt, y2: mt + ph, stroke: '#f1f1f4' })); var xt = el('text', { x: xx, y: H - 8, 'text-anchor': 'middle' }); xt.textContent = yr; g.appendChild(xt); }
  svg.appendChild(g);
  var plot = el('g', { 'clip-path': 'url(#wm-clip)' });
  // zone bands (only where a 200WMA exists)
  var from = Math.max(i0, s.firstMa);
  if (from < i1) {
    var edges = [0].concat(Z.map(function (z) { return z.hi; }).slice(0, -1)); // 0,1.1,2,3.5
    Z.forEach(function (z) {
      var upper = z.hi === Infinity ? null : z.hi, lower = z.lo, pts = [], back = [];
      for (var i = from; i <= i1; i++) { pts.push(X(s.dates[i]).toFixed(1) + ',' + (upper === null ? mt - 5 : Y(s.ma[i] * upper)).toFixed(1)); }
      for (var j = i1; j >= from; j--) { back.push(X(s.dates[j]).toFixed(1) + ',' + (lower === 0 ? Y(s.ma[j] * 0.5) : Y(s.ma[j] * lower)).toFixed(1)); }
      plot.appendChild(el('polygon', { points: pts.concat(back).join(' '), fill: z.color, 'fill-opacity': z.id === 'deep' ? .22 : .10 }));
    });
  }
  // lines
  var pd = '', md = '';
  for (var k = i0; k <= i1; k++) { pd += (k === i0 ? 'M' : 'L') + X(s.dates[k]).toFixed(1) + ' ' + Y(s.price[k]).toFixed(1); }
  var first = true; for (var m = Math.max(i0, s.firstMa); m <= i1; m++) { md += (first ? 'M' : 'L') + X(s.dates[m]).toFixed(1) + ' ' + Y(s.ma[m]).toFixed(1); first = false; }
  plot.appendChild(el('path', { d: pd, fill: 'none', stroke: '#0b0b0c', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  if (md) plot.appendChild(el('path', { d: md, fill: 'none', stroke: '#6e1fd1', 'stroke-width': 2.8, 'stroke-linejoin': 'round' }));
  svg.appendChild(plot);
  // today marker
  var tx2 = X(s.dates[i1]), ty = Y(s.price[i1]);
  svg.appendChild(el('circle', { cx: tx2, cy: ty, r: 5, fill: c.zone.color, stroke: '#fff', 'stroke-width': 2 }));
  // hover layer
  var cross = el('line', { y1: mt, y2: mt + ph, stroke: '#0b0b0c', 'stroke-width': 1, 'stroke-dasharray': '3 3', visibility: 'hidden' }), dot = el('circle', { r: 4.5, fill: '#fff', stroke: '#0b0b0c', 'stroke-width': 2, visibility: 'hidden' });
  svg.appendChild(cross); svg.appendChild(dot);
  if (i0 < s.firstMa - 20 && X(s.dates[s.firstMa]) - ml > 190) { var nt = el('text', { x: X(s.dates[s.firstMa]) - 8, y: mt + 14, 'text-anchor': 'end' }); nt.textContent = 'No 200-week average yet'; svg.appendChild(nt); }
  host.innerHTML = ''; host.appendChild(svg);
  function show(i) {
    i = Math.max(i0, Math.min(i1, i)); hoverIdx = i;
    cross.setAttribute('x1', X(s.dates[i])); cross.setAttribute('x2', X(s.dates[i])); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', X(s.dates[i])); dot.setAttribute('cy', Y(s.price[i])); dot.setAttribute('visibility', 'visible');
    var h = '<b>Week of ' + dateLong(s.dates[i]) + '</b> · price <b>' + usd(s.price[i]) + '</b>';
    if (s.ma[i]) { var zz = WMA.zoneOf(s.mult[i]); h += ' · 200-week avg <b>' + usd(s.ma[i]) + '</b> · <b style="color:' + zz.color + '">' + mult(s.mult[i]) + ' (' + zz.name + ')</b>'; }
    else h += ' · no 200-week average yet (needs 200 weeks of history)';
    $('#wm-hover').innerHTML = h;
  }
  function idxAt(ev) { var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, tt = t0 + (x - ml) / pw * (t1 - t0), best = i0, bd = Infinity; for (var i = i0; i <= i1; i++) { var d = Math.abs(s.dates[i] - tt); if (d < bd) { bd = d; best = i; } } return best; }
  svg.addEventListener('pointermove', function (ev) { show(idxAt(ev)); });
  svg.addEventListener('pointerdown', function (ev) { show(idxAt(ev)); });
  svg.addEventListener('keydown', function (ev) { var d = ev.key === 'ArrowLeft' ? -1 : ev.key === 'ArrowRight' ? 1 : ev.key === 'Home' ? -9999 : ev.key === 'End' ? 9999 : 0; if (!d) return; ev.preventDefault(); show((hoverIdx === null ? i1 : hoverIdx) + d); });
  if (hoverIdx !== null && hoverIdx >= i0 && hoverIdx <= i1) show(hoverIdx); else hoverIdx = null;
}

function renderAll() { renderToday(); drawChart(); }
function start(live) { series = WMA.build(data, live); renderAll(); }

var tracked = false;
function afterFirst() { if (tracked) return; tracked = true; if (window.PT && PT.track) PT.track('results-shown', 'Results shown'); }

fetch('data/weekly.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
  data = d; start(null); afterFirst();
  // Live top-up: a public, keyless ticker. Ignored if blocked, slow or implausible.
  var ctl = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 5000);
  fetch('https://api.exchange.coinbase.com/products/BTC-USD/ticker', ctl ? { signal: ctl.signal } : {}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (t) {
    clearTimeout(to);
    var p = parseFloat(t.price), last = d.latest.price;
    if (!(p > 0) || p < last * 0.5 || p > last * 2) return;
    var now = new Date(), day = now.toISOString().slice(0, 10);
    if (day < d.latest.date) day = d.latest.date;
    liveInfo = liveStamp(now);
    start({ price: p, date: day });
  }).catch(function () { clearTimeout(to); });
}).catch(function () { $('#wm-loading').textContent = 'Sorry, the price history could not be loaded. Please try again later.'; });

PT.$$('input[name="wm-range"]').forEach(function (r) { r.addEventListener('change', function () { range = r.value; hoverIdx = null; $('#wm-hover').textContent = 'Hover or tap the chart to read a week.'; if (series) drawChart(); }); });
var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (series) drawChart(); }, 120); });
})();
