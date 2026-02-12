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
    '.faq-category',
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
    // === BEGINNER (weight: 1) ===
    {
      question: "What is the maximum number of bitcoin that will ever exist?",
      options: ["100 million", "21 million", "1 billion", "Unlimited"],
      correct: 1,
      explanation: "Bitcoin has a hard cap of 21 million coins. This fixed supply is enforced by the protocol and is one of Bitcoin's most important properties, making it truly scarce digital money.",
      difficulty: "beginner",
      weight: 1
    },
    {
      question: "What is the smallest unit of bitcoin called?",
      options: ["Bit", "Micro", "Satoshi", "Wei"],
      correct: 2,
      explanation: "A satoshi (or 'sat') is the smallest unit of bitcoin, equal to 0.00000001 BTC. It's named after Bitcoin's pseudonymous creator, Satoshi Nakamoto.",
      difficulty: "beginner",
      weight: 1
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
      explanation: "HODL originated from a misspelling of 'hold' in a 2013 Bitcoin forum post. It's now a mantra meaning to hold your bitcoin long-term rather than selling during price dips.",
      difficulty: "beginner",
      weight: 1
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
      explanation: "DCA means investing a fixed dollar amount at regular intervals (e.g., $50 every week) regardless of price. This strategy reduces the impact of volatility and removes the stress of trying to time the market.",
      difficulty: "beginner",
      weight: 1
    },
    // === INTERMEDIATE (weight: 2) ===
    {
      question: "What is a Bitcoin 'halving'?",
      options: [
        "When the bitcoin price drops by 50%",
        "When transaction fees are cut in half",
        "When the block reward for miners is cut in half",
        "When half of all bitcoin is lost"
      ],
      correct: 2,
      explanation: "Approximately every 4 years (210,000 blocks), the reward miners receive for creating new blocks is cut in half. This mechanism controls inflation and ensures bitcoin's supply approaches 21 million gradually.",
      difficulty: "intermediate",
      weight: 2
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
      explanation: "This phrase emphasizes the importance of self-custody. If your bitcoin is on an exchange, the exchange holds the private keys. Only by holding your own keys (in your own wallet) do you truly own and control your bitcoin.",
      difficulty: "intermediate",
      weight: 2
    },
    {
      question: "What is the Lightning Network?",
      options: [
        "A faster internet protocol for downloading bitcoin",
        "A layer-2 payment protocol enabling fast, low-cost bitcoin transactions",
        "A new cryptocurrency that competes with bitcoin",
        "A mining pool that uses renewable energy"
      ],
      correct: 1,
      explanation: "The Lightning Network is a second-layer protocol built on top of Bitcoin. It enables near-instant, low-fee transactions by creating payment channels between users, making bitcoin practical for everyday purchases.",
      difficulty: "intermediate",
      weight: 2
    },
    {
      question: "What is a Bitcoin node?",
      options: [
        "A specialized mining computer",
        "A computer that validates transactions and enforces the network's rules",
        "A physical location where bitcoin is stored",
        "A type of bitcoin wallet app"
      ],
      correct: 1,
      explanation: "A Bitcoin node is a computer running Bitcoin software that independently validates every transaction and block against the protocol's rules. Nodes are what keep Bitcoin decentralized — anyone can run one to verify the network for themselves.",
      difficulty: "intermediate",
      weight: 2
    },
    // === ADVANCED (weight: 3) ===
    {
      question: "What is the 'mempool' in Bitcoin?",
      options: [
        "A special type of mining hardware memory",
        "The waiting area for unconfirmed transactions before they are included in a block",
        "A backup storage for old blockchain data",
        "A pool of memory used by Bitcoin wallets"
      ],
      correct: 1,
      explanation: "The mempool (memory pool) is where valid but unconfirmed transactions wait to be picked up by miners and included in the next block. Miners typically prioritize transactions with higher fees, which is why fees rise during congested periods.",
      difficulty: "advanced",
      weight: 3
    },
    {
      question: "What is the significance of the Bitcoin Genesis Block?",
      options: [
        "It contained the largest bitcoin transaction ever",
        "It was the first block mined by Satoshi Nakamoto and contains a message referencing bank bailouts",
        "It established the price of bitcoin at $1",
        "It was the first block mined using a GPU"
      ],
      correct: 1,
      explanation: "The Genesis Block (Block 0), mined by Satoshi Nakamoto on January 3, 2009, contains the embedded message: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.' This is widely seen as a statement about the failures of traditional finance that motivated Bitcoin's creation.",
      difficulty: "advanced",
      weight: 3
    },
    {
      question: "What is a UTXO in Bitcoin?",
      options: [
        "A type of smart contract on the Bitcoin network",
        "An Unspent Transaction Output — how Bitcoin tracks ownership of funds",
        "A cryptographic algorithm used in mining",
        "A protocol for transferring bitcoin between blockchains"
      ],
      correct: 1,
      explanation: "UTXO stands for Unspent Transaction Output. Unlike a bank account with a balance, Bitcoin tracks ownership through individual 'coins' (UTXOs). When you spend bitcoin, you consume existing UTXOs and create new ones — similar to breaking a $20 bill to make a purchase.",
      difficulty: "advanced",
      weight: 3
    },
    {
      question: "Why is Bitcoin's difficulty adjustment important?",
      options: [
        "It makes bitcoin harder to buy over time",
        "It ensures blocks are mined roughly every 10 minutes regardless of total hashrate changes",
        "It increases transaction fees during high demand",
        "It limits the number of nodes that can join the network"
      ],
      correct: 1,
      explanation: "Every 2,016 blocks (roughly two weeks), Bitcoin automatically adjusts the mining difficulty to target an average block time of 10 minutes. If miners join and blocks come too fast, difficulty rises; if miners leave, it drops. This self-regulating mechanism keeps Bitcoin's issuance schedule predictable.",
      difficulty: "advanced",
      weight: 3
    }
  ];

  // Pre-calculate totals per difficulty
  const totalByDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };
  quizData.forEach(q => { totalByDifficulty[q.difficulty]++; });

  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  const scoreByDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };

  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const progressBar = document.getElementById('quiz-progress-bar');
  const scoreEl = document.getElementById('quiz-score');
  const difficultyBadge = document.getElementById('quiz-difficulty-badge');
  const counterEl = document.getElementById('quiz-counter');

  function loadQuestion() {
    answered = false;
    const q = quizData[currentQuestion];
    progressBar.style.width = `${((currentQuestion) / quizData.length) * 100}%`;
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';
    feedbackEl.className = 'quiz-feedback';
    feedbackEl.style.display = 'none';
    nextBtn.style.display = 'none';

    // Update difficulty badge
    if (difficultyBadge) {
      difficultyBadge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
      difficultyBadge.className = `quiz-difficulty-badge difficulty-${q.difficulty}`;
    }

    // Update question counter
    if (counterEl) {
      counterEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    }

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
      score += q.weight;
      scoreByDifficulty[q.difficulty]++;
      feedbackEl.className = 'quiz-feedback show correct';
      feedbackEl.textContent = '\u2713 Correct! ' + q.explanation;
    } else {
      feedbackEl.className = 'quiz-feedback show incorrect';
      feedbackEl.textContent = '\u2717 Not quite. ' + q.explanation;
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

    // Hide quiz meta during results
    if (difficultyBadge) difficultyBadge.style.display = 'none';
    if (counterEl) counterEl.style.display = 'none';

    // Determine classification based on weighted score (max 24)
    let classification, classColor, message;
    if (score >= 17) {
      classification = 'Advanced';
      classColor = 'advanced';
      message = "Impressive! You have a deep understanding of Bitcoin's technology and principles. You're well-equipped to navigate the Bitcoin ecosystem with confidence.";
    } else if (score >= 9) {
      classification = 'Intermediate';
      classColor = 'intermediate';
      message = "Solid knowledge! You understand the fundamentals and are building deeper expertise. Keep exploring \u2014 the advanced concepts will click as you continue learning.";
    } else {
      classification = 'Beginner';
      classColor = 'beginner';
      message = "Welcome to your Bitcoin journey! You're in the right place. Explore the resources on this page to build your foundation \u2014 every expert started exactly where you are now.";
    }

    scoreEl.innerHTML = `
      <div class="score-classification ${classColor}">
        <span class="classification-label">${classification}</span>
      </div>
      <h3>Bitcoin Knowledge Level</h3>
      <p class="score-message">${message}</p>
      <div class="score-breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Beginner</span>
          <span class="breakdown-value">${scoreByDifficulty.beginner}/${totalByDifficulty.beginner}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Intermediate</span>
          <span class="breakdown-value">${scoreByDifficulty.intermediate}/${totalByDifficulty.intermediate}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Advanced</span>
          <span class="breakdown-value">${scoreByDifficulty.advanced}/${totalByDifficulty.advanced}</span>
        </div>
      </div>
      <div class="score-weighted">
        <span class="weighted-label">Weighted Score</span>
        <span class="weighted-value">${score}/24</span>
      </div>
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
    const href = this.getAttribute('href');
    if (href === '#' || href === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
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
