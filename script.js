/* ============================================================
   NEXUS 2026 — script.js
   Layout injection · countdown · counters · speakers · agenda
   · tickets/FAQ · registration · newsletter · contact · venue
   ============================================================ */
'use strict';

document.documentElement.classList.add('js');

/* ─── Helpers ──────────────────────────────────────────────── */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '$' + n.toLocaleString('en-US');
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }
};

const E = NEXUS.event;
const PAGE = document.body.dataset.page || '';
const TYPE_LABEL = { keynote: 'Keynote', talk: 'Talk', panel: 'Panel', workshop: 'Workshop', break: 'Break', social: 'Social' };

// Flat lookup of every session (with its day info)
const SESSIONS = {};
Object.entries(NEXUS.schedule).forEach(([d, day]) =>
  day.sessions.forEach(s => { SESSIONS[s.id] = { ...s, day: d, iso: day.iso, date: day.date }; })
);

const speakerById = id => NEXUS.speakers.find(s => s.id === id);

/* ─── Toast ────────────────────────────────────────────────── */
function toast(msg) {
  let t = $('#nxToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'nxToast';
    t.className = 'nx-toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ─── Layout: header, footer, speaker modal, back-to-top ───── */
const NAV = [
  ['speakers.html', 'Speakers', 'speakers'],
  ['schedule.html', 'Schedule', 'schedule'],
  ['tickets.html', 'Tickets', 'tickets'],
  ['venue.html', 'Venue', 'venue'],
  ['about.html', 'About', 'about']
];

function renderLayout() {
  $('#site-header').innerHTML = `
    <nav id="mainNav" class="navbar navbar-expand-lg fixed-top" aria-label="Main navigation">
      <div class="container">
        <a class="navbar-brand" href="index.html" aria-label="NEXUS 2026 home">
          <span class="brand-nx">NEX</span><span class="brand-us">US</span><span class="brand-year">2026</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
                aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
          <i class="bi bi-list toggler-icon" aria-hidden="true"></i>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav ms-auto gap-lg-2 align-items-lg-center">
            ${NAV.map(([href, label, key]) => `
              <li class="nav-item"><a class="nav-link${PAGE === key ? ' active' : ''}" href="${href}"${PAGE === key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
            <li class="nav-item ms-lg-3 mt-2 mt-lg-0"><a class="btn-accent-sm" href="register.html">Register</a></li>
          </ul>
        </div>
      </div>
    </nav>`;

  $('#site-footer').innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="row g-4 footer-top">
          <div class="col-lg-4">
            <div class="footer-brand"><span class="brand-nx">NEX</span><span class="brand-us">US</span><span class="brand-year">2026</span></div>
            <p class="footer-tagline">The Future of Innovation<br /><span data-nx="dates">${E.dates}</span>, <span data-nx="city">${E.city}</span>.</p>
            <div class="footer-socials">
              <a href="https://github.com/saarika-codes" target="_blank" rel="noopener" aria-label="Sarika Kohli on GitHub"><i class="bi bi-github"></i></a>
              <a href="https://www.linkedin.com/in/sarika-codes" target="_blank" rel="noopener" aria-label="Sarika Kohli on LinkedIn"><i class="bi bi-linkedin"></i></a>
              <a data-mail href="#" aria-label="Send an email"><i class="bi bi-envelope-fill"></i></a>
            </div>
          </div>
          <div class="col-6 col-lg-2 offset-lg-1">
            <h2 class="footer-heading">Event</h2>
            <ul class="footer-links">
              <li><a href="speakers.html">Speakers</a></li>
              <li><a href="schedule.html">Agenda</a></li>
              <li><a href="tickets.html">Tickets</a></li>
              <li><a href="venue.html">Venue</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h2 class="footer-heading">Info</h2>
            <ul class="footer-links">
              <li><a href="about.html">About NEXUS</a></li>
              <li><a href="about.html#sponsors">Sponsorship</a></li>
              <li><a href="tickets.html#faq">FAQ</a></li>
              <li><a href="about.html#contact">Contact</a></li>
            </ul>
          </div>
          <div class="col-lg-3">
            <h2 class="footer-heading">Stay Updated</h2>
            <p class="footer-newsletter-text">Get speaker announcements and schedule updates.</p>
            <form id="newsletterForm" class="footer-newsletter" novalidate>
              <label class="visually-hidden" for="newsletterEmail">Email address</label>
              <input id="newsletterEmail" type="email" class="newsletter-input" placeholder="your@email.com" autocomplete="email" />
              <button type="submit" class="newsletter-btn" aria-label="Subscribe"><i class="bi bi-send-fill"></i></button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 NEXUS Conference — a demo project by Sarika Kohli. No tickets are sold.</span>
          <span>
            <a href="legal.html#privacy">Privacy Policy</a> &nbsp;·&nbsp;
            <a href="legal.html#terms">Terms</a> &nbsp;·&nbsp;
            <a href="legal.html#accessibility">Accessibility</a>
          </span>
        </div>
      </div>
    </footer>

    <div class="modal fade" id="speakerModal" tabindex="-1" aria-labelledby="modalName" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header border-0">
            <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-0">
            <div class="row g-4 align-items-center">
              <div class="col-md-4 text-center"><img id="modalImage" src="" alt="" /></div>
              <div class="col-md-8">
                <h2 id="modalName" class="modal-name"></h2>
                <p class="modal-topic" id="modalTopic"></p>
                <p id="modalBio"></p>
                <div id="modalSessions"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="to-top" id="toTop" aria-label="Back to top"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>`;
}

/* Fill config values (dates, city, venue, email...) everywhere */
function bindConfig() {
  const values = { dates: E.dates, city: E.city, venue: E.venue, address: E.address, earlybird: E.earlyBirdEnds };
  $$('[data-nx]').forEach(el => { const v = values[el.dataset.nx]; if (v) el.textContent = v; });
  $$('[data-mail]').forEach(a => { a.href = 'mailto:' + E.email; });
  $$('[data-mail-text]').forEach(a => { a.textContent = E.email; });
}

/* ─── Navbar & back-to-top ─────────────────────────────────── */
function initNav() {
  const nav = $('#mainNav'), toTop = $('#toTop');
  const solid = PAGE !== 'home';
  const onScroll = () => {
    nav.classList.toggle('scrolled', solid || window.scrollY > 60);
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  // Close the mobile menu after tapping a link
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
    const menu = $('#navMenu');
    if (menu.classList.contains('show') && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));
}

/* ─── Countdown ────────────────────────────────────────────── */
function initCountdown() {
  const els = { days: $('#c-days'), hours: $('#c-hours'), mins: $('#c-mins'), secs: $('#c-secs') };
  if (!els.days) return;
  const label = $('.countdown-label');
  const start = new Date(E.start), end = new Date(E.end);
  const pad = n => String(n).padStart(2, '0');
  const prev = {};
  let timer;

  const set = (key, value) => {
    if (prev[key] === value) return;
    prev[key] = value;
    els[key].textContent = pad(value);
    if (!reduceMotion) {
      els[key].classList.remove('tick');
      void els[key].offsetWidth; // restart the animation
      els[key].classList.add('tick');
    }
  };

  const tick = () => {
    const now = new Date(), diff = start - now;
    if (diff <= 0) {
      Object.values(els).forEach(el => { el.textContent = '00'; });
      label.textContent = now < end ? '🎉 Event is live!' : 'This event has ended';
      if (now >= end) clearInterval(timer);
      return;
    }
    set('days', Math.floor(diff / 86400000));
    set('hours', Math.floor((diff % 86400000) / 3600000));
    set('mins', Math.floor((diff % 3600000) / 60000));
    set('secs', Math.floor((diff % 60000) / 1000));
  };

  tick();
  timer = setInterval(tick, 1000);
}

/* ─── Animated stat counters ───────────────────────────────── */
function initCounters() {
  const items = $$('[data-count]');
  if (!items.length) return;
  const show = (el, n) => {
    const suffix = el.dataset.suffix || '';
    el.innerHTML = n + (suffix === '+' ? '<sup>+</sup>' : suffix);
  };
  if (reduceMotion || !('IntersectionObserver' in window)) return; // keep final values

  items.forEach(el => show(el, 0));
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = +el.dataset.count, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 1400, 1);
      show(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    io.unobserve(el);
  }), { threshold: 0.5 });
  items.forEach(el => io.observe(el));
}

