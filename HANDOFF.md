# Handoff: dark mode toggle snapping

Status: FIXED on `main` at `a0cd064` (fix: dark mode toggle wiggle and spin
snapping). This doc records the real root causes so nobody re-litigates the
earlier dead ends.

## Symptom

"It rotates and then it snaps a couple pixels, every single time." Two earlier
commits (`a391fcf`, `2eea164`) smoothed the wallet-open animate-in, but the snap
persisted because it never came from the animate-in.

## Ruled out (with evidence)

- Framer stripping `transform` to `none` at animation end: pixel-diffed the
  settled button with `none` vs identity matrix vs `rotate(360deg)` at DPR 1,
  1.25, 1.5, and 2 - zero changed pixels in every combination. Harmless.
- The animate-in itself: frame traces show opacity/scale/rotate converging
  together with a sub-pixel terminal step. It was already clean after `2eea164`.
- Wallet panel `height: auto` end-snap: panel content is top-anchored; a stale
  height target cannot move the toggle row.

## Actual root causes (three, all fixed in `a0cd064`)

1. **Hover wiggle aborted mid-flight.** The inquiry wiggle was a CSS `:hover`
   animation (`dm-inquiry`, up to 30deg). Any interruption - mouse leaving
   mid-wiggle, or click removing the class - cancelled the CSS animation and the
   icon jumped instantly back to 0 (about 5px at the icon corners). Now a framer
   `whileHover` variant on a `motion.span`: interruptions ease back to rest
   (0.15s) from the current angle. CSS keyframes deleted from `globals.css`.
2. **Spin fought the View Transition on the main thread.** The 360 spin started
   before `startViewTransition` captured its snapshot, so the capture stall froze
   the spin at ~2deg and then teleported it ~200deg (framer tweens run on wall
   clock). The VT teardown style recalc at 280ms also landed right before the
   300ms spin ended, guaranteeing a dropped-frame snap at the end of every click.
   Now the spin starts inside `transition.ready` (after capture) and runs 0.25s,
   ending before teardown. Animate-in still uses the unified 0.3s transition
   (the `spin ? ... : ...` transition override keys off spin being nonzero).
3. **VT hover steal replayed the wiggle under a static pointer.** The VT overlay
   takes hover from the whole document: pointerout fires at VT start and
   pointerover at teardown with the pointer never moving. That re-triggered
   `whileHover` right after the spin settled - a fresh "rotates then moves again"
   artifact. Gated by `allowInquiry`: cleared on click, re-armed only by a native
   `pointerleave` on the button whose coordinates are genuinely outside it (and
   not while `data-theme-vt` is set). Two framer traps forced that shape:
   - framer applies `whileHover` prop changes one hover session late, so the
     gate lives in a dynamic variant via `custom`, and `whileHover` stays fixed;
   - framer's `onHoverEnd` skips sessions that began while `whileHover` was
     unset, so re-arming uses a native listener, not framer callbacks.
   The icons also got `pointer-events="none"` so the Sun/Moon swap cannot change
   the hover hit-target mid-gesture.

## How it was verified

Standalone playwright-core runner (MCP browser gets reaped; see memory
`env-background-process-reaper`), dev server on :3002 (user's :3000 had died;
never touch :3000). Per-frame MutationObserver on inline style writes + computed
transform polling + pixel filmstrips via sharp. All scenarios traced clean:

- animate-in: unified convergence, stable tail;
- hover -> full wiggle -> click: monotonic spin, no freeze/teleport, no post-spin
  writes;
- click mid-wiggle: smooth ease-back composed with the spin;
- hover-leave mid-wiggle: 29.8 -> 27.9 -> 21.2 -> 12.3 -> 4.0 -> 0.6 -> 0;
- re-arm matrix: wiggle on hover 29deg / post-click static 0 / first re-entry
  after real exit 29deg.

`npm run lint`: 0 errors (26 pre-existing warnings, none in these files).

Env quirks hit while testing (headless chromium-1217 only, not real browsers):
React's delegated synthetic clicks never fire - drive buttons via
`el[__reactProps$key].onClick()`. Next devtools button also matches
`button[aria-expanded]`; scope selectors to `header`.

## Open items (pre-existing, untouched)

- TEMP quest-gate bypass in `DarkModeToggle.js` (~line 51):
  `const canToggle = ready || allQuestComp;` with a TODO to restore
  `ready && allQuestComp`. Still unlocked unconditionally; owner call.
- `quest_totals` hand-maintained counts (see CLAUDE.md). Unaffected.
