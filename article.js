/* ============================================
   JUST IN CASE — ARTICLE SCROLL ENHANCEMENTS
   ============================================ */

(function () {
  'use strict';

  /* ── 1. READING PROGRESS BAR ── */
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.prepend(progressBar);

  /* ── 2. BACK TO TOP BUTTON ── */
  const backBtn = document.createElement('button');
  backBtn.className = 'back-to-top';
  backBtn.setAttribute('aria-label', 'Back to top');
  backBtn.innerHTML = '↑';
  document.body.appendChild(backBtn);
  backBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ── 3. CORE SCROLL HANDLER ── */
  const heroImg = document.querySelector('.article__hero-img img');
  const heroWrap = document.querySelector('.article__hero-img');
  let endPopupShown = false;

  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      progressBar.style.width = pct + '%';
      backBtn.classList.toggle('visible', scrollTop > 500);

      // Parallax on hero image
      if (heroImg && heroWrap) {
        const rect = heroWrap.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          heroImg.style.transform = `scale(1.08) translateY(${
            scrollTop * 0.14
          }px)`;
        }
      }

      updateActiveTOC();
      updateSectionDots();

      if (!endPopupShown && pct > 85) {
        endPopupShown = true;
        showEndPopup();
      }
    },
    { passive: true }
  );

  /* ── 4. PROSE SCROLL REVEAL ── */
  const prose = document.querySelector('.article__content.prose');
  const h2Headings = Array.from(
    document.querySelectorAll('.prose h2')
  );

  if (prose) {
    // Animate every direct child of prose
    Array.from(prose.children).forEach((el, i) => {
      const delay = (i % 7) * 0.055;
      el.style.cssText +=
        `opacity:0;transform:translateY(30px);` +
        `transition:opacity .7s ${delay}s ease,` +
        `transform .7s ${delay}s cubic-bezier(.22,1,.36,1);`;
    });

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    Array.from(prose.children).forEach((el) => revealObs.observe(el));

    /* H2 – animated accent line expanding on entry */
    const h2LineObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(
              () => entry.target.classList.add('line-animated'),
              220
            );
            h2LineObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    h2Headings.forEach((h2) => {
      h2.classList.add('prose-h2--animated');
      h2LineObs.observe(h2);
    });

    /* Pull-quote treatment on first <p> after each <h2> */
    prose.querySelectorAll('h2 + p').forEach((p) =>
      p.classList.add('prose-lead')
    );

    /* Callout-card treatment on <ul>/<ol> directly after <h3> */
    prose
      .querySelectorAll('h3 + ul, h3 + ol')
      .forEach((list) => list.classList.add('callout-list'));

    /* <strong> keyword highlight pop on scroll */
    prose.querySelectorAll('strong').forEach((strong) => {
      const sObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('strong-pop');
              sObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 1.0 }
      );
      sObs.observe(strong);
    });

    /* Stat callout: any <p> that starts with a digit gets emphasised */
    prose.querySelectorAll('li').forEach((li) => {
      if (/^\d/.test(li.textContent.trim())) {
        li.classList.add('stat-callout');
      }
    });
  }

  /* ── 5. FLOATING TABLE OF CONTENTS ── */
  let tocLinks = [];

  if (h2Headings.length >= 3) {
    // Assign IDs
    h2Headings.forEach((h2, i) => {
      if (!h2.id) h2.id = `section-${i}`;
    });

    const toc = document.createElement('aside');
    toc.className = 'article-toc';

    const tocInner = document.createElement('div');
    tocInner.className = 'article-toc__inner';

    const tocLabel = document.createElement('p');
    tocLabel.className = 'article-toc__label';
    tocLabel.textContent = 'In This Article';
    tocInner.appendChild(tocLabel);

    const list = document.createElement('ul');
    list.className = 'article-toc__list';

    h2Headings.forEach((h2) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h2.id}`;
      a.className = 'article-toc__link';
      a.dataset.target = h2.id;
      a.textContent = h2.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const top =
          h2.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      });
      li.appendChild(a);
      list.appendChild(li);
      tocLinks.push(a);
    });

    tocInner.appendChild(list);
    toc.appendChild(tocInner);
    document.body.appendChild(toc);
  }

  function updateActiveTOC() {
    if (!tocLinks.length) return;
    let activeId = null;
    h2Headings.forEach((h2) => {
      if (h2.getBoundingClientRect().top < 160) activeId = h2.id;
    });
    tocLinks.forEach((a) =>
      a.classList.toggle('active', a.dataset.target === activeId)
    );
  }

  /* ── 6. SECTION PROGRESS DOTS ── */
  let dots = [];

  if (h2Headings.length >= 3) {
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'section-dots';
    dotsWrap.setAttribute('aria-hidden', 'true');

    h2Headings.forEach((h2) => {
      const dot = document.createElement('button');
      dot.className = 'section-dot';
      dot.setAttribute('title', h2.textContent);
      dot.addEventListener('click', () => {
        const top =
          h2.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    document.body.appendChild(dotsWrap);
  }

  function updateSectionDots() {
    if (!dots.length) return;
    let activeIdx = 0;
    h2Headings.forEach((h2, i) => {
      if (h2.getBoundingClientRect().top < 180) activeIdx = i;
    });
    dots.forEach((dot, i) =>
      dot.classList.toggle('active', i === activeIdx)
    );
  }

  /* ── 7. END-OF-ARTICLE "KEEP READING" POPUP ── */
  function showEndPopup() {
    const relatedCards = Array.from(
      document.querySelectorAll('.article-recent .story-card')
    );
    if (!relatedCards.length) return;

    const popup = document.createElement('div');
    popup.className = 'end-popup';
    popup.setAttribute('role', 'region');
    popup.setAttribute('aria-label', 'Keep Reading');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'end-popup__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => {
      popup.classList.remove('visible');
      setTimeout(() => popup.remove(), 400);
    });

    const label = document.createElement('p');
    label.className = 'end-popup__label';
    label.textContent = 'Keep Reading';

    popup.appendChild(closeBtn);
    popup.appendChild(label);

    relatedCards.slice(0, 2).forEach((card) => {
      const link = document.createElement('a');
      link.href = card.getAttribute('href') || '#';
      link.className = 'end-popup__card';
      const tag =
        card.querySelector('.story-card__tag')?.textContent || 'Article';
      const title =
        card.querySelector('.story-card__title')?.textContent || '';
      link.innerHTML = `
        <span class="end-popup__card-tag">${tag}</span>
        <span class="end-popup__card-title">${title}</span>
        <span class="end-popup__card-arrow">→</span>
      `;
      popup.appendChild(link);
    });

    document.body.appendChild(popup);
    // Double rAF ensures the transition actually fires
    requestAnimationFrame(() =>
      requestAnimationFrame(() => popup.classList.add('visible'))
    );
  }

  /* ── 8. HIGHLIGHT BAND ON ARTICLE HEADER ── */
  const articleHeader = document.querySelector('.article__header');
  if (articleHeader) {
    const words = Array.from(
      articleHeader.querySelectorAll('h1')
    );
    words.forEach((el) => {
      // Wrap words in spans for stagger
      el.innerHTML = el.textContent
        .split(' ')
        .map(
          (w, i) =>
            `<span class="word-reveal" style="transition-delay:${i * 0.06 + 0.1}s">${w}</span>`
        )
        .join(' ');
    });
    // Trigger after a brief moment
    setTimeout(() => {
      articleHeader
        .querySelectorAll('.word-reveal')
        .forEach((span) => span.classList.add('visible'));
    }, 120);
  }
})();
