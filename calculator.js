/* ============================================
   Bitcoin Net Worth Calculator - JavaScript
   ============================================ */

// ---- Navbar Scroll & Hamburger ----
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
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
    });
  });
})();

// ---- Live Bitcoin Price Feed ----
(function initBitcoinPrice() {
  const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true';
  const COINCAP_URL = 'https://api.coincap.io/v2/assets/bitcoin';
  const UPDATE_INTERVAL = 60000;
  const RETRY_INTERVAL = 15000;

  const bar = document.getElementById('btc-price-bar');
  const priceEl = document.getElementById('btc-price-value');
  const changeEl = document.getElementById('btc-price-change');
  const changeArrowEl = document.getElementById('btc-change-arrow');
  const changeValueEl = document.getElementById('btc-change-value');
  const marketCapEl = document.getElementById('btc-market-cap');
  const volumeEl = document.getElementById('btc-volume');
  const updatedEl = document.getElementById('btc-price-updated');

  if (!bar || !priceEl) return;

  let lastPrice = null;
  let updateTimer = null;
  let lastFetchTime = null;

  function formatPrice(num) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    if (lastPrice !== null && newPrice !== lastPrice) {
      flashPrice();
    }
    priceEl.textContent = newPrice;
    lastPrice = newPrice;

    var isPositive = data.change24h >= 0;
    changeEl.className = 'btc-price-change ' + (isPositive ? 'positive' : 'negative');
    changeArrowEl.textContent = isPositive ? '\u25B2' : '\u25BC';
    changeValueEl.textContent = formatChange(data.change24h);

    if (marketCapEl && data.marketCap) {
      marketCapEl.textContent = formatLargeNumber(data.marketCap);
    }

    if (volumeEl && data.volume24h) {
      volumeEl.textContent = formatLargeNumber(data.volume24h);
    }

    lastFetchTime = Date.now();
    if (updatedEl) {
      updatedEl.querySelector('span').textContent = 'Updated just now';
    }

    // Dispatch event so calculator can use the live price
    window.dispatchEvent(new CustomEvent('btcPriceUpdate', { detail: { price: data.price } }));
  }

  function setError() {
    clearLoading();
    bar.classList.add('error');
    if (priceEl.textContent === '--' || priceEl.textContent.trim() === '') {
      priceEl.textContent = '--';
    }
  }

  async function fetchCoinGecko() {
    var response = await fetch(COINGECKO_URL);
    if (!response.ok) throw new Error('CoinGecko HTTP ' + response.status);
    var json = await response.json();
    var btc = json.bitcoin;
    return {
      price: btc.usd,
      change24h: btc.usd_24h_change,
      marketCap: btc.usd_market_cap,
      volume24h: btc.usd_24h_vol
    };
  }

  async function fetchCoinCap() {
    var response = await fetch(COINCAP_URL);
    if (!response.ok) throw new Error('CoinCap HTTP ' + response.status);
    var json = await response.json();
    var d = json.data;
    return {
      price: parseFloat(d.priceUsd),
      change24h: parseFloat(d.changePercent24Hr),
      marketCap: parseFloat(d.marketCapUsd),
      volume24h: parseFloat(d.volumeUsd24Hr)
    };
  }

  async function fetchPrice() {
    try {
      var data = await fetchCoinGecko();
      updateDisplay(data);
      scheduleNext(UPDATE_INTERVAL);
    } catch (err1) {
      console.warn('[BTC Price] CoinGecko failed, trying CoinCap...', err1);
      try {
        var data2 = await fetchCoinCap();
        updateDisplay(data2);
        scheduleNext(UPDATE_INTERVAL);
      } catch (err2) {
        console.warn('[BTC Price] CoinCap also failed.', err2);
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
    if (lastFetchTime && updatedEl) {
      updatedEl.querySelector('span').textContent = timeSince(lastFetchTime);
    }
  }, 10000);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (updateTimer) clearTimeout(updateTimer);
    } else {
      fetchPrice();
    }
  });

  setLoading();
  fetchPrice();
})();