/* ─── Scroll reveal ────────────────────────────────────────── */
let revealObserver;
function initReveal() {
  if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(el => el.classList.add('visible')); return; }
  revealObserver = revealObserver || new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

/* ─── Speakers ─────────────────────────────────────────────── */
const avatar = name => {
  const initials = name.replace(/^Dr\.\s*/, '').split(' ').map(w => w[0]).slice(0, 2).join('');
  return 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#14181b"/><text x="150" y="178" font-size="96" text-anchor="middle" fill="#00B39F" font-family="Arial, sans-serif">${initials}</text></svg>`);
};

// If a speaker photo fails to load, show initials instead
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.name && !img.dataset.fallback) {
    img.dataset.fallback = '1';
    img.src = avatar(img.dataset.name);
  }
}, true);

const speakerCard = (s, i = 0) => `
  <div class="col-6 col-md-4 col-lg-3 speaker-col reveal" style="--d:${i % 4}" data-id="${s.id}">
    <article class="speaker-card" tabindex="0" role="button" data-id="${s.id}" aria-label="View profile of ${esc(s.name)}">
      <div class="speaker-img-wrap">
        <img src="${s.img}" alt="Portrait of ${esc(s.name)}" width="300" height="300" loading="lazy" data-name="${esc(s.name)}" />
        <div class="speaker-hover">
          <p class="speaker-bio">${esc(s.bio)}</p>
          <span class="speaker-more">View profile <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
      </div>
      <div class="speaker-info">
        <h3>${esc(s.name)}</h3>
        <span class="speaker-topic"><i class="bi ${s.icon}" aria-hidden="true"></i> ${esc(s.topic)}</span>
      </div>
    </article>
  </div>`;

