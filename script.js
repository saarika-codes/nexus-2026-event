/* ============================================================
   NEXUS 2026 — script.js
   Countdown Timer · Scroll Effects · Form Validation
   ============================================================ */

'use strict';

/* ─── NAVBAR: scroll-aware styling ─────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ─── THEME TOGGLE (persisted) ───────────────────────────────── */
(function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const apply = theme => {
    document.body.classList.toggle('light-theme', theme === 'light');
    btn.setAttribute('aria-pressed', theme === 'light');
    btn.innerHTML = theme === 'light' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    localStorage.setItem('nexusTheme', theme);
  };

  const saved = localStorage.getItem('nexusTheme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  apply(saved === 'light' ? 'light' : 'dark');

  btn.addEventListener('click', () => {
    const next = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    apply(next);
  });
})();


/* ─── SPEAKER MODAL & SEARCH ─────────────────────────────────── */
(function initSpeakerUX() {
  // Modal population
  const modalEl = document.getElementById('speakerModal');
  const modalImage = document.getElementById('modalImage');
  const modalName  = document.getElementById('modalName');
  const modalTopic = document.getElementById('modalTopic');
  const modalBio   = document.getElementById('modalBio');
  const modalSocials = document.getElementById('modalSocials');

  let bsModal = null;
  if (modalEl && window.bootstrap) bsModal = new window.bootstrap.Modal(modalEl);

  document.querySelectorAll('.speaker-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const name = card.querySelector('.speaker-info h5');
      const topic = card.querySelector('.speaker-topic');
      const bio = card.querySelector('.speaker-bio');

      if (modalImage && img) modalImage.src = img.src;
      if (modalName && name) modalName.textContent = name.textContent;
      if (modalTopic && topic) modalTopic.textContent = topic ? topic.textContent : '';
      if (modalBio && bio) modalBio.textContent = bio ? bio.textContent : '';

      // Populate socials
      if (modalSocials) {
        modalSocials.innerHTML = '';
        card.querySelectorAll('.speaker-socials a').forEach(a => {
          const clone = a.cloneNode(true);
          clone.classList.add('me-2');
          modalSocials.appendChild(clone);
        });
      }

      if (bsModal) bsModal.show();
    });
  });

  // Search/filter
  const search = document.getElementById('speakerSearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.speaker-card').forEach(card => {
        const name = card.querySelector('.speaker-info h5')?.textContent.toLowerCase() || '';
        const topic = card.querySelector('.speaker-topic')?.textContent.toLowerCase() || '';
        const bio = card.querySelector('.speaker-bio')?.textContent.toLowerCase() || '';
        const show = !q || name.includes(q) || topic.includes(q) || bio.includes(q);
        const col = card.closest('[class*="col-"]');
        if (col) col.style.display = show ? '' : 'none';
      });
    });
  }
})();


/* ─── SMOOTH SCROLL for anchor links ────────────────────────── */
(function initSmoothScroll() {
  // ignore bare hash links which don't target an element
  document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#0"])').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      // Close mobile menu if open
      const bsCollapse = document.getElementById('navMenu');
      if (bsCollapse && bsCollapse.classList.contains('show') && window.bootstrap) {
        const bsInstance = window.bootstrap.Collapse.getOrCreateInstance(bsCollapse);
        if (bsInstance) bsInstance.hide();
      }

      const offset = document.getElementById('mainNav').offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── COUNTDOWN TIMER ────────────────────────────────────────── */
(function initCountdown() {
  // Target: September 18, 2026 09:00 AM Eastern Time
  const EVENT_DATE = new Date('2026-09-18T09:00:00-04:00');

  const els = {
    days:  document.getElementById('c-days'),
    hours: document.getElementById('c-hours'),
    mins:  document.getElementById('c-mins'),
    secs:  document.getElementById('c-secs'),
  };

  if (!els.days) return;

  // Pad single digits
  const pad = n => String(n).padStart(2, '0');

  // Flash animation on change
  const flash = el => {
    el.style.transform = 'scale(1.25)';
    el.style.color = 'var(--gold-light)';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.color = 'var(--gold)';
    }, 180);
  };

  let prevSecs = null;
  let prevMins = null;
  let prevHours = null;
  let prevDays = null;

  let timer = null;

  const tick = () => {
    const now  = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      // Event has started
      Object.values(els).forEach(el => (el.textContent = '00'));
      if (timer) clearInterval(timer);
      document.querySelector('.countdown-label').textContent = '🎉 Event is live!';
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    if (secs  !== prevSecs)  { els.secs.textContent  = pad(secs);  flash(els.secs); }
    if (mins  !== prevMins)  { els.mins.textContent  = pad(mins);  flash(els.mins); }
    if (hours !== prevHours) { els.hours.textContent = pad(hours); flash(els.hours); }
    if (days  !== prevDays)  { els.days.textContent  = pad(days);  flash(els.days); }

    prevSecs  = secs;
    prevMins  = mins;
    prevHours = hours;
    prevDays  = days;
  };

  tick(); // run immediately, no flicker on load
  timer = setInterval(tick, 1000);
})();


