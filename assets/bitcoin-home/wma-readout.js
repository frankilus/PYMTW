/* Bitcoin homepage 200-week average: Keep exploring row + "When to buy?" section.
   Same math and zone thresholds as /tools/bitcoin-200-week-moving-average/ (core.js).
   Loads the saved weekly.json; optionally tops up with the public Coinbase ticker.
   If a fetch fails, the static fallback already in the page is left in place. */
(function () {
  var row = document.getElementById('wma-readout');
  var section = document.getElementById('when-to-buy');
  if ((!row && !section) || !window.WMA) return;

  var TICK = 'https://api.exchange.coinbase.com/products/BTC-USD/ticker';
  var GAUGE_LO = 0.5, GAUGE_HI = 5;
  /* Darker than the tracker's fill colors so zone names meet contrast on #f2eade. */
  var ZONE_TEXT = { deep: '#086848', fair: '#155e96', stretched: '#8a4a0a', hot: '#9d2222' };

  function usd(n) {
    if (n >= 100) return '$' + Math.round(n).toLocaleString('en-US');
    if (n >= 1) return '$' + n.toFixed(2);
    return '$' + n.toFixed(4);
  }
  function dateLong(ms) {
    return new Date(ms).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
  }
  function liveStamp(d) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
      }).format(d);
    } catch (e) {
      return d.toISOString();
    }
  }
  function historyAsOf(data) {
    var raw = data && data.updated;
    var ms = raw ? Date.parse(raw + 'T00:00:00Z') : NaN;
    return isFinite(ms) ? dateLong(ms) : '';
  }
  function asofText(data, live) {
    var hist = historyAsOf(data);
    if (live && live.price) {
      return 'Price live as of ' + liveStamp(new Date()) +
        (hist ? '; weekly history as of ' + hist + '.' : '.');
    }
    return hist ? 'Data as of ' + hist + '.' : '';
  }
  function cheaperLine(s, m) {
    var share = WMA.shareAtOrBelow(s, m);
    if (!(share >= 0 && share <= 1)) return '';
    return 'Cheaper than ' + ((1 - share) * 100).toFixed(1) + '% of weeks since mid-2014.';
  }
  function logPos(m) {
    var v = Math.max(GAUGE_LO, Math.min(GAUGE_HI, m));
    return (Math.log(v / GAUGE_LO) / Math.log(GAUGE_HI / GAUGE_LO)) * 100;
  }

  function paintRow(c) {
    if (!row || !c || !c.mult || !c.zone) return;
    row.textContent = 'Bitcoin is ' + c.mult.toFixed(2) + 'x its 200-week average today: ' + c.zone.name + '.';
  }

  function paintGauge(el, c) {
    if (!el) return;
    var zones = WMA.ZONES;
    var edges = [GAUGE_LO];
    for (var i = 0; i < zones.length; i++) {
      var hi = zones[i].hi;
      if (hi > GAUGE_LO && hi < GAUGE_HI) edges.push(hi);
    }
    edges.push(GAUGE_HI);
    var segs = '';
    for (var j = 0; j < edges.length - 1; j++) {
      var width = logPos(edges[j + 1]) - logPos(edges[j]);
      var z = WMA.zoneOf((edges[j] + edges[j + 1]) / 2);
      segs += '<span class="wma-when-seg" style="width:' + width.toFixed(2) + '%;background:' + z.color + '"></span>';
    }
    var ticks = [0.5, 1.1, 2, 3.5, 5];
    var tickHtml = '';
    for (var t = 0; t < ticks.length; t++) {
      var label = ticks[t] >= 5 ? '5x+' : ticks[t] + 'x';
      tickHtml += '<span style="left:' + logPos(ticks[t]).toFixed(2) + '%">' + label + '</span>';
    }
    var pin = Math.max(GAUGE_LO, Math.min(GAUGE_HI, c.mult));
    var pinLeft = logPos(pin);
    el.innerHTML =
      '<div class="wma-when-pin" style="left:' + pinLeft.toFixed(2) + '%">' +
        '<span class="wma-when-pin-label">' + c.mult.toFixed(2) + 'x</span>' +
        '<span class="wma-when-pin-caret" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="wma-when-bar" aria-hidden="true">' + segs + '</div>' +
      '<div class="wma-when-ticks" aria-hidden="true">' + tickHtml + '</div>';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label',
      'Today’s multiple is ' + c.mult.toFixed(2) + ' times the 200-week average, in the ' + c.zone.name + ' zone.');
  }

  function paintSpark(el, s) {
    if (!el) return;
    var years = 5;
    var latestMs = s.dates && s.dates[s.n];
    if (!latestMs) return;
    var start = latestMs - years * 365.25 * 24 * 3600 * 1000;
    var pts = [];
    for (var i = 0; i <= s.n; i++) {
      if (!s.ma[i] || s.dates[i] < start) continue;
      pts.push({ price: s.price[i], ma: s.ma[i] });
    }
    if (pts.length < 2) return;
    var w = 640, h = 112, padL = 2, padR = 8, padT = 8, padB = 8;
    var min = Infinity, max = 0;
    for (var p = 0; p < pts.length; p++) {
      min = Math.min(min, pts[p].price, pts[p].ma);
      max = Math.max(max, pts[p].price, pts[p].ma);
    }
    if (!(min > 0) || !(max > min)) return;
    var logMin = Math.log(min), logMax = Math.log(max);
    function x(idx) {
      return padL + (idx / (pts.length - 1)) * (w - padL - padR);
    }
    function y(v) {
      return padT + (logMax - Math.log(v)) / (logMax - logMin) * (h - padT - padB);
    }
    function path(key) {
      var d = '';
      for (var i = 0; i < pts.length; i++) {
        d += (i ? ' L ' : 'M ') + x(i).toFixed(1) + ' ' + y(pts[i][key]).toFixed(1);
      }
      return d;
    }
    var last = pts[pts.length - 1];
    var zoneColor = WMA.zoneOf(last.price / last.ma).color || '#29261f';
    el.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '" width="640" height="112" focusable="false" aria-hidden="true">' +
        '<path d="' + path('ma') + '" style="fill:none;stroke:#6e1fd1;stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>' +
        '<path d="' + path('price') + '" style="fill:none;stroke:#29261f;stroke-width:2.25;stroke-linejoin:round;stroke-linecap:round"/>' +
        '<circle cx="' + x(pts.length - 1).toFixed(1) + '" cy="' + y(last.price).toFixed(1) + '" r="4" style="fill:' + zoneColor + ';stroke:#fffcf7;stroke-width:1.5"/>' +
      '</svg>' +
      '<ul class="wma-when-legend">' +
        '<li><span class="wma-when-swatch price" aria-hidden="true"></span>Weekly price</li>' +
        '<li><span class="wma-when-swatch ma" aria-hidden="true"></span>200-week average</li>' +
      '</ul>';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label',
      'Log-scale sparkline of bitcoin’s weekly price versus its 200-week average over the last five years.');
  }

  function paintSection(s, data, live) {
    if (!section) return;
    var c = s && s.current;
    if (!c || !c.mult || !c.zone) return;
    var textColor = ZONE_TEXT[c.zone.id] || c.zone.color;
    section.style.setProperty('--wma-zone', textColor);
    var multEl = document.getElementById('wma-when-mult');
    var zoneEl = document.getElementById('wma-when-zone');
    var priceEl = document.getElementById('wma-when-price');
    var maEl = document.getElementById('wma-when-ma');
    var cheapEl = document.getElementById('wma-when-cheap');
    var asofEl = document.getElementById('wma-when-asof');
    if (multEl) multEl.textContent = c.mult.toFixed(2) + 'x';
    if (zoneEl) zoneEl.textContent = c.zone.name;
    if (priceEl) priceEl.textContent = usd(c.price);
    if (maEl) maEl.textContent = usd(c.ma);
    if (cheapEl) cheapEl.textContent = cheaperLine(s, c.mult);
    if (asofEl) {
      var line = asofText(data, live);
      if (line) asofEl.textContent = line;
    }
    paintGauge(document.getElementById('wma-when-gauge'), c);
    paintSpark(document.getElementById('wma-when-spark'), s);
    section.classList.add('is-ready');
    section.setAttribute('aria-busy', 'false');
  }

  function paint(data, live) {
    var s = WMA.build(data, live), c = s && s.current;
    if (!c || !c.mult || !c.zone) return;
    paintRow(c);
    paintSection(s, data, live);
  }

  if (section) section.setAttribute('aria-busy', 'true');

  fetch('/tools/bitcoin-200-week-moving-average/data/weekly.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (d) {
    paint(d, null);
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 5000);
    fetch(TICK, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (t) {
      clearTimeout(to);
      var p = parseFloat(t.price), last = d.latest && d.latest.price;
      if (!(p > 0) || !last || p < last * 0.5 || p > last * 2) return;
      var day = new Date().toISOString().slice(0, 10);
      if (d.latest.date && day < d.latest.date) day = d.latest.date;
      paint(d, { price: p, date: day });
    }).catch(function () { clearTimeout(to); });
  }).catch(function () {
    if (section) section.setAttribute('aria-busy', 'false');
    /* keep the static fallback already in the HTML */
  });
})();
