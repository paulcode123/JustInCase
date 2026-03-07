/* ============================================
   JUST IN CASE — INTERACTIONS & ANIMATIONS
   ============================================ */

/* ---------- NAV SCROLL ---------- */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- HAMBURGER ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ---------- HERO CANVAS PARTICLE NETWORK ---------- */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;
  const MOUSE_RADIUS = 180;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: randomBetween(-.35, .35),
      vy: randomBetween(-.35, .35),
      r: randomBetween(1.2, 2.8),
      opacity: randomBetween(.3, .8),
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(230,57,70,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });

  resize();
  createParticles();
  drawParticles();
})();

/* ---------- INTERSECTION OBSERVER: REVEAL ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.about__grid, .story-card, .testimonial__card, .contact__grid, .stats__card, .mission-strip__item'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ---------- GET INVOLVED CARDS STAGGER ---------- */
const involvedObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      involvedObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.involved__card').forEach(card => {
  involvedObserver.observe(card);
});

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isLarge = target >= 1000;

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    if (isLarge && current >= 1000) {
      el.textContent = (current / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
      el.textContent = current.toLocaleString();
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ---------- CONTACT FORM ---------- */
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    success.classList.add('visible');
    form.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
    setTimeout(() => success.classList.remove('visible'), 5000);
  }, 1200);
});

/* ---------- SMOOTH SCROLL FOR NAV LINKS ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
