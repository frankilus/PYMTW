/* ============================================
   The Whitepaper Decoded - JavaScript
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

// ---- Reading Progress Bar ----
(function initProgressBar() {
  var fill = document.getElementById('wp-progress-fill');
  if (!fill) return;

  function updateProgress() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = Math.min(progress, 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// ---- Sidebar Scroll Spy & Navigation ----
(function initScrollSpy() {
  var sidebarLinks = document.querySelectorAll('.wp-sidebar-link');
  var mobilePills = document.querySelectorAll('.wp-mobile-pill');
  var sections = document.querySelectorAll('.wp-section-card');
  if (sections.length === 0) return;

  // Click handlers for sidebar links
  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);
      if (target) {
        var offset = 110;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // Click handlers for mobile pills
  mobilePills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var sectionNum = this.getAttribute('data-section');
      var target = document.getElementById('wp-section-' + sectionNum);
      if (target) {
        var offset = 130;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // IntersectionObserver to track active section
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var sectionNum = entry.target.getAttribute('data-section');

        // Update sidebar
        sidebarLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('data-section') === sectionNum);
        });

        // Update mobile pills
        mobilePills.forEach(function (pill) {
          pill.classList.toggle('active', pill.getAttribute('data-section') === sectionNum);
        });

        // Auto-scroll active mobile pill into view
        var activePill = document.querySelector('.wp-mobile-pill.active');
        if (activePill) {
          activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    });
  }, {
    rootMargin: '-120px 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(function (section) {
    observer.observe(section);
  });

  // Start button smooth scroll
  var startBtn = document.getElementById('wp-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('wp-section-0');
      if (target) {
        var offset = 110;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }
})();

// ---- Expand/Collapse Original Text ----
(function initExpandCollapse() {
  var toggles = document.querySelectorAll('.wp-original-toggle');

  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var parent = this.closest('.wp-original');
      var isOpen = parent.classList.contains('open');
      var expanded = !isOpen;

      parent.classList.toggle('open');
      this.setAttribute('aria-expanded', expanded.toString());
    });
  });
})();

// ---- Concept Tag Tooltips ----
(function initTooltips() {
  var tooltip = document.getElementById('wp-tooltip');
  var tooltipContent = document.getElementById('wp-tooltip-content');
  if (!tooltip || !tooltipContent) return;

  var GLOSSARY = {
    'peer-to-peer': 'A network where participants communicate directly with each other, without a central server or intermediary.',
    'double-spending': 'The risk that digital currency could be spent twice. Bitcoin solves this without a central authority.',
    'cryptographic-proof': 'Mathematical evidence that verifies something is true without requiring trust in a third party.',
    'trusted-third-party': 'An entity (like a bank) that both parties in a transaction must trust to be honest and process payments correctly.',
    'digital-signatures': 'A mathematical scheme that proves ownership and prevents tampering, like a handwritten signature but unforgeable.',
    'hash-function': 'A one-way mathematical function that converts any data into a fixed-size string of characters.',
    'sha-256': 'The specific hash function Bitcoin uses. Produces a unique 256-bit output for any input.',
    'merkle-tree': 'A data structure that efficiently summarizes all transactions in a block, allowing verification without downloading everything.',
    'proof-of-work': 'A system requiring computational effort to produce a valid block, making it costly to attack but easy to verify.',
    'nonce': 'A number that miners change to find a valid hash. Short for "number used once."',
    'block': 'A bundle of verified transactions added to the blockchain roughly every 10 minutes.',
    'blockchain': 'A chain of blocks, each referencing the previous one, creating a tamper-proof ledger of all transactions.',
    'node': 'A computer running Bitcoin software that validates transactions and blocks.',
    'mining': 'Using computational power to validate transactions and add new blocks in exchange for bitcoin rewards.',
    'consensus': 'The process by which all nodes agree on the valid state of the blockchain without central coordination.',
    'spv': 'Simplified Payment Verification: verifying transactions without downloading the entire blockchain.',
    'utxo': 'Unspent Transaction Output: the fundamental unit of Bitcoin accounting, like specific bills in your wallet.',
    'public-key': 'Your Bitcoin address, derived from your private key. Safe to share \u2014 it\'s how others send you bitcoin.',
    'private-key': 'A secret number that proves ownership of your bitcoin. Never share it \u2014 whoever has it controls your funds.',
    '51-attack': 'A theoretical attack where someone controls >50% of mining power. Economically irrational due to the cost.',
    'timestamp': 'A record of when a block was created, establishing chronological order of transactions.',
    'reversible-transactions': 'Transactions that can be undone (like credit card chargebacks). Bitcoin transactions are irreversible.',
    'hash-chain': 'A series of hashes where each includes the previous, creating an unbreakable link between blocks.',
    'game-theory': 'The study of strategic decision-making. Bitcoin uses game theory to incentivize honest behavior.',
    'block-reward': 'New bitcoin created with each block, paid to the miner. Currently 3.125 BTC, halves every ~4 years.',
    'transaction-fees': 'Small amounts paid by senders to incentivize miners to include their transaction in a block.',
    'halving': 'The event every ~210,000 blocks where the block reward is cut in half, controlling Bitcoin\'s supply.',
    'pseudonymity': 'Being identified by a consistent alias (public key) rather than your real-world identity.',
    'confirmation': 'Each new block added after your transaction\'s block. More confirmations = more security.',
    'gamblers-ruin': 'A probability concept showing that an attacker with less than 50% hashrate will eventually fail.'
  };

  var tags = document.querySelectorAll('.wp-concept-tag[data-term]');

  tags.forEach(function (tag) {
    tag.addEventListener('mouseenter', function (e) {
      var term = this.getAttribute('data-term');
      var def = GLOSSARY[term];
      if (!def) return;

      tooltipContent.innerHTML = '<strong>' + this.textContent + '</strong>' + def;
      tooltip.classList.add('visible');
      tooltip.setAttribute('aria-hidden', 'false');
      positionTooltip(this);
    });

    tag.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
      tooltip.setAttribute('aria-hidden', 'true');
    });
  });

  function positionTooltip(el) {
    var rect = el.getBoundingClientRect();
    var tooltipWidth = 300;
    var x = rect.left + rect.width / 2 - tooltipWidth / 2;
    var y = rect.top - 10;

    // Position above the element
    tooltip.style.left = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10)) + 'px';
    tooltip.style.top = 'auto';
    tooltip.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
  }
})();

// ---- Scroll Reveal ----
(function initScrollReveal() {
  var revealElements = document.querySelectorAll('.reveal');

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

  revealElements.forEach(function (el) {
    observer.observe(el);
  });
})();
