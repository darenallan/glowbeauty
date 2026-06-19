/* =====================================================
   GLOW BEAUTY — SCRIPT.JS (REFONTE)
   Optimisé mobile : cursor/parallax/grain désactivés
   sur pointer:coarse via JS (doublure du CSS)
   ===================================================== */

// ─── DETECT TOUCH ──────────────────────────────────
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// ─── 1. LOADER ─────────────────────────────────────
const loader    = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderNum = document.getElementById('loader-counter');

let progress = 0;
const tick = setInterval(() => {
  progress += Math.random() * 9 + 3;
  if (progress >= 100) {
    progress = 100;
    clearInterval(tick);
    loaderBar.style.width = '100%';
    loaderNum.textContent = '100';
    setTimeout(() => {
      loader.classList.add('hidden');
      startAnimations();
    }, 420);
  }
  loaderBar.style.width = progress + '%';
  loaderNum.textContent = Math.floor(progress);
}, 55);

// ─── 2. CUSTOM CURSOR (desktop uniquement) ─────────
if (!isTouchDevice) {
  const cursor = document.getElementById('cursor');
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
  });

  function animateCursor() {
    const speed = 0.11;
    curX += (mouseX - curX) * speed;
    curY += (mouseY - curY) * speed;
    cursor.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .panel, .look-card, .service-item, .service-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
    });
}

// ─── 3. NAV SCROLL STATE ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── 4. HERO PARALLAX (desktop seulement) ─────────
if (!isTouchDevice) {
  const heroImg = document.getElementById('hero-img');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.22}px)`;
    }
  }, { passive: true });
}

// ─── 5. STICKY CTA MOBILE ─────────────────────────
const stickyCta = document.getElementById('sticky-cta');
if (stickyCta) {
  window.addEventListener('scroll', () => {
    stickyCta.classList.toggle('visible', window.scrollY > 120);
    stickyCta.setAttribute('aria-hidden', window.scrollY <= 120 ? 'true' : 'false');
  }, { passive: true });
}

// ─── 6. SCROLL REVEAL ─────────────────────────────
function setupReveal() {
  const targets = document.querySelectorAll(
    '.about-left, .about-right, .showcase-header, .service-item, ' +
    '.contact-left, .contact-right, .stat, .quote-divider blockquote, ' +
    '.booking-header, .booking-form, .contact-info-card'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 75}ms`;
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => io.observe(el));
}

// ─── 7. PORTFOLIO ──────────────────────────────────
const portfolioData = {
  nude: [
    { type: 'image', src: 'static/moiArr.jpeg',  title: 'Soft Morning Glow', desc: 'Natural Skin Finish' },
    { type: 'image', src: 'static/moiRobe.jpeg', title: 'Bridal Nude',       desc: 'Wedding Perfection'  },
    { type: 'video', src: 'static/flex2.mp4',    title: 'Fresh Face',        desc: 'Video Tutorial'      }
  ],
  glamour: [
    { type: 'image', src: 'static/nous2.jpeg',   title: 'Red Carpet Ready',  desc: 'Highlighter Focus'   },
    { type: 'video', src: 'static/chaperon.mp4', title: 'Lip Precision',     desc: 'Behind the Scenes'   },
    { type: 'image', src: 'static/jupeW.jpeg',   title: 'Golden Hour',       desc: 'Editorial Shoot'     }
  ],
  smokey: [
    { type: 'image', src: 'static/mes3.jpeg',    title: 'Midnight Blue',     desc: 'Intense Eyes'        },
    { type: 'image', src: 'static/4tete.jpeg',   title: 'Grunge Chic',       desc: 'Matte Finish'        },
    { type: 'video', src: 'static/flex1.mp4',    title: 'Classic Black',     desc: 'Smokey Cat Eye'      }
  ]
};

const grid = document.getElementById('portfolio-grid');
const tabs = document.querySelectorAll('.tab-btn');

function displayCategory(category) {
  const existing = grid.querySelectorAll('.look-card');
  existing.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(16px)'; });

  setTimeout(() => {
    grid.innerHTML = '';
    portfolioData[category].forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'look-card';
      card.style.cssText = `opacity:0; transform:translateY(24px); transition:opacity 0.45s ease ${i * 0.1}s, transform 0.45s ease ${i * 0.1}s`;

      const isVideo = item.type === 'video';
      const mediaEl = isVideo
        ? `<video src="${item.src}" muted loop playsinline
              onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0"></video>`
        : `<img src="${item.src}" alt="${item.title}" loading="lazy">`;

      card.innerHTML = `
        <div class="media-wrapper">${mediaEl}</div>
        <div class="card-badge">${isVideo ? '▶' : '↗'}</div>
        <div class="card-info"><h3>${item.title}</h3><span>${item.desc}</span></div>`;

      grid.appendChild(card);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }));
    });
  }, existing.length ? 250 : 0);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    displayCategory(tab.dataset.category);
  });
});