// ---- Net Worth Calculator Engine ----
(function initCalculator() {
  var currentBtcPrice = 0;

  // Category colors for breakdown
  var categoryColors = {
    cash: '#4ade80',
    investments: '#60a5fa',
    realestate: '#c084fc',
    bitcoin: '#f7931a',
    other: '#fbbf24'
  };

  var categoryLabels = {
    cash: 'Cash',
    investments: 'Investments',
    realestate: 'Real Estate',
    bitcoin: 'Bitcoin',
    other: 'Other'
  };

  // Price targets for projection
  var priceTargets = [150000, 250000, 500000, 1000000, 2000000];

  // DOM elements
  var netWorthEl = document.getElementById('calc-net-worth');
  var btcWorthEl = document.getElementById('calc-btc-worth');
  var totalAssetsEl = document.getElementById('calc-total-assets');
  var totalLiabilitiesEl = document.getElementById('calc-total-liabilities');
  var allocationEl = document.getElementById('calc-allocation');
  var btcPctEl = document.getElementById('calc-btc-pct');
  var allocationFillEl = document.getElementById('calc-allocation-fill');
  var breakdownEl = document.getElementById('calc-breakdown');
  var breakdownBarEl = document.getElementById('calc-breakdown-bar');
  var breakdownLegendEl = document.getElementById('calc-breakdown-legend');
  var projectionEl = document.getElementById('calc-projection');
  var projectionGridEl = document.getElementById('calc-projection-grid');
  var btcAmountInput = document.getElementById('btc-amount-input');
  var btcUsdHint = document.getElementById('btc-usd-hint');

  if (!netWorthEl) return;

  // Listen for live BTC price updates
  window.addEventListener('btcPriceUpdate', function (e) {
    currentBtcPrice = e.detail.price;
    recalculate();
  });

  // --- Collapsible Categories ---
  document.querySelectorAll('.calc-category-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var category = header.closest('.calc-category');
      category.classList.toggle('open');
    });
  });

  // --- Input change listeners ---
  document.querySelectorAll('.calc-input-wrap input').forEach(function (input) {
    input.addEventListener('input', recalculate);
  });

  // --- Format helpers ---
  function formatUSD(num) {
    if (num < 0) {
      return '-$' + Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function formatBTC(num) {
    return '₿ ' + num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  function formatCompact(num) {
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
    return '$' + num.toFixed(0);
  }

  function formatTargetPrice(num) {
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(0) + 'M';
    return '$' + (num / 1e3).toFixed(0) + 'K';
  }

  // --- Recalculation Engine ---
  function recalculate() {
    // Sum assets by category
    var assetsByCategory = { cash: 0, investments: 0, realestate: 0, bitcoin: 0, other: 0 };

    document.querySelectorAll('input[data-asset]').forEach(function (input) {
      var cat = input.getAttribute('data-asset');
      var val = parseFloat(input.value) || 0;

      if (cat === 'bitcoin') {
        // BTC field is in BTC units, convert to USD
        val = val * currentBtcPrice;
      }

      assetsByCategory[cat] = (assetsByCategory[cat] || 0) + val;
    });

    // Sum liabilities
    var totalLiabilities = 0;
    document.querySelectorAll('input[data-liability]').forEach(function (input) {
      var val = parseFloat(input.value) || 0;
      totalLiabilities += val;

      // Update individual liability category totals
      var cat = input.getAttribute('data-liability');
      var totalEl = document.querySelector('[data-total="' + cat + '"]');
      if (totalEl) {
        totalEl.textContent = formatUSD(val);
      }
    });

    // Calculate total assets
    var totalAssets = 0;
    for (var cat in assetsByCategory) {
      totalAssets += assetsByCategory[cat];
    }

    // Update category totals in headers
    for (var c in assetsByCategory) {
      var totalEl = document.querySelector('[data-total="' + c + '"]');
      if (totalEl) {
        totalEl.textContent = formatUSD(assetsByCategory[c]);
      }
    }

    // Net worth
    var netWorth = totalAssets - totalLiabilities;

    // Update displays
    netWorthEl.textContent = formatUSD(netWorth);
    netWorthEl.classList.toggle('negative', netWorth < 0);

    totalAssetsEl.textContent = formatUSD(totalAssets);
    totalLiabilitiesEl.textContent = formatUSD(totalLiabilities);

    // BTC denomination
    if (currentBtcPrice > 0) {
      btcWorthEl.textContent = formatBTC(netWorth / currentBtcPrice);
    } else {
      btcWorthEl.textContent = '₿ --';
    }

    // BTC USD hint
    var btcAmount = parseFloat(btcAmountInput ? btcAmountInput.value : 0) || 0;
    if (btcUsdHint) {
      if (btcAmount > 0 && currentBtcPrice > 0) {
        btcUsdHint.textContent = btcAmount.toFixed(8) + ' BTC = ' + formatUSD(btcAmount * currentBtcPrice);
      } else if (currentBtcPrice > 0) {
        btcUsdHint.textContent = 'Live BTC price: ' + formatUSD(currentBtcPrice);
      } else {
        btcUsdHint.textContent = 'Fetching live BTC price...';
      }
    }

    // Bitcoin allocation
    if (totalAssets > 0 && assetsByCategory.bitcoin > 0) {
      var pct = (assetsByCategory.bitcoin / totalAssets) * 100;
      allocationEl.style.display = 'block';
      btcPctEl.textContent = pct.toFixed(1) + '%';
      allocationFillEl.style.width = Math.min(pct, 100) + '%';
    } else {
      allocationEl.style.display = 'none';
    }

    // Asset breakdown bar
    if (totalAssets > 0) {
      breakdownEl.style.display = 'block';
      updateBreakdownBar(assetsByCategory, totalAssets);
    } else {
      breakdownEl.style.display = 'none';
    }

    // Projection table
    if (btcAmount > 0 && currentBtcPrice > 0) {
      updateProjection(btcAmount, assetsByCategory, totalLiabilities);
    } else {
      showProjectionPrompt();
    }
  }

  // --- Asset Breakdown Bar ---
  function updateBreakdownBar(assetsByCategory, totalAssets) {
    breakdownBarEl.innerHTML = '';
    breakdownLegendEl.innerHTML = '';

    var cats = ['cash', 'investments', 'realestate', 'bitcoin', 'other'];

    cats.forEach(function (cat) {
      var val = assetsByCategory[cat] || 0;
      if (val <= 0) return;

      var pct = (val / totalAssets) * 100;

      // Bar segment
      var seg = document.createElement('div');
      seg.className = 'calc-breakdown-segment';
      seg.style.width = pct + '%';
      seg.style.background = categoryColors[cat];
      breakdownBarEl.appendChild(seg);

      // Legend item
      var legendItem = document.createElement('div');
      legendItem.className = 'calc-legend-item';
      legendItem.innerHTML = '<span class="calc-legend-dot" style="background:' + categoryColors[cat] + '"></span>' +
        categoryLabels[cat] + ' ' + pct.toFixed(0) + '%';
      breakdownLegendEl.appendChild(legendItem);
    });
  }

  // --- Projection Prompt (no BTC entered) ---
  function showProjectionPrompt() {
    projectionGridEl.innerHTML =
      '<div class="calc-proj-empty">' +
        '<div class="calc-proj-empty-icon">₿</div>' +
        '<p>Enter your Bitcoin amount above to see how your net worth changes at different BTC price targets.</p>' +
      '</div>';
  }

  // --- Projection Cards ---
  function updateProjection(btcAmount, assetsByCategory, totalLiabilities) {
    projectionGridEl.innerHTML = '';

    // Current non-BTC assets
    var nonBtcAssets = 0;
    for (var cat in assetsByCategory) {
      if (cat !== 'bitcoin') {
        nonBtcAssets += assetsByCategory[cat];
      }
    }

    var currentNetWorth = nonBtcAssets + assetsByCategory.bitcoin - totalLiabilities;

    priceTargets.forEach(function (target) {
      var projectedBtcValue = btcAmount * target;
      var projectedNetWorth = nonBtcAssets + projectedBtcValue - totalLiabilities;
      var change = projectedNetWorth - currentNetWorth;

      var card = document.createElement('div');
      card.className = 'calc-proj-card';

      var changeText = change >= 0
        ? '<span class="arrow">▲</span> +' + formatCompact(change)
        : '<span class="arrow">▼</span> ' + formatCompact(change);

      card.innerHTML =
        '<div class="calc-proj-target">If BTC reaches</div>' +
        '<div class="calc-proj-price">' + formatTargetPrice(target) + '</div>' +
        '<div class="calc-proj-btc-value">' + btcAmount.toFixed(4) + ' BTC = ' + formatUSD(projectedBtcValue) + '</div>' +
        '<div class="calc-proj-net-worth">' + formatUSD(projectedNetWorth) + '</div>' +
        '<div class="calc-proj-change">' + changeText + '</div>';

      projectionGridEl.appendChild(card);
    });
  }

  // Initial calculation
  recalculate();
})();
