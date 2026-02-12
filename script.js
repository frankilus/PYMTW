/* ============================================
   PYMTWiB - Interactive JavaScript
   ============================================ */

// ---- Particle Background ----
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '247, 147, 26' : '255, 255, 255';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticleArray() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticleArray();

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const opacity = (1 - dist / 150) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(247, 147, 26, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    animationId = requestAnimationFrame(animate);
  }
  animate();
})();


// ---- Navbar scroll behavior ----
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
    document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
      document.body.style.overflow = '';
      document.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('open'));
    });
  });

  document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });
})();


// ---- Scroll Reveal (IntersectionObserver) ----
(function initScrollReveal() {
  // Add reveal class to elements
  const revealSelectors = [
    '.feature-card',
    '.resource-card',
    '.faq-item',
    '.cta-card',
    '.section-header',
    '.step'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Steps visibility
  document.querySelectorAll('.step').forEach(el => {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    stepObserver.observe(el);
  });
})();


// ---- Education Tabs (All Steps — Collapsible) ----
(function initEduTabs() {
  const steps = document.querySelectorAll('.step');

  steps.forEach(step => {
    const tabs = step.querySelectorAll('[data-edu-tab]');
    const panelsContainer = step.querySelector('.edu-panels');
    const panels = step.querySelectorAll('.edu-panel');

    if (tabs.length === 0 || !panelsContainer) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.eduTab;
        const targetPanel = step.querySelector(`#edu-${target}`);
        const isAlreadyActive = tab.classList.contains('active');

        // If clicking the already-active tab, collapse everything
        if (isAlreadyActive) {
          tab.classList.remove('active');
          panelsContainer.classList.remove('open');
          // After collapse animation, hide the panel
          setTimeout(() => {
            panels.forEach(p => p.classList.remove('active'));
          }, 400);
          return;
        }

        // Deactivate all tabs and panels in this step
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Activate clicked tab and its panel
        tab.classList.add('active');
        if (targetPanel) {
          targetPanel.classList.add('active');
          // Re-trigger entrance animation on items
          targetPanel.style.animation = 'none';
          targetPanel.offsetHeight;
          targetPanel.style.animation = '';
        }

        // Expand the container
        panelsContainer.classList.add('open');
      });
    });
  });
})();


// ---- Resource Filter Tabs ----
(function initResourceTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.resource-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


// ---- FAQ Accordion ----
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
})();


