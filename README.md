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
- [🎮 Money/Earnings System](#-gamification-system)  
- [🚀 Deployment, Hosting, and Crons](#-deployment--hosting)  
- [🧩 Future Improvements](#-future-improvements)

---

## 🛠️ Tools Used

| Category | Tools / Frameworks |
|-----------|--------------------|
| **Frontend** | Next.js 15, React, TailwindCSS, Three.js |
| **Backend** | Node.js, Next.js API Routes |
| **Animations** | Framer Motion |
| **Design** | Figma, Illustrator |
| **Deployment** | AWS Amplify |

---

## ⚙️ Frontend Architecture

The frontend leverages **Next.js 14 (App Router)** for file-based routing and **server components** for optimized rendering.  
All UI components are modularized and built with **TypeScript** for type safety.

### Key Features

- **Responsive Design:** Built with TailwindCSS and utility-first principles.  
- **Dynamic Routing:** Each “achievement” or “project” lives as a statically generated route.  
- **Framer Motion Integration:** Smooth page transitions and hover animations enhance immersion.  
- **State Management:** Lightweight context API to handle UI and game state.

---

## 💾 Backend + APIs

The backend is handled via **Next.js API routes**, integrating seamlessly with **Supabase** for user data, progress tracking, and gamified metrics.

### Highlights

- **RESTful Endpoints:** For user XP, achievements, and project data.  
- **Supabase Edge Functions:** Serverless logic for dynamic updates and scoring.  
- **Caching Layer:** Incremental Static Regeneration (ISR) ensures fast responses.  
- **Secure Auth:** NextAuth with GitHub and Google providers.

---

## 🎮 Gamification System

The centerpiece of the portfolio — a **reward-based experience** system that turns exploration into play.

### How It Works

- Each page visit grants **XP** or unlocks **achievements** (stored in Supabase).  
- The **HUD component** displays live XP and level progress.  
- Leaderboard and badges encourage continued engagement.  
- Designed with **modular components**, so new achievements can be added easily.

---

## 🎨 Design & UI

The visual design embraces a **retro-futuristic** theme — playful, yet functional.

- Built with **Figma → Tailwind** workflow.  
- **Shadcn/UI** components for consistent design language.  
- **Framer Motion** adds delight through subtle transitions.  
- All icons from **Lucide React**, ensuring clean vector visuals.

---

## 🚀 Deployment & Hosting

The app is continuously deployed via **Vercel**, leveraging:

- Automatic builds on `main` branch commits.  
- Environment variables managed via **Vercel dashboard**.  
- Edge Network caching for global performance.  
- CI/CD integration for preview deployments.

---

## 🧩 Future Improvements

- 🧠 Integrate **AI-powered project recommendations**.  
- 🪄 Add **custom game quests** for interactive storytelling.  
- 🧭 Improve accessibility with semantic components.  
- ⚡ Expand dashboard analytics for visitor tracking.

---

<p align="center">Made with ❤️ by <b>Aidan Chien</b></p>