/* ─── SCROLL REVEAL ─────────────────────────────────────────── */
(function initScrollReveal() {
  // Add 'reveal' class to elements we want to animate in
  const targets = [
    '.speaker-card',
    '.ticket-card',
    '.stat-item',
    '.sched-item',
    '.venue-img-frame',
    '.venue-desc',
    '.venue-details',
    '.section-header',
  ];

  targets.forEach((selector, groupIndex) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger cards within a group
      if (i <= 3) el.classList.add(`reveal-delay-${i + 1}`);
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ─── ACTIVE NAV LINK on scroll ─────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlight = () => {
    const scrollY = window.scrollY + 120;
    let current = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', highlight, { passive: true });
  highlight();
})();


/* ─── REGISTRATION FORM VALIDATION ──────────────────────────── */
(function initForm() {
  const form      = document.getElementById('registerForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');
  if (!form) return;

  // Real-time validation helper
  const validateField = input => {
    if (!input.required && !input.value.trim()) {
      input.classList.remove('is-invalid', 'is-valid');
      return true;
    }

    let valid = input.checkValidity();

    // Extra: email format check
    if (input.type === 'email' && input.value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    }

    // Extra: name min length
    if ((input.id === 'firstName' || input.id === 'lastName') && input.value.trim().length < 2) {
      valid = false;
    }

    input.classList.toggle('is-invalid', !valid);
    input.classList.toggle('is-valid', valid);
    return valid;
  };

  // Validate on blur
  form.querySelectorAll('.nx-input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateField(input);
    });
  });

  // Checkbox
  const termsCheck = document.getElementById('termsCheck');
  if (termsCheck) {
    termsCheck.addEventListener('change', () => {
      termsCheck.classList.toggle('is-invalid', !termsCheck.checked);
    });
  }

  // Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.classList.add('was-validated');

    // Validate all required fields
    let allValid = true;
    form.querySelectorAll('.nx-input').forEach(input => {
      if (!validateField(input)) allValid = false;
    });
    if (termsCheck && !termsCheck.checked) {
      termsCheck.classList.add('is-invalid');
      allValid = false;
    }

    if (!allValid) {
      // Scroll to first error
      const firstError = form.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Simulate submission
    try {
      const btnText    = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.classList.add('d-none');
      if (btnSpinner) btnSpinner.classList.remove('d-none');

      await simulateRequest(1800);
    } catch (err) {
      console.error('Registration UI failed:', err);
    }

    // Collect form data (in a real app you'd POST this)
    const payload = {
      firstName:  document.getElementById('firstName').value.trim(),
      lastName:   document.getElementById('lastName').value.trim(),
      email:      document.getElementById('email').value.trim(),
      company:    document.getElementById('company').value.trim(),
      ticketType: document.getElementById('ticketType').value,
    };
    console.log('[NEXUS 2026] Registration payload:', payload);

    // Show success state
    form.classList.add('d-none');
    if (success) success.classList.remove('d-none');

    // Confetti burst
    launchConfetti();
  });

  // Simulate async network request
  function simulateRequest(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();


/* ─── MINI CONFETTI on success ───────────────────────────────── */
function launchConfetti() {
  const colors = ['#C9A84C', '#E8C96A', '#F2EDE4', '#9A7432', '#ffffff'];
  const count  = 80;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position:        'fixed',
      top:             '50%',
      left:            '50%',
      width:           Math.random() * 8 + 4 + 'px',
      height:          Math.random() * 8 + 4 + 'px',
      borderRadius:    Math.random() > 0.5 ? '50%' : '2px',
      background:      colors[Math.floor(Math.random() * colors.length)],
      pointerEvents:   'none',
      zIndex:          9999,
      opacity:         '1',
      transform:       'translate(-50%, -50%)',
      transition:      `transform ${0.8 + Math.random() * 1.2}s ease-out, opacity ${0.8 + Math.random() * 0.8}s ease-out`,
    });
    document.body.appendChild(dot);

    requestAnimationFrame(() => {
      const angle  = Math.random() * 2 * Math.PI;
      const dist   = 120 + Math.random() * 280;
      const tx     = Math.cos(angle) * dist;
      const ty     = Math.sin(angle) * dist - Math.random() * 200;
      dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random() * 720}deg)`;
      dot.style.opacity   = '0';
    });

    setTimeout(() => dot.remove(), 2500);
  }
}


/* ─── NEWSLETTER FORM (footer) ───────────────────────────────── */
(function initNewsletter() {
  const btn   = document.querySelector('.newsletter-btn');
  const input = document.querySelector('.newsletter-input');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = '#e05454';
      input.focus();
      return;
    }
    input.style.borderColor = '#54a854';
    btn.innerHTML = '<i class="bi bi-check2"></i>';
    btn.style.background = '#3a7a3a';
    input.value = '';
    input.placeholder = 'You\'re subscribed!';
    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-send-fill"></i>';
      btn.style.background = '';
      input.placeholder = 'your@email.com';
      input.style.borderColor = '';
    }, 3500);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
})();
