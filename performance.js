/* ============================================
   Bitcoin Performance Compared - JavaScript
   ============================================ */

// ---- Navbar Scroll & Hamburger ----
(function initNavbar() {
  var navbar = document.getElementById('navbar');
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (!navbar || !toggle || !links) return;

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.classList.remove('active');
      links.classList.remove('active');
      document.querySelectorAll('.nav-dropdown').forEach(function (dd) { dd.classList.remove('open'); });
    });
  });

  document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });
})();

// ---- Live Bitcoin Price Feed ----
(function initBitcoinPrice() {
  var COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true';
  var COINCAP_URL = 'https://api.coincap.io/v2/assets/bitcoin';
  var UPDATE_INTERVAL = 60000;
  var RETRY_INTERVAL = 15000;

  var bar = document.getElementById('btc-price-bar');
  var priceEl = document.getElementById('btc-price-value');
  var changeEl = document.getElementById('btc-price-change');
  var changeArrowEl = document.getElementById('btc-change-arrow');
  var changeValueEl = document.getElementById('btc-change-value');
  var marketCapEl = document.getElementById('btc-market-cap');
  var volumeEl = document.getElementById('btc-volume');
  var updatedEl = document.getElementById('btc-price-updated');

  if (!bar || !priceEl) return;

  var lastPrice = null;
  var updateTimer = null;
  var lastFetchTime = null;

  function formatPrice(num) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(num);
  }

  function formatLargeNumber(num) {
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
  }

  function formatChange(change) {
    var sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
  }

  function timeSince(date) {
    var seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 10) return 'Updated just now';
    if (seconds < 60) return 'Updated ' + seconds + 's ago';
    var minutes = Math.floor(seconds / 60);
    return 'Updated ' + minutes + 'm ago';
  }

  function setLoading() {
    priceEl.classList.add('loading');
    priceEl.textContent = '\u00A0\u00A0\u00A0\u00A0\u00A0';
    if (marketCapEl) { marketCapEl.classList.add('loading'); marketCapEl.textContent = '\u00A0\u00A0\u00A0'; }
    if (volumeEl) { volumeEl.classList.add('loading'); volumeEl.textContent = '\u00A0\u00A0\u00A0'; }
  }

  function clearLoading() {
    priceEl.classList.remove('loading');
    if (marketCapEl) marketCapEl.classList.remove('loading');
    if (volumeEl) volumeEl.classList.remove('loading');
  }

  function flashPrice() {
    priceEl.classList.remove('flash');
    void priceEl.offsetWidth;
    priceEl.classList.add('flash');
  }

  function updateDisplay(data) {
    clearLoading();
    bar.classList.remove('error');
    var newPrice = formatPrice(data.price);
    if (lastPrice !== null && newPrice !== lastPrice) flashPrice();
    priceEl.textContent = newPrice;
    lastPrice = newPrice;
    var isPositive = data.change24h >= 0;
    changeEl.className = 'btc-price-change ' + (isPositive ? 'positive' : 'negative');
    changeArrowEl.textContent = isPositive ? '\u25B2' : '\u25BC';
    changeValueEl.textContent = formatChange(data.change24h);
    if (marketCapEl && data.marketCap) marketCapEl.textContent = formatLargeNumber(data.marketCap);
    if (volumeEl && data.volume24h) volumeEl.textContent = formatLargeNumber(data.volume24h);
    lastFetchTime = Date.now();
    if (updatedEl) updatedEl.querySelector('span').textContent = 'Updated just now';
  }

  function setError() {
    clearLoading();
    bar.classList.add('error');
    if (priceEl.textContent === '--' || priceEl.textContent.trim() === '') priceEl.textContent = '--';
  }

  async function fetchCoinGecko() {
    var response = await fetch(COINGECKO_URL);
    if (!response.ok) throw new Error('CoinGecko HTTP ' + response.status);
    var json = await response.json();
    var btc = json.bitcoin;
    return { price: btc.usd, change24h: btc.usd_24h_change, marketCap: btc.usd_market_cap, volume24h: btc.usd_24h_vol };
  }

  async function fetchCoinCap() {
    var response = await fetch(COINCAP_URL);
    if (!response.ok) throw new Error('CoinCap HTTP ' + response.status);
    var json = await response.json();
    var d = json.data;
    return { price: parseFloat(d.priceUsd), change24h: parseFloat(d.changePercent24Hr), marketCap: parseFloat(d.marketCapUsd), volume24h: parseFloat(d.volumeUsd24Hr) };
  }

  async function fetchPrice() {
    try {
      var data = await fetchCoinGecko();
      updateDisplay(data);
      scheduleNext(UPDATE_INTERVAL);
    } catch (err1) {
      try {
        var data2 = await fetchCoinCap();
        updateDisplay(data2);
        scheduleNext(UPDATE_INTERVAL);
      } catch (err2) {
        setError();
        scheduleNext(RETRY_INTERVAL);
      }
    }
  }

  function scheduleNext(interval) {
    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(fetchPrice, interval);
  }

  setInterval(function () {
    if (lastFetchTime && updatedEl) updatedEl.querySelector('span').textContent = timeSince(lastFetchTime);
  }, 10000);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (updateTimer) clearTimeout(updateTimer); }
    else fetchPrice();
  });

  setLoading();
  fetchPrice();
})();