function openSpeaker(id) {
  const s = speakerById(id);
  if (!s || !window.bootstrap) return;
  const img = $('#modalImage');
  img.dataset.name = s.name;
  delete img.dataset.fallback;
  img.src = s.img;
  img.alt = 'Portrait of ' + s.name;
  $('#modalName').textContent = s.name;
  $('#modalTopic').textContent = s.topic;
  $('#modalBio').textContent = s.bio;

  const sessions = Object.values(SESSIONS).filter(x => x.speakers.includes(id) || x.speakers.includes('all'));
  $('#modalSessions').innerHTML = sessions.length
    ? `<h3 class="modal-sub">Sessions</h3><ul class="modal-sessions">${sessions.map(x =>
        `<li><a href="schedule.html#day${x.day}"><span>${x.date} · ${x.time}</span>${esc(x.title)}</a></li>`).join('')}</ul>`
    : '';
  window.bootstrap.Modal.getOrCreateInstance($('#speakerModal')).show();
}

function initSpeakers() {
  // Open the modal from any speaker card (home + speakers page)
  document.addEventListener('click', e => {
    const card = e.target.closest('.speaker-card');
    if (card) openSpeaker(card.dataset.id);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest?.('.speaker-card');
    if (card) { e.preventDefault(); openSpeaker(card.dataset.id); }
  });
  $('#speakerModal').addEventListener('hidden.bs.modal', () => {
    if (speakerById(location.hash.slice(1))) history.replaceState(null, '', location.pathname + location.search);
  });

  const featured = $('#featuredSpeakers');
  if (featured) featured.innerHTML = NEXUS.speakers.slice(0, 4).map(speakerCard).join('');

  const grid = $('#speakerGrid');
  if (!grid) return;
  grid.innerHTML = NEXUS.speakers.map(speakerCard).join('');

  const search = $('#speakerSearch'), count = $('#speakerCount'), empty = $('#speakerEmpty');
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    $$('.speaker-col', grid).forEach(col => {
      const s = speakerById(col.dataset.id);
      const hit = !q || [s.name, s.topic, s.bio].some(t => t.toLowerCase().includes(q));
      col.hidden = !hit;
      if (hit) shown++;
    });
    count.textContent = `${shown} of ${NEXUS.speakers.length} speakers`;
    empty.hidden = shown > 0;
  };
  search.addEventListener('input', apply);
  $('#speakerClear').addEventListener('click', () => { search.value = ''; apply(); search.focus(); });
  apply();

  if (location.hash.length > 1) openSpeaker(decodeURIComponent(location.hash.slice(1)));
}

