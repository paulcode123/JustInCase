/* ============================================
   JUST IN CASE — INTERACTIONS & ANIMATIONS
   ============================================ */

/* ---------- NAV SCROLL ---------- */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ---------- HAMBURGER ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
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
}

/* ---------- MOBILE DROPDOWN ---------- */
const dropdownToggleMobile = document.querySelector('.dropdown-toggle-mobile');
const dropdownMobile = document.querySelector('.dropdown-mobile');
if (dropdownToggleMobile && dropdownMobile) {
  dropdownToggleMobile.addEventListener('click', (e) => {
    e.preventDefault();
    dropdownMobile.classList.toggle('open');
  });
}

/* ---------- HERO CANVAS PARTICLE NETWORK ---------- */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
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
  '.about__grid, .story-card, .testimonial__card, .contact__grid, .stats__card, .mission-strip__item, .team-card'
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

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = current.toLocaleString();

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

if (form && success) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    const response = await fetch('/api/submit-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      success.classList.add('visible');
      form.reset();
      setTimeout(() => success.classList.remove('visible'), 5000);
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Sorry, there was an error sending your message. Please try again or email us directly.');
  } finally {
    btn.textContent = 'Send Message';
    btn.disabled = false;
  }
});

/* ---------- EVENTS ---------- */

const EVENTS = [
  {
    id: 1,
    title: 'CPR & First Aid Certification',
    type: 'Workshop',
    color: '#e63946',
    gradient: 'linear-gradient(135deg,#e63946 0%,#c1121f 100%)',
    month: 'MAR',
    day: '22',
    fullDate: 'Saturday, March 22, 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Riverside Community Center, Room 4B',
    address: '248 Riverside Dr, Springfield',
    spotsTotal: 20,
    spotsLeft: 7,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=900&q=80',
    shortDesc: 'Get hands-on CPR and first aid certification from licensed instructors.',
    fullDesc: 'Get certified in CPR and basic first aid techniques in this hands-on 3-hour workshop. Led by certified American Heart Association instructors, you\'ll practice on training mannequins and learn to respond to cardiac emergencies, choking, severe bleeding, and more. A certification card is provided upon successful completion.',
    whatToBring: ['Comfortable, moveable clothing', 'Water bottle', 'Valid ID', 'Closed-toe shoes'],
    price: '$15 per person',
  },
  {
    id: 2,
    title: 'Youth Emergency Response Boot Camp',
    type: 'Boot Camp',
    color: '#162848',
    gradient: 'linear-gradient(135deg,#162848 0%,#060d1f 100%)',
    month: 'APR',
    day: '5',
    fullDate: 'Sunday, April 5, 2026',
    time: '9:00 AM – 4:00 PM',
    location: 'Greenwood Park Recreation Center',
    address: '55 Greenwood Ave, Springfield',
    spotsTotal: 30,
    spotsLeft: 14,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80',
    shortDesc: 'A full-day immersive training experience designed for youth ages 13–18.',
    fullDesc: 'A full-day immersive training experience designed for youth ages 13–18. Participants rotate through five stations covering fire safety, disaster shelter building, basic wound care, emergency communication, and team response drills. Lunch and all materials are provided. Parents are welcome to attend the closing ceremony at 3:45 PM.',
    whatToBring: ['Comfortable outdoor clothing', 'Sunscreen & bug spray', 'Signed parent/guardian waiver', 'Reusable water bottle'],
    price: 'Free (registration required)',
  },
  {
    id: 3,
    title: 'Community Preparedness Fair',
    type: 'Community Fair',
    color: '#e05d2a',
    gradient: 'linear-gradient(135deg,#ff6b35 0%,#e05d2a 100%)',
    month: 'APR',
    day: '19',
    fullDate: 'Sunday, April 19, 2026',
    time: '11:00 AM – 3:00 PM',
    location: 'Central Park Pavilion',
    address: 'Central Park Main Entrance, Springfield',
    spotsTotal: null,
    spotsLeft: null,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=900&q=80',
    shortDesc: 'Free public fair with live demos, resources, and local emergency services.',
    fullDesc: 'Our annual community preparedness fair is free and open to everyone! Explore interactive booths from local fire departments, emergency medical services, and preparedness experts. Pick up a free emergency checklist, attend live demos, and connect with first responders. Fun activities and preparedness challenges for kids, with prizes for families who complete the full course.',
    whatToBring: ['The whole family!', 'Curiosity and good questions'],
    price: 'Free — open to all',
  },
  {
    id: 4,
    title: 'Disaster Readiness Webinar',
    type: 'Webinar',
    color: '#2c6e98',
    gradient: 'linear-gradient(135deg,#457b9d 0%,#2c5f7a 100%)',
    month: 'MAY',
    day: '2',
    fullDate: 'Saturday, May 2, 2026',
    time: '2:00 PM – 3:30 PM',
    location: 'Online via Zoom',
    address: 'Link sent upon registration',
    spotsTotal: 100,
    spotsLeft: 42,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=900&q=80',
    shortDesc: 'Live expert panel on disaster readiness strategies you can use right now.',
    fullDesc: 'Join our live Zoom session on disaster readiness, hosted by JICE alongside certified emergency management professionals. Topics include: creating a family emergency plan, building a 72-hour kit, earthquake and flood preparedness, and digital tools for staying informed. A full recording is made available to all registered attendees within 48 hours.',
    whatToBring: ['A device with Zoom installed', 'Pen and paper for notes'],
    price: 'Free (registration required)',
  },
];

