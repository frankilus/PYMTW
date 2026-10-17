/* ============================================
   Bitcoin DCA Calculator - Logic
   ============================================ */
(function () {
  'use strict';

  const BTC_PRICES = window.PYMTW_DCA_PRICES;

  let chart = null;

  // ── Formatting helpers ──
  function fmt$(n) {
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1e4) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtBtc(n) {
    if (n >= 1) return n.toFixed(4) + ' BTC';
    return n.toFixed(6) + ' BTC';
  }

  // ── Main calculation ──
  function calculate(userTriggered) {
    var status = document.getElementById('dca-status');
    var result;
    try {
      result = window.PYMTW_DCA.calculate(BTC_PRICES, {
        initial: document.getElementById('initial').value,
        monthly: document.getElementById('monthly').value,
        start: document.getElementById('start-date').value,
        years: document.getElementById('duration').value
      });
    } catch (error) {
      status.textContent = error.message;
      status.className = 'dca-disclaimer error';
      document.getElementById('results-section').style.display = 'none';
      document.getElementById('chart-section').style.display = 'none';
      if (chart) { chart.destroy(); chart = null; }
      if (userTriggered) status.focus();
      return;
    }
    status.className = 'dca-disclaimer';
    status.textContent = (result.truncated ? 'SHORTENED RANGE: requested through ' + result.requestedEnd + ', but prices end at ' + result.end + '. ' : '') +
      'Illustrative results: ' + result.start + ' through ' + result.end + ' (' + result.months + ' monthly contributions after the initial deposit). No returns beyond this range are estimated.';
    var totalInvested = result.invested, finalValue = result.value, btcHeld = result.btc;
    var roi = result.roi, avgBuyPrice = result.averagePrice, dcaVsLump = result.vsLump;
    var dataPoints = result.points.map(function (p) { return { x: p.month + '-01', y: p.value }; });
    var investedPoints = result.points.map(function (p) { return { x: p.month + '-01', y: p.invested }; });

    // Update DOM
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('total-invested').textContent = fmt$(totalInvested);
    document.getElementById('portfolio-value').textContent = fmt$(finalValue);

    var roiEl = document.getElementById('roi');
    roiEl.textContent = (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%';
    roiEl.className = 'dca-stat-value ' + (roi >= 0 ? 'green' : 'red');

    document.getElementById('btc-total').textContent = fmtBtc(btcHeld);
    document.getElementById('avg-price').textContent = fmt$(avgBuyPrice);

    var vsLumpEl = document.getElementById('vs-lump');
    vsLumpEl.textContent = (dcaVsLump >= 0 ? '+' : '') + dcaVsLump.toFixed(1) + '%';
    vsLumpEl.style.color = dcaVsLump >= 0 ? '#3fb950' : '#f85149';

    // Show chart section
    document.getElementById('chart-section').style.display = typeof Chart === 'function' ? 'block' : 'none';
    if (typeof Chart !== 'function') { status.textContent += ' Chart unavailable; the numeric results are still shown.'; return; }

    // Chart
    if (chart) chart.destroy();
    var ctx = document.getElementById('growth-chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Portfolio Value',
            data: dataPoints,
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247,147,26,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 10,
            borderWidth: 2.5
          },
          {
            label: 'Total Invested',
            data: investedPoints,
            borderColor: '#58a6ff',
            backgroundColor: 'transparent',
            borderDash: [6, 4],
            fill: false,
            tension: 0,
            pointRadius: 0,
            pointHitRadius: 10,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: {
              color: '#8b949e',
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: '#1c2333',
            borderColor: '#30363d',
            borderWidth: 1,
            titleColor: '#e6edf3',
            bodyColor: '#e6edf3',
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (ctx) {
                return ctx.dataset.label + ': ' + fmt$(ctx.parsed.y);
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'month', displayFormats: { month: 'MMM yyyy' } },
            ticks: { color: '#8b949e', maxTicksLimit: 10 },
            grid: { color: 'rgba(48,54,61,0.5)' }
          },
          y: {
            ticks: {
              color: '#8b949e',
              callback: function (v) { return fmt$(v); }
            },
            grid: { color: 'rgba(48,54,61,0.5)' }
          }
        }
      }
    });

    if (userTriggered) {
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Event listeners ──
  document.getElementById('calculate-btn').addEventListener('click', function () { calculate(true); });

  // ── Run on load with defaults (no scroll) ──
  window.addEventListener('DOMContentLoaded', function () { calculate(false); });

  // ── Live BTC Price Bar (same as other pages) ──
  var btcPriceUpdateInterval;
  var lastBtcUpdate = null;

  function formatPrice(price) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatLargeNumber(num) {
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
  }

  function updateTimestamp() {
    if (!lastBtcUpdate) return;
    var el = document.getElementById('btc-price-updated');
    if (!el) return;
    var seconds = Math.floor((Date.now() - lastBtcUpdate) / 1000);
    var text;
    if (seconds < 10) text = 'Updated just now';
    else if (seconds < 60) text = 'Updated ' + seconds + 's ago';
    else text = 'Updated ' + Math.floor(seconds / 60) + 'm ago';
    el.innerHTML = '<span>' + text + '</span>';
  }

  function fetchBtcPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var btc = data.bitcoin;
        var priceEl = document.getElementById('btc-price-value');
        var changeEl = document.getElementById('btc-change-value');
        var arrowEl = document.getElementById('btc-change-arrow');
        var mcapEl = document.getElementById('btc-market-cap');
        var volEl = document.getElementById('btc-volume');
        var changeWrap = document.getElementById('btc-price-change');

        if (priceEl) priceEl.textContent = formatPrice(btc.usd);
        var change = btc.usd_24h_change || 0;
        if (changeEl) changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        if (arrowEl) arrowEl.textContent = change >= 0 ? '\u25B2' : '\u25BC';
        if (changeWrap) {
          changeWrap.classList.remove('btc-price-up', 'btc-price-down');
          changeWrap.classList.add(change >= 0 ? 'btc-price-up' : 'btc-price-down');
        }
        if (mcapEl) mcapEl.textContent = formatLargeNumber(btc.usd_market_cap || 0);
        if (volEl) volEl.textContent = formatLargeNumber(btc.usd_24h_vol || 0);

        lastBtcUpdate = Date.now();
        updateTimestamp();
      })
      .catch(function () {
        // Fallback to Coincap
        fetch('https://api.coincap.io/v2/assets/bitcoin')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            var btc = data.data;
            var priceEl = document.getElementById('btc-price-value');
            var changeEl = document.getElementById('btc-change-value');
            var arrowEl = document.getElementById('btc-change-arrow');
            var mcapEl = document.getElementById('btc-market-cap');
            var volEl = document.getElementById('btc-volume');
            var changeWrap = document.getElementById('btc-price-change');

            if (priceEl) priceEl.textContent = formatPrice(parseFloat(btc.priceUsd));
            var change = parseFloat(btc.changePercent24Hr) || 0;
            if (changeEl) changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            if (arrowEl) arrowEl.textContent = change >= 0 ? '\u25B2' : '\u25BC';
            if (changeWrap) {
              changeWrap.classList.remove('btc-price-up', 'btc-price-down');
              changeWrap.classList.add(change >= 0 ? 'btc-price-up' : 'btc-price-down');
            }
            if (mcapEl) mcapEl.textContent = formatLargeNumber(parseFloat(btc.marketCapUsd) || 0);
            if (volEl) volEl.textContent = formatLargeNumber(parseFloat(btc.volumeUsd24Hr) || 0);

            lastBtcUpdate = Date.now();
            updateTimestamp();
          })
          .catch(function () {});
      });
  }

  // ── Particle canvas ──
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var maxParticles = 60;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.5 ? 'rgba(247,147,26,' : 'rgba(255,255,255,';
    }

    for (var i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(247,147,26,' + (0.06 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ── Init ──
  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    fetchBtcPrice();
    btcPriceUpdateInterval = setInterval(fetchBtcPrice, 60000);
    setInterval(updateTimestamp, 10000);
  });
})();
