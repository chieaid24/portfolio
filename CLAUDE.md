# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Next.js dev server (Turbopack)
npm run build          # Production build; runs next-sitemap afterward (postbuild)
npm run start          # Serve the production build
npm run lint           # ESLint (next/core-web-vitals)
npm run build:favicon  # Regenerate public/favicon.ico from public/icons-src/*.png
```

No test framework is configured. This is a **JavaScript** project (no TypeScript), despite `jsconfig.json`. The `@/*` import alias maps to `src/*`.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Three.js (`@react-three/fiber` + `drei`). Backend is Next.js API routes (Node runtime) on Vercel, with MongoDB and Pusher. Content/data files use embedded JSX, so most `src/app/data/*.js` files are `.js` but contain React.

## Architecture

### The "earnings" gamification system (the spine of the site)

A site-wide play-money economy lives in `src/lib/money-context.js` (`MoneyProvider` / `useMoney`). The whole UI consumes it. Key behaviors:

- **State** = `{ balance, awarded, initBalance }` via `useReducer`, persisted to `localStorage` under versioned keys (`moneyState_v2`, `themeSelection_v2`, `localStarflareClickCount_v2`). **Bumping a key version resets all users.**
- **Awards are deduped by `rewardId`.** `awardOnce(id, kind)` pays out once per id ever (`awarded` maps id → kind). `rewardId` strings must be **globally unique**. The redeem UI is `RewardRedText` (highlighted words) and links; `SkillDisplay` auto-derives its id as `` red:${project}:${fileName.toLowerCase()} ``.
- **Quests**: `quest_totals` in `src/app/data/projects.js` declares how many `redtext` / `project` / `link` rewards exist. These counts are **maintained by hand** (see the comment block tallying each page) — if you add/remove a `RewardRedText`, project, or tracked link, update `quest_totals` or the "all quests complete" gating breaks.
- **Color themes** (coral/green/orange/…) are *purchasable* with balance and are separate from light/dark mode. Selecting one writes `--highlight-color` / `--highlight-light-color` CSS variables on `<html>` at runtime; Tailwind classes like `bg-highlight-color` read those.
- **Lever/slot payouts** use a calibrated mixture distribution in `src/lib/payout.js` (config in `src/lib/payout-default.js`), not flat randoms.

Provider nesting (`src/app/providers.js`): `ThemeProvider` (next-themes, light/dark) → `MoneyProvider` → `SlotJiggleProvider`. Note `app/layout.js` is itself a client component (`"use client"`).

### Starflare global counter (real-time, globally shared)

A single global click counter synced across all visitors:
- **MongoDB is the source of truth**: `stats` collection, doc `{ key: "globalCounter", value: <number> }`.
- `GET /api/counter` reads it; `POST /api/counter/increment` `$inc`s it and fires a **Pusher** event on channel `global-counter` (event `updated`).
- The client (`components/StarflareSection.js`) subscribes to Pusher, **optimistically** bumps the local count on click, and only accepts incoming counts **greater** than the current value (prevents flicker on races). Rate limiting (25 req / 10 s) is **client-side** in this component — there is no server-side limit.

### API routes (`src/app/api/`)

- `chess` and `royale/player` are `force-static` with `revalidate` (cached ~daily, edge-cached a week via `Cache-Control`). On upstream failure Next serves the last good cache. Royale uses the RoyaleAPI proxy and maps clan badge IDs via `royale/_data/clanBadges.json`.
- `spotify/monthly` (`force-dynamic`) refreshes the "Top 5" playlist; guarded by `Authorization: Bearer ${CRON_SECRET}`. Supports `?dry_run=1` to preview without writing. `spotify/login` + `spotify/callback` exist only to mint the long-lived refresh token once.
- **Cron** is configured in `vercel.json` (currently `/api/counter/increment` weekly — keeps Mongo warm). The Spotify monthly schedule is documented in the route's footer comment.

### Content as data

Projects live in `src/app/data/projects.js` (an empty template is at the top of the file), experiences in `experiences.js`. Project pages render dynamically at `app/projects/[slug]/page.js` keyed off the `slug`. Paragraph fields hold JSX with inline `<RewardRedText>` / `<SkillDisplay>` reward hooks, so editing copy = editing these files. `featuredList` controls the home page.

### Icons & SVG

`src/icons/` holds SVG-as-React components. SVGR is wired for **both** Webpack and Turbopack in `next.config.mjs` (`#000`/`#111`/`#fff` → `currentColor`); keep both loaders in sync when changing SVG handling. Skill icons in `src/icons/skills/` are **dynamically imported by exact filename** (`SkillDisplay`), falling back to `BackupNYT.js` if the name doesn't match — so a skill icon filename must match the `fileName` prop exactly (spaces included, e.g. `AWS Glue.js`).

## Environment variables

Several modules **throw at import** if their vars are missing (`lib/mongodb.js`, `lib/pusher-server.js`, `lib/pusher-client.js`). Required: `MONGODB_URI`, `MONGODB_DB`, `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `CLASH_ROYALE_TOKEN` (+ optional `CLASH_ROYALE_TAG`), `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `SPOTIFY_PLAYLIST_ID`, `SPOTIFY_REDIRECT_URI`, `CRON_SECRET`.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Only touch what's necessary. No side effects with new bugs.

## Project Rules

- Before executing anything on non-trivial tasks, ask the user clarification questions. For clear bug reports, just fix them autonomously.
- DON'T add project secrets to the README.md.
- Follow all existing code patterns in the codebase when writing new code.
- ALWAYS inform the user when making changes that were not explicitly requested. If a change is implied or necessary but not directly asked for, call it out before or after making it.
- ALWAYS verify with real logs and real data values before executing anything. Never assume container names, field names, or data formats — check them first.
- NEVER add Co-Authored-By lines or any AI attribution to git commits. All commits should appear as solely authored by the user.
- ALWAYS run `mvn spotless:apply` and `mvn -q compile` on any service after making changes to verify formatting and compilation. Never consider a change complete without passing both.

## Workflow Orchestration

### Plan Mode
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions).
- Write detailed specs upfront to reduce ambiguity.
- If something goes sideways, stop and re-plan immediately.
- Use plan mode for verification steps, not just building.

### Subagent Strategy
- Use subagents liberally to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, throw more compute at it via subagents.
- One task per subagent for focused execution.

### Self-Improvement Loop
- After any correction from the user: update `tasks/lessons.md` with the pattern.
- Write rules that prevent the same mistake from recurring.
- Review lessons at session start for relevant context.

### Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: implement the elegant solution instead.
- Skip this for simple, obvious fixes — don't over-engineer.

### Autonomous Bug Fixing
- When given a bug report: just fix it. Point at logs, errors, and failing tests — then resolve them.
- Zero context switching required from the user.
- Go fix failing CI tests without being told how.

## Task Management

1. **Plan First**: Write a plan to `tasks/todo.md` with checkable items.
2. **Verify Plan**: Check in with the user before starting implementation.
3. **Track Progress**: Mark items complete as you go.
4. **Explain Changes**: High-level summary at each step.
5. **Document Results**: Add a review section to `tasks/todo.md` when done.
6. **Capture Lessons**: Update `tasks/lessons.md` after any corrections.