function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  grid.innerHTML = EVENTS.map(ev => {
    const filled = ev.spotsTotal
      ? Math.round(((ev.spotsTotal - ev.spotsLeft) / ev.spotsTotal) * 100)
      : 0;
    const spotsColor = ev.spotsLeft !== null && ev.spotsLeft <= 5 ? '#e63946' : ev.color;
    const spotsUrgent = ev.spotsLeft !== null && ev.spotsLeft <= 5;
    const spotsLabelText = ev.spotsLeft === null
      ? ''
      : spotsUrgent
        ? `Only ${ev.spotsLeft} spots left!`
        : `${ev.spotsLeft} of ${ev.spotsTotal} spots remaining`;

    return `
      <div class="event-card reveal" data-event-id="${ev.id}" tabindex="0" role="button"
           aria-label="View details and register for ${ev.title}">
        <div class="event-card__header" style="background:${ev.gradient}">
          <div class="event-card__date-badge">
            <span class="event-card__date-month">${ev.month}</span>
            <span class="event-card__date-day">${ev.day}</span>
          </div>
          <span class="event-card__type-tag">${ev.type}</span>
        </div>
        <div class="event-card__body">
          <h3 class="event-card__title">${ev.title}</h3>
          <div class="event-card__meta">
            <div class="event-card__meta-item">
              <span class="event-card__meta-icon">🕐</span>
              <span>${ev.time}</span>
            </div>
            <div class="event-card__meta-item">
              <span class="event-card__meta-icon">📍</span>
              <span>${ev.location}</span>
            </div>
            <div class="event-card__meta-item">
              <span class="event-card__meta-icon">💰</span>
              <span>${ev.price}</span>
            </div>
          </div>
          ${ev.spotsTotal ? `
            <div class="event-card__spots">
              <p class="event-card__spots-label"
                 style="${spotsUrgent ? 'color:#e63946;font-weight:700;' : ''}">${spotsLabelText}</p>
              <div class="event-card__spots-bar">
                <div class="event-card__spots-fill"
                     data-width="${filled}"
                     style="background:${spotsColor};width:0%"></div>
              </div>
            </div>
          ` : `<span class="event-card__open-label">Open admission</span>`}
          <p class="event-card__excerpt">${ev.shortDesc}</p>
          <button class="btn btn--primary event-card__cta">View & Register →</button>
        </div>
      </div>
    `;
  }).join('');

  // Animate spots bars when scrolled into view
  grid.querySelectorAll('.event-card__spots-fill').forEach(bar => {
    const target = bar.dataset.width + '%';
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => { bar.style.width = target; }, 350);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(bar);
  });

  // Wire cards to modal
  grid.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => openEventModal(+card.dataset.eventId));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEventModal(+card.dataset.eventId); }
    });
  });

  // Plug rendered cards into the existing reveal observer
  grid.querySelectorAll('.event-card').forEach(card => revealObserver.observe(card));
}

