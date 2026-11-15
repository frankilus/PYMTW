/* Bitcoin homepage "Keep exploring" readout: price vs. 200-week average.
   Same math and zone thresholds as /tools/bitcoin-200-week-moving-average/ (core.js).
   Loads the saved weekly.json; optionally tops up with the public Coinbase ticker.
   If a fetch fails, the static fallback already in the page is left in place. */
(function () {
  var el = document.getElementById('wma-readout');
  if (!el || !window.WMA) return;
  var TICK = 'https://api.exchange.coinbase.com/products/BTC-USD/ticker';
  function paint(data, live) {
    var s = WMA.build(data, live), c = s && s.current;
    if (!c || !c.mult || !c.zone) return;
    el.textContent = 'Bitcoin is ' + c.mult.toFixed(2) + 'x its 200-week average today: ' + c.zone.name + '.';
  }
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
  }).catch(function () { /* keep the static fallback already in the HTML */ });
})();
