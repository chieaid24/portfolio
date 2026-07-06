# Hero rework — worktree notes

Branch: `remove-hero-subtitle`. Throwaway prototype work. Read this before touching
the hero.

## What this worktree contains

Two things, both bundled in `src/app/page.js`:

1. **Subtitle removed (the actual requested change).** The hero used to have an
   `<h2>` subtitle — "Owning real world projects, one galaxy at a time." — plus a
   commented block of alternate taglines. Both are gone. Hero is now just the
   greeting ("Greetings Earthling, I'm Aidan") + the link row.

2. **A hero-layout prototype (exploration, NOT final).** Four structurally
   different hero layouts, switchable at runtime, so a human can pick a look
   (or mix bits). This is throwaway — see "How to finish" below.

## The prototype

Files (all throwaway, delete when done):

- `src/components/prototype/HeroVariants.js` — the 4 variants + shared link
  primitives (`ResumeButton`, `SocialIcons`). Reuses the real
  `RewardLink` / `ScrambledText` / footer icons. `rewardId`s are IDENTICAL to
  the originals (`resume`, `linkedin`, `github`, `email`), so `quest_totals`
  in `src/app/data/projects.js` is unaffected — do not touch it.
- `src/components/prototype/PrototypeSwitcher.js` — floating bottom-center bar,
  hidden in production builds (`NODE_ENV === "production"` guard).
- `src/app/page.js` — wiring: `variant` state seeded from `?variant=` on mount,
  synced back via `history.replaceState`. Renders `<HeroVariant>` in the hero
  slot + the `<PrototypeSwitcher>` at the root.

### How to view the variants

Run the dev server (see gotcha below), then:

- `http://localhost:<port>/?variant=A` — **A — Centered split**: baseline,
  same shape as production but subtitle gone + spacing restored.
- `?variant=B` — **B — Left editorial**: left-aligned, eyebrow + oversized name
  on its own line, inline row of Resume CTA | divider | socials.
- `?variant=C` — **C — Unified pill**: centered; Resume + socials merged into one
  rounded control island.
- `?variant=D` — **D — Name-dominant CTA**: uppercase eyebrow, giant name, wide
  block Resume button, muted social row under it.

Also: the floating bar's arrows (or the `<-` / `->` keyboard keys) cycle
variants and update the URL, so a chosen variant is shareable / reload-stable.

## Status / what's verified

- `npm run lint` — clean.
- `src/app/page.js` JSX is balanced; SSR renders variant A correctly; DOM check
  confirmed the subtitle is gone and Resume/LinkedIn/GitHub/Email links are all
  present.
- Variant switching + the switcher have NOT been visually verified end-to-end
  (see the Playwright caveat). The switching logic is straightforward and
  correct by inspection, but a human should eyeball all four in a real browser.

## Gotchas in this environment (READ before debugging)

1. **HMR is broken here.** The dev server's webpack-hmr WebSocket handshake
   fails (`ERR_INVALID_HTTP_RESPONSE`) in this WSL2 setup, so edits do NOT hot-
   reload. Worse, Turbopack caches compile errors: if you save a
   mid-edit broken file, the server can wedge on a stale parse error (e.g. a
   500 pointing at an old line number) even after you fix the file. To pick up
   changes cleanly:

   ```bash
   pkill -9 -f next
   rm -rf .next
   PORT=3002 nohup npm run dev > dev-server.log 2>&1 &
   ```

   (Never use port 3000 — reserved for the user's own server.)

2. **Playwright (headless chrome-for-testing) does NOT hydrate this app.** The
   client bundle (framer-motion, @react-three/fiber, and therefore our
   `useEffect`/`onClick`) does not execute in the headless browser here. Symptoms:
   the hero renders BLANK (framer-motion stays at its SSR `initial` opacity 0),
   `?variant=` seeding doesn't apply, and switcher clicks do nothing —
   `reactHydrated` probes as false. This is an environment limitation, NOT a bug
   in the prototype. Validate in a real browser, not via the Playwright MCP.
   (See the user's memory note "Playwright MCP env fix" for the broader issue.)

## How to finish (fold in the winner, then delete the scaffolding)

1. Pick a variant (or a Frankenstein — e.g. "header from B, links from C").
2. In `src/app/page.js`, replace `<HeroVariant .../>` with the plain chosen hero
   JSX (a single hero block: greeting + Resume button + social icons). Keep the
   subtitle deleted. Keep the flash handlers (`handleFlashEnter/Move/Leave`) on
   the Resume button.
3. Delete: `src/components/prototype/` (both files), the `PrototypeSwitcher`
   render + its import, the `variant`/`changeVariant`/`VARIANT_*` state and
   `?variant=` `useEffect`, and the `HERO_VARIANTS`/`HeroVariant` imports. Drop
   `useState`/`useEffect` from the React import if no longer used.
4. Delete this file.
5. `npm run lint`, restart the dev server, eyeball the hero, commit.

Do NOT ship the prototype to production as-is (throwaway constraints: no tests,
minimal error handling). Rewrite the winner cleanly when folding it in.