function openEventModal(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;
  const overlay = document.getElementById('eventModal');
  const body    = document.getElementById('modalBody');
  if (!overlay || !body) return;

  const filled = ev.spotsTotal
    ? Math.round(((ev.spotsTotal - ev.spotsLeft) / ev.spotsTotal) * 100) : 0;
  const spotsUrgent = ev.spotsLeft !== null && ev.spotsLeft <= 5;
  const spotsColor  = spotsUrgent ? '#e63946' : ev.color;

  body.innerHTML = `
    <div class="modal__hero">
      <img src="${ev.image}" alt="${ev.title}" class="modal__hero-img" loading="lazy" />
      <div class="modal__hero-overlay">
        <div class="modal__hero-info">
          <span class="modal__hero-badge">${ev.type}</span>
          <h2 class="modal__hero-title">${ev.title}</h2>
        </div>
      </div>
    </div>

    <div class="modal__body">

      <!-- LEFT: details -->
      <div class="modal__details">

        <div class="modal__details-section">
          <p class="modal__details-label">Event Details</p>
          <div class="modal__detail-item">
            <span class="modal__detail-icon">📅</span>
            <span>${ev.fullDate}</span>
          </div>
          <div class="modal__detail-item">
            <span class="modal__detail-icon">🕐</span>
            <span>${ev.time}</span>
          </div>
          <div class="modal__detail-item">
            <span class="modal__detail-icon">📍</span>
            <div>
              <div>${ev.location}</div>
              <div class="modal__detail-address">${ev.address}</div>
            </div>
          </div>
          <div class="modal__detail-item">
            <span class="modal__detail-icon">💰</span>
            <span>${ev.price}</span>
          </div>
        </div>

        <div class="modal__details-section">
          <p class="modal__details-label">About This Event</p>
          <p class="modal__description">${ev.fullDesc}</p>
        </div>

        ${ev.whatToBring.length ? `
        <div class="modal__details-section">
          <p class="modal__details-label">What to Bring</p>
          <ul class="modal__bring-list">
            ${ev.whatToBring.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>` : ''}

        ${ev.spotsTotal ? `
        <div class="modal__details-section">
          <p class="modal__details-label">Availability</p>
          <div class="modal__spots">
            <div class="modal__spots-top">
              <span class="modal__spots-count"
                style="${spotsUrgent ? 'color:#e63946;' : ''}">${ev.spotsLeft} spots remaining</span>
              <span class="modal__spots-total">of ${ev.spotsTotal}</span>
            </div>
            <div class="modal__spots-bar">
              <div class="modal__spots-fill"
                   style="width:${filled}%;background:${spotsColor}"></div>
            </div>
          </div>
        </div>` : ''}

      </div>

      <!-- RIGHT: registration form -->
      <div class="modal__form-wrap">
        <h3 class="modal__form-title">Register for This Event</h3>
        <p class="modal__form-subtitle">Fill in your details and we'll confirm your spot by email.</p>

        <form id="regForm" autocomplete="on">
          <div class="form__row">
            <div class="form__group">
              <label for="regFirst">First Name *</label>
              <input type="text" id="regFirst" name="firstName" placeholder="Jane" required />
            </div>
            <div class="form__group">
              <label for="regLast">Last Name *</label>
              <input type="text" id="regLast" name="lastName" placeholder="Smith" required />
            </div>
          </div>
          <div class="form__group">
            <label for="regEmail">Email *</label>
            <input type="email" id="regEmail" name="email" placeholder="jane@example.com" required />
          </div>
          <div class="form__group">
            <label for="regPhone">Phone (optional)</label>
            <input type="tel" id="regPhone" name="phone" placeholder="(555) 000-0000" />
          </div>
          ${ev.spotsTotal ? `
          <div class="form__group">
            <label for="regAttendees">Number of Attendees *</label>
            <select id="regAttendees" name="attendees" required>
              <option value="">Select…</option>
              <option value="1">1 person (just me)</option>
              <option value="2">2 people</option>
              <option value="3">3 people</option>
              <option value="4">4 people</option>
              <option value="5">5 people</option>
            </select>
          </div>` : ''}
          <div class="form__group">
            <label for="regNeeds">Special Requirements (optional)</label>
            <textarea id="regNeeds" name="requirements" rows="3"
              placeholder="Accessibility needs, dietary restrictions, questions…"></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--full">Confirm Registration</button>
        </form>

        <div class="modal__success" id="regSuccess">
          <span class="modal__success-icon">🎉</span>
          <h3 class="modal__success-title">You're registered!</h3>
          <p class="modal__success-body">
            A confirmation has been sent to your email with all event details.
            We can't wait to see you at <strong>${ev.title}</strong>!
          </p>
          <button class="modal__success-close" id="regSuccessClose">Close</button>
        </div>
      </div>

    </div>
  `;

  // Form submit
  const regForm    = body.querySelector('#regForm');
  const regSuccess = body.querySelector('#regSuccess');
  if (regForm && regSuccess) {
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = regForm.querySelector('button[type="submit"]');
      btn.textContent = 'Registering…';
      btn.disabled = true;
      setTimeout(() => {
        regForm.style.display = 'none';
        regSuccess.classList.add('visible');
      }, 1300);
    });
  }

  const successClose = body.querySelector('#regSuccessClose');
  if (successClose) successClose.addEventListener('click', closeEventModal);

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeEventModal() {
  const overlay = document.getElementById('eventModal');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Modal close wiring
const eventOverlay = document.getElementById('eventModal');
const modalCloseBtn = document.getElementById('modalClose');
if (eventOverlay) {
  eventOverlay.addEventListener('click', e => {
    if (e.target === eventOverlay) closeEventModal();
  });
}
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEventModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeEventModal();
});

// renderEvents() - Removed: Events section now displays coming soon message
// renderEvents();

/* ---------- SMOOTH SCROLL FOR NAV LINKS ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      // Use different offset for donate section to align with the donate button
      const offset = href === '#donate' ? 120 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
