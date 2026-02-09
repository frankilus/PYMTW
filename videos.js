/* ============================================
   Bitcoin Video Library - JavaScript
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


// ---- Video Library ----
(function initVideoLibrary() {

  // =====================
  // VIDEO DATA
  // =====================
  var VIDEO_DATA = {
    essentials: {
      title: 'Bitcoin Essentials',
      subtitle: 'Start here. The best beginner-friendly explainers.',
      videos: [
        { id: 'bBC-nXj3Ng4', title: 'But how does bitcoin actually work?', creator: '3Blue1Brown', duration: '26:21' },
        { id: 'l9jOJk30eQs', title: 'How Bitcoin Works in 5 Minutes (Technical)', creator: 'CuriousInventor', duration: '5:24' },
        { id: '41JCpzvnn_0', title: 'What is Bitcoin?', creator: 'Whiteboard Crypto', duration: '10:09' },
        { id: 'SSo_EIwHSd4', title: 'How does a blockchain work?', creator: 'Simply Explained', duration: '5:55' },
        { id: 'kubGCSj5y3k', title: 'Bitcoin for Beginners', creator: 'Andreas Antonopoulos', duration: '23:51' },
        { id: 'Gc2en3nHxA4', title: 'The Trust Machine - The Story of Bitcoin', creator: 'ColdFusion', duration: '19:36' }
      ]
    },
    economics: {
      title: 'Economics & Money',
      subtitle: 'Understanding money, inflation, and why Bitcoin matters.',
      videos: [
        { id: 'DyV0OfU3-FU', title: 'Hidden Secrets of Money - Ep 1', creator: 'Mike Maloney', duration: '29:28' },
        { id: 'jqvKjsIxT_8', title: 'Money As Debt', creator: 'Paul Grignon', duration: '47:07' },
        { id: 'zpNlG3VtcBM', title: 'Bitcoin: The End of Money As We Know It', creator: 'Torsten Hoffmann', duration: '1:16:36' },
        { id: 'sDNN0uH2Z3o', title: 'Why Blockchain Matters More Than You Think', creator: 'ColdFusion', duration: '16:38' },
        { id: 'SaLCJMwMmgo', title: 'Masters and Slaves of Money', creator: 'Robert Breedlove', duration: '45:21' }
      ]
    },
    technical: {
      title: 'Deep Dives & Technical',
      subtitle: 'How the technology works under the hood.',
      videos: [
        { id: 'SSo_EIwHSd4', title: 'How does a blockchain work?', creator: 'Simply Explained', duration: '5:55' },
        { id: 'rrr_zPmEiME', title: "Bitcoin's Lightning Network, Explained", creator: 'Simply Explained', duration: '5:33' },
        { id: 'NF1pwjL9-DE', title: 'Elliptic Curve Cryptography', creator: 'Computerphile', duration: '11:41' },
        { id: 'orIgy2MjqrA', title: 'SHA-256 Hash - How does it work?', creator: 'Computerphile', duration: '10:02' },
        { id: 'bBC-nXj3Ng4', title: 'But how does bitcoin actually work?', creator: '3Blue1Brown', duration: '26:21' }
      ]
    },
    interviews: {
      title: 'Interviews & Conversations',
      subtitle: 'Long-form conversations with leading Bitcoin thinkers.',
      videos: [
        { id: 'mC43pZkpTec', title: 'Michael Saylor: Bitcoin, Inflation & the Future of Money', creator: 'Lex Fridman #276', duration: '3:55:00' },
        { id: 'dD2-T7TX2rk', title: 'Jack Mallers at Bitcoin 2022', creator: 'Bitcoin Magazine', duration: '45:00' },
        { id: 'Zbm772vF-5M', title: 'The Bitcoin Standard (Presentation)', creator: 'Saifedean Ammous', duration: '1:00:00' },
        { id: 'IHg6ixt3CKc', title: 'Anthony Pompliano on Bitcoin', creator: 'Lex Fridman #171', duration: '2:30:00' }
      ]
    },
    security: {
      title: 'Security & Self-Custody',
      subtitle: 'Protect your Bitcoin. Your keys, your coins.',
      videos: [
        { id: 'Y1OBIGslgGM', title: 'Why Self-Custody Matters', creator: 'Andreas Antonopoulos', duration: '15:42' },
        { id: 'R0YWdw2AOCg', title: 'How To Use a Bitcoin Hardware Wallet', creator: 'BTC Sessions', duration: '20:15' },
        { id: 'nYm8ROOSRCk', title: 'Bitcoin Security Made Simple', creator: 'BTC Sessions', duration: '15:30' },
        { id: 'lt2FhYOWK5g', title: 'Seed Phrase Security Guide', creator: 'BTC Sessions', duration: '12:18' }
      ]
    },
    documentaries: {
      title: 'Culture & Documentaries',
      subtitle: 'The people, stories, and history behind Bitcoin.',
      videos: [
        { id: 'b4xuRZYLpgk', title: 'God Bless Bitcoin', creator: 'God Bless Bitcoin (2024)', duration: '1:29:00' },
        { id: 'b-7dMVcVWgc', title: 'This Machine Greens', creator: 'Swan Bitcoin (2021)', duration: '43:00' },
        { id: 'LszOt51OjXU', title: 'Bitcoin: Beyond the Bubble', creator: 'Tim Delmastro (2018)', duration: '35:00' },
        { id: 'zpNlG3VtcBM', title: 'Bitcoin: The End of Money As We Know It', creator: 'Torsten Hoffmann (2015)', duration: '1:16:36' }
      ]
    }
  };

  // =====================
  // DOM REFERENCES
  // =====================
  var modal = document.getElementById('vid-modal');
  var modalIframe = document.getElementById('vid-modal-iframe');
  var modalTitle = document.getElementById('vid-modal-title');
  var modalCreator = document.getElementById('vid-modal-creator');
  var modalClose = document.getElementById('vid-modal-close');
  var modalBackdrop = document.getElementById('vid-modal-backdrop');
  var searchInput = document.getElementById('vid-search');
  var searchClear = document.getElementById('vid-search-clear');
  var resultsSection = document.getElementById('vid-search-results');
  var resultsGrid = document.getElementById('vid-search-results-grid');
  var resultsTitle = document.getElementById('vid-search-results-title');
  var resultsClearBtn = document.getElementById('vid-search-results-clear');
  var spotlight = document.querySelector('.vid-spotlight');
  var catNav = document.getElementById('vid-cat-nav');

  // =====================
  // CARD BUILDER
  // =====================
  function createCard(video) {
    var card = document.createElement('article');
    card.className = 'vid-card';
    card.setAttribute('data-video-id', video.id);
    card.setAttribute('data-title', video.title.toLowerCase());
    card.setAttribute('data-creator', video.creator.toLowerCase());

    card.innerHTML =
      '<div class="vid-card-thumb">' +
        '<img src="https://img.youtube.com/vi/' + video.id + '/hqdefault.jpg" ' +
             'alt="' + video.title.replace(/"/g, '&quot;') + '" loading="lazy" ' +
             'onerror="this.src=\'https://img.youtube.com/vi/' + video.id + '/default.jpg\'">' +
        '<div class="vid-card-overlay">' +
          '<button class="vid-play-btn" aria-label="Play video">' +
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
          '</button>' +
        '</div>' +
        '<span class="vid-duration-badge">' + video.duration + '</span>' +
      '</div>' +
      '<div class="vid-card-info">' +
        '<h3 class="vid-card-title">' + video.title + '</h3>' +
        '<p class="vid-card-creator">' + video.creator + '</p>' +
      '</div>';

    card.addEventListener('click', function () {
      openModal(video.id, video.title, video.creator);
    });

    return card;
  }

  // =====================
  // RENDER CAROUSELS
  // =====================
  function renderCarousels() {
    var categories = Object.keys(VIDEO_DATA);
    categories.forEach(function (catKey) {
      var cat = VIDEO_DATA[catKey];
      var track = document.querySelector('[data-carousel="' + catKey + '"] .vid-carousel-track');
      if (!track) return;

      track.innerHTML = '';
      cat.videos.forEach(function (video) {
        track.appendChild(createCard(video));
      });
    });
  }

  // =====================
  // CAROUSEL ARROWS
  // =====================
  function initCarouselArrows() {
    document.querySelectorAll('.vid-category').forEach(function (section) {
      var track = section.querySelector('.vid-carousel-track');
      var leftBtn = section.querySelector('.vid-arrow-left');
      var rightBtn = section.querySelector('.vid-arrow-right');
      if (!track || !leftBtn || !rightBtn) return;

      function getCardWidth() {
        var firstCard = track.querySelector('.vid-card');
        return firstCard ? firstCard.offsetWidth + 20 : 300;
      }

      function updateArrows() {
        leftBtn.disabled = track.scrollLeft <= 10;
        rightBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      }

      leftBtn.addEventListener('click', function () {
        track.scrollBy({ left: -getCardWidth() * 2, behavior: 'smooth' });
      });

      rightBtn.addEventListener('click', function () {
        track.scrollBy({ left: getCardWidth() * 2, behavior: 'smooth' });
      });

      track.addEventListener('scroll', updateArrows);
      window.addEventListener('resize', updateArrows);
      setTimeout(updateArrows, 100);
    });
  }

  // =====================
  // VIDEO MODAL
  // =====================
  function openModal(videoId, title, creator) {
    if (!modal || !modalIframe) return;
    modalIframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
    if (modalTitle) modalTitle.textContent = title;
    if (modalCreator) modalCreator.textContent = creator;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    if (modalIframe) modalIframe.src = '';
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Spotlight click
  var spotlightCard = document.querySelector('.vid-spotlight-card');
  if (spotlightCard) {
    spotlightCard.addEventListener('click', function (e) {
      var videoId = this.getAttribute('data-video-id');
      if (videoId) {
        openModal(videoId, 'But how does bitcoin actually work?', '3Blue1Brown');
      }
    });
  }

  // =====================
  // CATEGORY NAV (Sticky Pills + Scroll Spy)
  // =====================
  function initCategoryNav() {
    var pills = document.querySelectorAll('.vid-cat-pill');
    var sections = document.querySelectorAll('.vid-category');

    // Click: smooth scroll to section
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var catId = 'cat-' + this.getAttribute('data-category');
        var target = document.getElementById(catId);
        if (target) {
          var offset = 140;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // Scroll spy: update active pill
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var cat = entry.target.getAttribute('data-category');
          pills.forEach(function (p) {
            p.classList.toggle('active', p.getAttribute('data-category') === cat);
          });
          // Scroll active pill into view in the pill bar
          var activePill = document.querySelector('.vid-cat-pill.active');
          if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      });
    }, {
      rootMargin: '-140px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // =====================
  // SEARCH
  // =====================
  function initSearch() {
    if (!searchInput) return;

    var carouselSections = document.querySelectorAll('.vid-category');

    // Build flat deduplicated list for search
    var allVideos = [];
    var seenIds = {};
    Object.keys(VIDEO_DATA).forEach(function (catKey) {
      VIDEO_DATA[catKey].videos.forEach(function (v) {
        if (!seenIds[v.id]) {
          seenIds[v.id] = true;
          allVideos.push({ id: v.id, title: v.title, creator: v.creator, duration: v.duration, category: catKey });
        }
      });
    });

    var debounceTimer;

    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 250);
      if (searchClear) searchClear.style.display = this.value.length > 0 ? 'flex' : 'none';
    });

    function performSearch() {
      var query = searchInput.value.trim().toLowerCase();
      if (query.length < 2) {
        clearSearch();
        return;
      }

      var results = allVideos.filter(function (v) {
        return v.title.toLowerCase().indexOf(query) !== -1 ||
               v.creator.toLowerCase().indexOf(query) !== -1;
      });

      // Hide carousels, show results
      carouselSections.forEach(function (s) { s.style.display = 'none'; });
      if (spotlight) spotlight.style.display = 'none';
      if (catNav) catNav.style.display = 'none';
      if (resultsSection) resultsSection.style.display = 'block';

      if (resultsTitle) resultsTitle.textContent = 'Results for "' + searchInput.value.trim() + '"';
      if (resultsGrid) {
        resultsGrid.innerHTML = '';

        if (results.length === 0) {
          resultsGrid.innerHTML = '<div class="vid-no-results">No videos found. Try a different search term.</div>';
          return;
        }

        results.forEach(function (video) {
          resultsGrid.appendChild(createCard(video));
        });
      }
    }

    function clearSearch() {
      searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (resultsSection) resultsSection.style.display = 'none';
      carouselSections.forEach(function (s) { s.style.display = ''; });
      if (spotlight) spotlight.style.display = '';
      if (catNav) catNav.style.display = '';
    }

    if (searchClear) searchClear.addEventListener('click', clearSearch);
    if (resultsClearBtn) resultsClearBtn.addEventListener('click', clearSearch);
  }

  // =====================
  // INITIALIZE
  // =====================
  renderCarousels();
  initCarouselArrows();
  initCategoryNav();
  initSearch();

})();
