/* ============================================
   Bitcoin DCA Calculator - Logic
   ============================================ */
(function () {
  'use strict';

  // ── Monthly BTC prices (first-of-month close, USD) — Jan 2011 to Mar 2026 ──
  const BTC_PRICES = {
    "2011-01":0.30,"2011-02":1.00,"2011-03":0.82,"2011-04":0.75,"2011-05":3.15,
    "2011-06":15.40,"2011-07":14.00,"2011-08":10.90,"2011-09":5.80,"2011-10":3.20,
    "2011-11":2.90,"2011-12":4.25,
    "2012-01":6.30,"2012-02":4.60,"2012-03":5.00,"2012-04":4.90,"2012-05":5.10,
    "2012-06":6.30,"2012-07":7.40,"2012-08":10.20,"2012-09":12.30,"2012-10":11.00,
    "2012-11":12.00,"2012-12":13.45,
    "2013-01":13.30,"2013-02":22.00,"2013-03":34.00,"2013-04":93.00,"2013-05":130.00,
    "2013-06":100.00,"2013-07":89.00,"2013-08":110.00,"2013-09":133.00,"2013-10":195.00,
    "2013-11":350.00,"2013-12":750.00,
    "2014-01":770.00,"2014-02":580.00,"2014-03":630.00,"2014-04":450.00,"2014-05":440.00,
    "2014-06":630.00,"2014-07":585.00,"2014-08":490.00,"2014-09":380.00,"2014-10":340.00,
    "2014-11":370.00,"2014-12":310.00,
    "2015-01":270.00,"2015-02":220.00,"2015-03":245.00,"2015-04":235.00,"2015-05":240.00,
    "2015-06":250.00,"2015-07":285.00,"2015-08":230.00,"2015-09":235.00,"2015-10":270.00,
    "2015-11":375.00,"2015-12":430.00,
    "2016-01":370.00,"2016-02":435.00,"2016-03":415.00,"2016-04":420.00,"2016-05":455.00,
    "2016-06":530.00,"2016-07":665.00,"2016-08":575.00,"2016-09":605.00,"2016-10":695.00,
    "2016-11":735.00,"2016-12":960.00,
    "2017-01":970.00,"2017-02":1050.00,"2017-03":1070.00,"2017-04":1340.00,"2017-05":2300.00,
    "2017-06":2500.00,"2017-07":2550.00,"2017-08":4400.00,"2017-09":4340.00,"2017-10":6140.00,
    "2017-11":10000.00,"2017-12":14000.00,
    "2018-01":13850.00,"2018-02":10200.00,"2018-03":6950.00,"2018-04":7500.00,"2018-05":7400.00,
    "2018-06":6200.00,"2018-07":7600.00,"2018-08":6950.00,"2018-09":6600.00,"2018-10":6300.00,
    "2018-11":6340.00,"2018-12":3700.00,
    "2019-01":3450.00,"2019-02":3400.00,"2019-03":3800.00,"2019-04":5300.00,"2019-05":8550.00,
    "2019-06":10820.00,"2019-07":9580.00,"2019-08":9600.00,"2019-09":8300.00,"2019-10":9200.00,
    "2019-11":7500.00,"2019-12":7200.00,
    "2020-01":9350.00,"2020-02":8770.00,"2020-03":6400.00,"2020-04":8600.00,"2020-05":9450.00,
    "2020-06":9150.00,"2020-07":11350.00,"2020-08":11650.00,"2020-09":10780.00,"2020-10":13800.00,
    "2020-11":19700.00,"2020-12":29000.00,
    "2021-01":33100.00,"2021-02":45200.00,"2021-03":58800.00,"2021-04":57800.00,"2021-05":37300.00,
    "2021-06":35000.00,"2021-07":41500.00,"2021-08":47100.00,"2021-09":43800.00,"2021-10":61300.00,
    "2021-11":57000.00,"2021-12":46300.00,
    "2022-01":38500.00,"2022-02":43200.00,"2022-03":45500.00,"2022-04":37700.00,"2022-05":31800.00,
    "2022-06":19800.00,"2022-07":23300.00,"2022-08":20050.00,"2022-09":19400.00,"2022-10":20500.00,
    "2022-11":17150.00,"2022-12":16500.00,
    "2023-01":23100.00,"2023-02":23600.00,"2023-03":28500.00,"2023-04":29300.00,"2023-05":27200.00,
    "2023-06":30500.00,"2023-07":29200.00,"2023-08":26100.00,"2023-09":27000.00,"2023-10":34500.00,
    "2023-11":37700.00,"2023-12":42500.00,
    "2024-01":42600.00,"2024-02":51800.00,"2024-03":63500.00,"2024-04":60200.00,"2024-05":67500.00,
    "2024-06":62700.00,"2024-07":64600.00,"2024-08":59000.00,"2024-09":63300.00,"2024-10":72300.00,
    "2024-11":96400.00,"2024-12":93400.00,
    "2025-01":102000.00,"2025-02":96500.00,"2025-03":84000.00,"2025-04":82500.00,"2025-05":87000.00,
    "2025-06":90000.00,"2025-07":88000.00,"2025-08":91000.00,"2025-09":95000.00,"2025-10":93000.00,
    "2025-11":97000.00,"2025-12":100000.00,
    "2026-01":98000.00,"2026-02":95000.00,"2026-03":92000.00
  };

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

  function monthKey(year, month) {
    return year + '-' + String(month).padStart(2, '0');
  }

  // ── Main calculation ──
  function calculate() {
    var initial  = parseFloat(document.getElementById('initial').value) || 0;
    var monthly  = parseFloat(document.getElementById('monthly').value) || 0;
    var startVal = document.getElementById('start-date').value;
    var duration = parseInt(document.getElementById('duration').value, 10);

    if (!startVal) return;

    var parts      = startVal.split('-');
    var startYear  = parseInt(parts[0], 10);
    var startMonth = parseInt(parts[1], 10);
    var totalMonths = duration * 12;

    var firstKey = monthKey(startYear, startMonth);
    if (!BTC_PRICES[firstKey]) {
      alert('Start date is outside available price data (Jan 2011 \u2013 Mar 2026).');
      return;
    }

    var totalInvested = 0;
    var btcHeld = 0;
    var dataPoints = [];
    var investedPoints = [];

    for (var i = 0; i <= totalMonths; i++) {
      var d = new Date(startYear, startMonth - 1 + i, 1);
      var key = monthKey(d.getFullYear(), d.getMonth() + 1);
      var price = BTC_PRICES[key];
      if (price === undefined) break;

      var contribution = (i === 0) ? initial : monthly;
      if (contribution > 0) {
        btcHeld += contribution / price;
        totalInvested += contribution;
      }

      var portfolioValue = btcHeld * price;
      dataPoints.push({ x: d, y: portfolioValue });
      investedPoints.push({ x: d, y: totalInvested });
    }

    if (dataPoints.length < 2) {
      alert('Not enough price data for the selected range.');
      return;
    }

    var lastPoint   = dataPoints[dataPoints.length - 1];
    var finalValue  = lastPoint.y;
    var roi         = ((finalValue - totalInvested) / totalInvested) * 100;
    var avgBuyPrice = totalInvested / btcHeld;

    // Lump sum comparison
    var firstPrice   = BTC_PRICES[monthKey(startYear, startMonth)];
    var lastDate     = lastPoint.x;
    var lastKey      = monthKey(lastDate.getFullYear(), lastDate.getMonth() + 1);
    var lastPrice    = BTC_PRICES[lastKey];
    var lumpSumBtc   = totalInvested / firstPrice;
    var lumpSumValue = lumpSumBtc * lastPrice;
    var dcaVsLump    = ((finalValue - lumpSumValue) / lumpSumValue) * 100;

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
    document.getElementById('chart-section').style.display = 'block';

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

    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Event listeners ──
  document.getElementById('calculate-btn').addEventListener('click', calculate);

  // ── Run on load with defaults ──
  window.addEventListener('DOMContentLoaded', calculate);

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

  // ── Navbar scroll behavior ──
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('active');
        toggle.classList.toggle('active');
      });
    }

    window.addEventListener('scroll', function () {
      if (!navbar) return;
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Dropdown hover for desktop
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(function (dd) {
      dd.addEventListener('mouseenter', function () {
        this.classList.add('open');
      });
      dd.addEventListener('mouseleave', function () {
        this.classList.remove('open');
      });
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
    initNavbar();
    initParticles();
    fetchBtcPrice();
    btcPriceUpdateInterval = setInterval(fetchBtcPrice, 60000);
    setInterval(updateTimestamp, 10000);
  });
})();