// ---- Bitcoin Quiz ----
(function initQuiz() {
  const quizData = [
    {
      question: "What is the maximum number of bitcoin that will ever exist?",
      options: ["100 million", "21 million", "1 billion", "Unlimited"],
      correct: 1,
      explanation: "Bitcoin has a hard cap of 21 million coins. This fixed supply is enforced by the protocol and is one of Bitcoin's most important properties, making it truly scarce digital money."
    },
    {
      question: "What is the smallest unit of bitcoin called?",
      options: ["Bit", "Micro", "Satoshi", "Wei"],
      correct: 2,
      explanation: "A satoshi (or 'sat') is the smallest unit of bitcoin, equal to 0.00000001 BTC. It's named after Bitcoin's pseudonymous creator, Satoshi Nakamoto."
    },
    {
      question: "What does 'HODL' mean in the Bitcoin community?",
      options: [
        "A trading strategy",
        "Hold On for Dear Life / holding bitcoin long-term",
        "A type of wallet",
        "A mining technique"
      ],
      correct: 1,
      explanation: "HODL originated from a misspelling of 'hold' in a 2013 Bitcoin forum post. It's now a mantra meaning to hold your bitcoin long-term rather than selling during price dips."
    },
    {
      question: "What is a Bitcoin 'halving'?",
      options: [
        "When the bitcoin price drops by 50%",
        "When transaction fees are cut in half",
        "When the block reward for miners is cut in half",
        "When half of all bitcoin is lost"
      ],
      correct: 2,
      explanation: "Approximately every 4 years (210,000 blocks), the reward miners receive for creating new blocks is cut in half. This mechanism controls inflation and ensures bitcoin's supply approaches 21 million gradually."
    },
    {
      question: "What does 'Not your keys, not your coins' mean?",
      options: [
        "You need a physical key to access bitcoin",
        "If you don't control your private keys, you don't truly own your bitcoin",
        "Keys are used to mine bitcoin",
        "Only key holders can trade bitcoin"
      ],
      correct: 1,
      explanation: "This phrase emphasizes the importance of self-custody. If your bitcoin is on an exchange, the exchange holds the private keys. Only by holding your own keys (in your own wallet) do you truly own and control your bitcoin."
    },
    {
      question: "What is dollar-cost averaging (DCA)?",
      options: [
        "Buying bitcoin only when the price drops",
        "Converting bitcoin to dollars regularly",
        "Buying a fixed dollar amount on a regular schedule",
        "Averaging your portfolio's dollar value"
      ],
      correct: 2,
      explanation: "DCA means investing a fixed dollar amount at regular intervals (e.g., $50 every week) regardless of price. This strategy reduces the impact of volatility and removes the stress of trying to time the market."
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let answered = false;

  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const progressBar = document.getElementById('quiz-progress-bar');
  const scoreEl = document.getElementById('quiz-score');

  function loadQuestion() {
    answered = false;
    const q = quizData[currentQuestion];
    progressBar.style.width = `${((currentQuestion) / quizData.length) * 100}%`;
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.className = 'quiz-feedback';
    feedbackEl.style.display = 'none';
    nextBtn.style.display = 'none';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectAnswer(i));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(index) {
    if (answered) return;
    answered = true;

    const q = quizData[currentQuestion];
    const options = optionsEl.querySelectorAll('.quiz-option');

    options[index].classList.add(index === q.correct ? 'correct' : 'incorrect');
    options[q.correct].classList.add('correct');

    if (index === q.correct) {
      score++;
      feedbackEl.className = 'quiz-feedback show correct';
      feedbackEl.textContent = '✓ Correct! ' + q.explanation;
    } else {
      feedbackEl.className = 'quiz-feedback show incorrect';
      feedbackEl.textContent = '✗ Not quite. ' + q.explanation;
    }

    if (currentQuestion < quizData.length - 1) {
      nextBtn.style.display = 'inline-flex';
    } else {
      setTimeout(showScore, 1500);
    }
  }

  function showScore() {
    progressBar.style.width = '100%';
    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    feedbackEl.style.display = 'none';
    nextBtn.style.display = 'none';
    scoreEl.style.display = 'block';

    const percentage = Math.round((score / quizData.length) * 100);
    let message = '';
    if (percentage === 100) {
      message = "You're a Bitcoin expert! You're well prepared for your journey.";
    } else if (percentage >= 70) {
      message = "Great job! You have a solid understanding of Bitcoin basics.";
    } else if (percentage >= 40) {
      message = "Good start! Check out the resources above to keep learning.";
    } else {
      message = "No worries — everyone starts somewhere. Explore the resources above!";
    }

    scoreEl.innerHTML = `
      <span class="score-big">${score}/${quizData.length}</span>
      <h3>Quiz Complete!</h3>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">
        <span>Try Again</span>
      </button>
    `;
  }

  nextBtn.addEventListener('click', () => {
    currentQuestion++;
    loadQuestion();
  });

  loadQuestion();
})();


// ---- Smooth Scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ---- Tilt Effect on Feature Cards ----
(function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();


// ---- Active nav link on scroll ----
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--accent-orange)';
      }
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
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
  }

  function timeSince(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 10) return 'Updated just now';
    if (seconds < 60) return 'Updated ' + seconds + 's ago';
    const minutes = Math.floor(seconds / 60);
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

    const newPrice = formatPrice(data.price);
    if (lastPrice !== null && newPrice !== lastPrice) {
      flashPrice();
    }
    priceEl.textContent = newPrice;
    lastPrice = newPrice;

    const isPositive = data.change24h >= 0;
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
  }

  function setError() {
    clearLoading();
    bar.classList.add('error');
    if (priceEl.textContent === '--' || priceEl.textContent.trim() === '') {
      priceEl.textContent = '--';
    }
  }

  async function fetchCoinGecko() {
    const response = await fetch(COINGECKO_URL);
    if (!response.ok) throw new Error('CoinGecko HTTP ' + response.status);
    const json = await response.json();
    const btc = json.bitcoin;
    return {
      price: btc.usd,
      change24h: btc.usd_24h_change,
      marketCap: btc.usd_market_cap,
      volume24h: btc.usd_24h_vol
    };
  }

  async function fetchCoinCap() {
    const response = await fetch(COINCAP_URL);
    if (!response.ok) throw new Error('CoinCap HTTP ' + response.status);
    const json = await response.json();
    const d = json.data;
    return {
      price: parseFloat(d.priceUsd),
      change24h: parseFloat(d.changePercent24Hr),
      marketCap: parseFloat(d.marketCapUsd),
      volume24h: parseFloat(d.volumeUsd24Hr)
    };
  }

  async function fetchPrice() {
    try {
      const data = await fetchCoinGecko();
      updateDisplay(data);
      scheduleNext(UPDATE_INTERVAL);
    } catch (err1) {
      console.warn('[BTC Price] CoinGecko failed, trying CoinCap...', err1);
      try {
        const data = await fetchCoinCap();
        updateDisplay(data);
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
