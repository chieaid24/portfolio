<h1 align="center"> 💫 Aidan's Portfolio Site </h1>

<img width="2090" height="1006" alt="website_card" src="https://github.com/user-attachments/assets/43aaa055-6ea6-4506-b93a-c5daa8f6085c" />

<h2>Overview</h2>

The site is live at **[aidanchien.com](https://aidanchien.com)**! 
It’s an interactive personal portfolio, and this README serves to highlight some aspects of the design.  

Each section below explains a different aspect of the system architecture and design process.
- [Tools Used](#tools-used)  
- [Frontend Architecture](#frontend-architecture)  
- [Backend + APIs](#backend--apis)  
- [Money/Earnings System](#moneyearnings-system) 
- [Future Extensions](#future-extensions)

---

## Tools Used

| Category | Tools / Frameworks |
|-----------|--------------------|
| **Frontend** | Next.js 15, TailwindCSS, Framer Motion, Three.js  |
| **Backend** | Node.js (Next.js API Routes), MongoDB, Pusher, Vercel Cron Jobs |
| **Design** | Figma, Illustrator |
| **Deployment** | Vercel |

---

## Frontend Architecture
- **Hero Space Background:** Generated a map of 800 stars with Three.js, randomly positioned in a spherical pattern. The group then is rotated using `useFrame()` around a center point to create a realistic sense of motion.  
- **Responsive Design:** The site works on mobile to 4k+ layouts, built with TailwindCSS and a **mobile-first** design principle.


---

## Backend + APIs

The backend is handled via **Next.js API routes** (Node.js), calling and caching information from **REST APIs** and **MongoDB**.

### Highlights
- **Starflare System Design:** Allows for global, real-time synchronization of the number of starflares sent. This is implemented through MongoDB as the global source of truth, and Pusher for real-time updates.
  - On `SEND` button click, it creates a POST request to my backend, and simultaneously **optimistically updates** the counter.
  - In my backend, the request increments local state (saved in the browser) - and issues a request to **MongoDB** and **Pusher**
    - Backing up, when the component is loaded, it subscribes the client to a **Pusher channel** (shared by users globally) so it can receive any incoming published messages
  -  Considerations made:
      - The counter only updates when the incoming value is greater than the currently displayed value (prevents flickering in race conditions)
      - **Rate limiting** for 25 requests / 10 seconds
- **RESTful Endpoints:** Fetches data from Clash Royale API (through the Royale API proxy) **daily,** caching it for a week
  - Allows older, **clean data** to be served in case of error
- **Monthly Cron Job:** Leverages **Vercel Cron** and Spotify API to calculate and update a Spotify playlist with my five most played songs of the month
  - Displayed on my "About" page

---

## Money/Earnings System

- Implemented with a global **React Context Provider** `(MoneyProvider)` that manages **rewards, balances, and quest progression** and persisted via localStorage
- User can spend money earned by exploring the portfolio on site-wide themes and sending Starflares to increment the global counter. 

---

## Future Extensions

- AI chatbot using my projects / resume as a RAG database
- Skills grid showcasing langauges and frameworks

