<h1 align="center"> 🚀 Aidan's Gamified Portfolio Site</h1>

> My full-stack personal site, powered by Next.js and Tailwind.

<img width="2090" height="1006" alt="website_card" src="https://github.com/user-attachments/assets/43aaa055-6ea6-4506-b93a-c5daa8f6085c" />

<h2>🧭 Overview</h2>

The site is live at **[aidanchien.com](https://aidanchien.com)**! 
It’s an interactive personal portfolio, and this README serves as a technical breakdown of how it’s built and organized.  

Each section below dives into a different aspect of the system architecture and design process.
- [🛠️ Tools Used](#️-tools-used)  
- [⚙️ Frontend Architecture](#️-frontend-architecture)  
- [💾 Backend + APIs](#-backend--apis)  
- [💸 Money/Earnings System](#-moneyearnings-system) 
- [🔮 Future Improvements](#-future-improvements)

---

## 🛠️ Tools Used

| Category | Tools / Frameworks |
|-----------|--------------------|
| **Frontend** | Next.js 15, React, TailwindCSS, Framer Motion, Three.js  |
| **Backend** | Node.js |
| **Design** | Figma, Illustrator |
| **Deployment** | Vercel |

---

## ⚙️ Frontend Architecture

The frontend leverages **Next.js 15 (App Router)** for file-based routing and **server components** for optimized rendering.  
All UI components are modular and formatted for future expansion and scalability.

### Key Features

- **Landing Page Slot Machine:** Interactive SVG animation built in the DOM with Framer Motion
  - Features an "Inquiry" animation persisted with localStorage for first time visitors
  - Samples from a statistical mixture model with **triangular-power-law distribution** to simulate realistic payouts
  - Includes **safeguards** against numeric under/overflow when gambling
- **Responsive Design:** Created mobile to 4k+ layouts, built with TailwindCSS and **utility-first principles**
- **Dynamic Routing:** Each project page is **built dynamically** from data at build time (static generation), allowing fast, **SEO-friendly** “plug-and-play” templates for projects.


---

## 💾 Backend + APIs

The backend is handled via **Next.js API routes** (Node.js), calling and caching information from multiple **REST APIs.**

### Highlights

- **RESTful Endpoints:** Fetches data from Clash Royale and Chess.com APIs **daily,** caching it for up to a week
  - Allows older, **clean data** to be served in case of error
- **Monthly Cron Job:** Leverages **Vercel Cron** to update a Spotify playlist with my five most played songs of the month
  - Displayed on my "About" page

---

## 💸 Money/Earnings System

The centerpiece of the portfolio: a **reward-based earnings** system that incentivises exploration.

### How It Works

- Implemented with a global **React Context Provider** `(MoneyProvider)` that manages **rewards, balances, and quest progression** and persisted via localStorage
- By interacting with new links and projects (tracked as "quests"), the user increases their earnings 
- Completing all quests unlocks a **dark mode** state which persists across the site

---


## Theme System

- Default theme is `id: "red"` (`#ff7d7d`); other themes live alongside it in `src/lib/money-context.js` and `src/components/ThemeSection.js`.
- `MoneyProvider` exposes `themeId`, `highlightHex`, `setThemeById`, and `purchaseTheme`, and updates the global CSS variable `--highlight-color` so Tailwind's `highlight-color` references switch instantly.
- `MoneyProvider` persists `ownedThemes` (always includes `"red"`) alongside the selected theme; purchases subtract `theme.price` from balance and add the theme to `ownedThemes`.
- `ThemeSection` keeps `selectedId` in sync with the context and calls `purchaseTheme` when a theme is unowned (or `setThemeById` if owned), giving immediate site-wide highlight updates.
- To add a theme: add `{ id, label, color, price }` to the theme arrays in both `money-context.js` and `ThemeSection.js`; choose a unique `id` and hex color.

---
## 🔮 Future Improvements

- 🧠 Integrate **AI project summaries**.
- 🪄 Add **rewards or prizes** for spending your earnings.
- ⚡ Expand dashboard analytics for visitor tracking.