// ---- Performance Comparison ----
(function initPerformance() {
  // ============================================
  // Annual return data (%) — 2011 to 2025
  // Sources: SlickCharts, CoinGlass, NYU Stern,
  // World Gold Council, Bloomberg, Case-Shiller
  // ============================================
  var YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  var ASSETS = {
    bitcoin: {
      name: 'Bitcoin',
      color: '#f7931a',
      returns: [1473.0, 186.0, 5507.0, -58.0, 35.0, 125.0, 1369.0, -73.6, 92.2, 303.0, 59.7, -64.3, 155.4, 121.1, -6.3]
    },
    sp500: {
      name: 'S&P 500',
      color: '#4285f4',
      returns: [2.1, 16.0, 32.4, 13.7, 1.4, 12.0, 21.8, -4.4, 31.5, 18.4, 28.7, -18.1, 26.3, 25.0, 17.9]
    },
    nasdaq: {
      name: 'NASDAQ',
      color: '#8b5cf6',
      returns: [-1.0, 17.5, 40.1, 14.7, 7.0, 8.9, 29.6, -3.0, 36.7, 44.9, 22.2, -32.5, 44.6, 29.6, 21.1]
    },
    gold: {
      name: 'Gold',
      color: '#ffd700',
      returns: [10.1, 7.1, -28.0, -1.8, -10.4, 8.6, 13.2, -1.6, 18.3, 25.1, -3.7, -0.4, 13.1, 27.2, 64.6]
    },
    bonds: {
      name: 'Bonds',
      color: '#22c55e',
      returns: [7.8, 4.2, -2.0, 6.0, 0.5, 2.6, 3.5, 0.0, 8.7, 7.5, -1.5, -13.0, 5.5, 1.3, 7.1]
    },
    realestate: {
      name: 'Real Estate',
      color: '#ef4444',
      returns: [-3.9, 6.4, 10.7, 4.5, 5.2, 5.3, 6.2, 4.5, 3.7, 10.4, 18.9, 5.6, 5.7, 4.0, 3.5]
    }
  };

  var ASSET_ORDER = ['bitcoin', 'sp500', 'nasdaq', 'gold', 'bonds', 'realestate'];

  var chart = null;
  var currentPeriod = 'all';
  var currentScale = 'log';
  var currentChartType = 'line';

  // ---- Utility Functions ----
  function calculateGrowth(assetKey, startYear, endYear) {
    var asset = ASSETS[assetKey];
    var startIdx = YEARS.indexOf(startYear);
    var endIdx = YEARS.indexOf(endYear);
    if (startIdx === -1 || endIdx === -1) return [];

    var values = [100];
    for (var i = startIdx; i <= endIdx; i++) {
      var prev = values[values.length - 1];
      values.push(prev * (1 + asset.returns[i] / 100));
    }
    return values;
  }

  function calculateTotalReturn(assetKey, startYear, endYear) {
    var growth = calculateGrowth(assetKey, startYear, endYear);
    if (growth.length < 2) return 0;
    return ((growth[growth.length - 1] / 100) - 1) * 100;
  }

  function calculateCAGR(assetKey, startYear, endYear) {
    var startIdx = YEARS.indexOf(startYear);
    var endIdx = YEARS.indexOf(endYear);
    var years = endIdx - startIdx + 1;
    if (years <= 0) return 0;
    var totalReturn = calculateTotalReturn(assetKey, startYear, endYear);
    var finalMultiple = 1 + totalReturn / 100;
    if (finalMultiple <= 0) return -100;
    return (Math.pow(finalMultiple, 1 / years) - 1) * 100;
  }

  function getBestWorstYear(assetKey, startYear, endYear) {
    var asset = ASSETS[assetKey];
    var startIdx = YEARS.indexOf(startYear);
    var endIdx = YEARS.indexOf(endYear);
    var best = { year: YEARS[startIdx], value: asset.returns[startIdx] };
    var worst = { year: YEARS[startIdx], value: asset.returns[startIdx] };
    for (var i = startIdx; i <= endIdx; i++) {
      if (asset.returns[i] > best.value) { best = { year: YEARS[i], value: asset.returns[i] }; }
      if (asset.returns[i] < worst.value) { worst = { year: YEARS[i], value: asset.returns[i] }; }
    }
    return { best: best, worst: worst };
  }

  function getYearRange(period) {
    var endYear = YEARS[YEARS.length - 1];
    if (period === 'all') return { start: YEARS[0], end: endYear };
    var startYear = endYear - parseInt(period) + 1;
    if (startYear < YEARS[0]) startYear = YEARS[0];
    return { start: startYear, end: endYear };
  }

  function formatNumber(num) {
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  }

  function formatPercent(num) {
    if (Math.abs(num) >= 10000) return formatNumber(num) + '%';
    var sign = num >= 0 ? '+' : '';
    if (Math.abs(num) >= 100) return sign + num.toFixed(0) + '%';
    return sign + num.toFixed(1) + '%';
  }

  function formatDollar(num) {
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + num.toFixed(2);
  }

  // ---- Hero Stats ----
  function updateHeroStats() {
    var totalReturn = calculateTotalReturn('bitcoin', YEARS[0], YEARS[YEARS.length - 1]);
    var bw = getBestWorstYear('bitcoin', YEARS[0], YEARS[YEARS.length - 1]);
    var topCount = 0;
    for (var i = 0; i < YEARS.length; i++) {
      var btcReturn = ASSETS.bitcoin.returns[i];
      var isTop = true;
      for (var j = 1; j < ASSET_ORDER.length; j++) {
        if (ASSETS[ASSET_ORDER[j]].returns[i] > btcReturn) { isTop = false; break; }
      }
      if (isTop) topCount++;
    }

    var heroTotal = document.getElementById('perf-hero-total-return');
    var heroBest = document.getElementById('perf-hero-best-year');
    var heroTop = document.getElementById('perf-hero-top-count');

    if (heroTotal) heroTotal.textContent = formatPercent(totalReturn);
    if (heroBest) heroBest.textContent = formatPercent(bw.best.value) + ' (' + bw.best.year + ')';
    if (heroTop) heroTop.textContent = topCount + ' of ' + YEARS.length;
  }

  // ---- Chart ----

  // Custom plugin to draw % return labels at bar tips
  var barLabelPlugin = {
    id: 'barReturnLabels',
    afterDatasetsDraw: function (chart) {
      if (chart.config.type !== 'bar') return;
      var ctx = chart.ctx;
      var chartArea = chart.chartArea;
      chart.data.datasets.forEach(function (dataset, i) {
        var meta = chart.getDatasetMeta(i);
        if (meta.hidden) return;
        meta.data.forEach(function (bar, index) {
          var value = dataset.data[index];
          var returnPct = ((value / 100) - 1) * 100;
          var label = formatPercent(returnPct);
          var isNegative = returnPct < 0;

          ctx.save();
          ctx.font = "bold 11px 'Space Grotesk', sans-serif";
          ctx.textAlign = 'center';

          var yPos;
          if (isNegative) {
            // Below the bar for negative returns
            ctx.fillStyle = '#ff6b6b';
            ctx.textBaseline = 'top';
            yPos = bar.y + 6;
          } else {
            // Above the bar for positive returns
            ctx.fillStyle = dataset.borderColor[index] || dataset.borderColor;
            ctx.textBaseline = 'bottom';
            yPos = bar.y - 6;
            // Clamp to chart area so label doesn't go off-canvas
            if (yPos < chartArea.top + 14) {
              yPos = chartArea.top + 14;
            }
          }

          ctx.fillText(label, bar.x, yPos);
          ctx.restore();
        });
      });
    }
  };

  function renderChart(period) {
    var range = getYearRange(period);
    var startIdx = YEARS.indexOf(range.start);
    var endIdx = YEARS.indexOf(range.end);

    var canvas = document.getElementById('perf-growth-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    if (chart) {
      chart.destroy();
    }

    if (currentChartType === 'bar') {
      renderBarChart(ctx, canvas, range);
    } else {
      renderLineChart(ctx, canvas, range, startIdx, endIdx);
    }
  }

  function renderLineChart(ctx, canvas, range, startIdx, endIdx) {
    var labels = [range.start - 1 + ''];
    for (var y = startIdx; y <= endIdx; y++) {
      labels.push(YEARS[y] + '');
    }

    var datasets = ASSET_ORDER.map(function (key) {
      var asset = ASSETS[key];
      var growth = calculateGrowth(key, range.start, range.end);
      return {
        label: asset.name,
        data: growth,
        borderColor: asset.color,
        backgroundColor: asset.color + '15',
        borderWidth: key === 'bitcoin' ? 3 : 2,
        pointRadius: growth.length <= 16 ? 4 : 2,
        pointHoverRadius: 6,
        pointBackgroundColor: asset.color,
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false
      };
    });

    chart = new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a0a0b8',
              font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#f0f0f5',
            bodyColor: '#a0a0b8',
            borderColor: 'rgba(247, 147, 26, 0.3)',
            borderWidth: 1,
            padding: 14,
            titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: 700 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            callbacks: {
              title: function (items) {
                return 'End of ' + items[0].label;
              },
              label: function (context) {
                var value = context.parsed.y;
                var returnPct = ((value / 100) - 1) * 100;
                return ' ' + context.dataset.label + ': ' + formatDollar(value) + ' (' + formatPercent(returnPct) + ')';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
            ticks: {
              color: '#6a6a80',
              font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 500 }
            }
          },
          y: {
            type: currentScale === 'log' ? 'logarithmic' : 'linear',
            grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
            ticks: {
              color: '#6a6a80',
              font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 500 },
              callback: function (value) {
                if (currentScale === 'log') {
                  var logValues = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
                  if (logValues.indexOf(value) !== -1) return '$' + formatNumber(value);
                  return '';
                }
                return '$' + formatNumber(value);
              }
            }
          }
        }
      }
    });
  }

  function renderBarChart(ctx, canvas, range) {
    // Each asset gets one bar showing final $100 growth value
    var labels = ASSET_ORDER.map(function (key) { return ASSETS[key].name; });

    var finalValues = ASSET_ORDER.map(function (key) {
      var growth = calculateGrowth(key, range.start, range.end);
      return growth[growth.length - 1];
    });

    var colors = ASSET_ORDER.map(function (key) { return ASSETS[key].color; });
    var bgColors = colors.map(function (c) { return c + 'cc'; });

    var datasets = [{
      label: 'Growth of $100',
      data: finalValues,
      backgroundColor: bgColors,
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.7,
      categoryPercentage: 0.8
    }];

    chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: datasets },
      plugins: [barLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 24 }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#f0f0f5',
            bodyColor: '#a0a0b8',
            borderColor: 'rgba(247, 147, 26, 0.3)',
            borderWidth: 1,
            padding: 14,
            titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: 700 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            callbacks: {
              label: function (context) {
                var value = context.parsed.y;
                var returnPct = ((value / 100) - 1) * 100;
                return ' Value: ' + formatDollar(value) + ' (' + formatPercent(returnPct) + ')';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: function (context) {
                return ASSETS[ASSET_ORDER[context.index]] ? ASSETS[ASSET_ORDER[context.index]].color : '#6a6a80';
              },
              font: { family: "'Space Grotesk', sans-serif", size: 12, weight: 600 }
            }
          },
          y: {
            type: currentScale === 'log' ? 'logarithmic' : 'linear',
            grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
            beginAtZero: false,
            ticks: {
              color: '#6a6a80',
              font: { family: "'Space Grotesk', sans-serif", size: 11, weight: 500 },
              callback: function (value) {
                if (currentScale === 'log') {
                  var logValues = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
                  if (logValues.indexOf(value) !== -1) return '$' + formatNumber(value);
                  return '';
                }
                return '$' + formatNumber(value);
              }
            }
          }
        }
      }
    });
  }

  // ---- KPI Cards ----
  function renderKPIs(period) {
    var range = getYearRange(period);
    var grid = document.getElementById('perf-kpi-grid');
    if (!grid) return;

    var html = '';
    ASSET_ORDER.forEach(function (key) {
      var asset = ASSETS[key];
      var totalReturn = calculateTotalReturn(key, range.start, range.end);
      var cagr = calculateCAGR(key, range.start, range.end);
      var bw = getBestWorstYear(key, range.start, range.end);
      var isBtc = key === 'bitcoin';

      html += '<div class="perf-kpi-card' + (isBtc ? ' perf-kpi-card-btc' : '') + ' reveal visible">';
      html += '<div class="perf-kpi-header">';
      html += '<div class="perf-kpi-dot" style="background:' + asset.color + '"></div>';
      html += '<div class="perf-kpi-asset-name">' + asset.name + '</div>';
      html += '</div>';
      html += '<div class="perf-kpi-metrics">';

      html += '<div class="perf-kpi-metric">';
      html += '<span class="perf-kpi-metric-label">Total Return</span>';
      html += '<span class="perf-kpi-metric-value ' + (totalReturn >= 0 ? 'positive' : 'negative') + '">' + formatPercent(totalReturn) + '</span>';
      html += '</div>';

      html += '<div class="perf-kpi-metric">';
      html += '<span class="perf-kpi-metric-label">CAGR</span>';
      html += '<span class="perf-kpi-metric-value ' + (cagr >= 0 ? 'positive' : 'negative') + '">' + formatPercent(cagr) + '</span>';
      html += '</div>';

      html += '<div class="perf-kpi-metric">';
      html += '<span class="perf-kpi-metric-label">Best Year</span>';
      html += '<span class="perf-kpi-metric-value positive">' + formatPercent(bw.best.value) + ' (' + bw.best.year + ')</span>';
      html += '</div>';

      html += '<div class="perf-kpi-metric">';
      html += '<span class="perf-kpi-metric-label">Worst Year</span>';
      html += '<span class="perf-kpi-metric-value negative">' + formatPercent(bw.worst.value) + ' (' + bw.worst.year + ')</span>';
      html += '</div>';

      html += '</div></div>';
    });

    grid.innerHTML = html;
  }

  // ---- Heatmap Table ----
  function getHeatClass(value) {
    if (value > 100) return 'perf-heat-extreme-positive';
    if (value > 30) return 'perf-heat-very-positive';
    if (value > 10) return 'perf-heat-positive';
    if (value > 0) return 'perf-heat-slight-positive';
    if (value === 0) return 'perf-heat-neutral';
    if (value > -10) return 'perf-heat-slight-negative';
    if (value > -20) return 'perf-heat-negative';
    return 'perf-heat-very-negative';
  }

  function renderHeatmap() {
    var wrap = document.getElementById('perf-heatmap-wrap');
    if (!wrap) return;

    var html = '<table class="perf-heatmap-table">';
    html += '<thead><tr><th>Year</th>';
    ASSET_ORDER.forEach(function (key) {
      html += '<th>' + ASSETS[key].name + '</th>';
    });
    html += '</tr></thead><tbody>';

    for (var i = YEARS.length - 1; i >= 0; i--) {
      html += '<tr>';
      html += '<td>' + YEARS[i] + '</td>';

      // Find the best performing asset this year
      var bestKey = ASSET_ORDER[0];
      var bestReturn = ASSETS[ASSET_ORDER[0]].returns[i];
      ASSET_ORDER.forEach(function (key) {
        if (ASSETS[key].returns[i] > bestReturn) {
          bestReturn = ASSETS[key].returns[i];
          bestKey = key;
        }
      });

      ASSET_ORDER.forEach(function (key) {
        var val = ASSETS[key].returns[i];
        var heatClass = getHeatClass(val);
        var bestClass = (key === bestKey) ? ' perf-heatmap-best' : '';
        var sign = val >= 0 ? '+' : '';
        var display = sign + (Math.abs(val) >= 1000 ? formatNumber(val) : val.toFixed(1)) + '%';
        html += '<td class="' + heatClass + bestClass + '">' + display + '</td>';
      });

      html += '</tr>';
    }

    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  // ---- Insights ----
  function renderInsights() {
    var grid = document.getElementById('perf-insights-grid');
    if (!grid) return;

    // Insight 1: Years Bitcoin was #1
    var topCount = 0;
    for (var i = 0; i < YEARS.length; i++) {
      var btcReturn = ASSETS.bitcoin.returns[i];
      var isTop = true;
      for (var j = 1; j < ASSET_ORDER.length; j++) {
        if (ASSETS[ASSET_ORDER[j]].returns[i] > btcReturn) { isTop = false; break; }
      }
      if (isTop) topCount++;
    }

    // Insight 2: $100 growth comparison
    var btcGrowth = calculateGrowth('bitcoin', YEARS[0], YEARS[YEARS.length - 1]);
    var spGrowth = calculateGrowth('sp500', YEARS[0], YEARS[YEARS.length - 1]);
    var btcFinal = btcGrowth[btcGrowth.length - 1];
    var spFinal = spGrowth[spGrowth.length - 1];

    // Insight 3: CAGR comparison
    var btcCAGR = calculateCAGR('bitcoin', YEARS[0], YEARS[YEARS.length - 1]);
    var bestTraditionalCAGR = 0;
    var bestTraditionalName = '';
    for (var k = 1; k < ASSET_ORDER.length; k++) {
      var c = calculateCAGR(ASSET_ORDER[k], YEARS[0], YEARS[YEARS.length - 1]);
      if (c > bestTraditionalCAGR) {
        bestTraditionalCAGR = c;
        bestTraditionalName = ASSETS[ASSET_ORDER[k]].name;
      }
    }
    var cagrMultiple = bestTraditionalCAGR > 0 ? (btcCAGR / bestTraditionalCAGR).toFixed(0) : '?';

    var html = '';

    // Card 1
    html += '<div class="perf-insight-card reveal visible">';
    html += '<div class="perf-insight-icon">\uD83C\uDFC6</div>';
    html += '<div class="perf-insight-value">' + topCount + ' of ' + YEARS.length + ' Years</div>';
    html += '<div class="perf-insight-desc">Bitcoin was the #1 performing asset class, outperforming stocks, gold, bonds, and real estate.</div>';
    html += '</div>';

    // Card 2
    html += '<div class="perf-insight-card reveal visible">';
    html += '<div class="perf-insight-icon">\uD83D\uDCB0</div>';
    html += '<div class="perf-insight-value">' + formatDollar(btcFinal) + '</div>';
    html += '<div class="perf-insight-desc">What $100 invested in Bitcoin in ' + (YEARS[0] - 1) + ' would be worth today, compared to ' + formatDollar(spFinal) + ' in the S&P 500.</div>';
    html += '</div>';

    // Card 3
    html += '<div class="perf-insight-card reveal visible">';
    html += '<div class="perf-insight-icon">\uD83D\uDE80</div>';
    html += '<div class="perf-insight-value">' + cagrMultiple + 'x Higher CAGR</div>';
    html += '<div class="perf-insight-desc">Bitcoin\'s compound annual growth rate of ' + formatPercent(btcCAGR) + ' is ' + cagrMultiple + 'x higher than the next best asset (' + bestTraditionalName + ' at ' + formatPercent(bestTraditionalCAGR) + ').</div>';
    html += '</div>';

    grid.innerHTML = html;
  }

  // ---- Event Handlers ----
  function initControls() {
    // Time period pills
    var pills = document.querySelectorAll('.perf-time-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        currentPeriod = pill.getAttribute('data-period');
        renderChart(currentPeriod);
        renderKPIs(currentPeriod);
      });
    });

    // Chart type toggle
    var lineBtn = document.getElementById('perf-type-line');
    var barBtn = document.getElementById('perf-type-bar');
    if (lineBtn && barBtn) {
      lineBtn.addEventListener('click', function () {
        currentChartType = 'line';
        lineBtn.classList.add('active');
        barBtn.classList.remove('active');
        renderChart(currentPeriod);
      });
      barBtn.addEventListener('click', function () {
        currentChartType = 'bar';
        barBtn.classList.add('active');
        lineBtn.classList.remove('active');
        renderChart(currentPeriod);
      });
    }

    // Scale toggle
    var logBtn = document.getElementById('perf-scale-log');
    var linearBtn = document.getElementById('perf-scale-linear');
    if (logBtn && linearBtn) {
      logBtn.addEventListener('click', function () {
        currentScale = 'log';
        logBtn.classList.add('active');
        linearBtn.classList.remove('active');
        renderChart(currentPeriod);
      });
      linearBtn.addEventListener('click', function () {
        currentScale = 'linear';
        linearBtn.classList.add('active');
        logBtn.classList.remove('active');
        renderChart(currentPeriod);
      });
    }
  }

  // ---- Initialize ----
  updateHeroStats();
  initControls();
  renderChart('all');
  renderKPIs('all');
  renderHeatmap();
  renderInsights();
})();

// ---- Scroll Reveal ----
(function initScrollReveal() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();
