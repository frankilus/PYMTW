/* v4 preview: growth illustration. FV of monthly contributions, monthly compounding. */
(function (root) {
  function fv(pmt, years, ratePct) {
    var n = Math.round(years * 12), i = ratePct / 100 / 12;
    if (i === 0) return pmt * n;
    return pmt * ((Math.pow(1 + i, n) - 1) / i);
  }
  root.PT_fv = fv;
  if (typeof module !== 'undefined') module.exports = { fv: fv };
  if (typeof document === 'undefined') return;
  var $ = function (id) { return document.getElementById(id); };
  var pmtEl = $('simPmt'), yrEl = $('simYears'), rEl = $('simRate'), chart = $('simChart');
  if (!pmtEl) return;
  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var NS = 'http://www.w3.org/2000/svg', raf = 0;
  function draw() {
    raf = 0;
    var p = +pmtEl.value, y = +yrEl.value, r = +rEl.value;
    var total = fv(p, y, r), contrib = p * 12 * y;
    $('simPmtOut').textContent = usd.format(p);
    $('simYearsOut').textContent = y;
    $('simRateOut').textContent = r + '%';
    $('simContrib').textContent = usd.format(contrib);
    $('simGrowth').textContent = usd.format(total - contrib);
    $('simFv').textContent = usd.format(total);
    $('simFvBig').textContent = usd.format(total);
    $('simAxisEnd').textContent = 'Year ' + y;
    chart.textContent = '';
    var W = 400, H = 180, gap = y > 25 ? 2 : 4, bw = (W - gap * (y - 1)) / y;
    for (var k = 1; k <= y; k++) {
      var v = fv(p, k, r), c = p * 12 * k, h = total ? v / total * (H - 4) : 0, hc = total ? c / total * (H - 4) : 0;
      var x = (k - 1) * (bw + gap);
      var g = document.createElementNS(NS, 'rect');
      g.setAttribute('x', x); g.setAttribute('width', bw); g.setAttribute('y', H - h); g.setAttribute('height', h);
      g.setAttribute('class', 'bar-growth'); chart.appendChild(g);
      var b = document.createElementNS(NS, 'rect');
      b.setAttribute('x', x); b.setAttribute('width', bw); b.setAttribute('y', H - hc); b.setAttribute('height', hc);
      b.setAttribute('class', 'bar-contrib'); chart.appendChild(b);
    }
    chart.setAttribute('aria-label', 'Bar chart: projected value grows to ' + usd.format(total) + ' after ' + y + ' years, of which ' + usd.format(contrib) + ' is contributions.');
  }
  [pmtEl, yrEl, rEl].forEach(function (el) {
    el.addEventListener('input', function () { if (!raf) raf = requestAnimationFrame(draw); });
  });
  draw();
})(typeof window !== 'undefined' ? window : globalThis);