/* ─── Home: agenda highlights ──────────────────────────────── */
function initHighlights() {
  const box = $('#highlights');
  if (!box) return;
  box.innerHTML = Object.entries(NEXUS.schedule).map(([d, day], i) => {
    const k = day.sessions.find(s => s.type === 'keynote');
    return `
      <div class="col-md-4 reveal" style="--d:${i}">
        <a class="highlight-card" href="schedule.html#day${d}">
          <span class="hl-day">${day.label} · ${day.date}</span>
          <h3>${esc(k.title)}</h3>
          <p>${esc(k.desc)}</p>
          <span class="hl-link">See full agenda <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </a>
      </div>`;
  }).join('');
}

/* ─── Schedule: tabs, filters, saved sessions, .ics ────────── */
function downloadICS(sessions, filename) {
  const z = n => String(n).padStart(2, '0');
  const utc = d => `${d.getUTCFullYear()}${z(d.getUTCMonth() + 1)}${z(d.getUTCDate())}T${z(d.getUTCHours())}${z(d.getUTCMinutes())}00Z`;
  const ics = t => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NEXUS 2026//Agenda//EN', 'CALSCALE:GREGORIAN'];
  sessions.forEach(s => {
    const start = new Date(`${s.iso}T${s.time}:00${E.tz}`);
    const end = new Date(start.getTime() + s.dur * 60000);
    lines.push('BEGIN:VEVENT', `UID:${s.id}@nexus2026.demo`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`, `SUMMARY:${ics(s.title)}`,
      `DESCRIPTION:${ics(s.desc)}`, `LOCATION:${ics(E.venue + ', ' + E.address)}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function speakerLinks(s) {
  if (s.speakers.includes('all')) return '<span class="sched-speaker"><i class="bi bi-people-fill" aria-hidden="true"></i> All Speakers</span>';
  if (!s.speakers.length) return '';
  return `<span class="sched-speaker"><i class="bi bi-person-fill" aria-hidden="true"></i> ${
    s.speakers.map(id => `<a href="speakers.html#${id}">${esc(speakerById(id).name)}</a>`).join(' · ')}</span>`;
}

function initSchedule() {
  const list = $('#scheduleList');
  if (!list) return;
  const tabs = $('#dayTabs'), chips = $('#typeFilters');
  const m = location.hash.match(/^#day([123])$/);
  let day = m ? m[1] : '1';
  let type = 'all';
  const saved = new Set(store.get('nexus_saved', []));
  const persist = () => store.set('nexus_saved', [...saved]);

  tabs.innerHTML = Object.entries(NEXUS.schedule).map(([d, x]) => `
    <button class="sched-tab" role="tab" id="tab-${d}" data-day="${d}" aria-controls="scheduleList">
      <span class="tab-day">${x.label}</span><span class="tab-date">${x.date}</span>
    </button>`).join('');

  const chipDefs = [['all', 'All'], ['keynote', 'Keynotes'], ['talk', 'Talks'], ['panel', 'Panels'], ['workshop', 'Workshops'], ['social', 'Social'], ['saved', 'Saved']];
  const drawChips = () => {
    chips.innerHTML = chipDefs.map(([k, label]) =>
      `<button type="button" class="chip" data-type="${k}" aria-pressed="${type === k}">${label}${k === 'saved' ? ` (${saved.size})` : ''}</button>`).join('');
  };

  const sessionHTML = s => `
    <article class="sched-item${s.featured ? ' featured' : ''}">
      <div class="sched-time">${s.time}</div>
      <div class="sched-body">
        <span class="sched-type ${s.type}">${esc(s.label || TYPE_LABEL[s.type])}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
        ${speakerLinks(s)}
      </div>
      <div class="sched-actions">
        <button type="button" class="icon-btn" data-save="${s.id}" aria-pressed="${saved.has(s.id)}" aria-label="Save “${esc(s.title)}” to my agenda">
          <i class="bi ${saved.has(s.id) ? 'bi-bookmark-fill' : 'bi-bookmark'}" aria-hidden="true"></i>
        </button>
        <button type="button" class="icon-btn" data-cal="${s.id}" aria-label="Add “${esc(s.title)}” to calendar">
          <i class="bi bi-calendar-plus" aria-hidden="true"></i>
        </button>
      </div>
    </article>`;

  const render = () => {
    $$('.sched-tab', tabs).forEach(b => {
      const on = b.dataset.day === day;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
    });
    list.setAttribute('aria-labelledby', 'tab-' + day);
    drawChips();
    const d = NEXUS.schedule[day];
    const items = d.sessions.filter(s => type === 'all' || (type === 'saved' ? saved.has(s.id) : s.type === type));
    list.innerHTML = items.length
      ? items.map(s => sessionHTML(SESSIONS[s.id])).join('')
      : `<p class="sched-empty">${type === 'saved' ? 'You haven’t saved any sessions on this day yet.' : 'No sessions of this type on ' + d.date + '.'}</p>`;
  };

  tabs.addEventListener('click', e => {
    const b = e.target.closest('.sched-tab');
    if (!b) return;
    day = b.dataset.day;
    history.replaceState(null, '', '#day' + day);
    render();
  });
  tabs.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const keys = Object.keys(NEXUS.schedule);
    const i = keys.indexOf(day);
    day = keys[(i + (e.key === 'ArrowRight' ? 1 : keys.length - 1)) % keys.length];
    render();
    $('#tab-' + day).focus();
  });
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    type = c.dataset.type;
    render();
    $(`.chip[data-type="${type}"]`, chips).focus();
  });

  list.addEventListener('click', e => {
    const saveBtn = e.target.closest('[data-save]');
    const calBtn = e.target.closest('[data-cal]');
    if (saveBtn) {
      const id = saveBtn.dataset.save;
      if (saved.has(id)) { saved.delete(id); toast('Removed from your agenda'); }
      else { saved.add(id); toast('Saved to your agenda'); }
      persist();
      if (type === 'saved') { render(); return; }
      saveBtn.setAttribute('aria-pressed', saved.has(id));
      saveBtn.innerHTML = `<i class="bi ${saved.has(id) ? 'bi-bookmark-fill' : 'bi-bookmark'}" aria-hidden="true"></i>`;
      drawChips();
    }
    if (calBtn) {
      const s = SESSIONS[calBtn.dataset.cal];
      downloadICS([s], s.id + '.ics');
      toast('Calendar file downloaded');
    }
  });

  $('#exportSaved').addEventListener('click', () => {
    const items = [...saved].map(id => SESSIONS[id]).filter(Boolean);
    if (!items.length) { toast('Save a session first'); return; }
    downloadICS(items, 'nexus-2026-my-agenda.ics');
    toast('Your agenda was downloaded');
  });

  window.addEventListener('hashchange', () => {
    const h = location.hash.match(/^#day([123])$/);
    if (h) { day = h[1]; render(); }
  });

  render();
}

/* ─── Tickets & FAQ ────────────────────────────────────────── */
const ticketCard = (t, i) => `
  <div class="col-md-6 col-lg-4 reveal" style="--d:${i}">
    <div class="ticket-card${t.featured ? ' featured' : ''}${t.dark ? ' dark' : ''}">
      ${t.badge ? `<div class="ticket-badge">${t.badge}</div>` : ''}
      <h3 class="ticket-tier">${t.name}</h3>
      <div class="ticket-price">${money(t.price)}${t.was ? ` <span class="was"><span class="visually-hidden">Was </span>${money(t.was)}</span>` : ''}</div>
      <div class="ticket-period">${t.period}</div>
      <ul class="ticket-perks">
        ${t.perks.map(([text, ok]) => `
          <li${ok ? '' : ' class="faded"'}><i class="bi ${ok ? 'bi-check2' : 'bi-x'}" aria-hidden="true"></i><span class="visually-hidden">${ok ? 'Included:' : 'Not included:'}</span> ${text}</li>`).join('')}
      </ul>
      <a href="register.html?ticket=${t.id}" class="${t.featured ? 'btn-dark-solid' : 'btn-outline-accent'} w-100">Get ${t.name} Pass</a>
    </div>
  </div>`;

function initTickets() {
  const grid = $('#ticketGrid');
  if (grid) grid.innerHTML = NEXUS.tickets.map(ticketCard).join('');

  const acc = $('#faqAccordion');
  if (acc) {
    acc.innerHTML = NEXUS.faqs.map(([q, a], i) => `
      <div class="accordion-item">
        <h3 class="accordion-header">
          <button class="accordion-button${i ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}" aria-expanded="${i === 0}" aria-controls="faq${i}">${q}</button>
        </h3>
        <div id="faq${i}" class="accordion-collapse collapse${i ? '' : ' show'}" data-bs-parent="#faqAccordion">
          <div class="accordion-body">${a}</div>
        </div>
      </div>`).join('');
  }
}

/* ─── Registration ─────────────────────────────────────────── */
function launchConfetti() {
  if (reduceMotion) return;
  const colors = ['#00B39F', '#6BE7C3', '#F2F7F5', '#007A6B', '#ffffff'];
  for (let i = 0; i < 80; i++) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', top: '50%', left: '50%',
      width: Math.random() * 8 + 4 + 'px', height: Math.random() * 8 + 4 + 'px',
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      background: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: 'none', zIndex: 9999, opacity: '1', transform: 'translate(-50%, -50%)',
      transition: `transform ${0.8 + Math.random() * 1.2}s ease-out, opacity ${0.8 + Math.random() * 0.8}s ease-out`
    });
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      const angle = Math.random() * 2 * Math.PI, dist = 120 + Math.random() * 280;
      const tx = Math.cos(angle) * dist, ty = Math.sin(angle) * dist - Math.random() * 200;
      dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random() * 720}deg)`;
      dot.style.opacity = '0';
    });
    setTimeout(() => dot.remove(), 2500);
  }
}

function initRegister() {
  const form = $('#registerForm');
  if (!form) return;
  const ticket = $('#ticketType'), qty = $('#quantity'), total = $('#orderTotal');
  const terms = $('#termsCheck'), success = $('#formSuccess'), header = $('.register-header');

  ticket.insertAdjacentHTML('beforeend', NEXUS.tickets.map(t => `<option value="${t.id}">${t.name} — ${money(t.price)}</option>`).join(''));
  const wanted = new URLSearchParams(location.search).get('ticket');
  if (NEXUS.tickets.some(t => t.id === wanted)) ticket.value = wanted;

  const updateTotal = () => {
    const t = NEXUS.tickets.find(x => x.id === ticket.value);
    total.textContent = t ? money(t.price * (+qty.value || 1)) : '—';
  };
  [ticket, qty].forEach(el => el.addEventListener('change', updateTotal));
  updateTotal();

  const rules = {
    firstName: v => v.trim().length >= 2,
    lastName: v => v.trim().length >= 2,
    email: isEmail,
    phone: v => !v.trim() || /^\+?[\d\s()-]{7,20}$/.test(v.trim()),
    ticketType: v => !!v
  };
  const check = el => {
    if (!el.required && !el.value.trim()) { el.classList.remove('is-invalid', 'is-valid'); return true; }
    const ok = rules[el.id] ? rules[el.id](el.value) : true;
    el.classList.toggle('is-invalid', !ok);
    el.classList.toggle('is-valid', ok);
    return ok;
  };

  $$('.nx-input', form).forEach(el => {
    el.addEventListener('blur', () => check(el));
    el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) check(el); });
  });
  terms.addEventListener('change', () => terms.classList.toggle('is-invalid', !terms.checked));

  const showSuccess = rec => {
    $('#successRef').textContent = rec.ref;
    $('#successSummary').innerHTML = [
      ['Name', rec.name], ['Email', rec.email], ['Pass', `${rec.ticket} × ${rec.qty}`],
      ['Total', money(rec.total)], ['Event', `${E.dates} · ${E.venue}, ${E.city}`]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    form.classList.add('d-none');
    header.classList.add('d-none');
    success.classList.remove('d-none');
    success.focus();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    launchConfetti();
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('.nx-input', form).forEach(el => { if (!check(el)) ok = false; });
    terms.classList.toggle('is-invalid', !terms.checked);
    if (!terms.checked) ok = false;
    if (!ok) {
      const bad = $('.is-invalid', form);
      bad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      bad.focus();
      return;
    }

    const btn = $('#submitBtn');
    btn.disabled = true;
    $('.btn-text', btn).classList.add('d-none');
    $('.btn-spinner', btn).classList.remove('d-none');
    await new Promise(r => setTimeout(r, 1200)); // simulated network request

    const t = NEXUS.tickets.find(x => x.id === ticket.value);
    const n = +qty.value || 1;
    const rec = {
      ref: 'NX26-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: `${$('#firstName').value.trim()} ${$('#lastName').value.trim()}`,
      email: $('#email').value.trim(),
      company: $('#company').value.trim(),
      ticket: t.name, qty: n, total: t.price * n,
      dietary: $('#dietary').value.trim(),
      at: new Date().toISOString()
    };
    const all = store.get('nexus_registrations', []);
    all.push(rec);
    store.set('nexus_registrations', all);
    showSuccess(rec);
  });

  $('#printConfirmation').addEventListener('click', () => window.print());
  $('#registerAnother').addEventListener('click', () => {
    form.reset();
    $$('.is-valid, .is-invalid', form).forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    const btn = $('#submitBtn');
    btn.disabled = false;
    $('.btn-text', btn).classList.remove('d-none');
    $('.btn-spinner', btn).classList.add('d-none');
    updateTotal();
    success.classList.add('d-none');
    form.classList.remove('d-none');
    header.classList.remove('d-none');
    $('#firstName').focus();
  });
}

/* ─── Newsletter (footer) ──────────────────────────────────── */
function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;
  const input = $('input', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!isEmail(input.value)) {
      input.classList.add('is-invalid');
      input.focus();
      toast('Please enter a valid email address');
      return;
    }
    input.classList.remove('is-invalid');
    const list = store.get('nexus_newsletter', []);
    const email = input.value.trim();
    if (!list.includes(email)) list.push(email);
    store.set('nexus_newsletter', list);
    input.value = '';
    toast('Subscribed! (demo — saved in this browser only)');
  });
}

/* ─── Contact form → opens the user's email app ────────────── */
function initContact() {
  const form = $('#contactForm');
  if (!form) return;
  const name = $('#cName'), email = $('#cEmail'), msg = $('#cMessage'), subject = $('#cSubject');

  const wanted = new URLSearchParams(location.search).get('subject');
  const opt = wanted && [...subject.options].find(o => o.value.toLowerCase() === wanted.toLowerCase());
  if (opt) subject.value = opt.value;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const checks = [[name, name.value.trim().length >= 2], [email, isEmail(email.value)], [msg, msg.value.trim().length >= 10]];
    let ok = true;
    checks.forEach(([el, valid]) => {
      el.classList.toggle('is-invalid', !valid);
      el.classList.toggle('is-valid', valid);
      if (!valid) ok = false;
    });
    if (!ok) { $('.is-invalid', form).focus(); return; }

    const body = `${msg.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`;
    window.location.href = `mailto:${E.email}?subject=${encodeURIComponent('[NEXUS 2026] ' + subject.value)}&body=${encodeURIComponent(body)}`;
    $('#contactNote').hidden = false;
  });
}

/* ─── Venue ────────────────────────────────────────────────── */
function initVenue() {
  const btn = $('#copyAddress');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`${E.venue}, ${E.address}`); toast('Address copied'); }
    catch { toast('Couldn’t copy — please select the address manually'); }
  });
}

/* ─── Init ─────────────────────────────────────────────────── */
renderLayout();
bindConfig();
initNav();
initCountdown();
initCounters();
initSpeakers();
initHighlights();
initSchedule();
initTickets();
initRegister();
initNewsletter();
initContact();
initVenue();
initReveal();
