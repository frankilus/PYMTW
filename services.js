/* ============================================
   Bitcoin Services - JavaScript
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

// ---- Smooth Scroll for Anchor Links ----
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        var offset = 100;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
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

// ---- FAQ Accordion ----
(function initFAQ() {
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (i) { i.classList.remove('active'); });
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
})();

// ---- Inquiry Form Validation & Submission ----
(function initInquiryForm() {
  var form = document.getElementById('svc-form');
  var submitBtn = document.getElementById('svc-submit-btn');
  var statusEl = document.getElementById('svc-form-status');

  if (!form || !submitBtn || !statusEl) return;

  var nameInput = document.getElementById('svc-name');
  var emailInput = document.getElementById('svc-email');
  var serviceSelect = document.getElementById('svc-service');
  var messageInput = document.getElementById('svc-message');

  var nameError = document.getElementById('svc-name-error');
  var emailError = document.getElementById('svc-email-error');
  var messageError = document.getElementById('svc-message-error');

  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (messageError) messageError.textContent = '';
  }

  function validateForm() {
    var valid = true;
    clearErrors();

    if (!nameInput.value.trim()) {
      if (nameError) nameError.textContent = 'Please enter your name.';
      valid = false;
    }

    if (!emailInput.value.trim()) {
      if (emailError) emailError.textContent = 'Please enter your email.';
      valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      valid = false;
    }

    if (!serviceSelect.value) {
      valid = false;
    }

    if (!messageInput.value.trim()) {
      if (messageError) messageError.textContent = 'Please tell us about your needs.';
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if API key is still placeholder
    var accessKey = form.querySelector('input[name="access_key"]');
    if (accessKey && accessKey.value === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      statusEl.className = 'svc-form-status success';
      statusEl.textContent = 'Thank you for your interest! The inquiry form is being set up. Please email us directly in the meantime.';
      statusEl.style.display = 'block';
      return;
    }

    var btnSpan = submitBtn.querySelector('span');
    var originalText = btnSpan.textContent;
    btnSpan.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    var formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.success) {
        statusEl.className = 'svc-form-status success';
        statusEl.textContent = 'Thank you! Your inquiry has been sent successfully. We will get back to you within 24 hours.';
        statusEl.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    })
    .catch(function () {
      statusEl.className = 'svc-form-status error';
      statusEl.textContent = 'Something went wrong. Please try again or email us directly.';
      statusEl.style.display = 'block';
    })
    .finally(function () {
      btnSpan.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    });
  });

  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(function (input) {
    if (input) {
      input.addEventListener('input', function () {
        clearErrors();
        statusEl.style.display = 'none';
      });
    }
  });
})();
