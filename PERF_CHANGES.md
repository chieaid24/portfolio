# Performance Changes

Branch: `perf-optimizations`. The home page ships 876 KB of JavaScript instead of 1771 KB,
and the four project pages are served as static HTML instead of running a server function
per visit. Nothing about the site's behavior changes: every animation, reward, and counter
works as it did.

Measured on the production build (`next build` + `next start`, Next.js 16.2.6, Turbopack) by
summing the `<script>` tags the home page loads eagerly, against `origin/main` built the same
way in the same environment.

| Metric | Before (`origin/main`) | After |
| --- | --- | --- |
| Home eager JS, raw | 1771 KB | 876 KB |
| Home eager JS, gzip | 510 KB | 273 KB |
| three.js in the home critical path | yes | no (832 KB chunk, loaded after paint) |
| Pusher WebSocket | opened on every page load, for every visitor | opened when the wallet is first opened |
| `/projects/[slug]` | dynamic SSR | SSG, served from the CDN |

## What this branch no longer contains

An earlier version of this branch also migrated the root layout to a server component and
moved page metadata to the Metadata API. `main` has since landed that work independently
(`c17110c`, `82e26ce`), along with a native `app/sitemap.js` and `app/robots.js`. This branch
now takes main's version of all of it. The same applies to the responsive UI audit fixes in
`43240a1`: where those touched the same files as the perf work, main's values win.

## 1. The star background loads lazily (`src/app/page.js`)

`StarBackground` is a `next/dynamic` import with `ssr: false`. A CSS-only placeholder paints
the same sky (near-black in dark mode, a day-sky gradient in light) while the canvas chunk
downloads, then the stars fade in on top.

This is where most of the 895 KB comes from: three.js and react-three-fiber leave the critical
path entirely, so a phone parses and hydrates the home page without touching WebGL code. The
end state is identical. On a cold first visit the stars arrive a beat after the page does, and
because the hero already fades in over one second, the star fade rides inside it. Light mode
improves: the placeholder is theme-aware, so light-mode visitors no longer see a dark-sky flash
before the canvas mounts.

## 2. Pusher connects when the wallet opens (`src/lib/pusher-client.js`, `src/components/StarflareSection.js`)

The module-level `new Pusher()` opened a WebSocket at import time on every page. It is now a
lazy singleton, `getPusherClient()`, which dynamically imports pusher-js on first call;
`StarflareSection` awaits it inside its mount effect.

The global counter still shows `---` until fetched, still live-updates, and clicks still
register optimistically. Live updates begin a few hundred milliseconds after the wallet first
opens rather than being pre-warmed. Visitors who never open the wallet now open no WebSocket at
all, which also cuts concurrent-connection load on the Pusher account.

One caveat for whoever reads `lib/pusher-client.js` next: it no longer throws at import when
its environment variables are missing. It throws on the first `getPusherClient()` call instead.

## 3. Project pages are static (`src/app/projects/[slug]/page.js`)

`generateStaticParams` enumerates every non-`github_only` project, so the build prerenders the
four project pages. Unknown slugs and `github_only` slugs still 404. Requests are served from
the Vercel CDN with no serverless cold start.

## 4. Quest totals moved out of the project data (`src/app/data/quest-totals.js`)

`quest_totals` now lives in its own module, which `money-context` imports; `projects.js`
re-exports it so existing imports keep working, and the hand-maintained tally comments moved
with it.

`money-context` wraps every page, so its old import pulled the full JSX content of every
project into every route's bundle. Project copy no longer appears in the about page's chunks.

## 5. The accent state has its own context (`src/lib/money-context.js`, `src/components/StarBackground.js`)

Theme-accent state (`themeId`, `highlightHex`, `highlightLightHex`, `ownedThemes`,
`setThemeById`, `purchaseTheme`) moved into a separate `AccentContext` behind a `useAccent()`
hook. `useMoney()` still returns the merged object, so every existing consumer is untouched.
`StarBackground` reads `useAccent()`.

The WebGL canvas no longer rerenders on every balance change (award, spend, lever pull). Only
accent changes reach it: a theme purchase or switch, or a light/dark flip.

## 6. The star canvas caps dpr at 1.5 (`src/components/StarBackground.js`)

`<Canvas dpr={[1, 2]}>` became `dpr={[1, 1.5]}`. The stars are soft radial-gradient sprites
rather than sharp geometry, so the change is invisible while shading about 44% fewer pixels per
frame on retina and mobile screens, every frame, for a background loop that never stops.

## 7. Smaller fixes

The Spotify iframe moved from `loading="eager"` to `loading="lazy"`, so the 1-2 MB it pulls
inside its frame loads when scrolled near. The existing spinner covers the gap, and on desktop,
where the embed sits in the initial viewport, nothing changes.

`ScrambledText`'s window-level mousemove proximity check is now rAF-coalesced: at most one
`getBoundingClientRect` per frame instead of one per mouse event. Hover decrypt behaves as
before.

## 8. The balance readout no longer jitters (`src/components/RollingText.js`, `src/components/AnimatedBalance.js`)

The header balance visibly shook on every update. A framer spring ends at a rest threshold,
then snaps to its final value and strips the transform, which re-rasterizes the text: a
sub-pixel snap on every landing.

`RollingText` replaces the spring rotator with a CSS odometer. Rows stack inside a 1em clipping
window and the column slides by exact em steps, so the transition lands on an exact multiple and
the transform persists at rest. There is nothing left to settle or re-measure. The easing is a
sampled spring curve (stiffness 300, damping 20) that keeps one visible bounce and the original
550ms window, so the motion reads as it did before. `RotatingNavText` lost its `layout` props
for the same reason: layout corrections fought the parent's width tween.

The odometer's digit column is `aria-hidden`, with an `sr-only` span carrying the current value,
so the accessible name stays `your earnings: 100.00` rather than the repeated digits a screen
reader would otherwise walk.

## Verified

Production build, then headless Chromium against `next start`:

- Bundle: home eager JS 1771 KB raw / 510 KB gzip on `origin/main`, 876 KB / 273 KB here.
  No eager script on the home page contains `WebGLRenderer`.
- Build output marks `/projects/[slug]` as SSG with all four slugs prerendered.
- Home: no Pusher WebSocket in the first 2.5 s; star canvas mounts; no console errors.
- Wallet: the Pusher WebSocket opens on first wallet open. The balance pill renders digits, and
  its accessible name is `your earnings: 100.00`.
- Routes: the four project pages return 200, `canopy` (`github_only`) and an unknown slug
  return 404, `/sitemap.xml` lists 7 URLs including all four project pages, and
  `/projects/ai-sleep-analytics` returns the title `AI SLEEP ANALYTICS` with canonical
  `https://aidanchien.com/projects/ai-sleep-analytics`.
- UI audit probes UA-002, UA-003, UA-004, and UA-007 all pass, which is what confirms main's
  contrast values and touch targets survived the merge into `money-context` and
  `StarflareSection`.
- `npm run lint`: 0 errors, 26 warnings, all pre-existing `react-hooks` warnings that
  `eslint.config.mjs` downgrades on purpose. `npm run build` clean.

## Notes for merge

`AGENTS.md` needs one correction after this merges: `lib/pusher-client.js` no longer throws at
import, and `quest_totals` lives in `src/app/data/quest-totals.js`.

Pre-existing and untouched by this branch: `DarkModeToggle` carries a TEMP override
(`canToggle = ready || allQuestComp`) whose own comment says to restore the quest gate before
merging.