// ─── 8. AVANT / APRÈS SLIDER ──────────────────────
(function initBASlider() {
  const container = document.getElementById('ba-slider');
  const before    = document.getElementById('ba-before');
  const handle    = document.getElementById('ba-handle');
  if (!container) return;

  let isDragging = false;
  let pct = 50; // position initiale en %

  function setPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    x = Math.max(2, Math.min(98, x));
    pct = x;
    // Clip l'image "avant" en partant de la gauche
    before.style.clipPath = `inset(0 ${100 - x}% 0 0)`;
    handle.style.left = `${x}%`;
  }

  // Mouse
  handle.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
  window.addEventListener('mousemove', e => { if (isDragging) setPosition(e.clientX); });
  window.addEventListener('mouseup',   () => { isDragging = false; });

  // Touch
  handle.addEventListener('touchstart', e => { isDragging = true; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove', e => {
    if (isDragging && e.touches.length === 1) setPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Drag sur toute la zone (tap-anywhere)
  container.addEventListener('pointerdown', e => {
    isDragging = true;
    setPosition(e.clientX);
    e.preventDefault();
  });
  container.addEventListener('pointermove', e => {
    if (isDragging) setPosition(e.clientX);
  });
  container.addEventListener('pointerup', () => { isDragging = false; });

  // Init
  setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);
})();

// ─── 9. BOOKING STEPPER ───────────────────────────
(function initBookingStepper() {
  const form      = document.getElementById('booking-form');
  if (!form) return;

  const steps     = Array.from(form.querySelectorAll('.booking-step'));
  const stepDots  = document.querySelectorAll('.step-dot');
  const success   = document.getElementById('booking-success');
  let current = 0;

  // Set min date = aujourd'hui
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
  }

  function goTo(idx) {
    steps[current].classList.add('hidden');
    current = idx;
    steps[current].classList.remove('hidden');
    // Update step dots
    stepDots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i < current)   dot.classList.add('completed');
      if (i === current) dot.classList.add('active');
    });
    // Scroll smooth vers le début du form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(idx) {
    if (idx === 0) {
      const checked = form.querySelector('input[name="service"]:checked');
      if (!checked) {
        alert('Veuillez choisir une prestation pour continuer.');
        return false;
      }
    }
    return true;
  }

  document.getElementById('step1-next')?.addEventListener('click', () => {
    if (validateStep(0)) goTo(1);
  });
  document.getElementById('step2-back')?.addEventListener('click', () => goTo(0));
  document.getElementById('step2-next')?.addEventListener('click', () => goTo(2));
  document.getElementById('step3-back')?.addEventListener('click', () => goTo(1));

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Ici : intégration EmailJS, Formspree, ou fetch() vers votre API
    steps[current].classList.add('hidden');
    success.classList.remove('hidden');
    stepDots.forEach(d => d.classList.remove('active', 'completed'));
    stepDots.forEach(d => d.classList.add('completed'));
  });
})();

// ─── 10. MARQUEE PAUSE ON HOVER ───────────────────
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => marqueeTrack.style.animationPlayState = 'paused');
  marqueeTrack.addEventListener('mouseleave', () => marqueeTrack.style.animationPlayState = 'running');
}

// ─── 11. GSAP ANIMATIONS ──────────────────────────
function startAnimations() {
  setupReveal();
  displayCategory('nude');

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero title — commun mobile/desktop
  gsap.from('.title-line', {
    y: 100, opacity: 0, duration: 1.1,
    stagger: 0.13, ease: 'power4.out', delay: 0.05
  });
  gsap.from('.hero-label, .hero-tagline, .hero-cta-btn', {
    opacity: 0, y: 18, duration: 0.9,
    stagger: 0.12, ease: 'power3.out', delay: 0.5
  });

  // Panels — simple fade (pas de parallax sur mobile)
  gsap.from('.panel', {
    scrollTrigger: { trigger: '.panels-section', start: 'top 85%' },
    opacity: 0, y: 30, duration: 0.9, stagger: 0.12, ease: 'power3.out'
  });

  // Parallax panels (desktop uniquement)
  if (!isTouchDevice) {
    gsap.utils.toArray('.panel .panel-media img').forEach(img => {
      gsap.to(img, {
        scrollTrigger: {
          trigger: img.closest('.panel'),
          start: 'top bottom', end: 'bottom top', scrub: true
        },
        y: -50, ease: 'none'
      });
    });
  }

  // About image reveal
  gsap.from('.about-img-frame', {
    scrollTrigger: { trigger: '.about-section', start: 'top 72%' },
    clipPath: 'inset(15% 0%)', duration: 1.3, ease: 'power4.out'
  });

  // Showcase title
  gsap.from('.showcase-title', {
    scrollTrigger: { trigger: '.showcase-section', start: 'top 78%' },
    y: 50, opacity: 0, duration: 1.1, ease: 'power4.out'
  });

  // Booking header
  gsap.from('.booking-title', {
    scrollTrigger: { trigger: '.booking-section', start: 'top 78%' },
    y: 40, opacity: 0, duration: 1, ease: 'power3.out'
  });
}