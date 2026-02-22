/* ============================================
   PYMTW — Bitcoin Playbook Landing Page JS
   Particles + Scroll Reveal
   ============================================ */

// --- Subtle particle background ---
(function () {
  const canvas = document.getElementById('pb-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((w * h) / 18000);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247, 147, 26, ${p.o})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();

// --- Scroll reveal ---
(function () {
  const reveals = document.querySelectorAll(
    '.pb-benefit-card, .pb-capture-box, .pb-proof-card, .pb-bio-inner, .pb-footer-cta-title'
  );
  reveals.forEach((el) => el.classList.add('pb-reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
})();

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

// --- Beehiiv form submission ---
(function () {
  const form = document.getElementById('pb-newsletter-form');
  if (!form) return;
  const status = document.getElementById('pb-form-status');
  const btn = form.querySelector('.pb-submit-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = form.querySelector('.pb-email-input').value.trim();
    if (!email) return;

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';
    status.textContent = '';

    try {
      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        status.style.color = '#4caf50';
        status.textContent = 'Check your inbox! Your playbook is on the way.';
        form.querySelector('.pb-email-input').value = '';
        btn.querySelector('span').textContent = 'Sent!';
        setTimeout(() => {
          btn.querySelector('span').textContent = 'Send Me The Playbook';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (err) {
      status.style.color = '#ff5252';
      status.textContent = 'Something went wrong. Please try again.';
      btn.querySelector('span').textContent = 'Send Me The Playbook';
      btn.disabled = false;
    }
  });
})();
