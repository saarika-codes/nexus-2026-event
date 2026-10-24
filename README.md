# 🎯 NEXUS 2026 — Event Website

> A premium, fully responsive multi-page conference website built with
> vanilla HTML, CSS, JavaScript & Bootstrap 5. No frameworks, no build step.

## 🌐 Live Demo
🔗 https://nexus-2026-event.vercel.app/

> NEXUS is a fictional event created as a front-end portfolio project. No tickets are sold.

---

## ✨ Features

| Page | What works |
|---|---|
| 🏠 Home | Live countdown timer, animated stat counters, featured speakers, agenda highlights |
| 🎤 Speakers | Live search, profile popup with each speaker's sessions, shareable deep links |
| 📅 Schedule | Day tabs (keyboard accessible), session-type filters, save sessions, `.ics` calendar download |
| 🎟️ Tickets | 3 pricing tiers that preselect the register form, FAQ accordion |
| 📍 Venue | Embedded map, directions link, copy-address button, travel info |
| 📝 Register | Real-time validation, live order total, booking reference, printable confirmation |
| ℹ️ About | Sponsorship tiers, contact form (opens your email app) |
| ⚖️ Legal | Privacy, Terms and Accessibility pages |

Also: responsive mobile menu, newsletter signup, back-to-top button, custom 404 page,
reduced-motion support, keyboard navigation, print styles.

---

## 🚀 Getting Started
```bash
git clone https://github.com/saarika-codes/nexus-2026-event.git
cd nexus-2026-event
open index.html
```

All content (dates, prices, speakers, sessions, FAQ) lives in `data.js`. Edit it once and every page updates.

---

## 🗂️ Project Structure

```
nexus-2026-event/
├── index.html        # Home
├── speakers.html     # Speakers + search + profile modal
├── schedule.html     # Agenda with tabs, filters, saved sessions
├── tickets.html      # Pricing + FAQ
├── venue.html        # Venue, map, travel info
├── register.html     # Registration form
├── about.html        # About, sponsors, contact
├── legal.html        # Privacy, terms, accessibility
├── 404.html          # Not-found page
├── data.js           # All content & event config
├── script.js         # Layout, countdown, filters, forms, calendar export
├── styles.css        # Design system on top of Bootstrap
└── favicon.svg
```

---

## 🛠️ Tech Stack

- **HTML5**: semantic, accessible markup
- **CSS3**: custom properties, animations, responsive layouts
- **Bootstrap 5.3**: grid, navbar, modal, accordion
- **Bootstrap Icons**: icon system
- **Vanilla JavaScript**: data-driven rendering, countdown, search, form validation, localStorage, `.ics` export
- **Google Fonts**: Bebas Neue · Cormorant Garamond · DM Sans
- **Vercel**: hosting, deployed via GitHub

---

## 🙋 Author

**Sarika Kohli** · [GitHub](https://github.com/saarika-codes) · [LinkedIn](https://www.linkedin.com/in/sarika-codes)

📧 sarika.kohli123@gmail.com

---

© 2026 Sarika Kohli. All Rights Reserved.
