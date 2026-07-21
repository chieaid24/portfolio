# Handoff: dark mode toggle animate-in snap

Status: DONE and pushed to `main`. This doc exists so a fresh agent can verify or
continue if the user reports the snap again.

## Task

User reported: when the expanded wallet opens, the dark mode toggle icon "snaps to
place at the end" of its animate-in. Fix on `main` directly (no worktree).

## What was wrong and what shipped

The toggle is `src/components/DarkModeToggle.js` (a `motion.button`). It only mounts
inside the open wallet panel (`src/components/Header.js`, the expanded
`AnimatePresence` panel), so opening the wallet plays its `initial -> animate`.

Two commits on `main`:

- `a391fcf` fix: smooth dark mode toggle animate-in
  - First hypothesis: underdamped rotate spring (`stiffness 180, damping 18`)
    overshot ~5 deg then corrected back. Replaced with a no-bounce spring.
  - This removed the overshoot but the user still saw a snap. Insufficient.
- `2eea164` fix: unify toggle animate-in timing to kill trailing rotate
  - Real root cause: split timing. opacity + scale finished at ~250ms while rotate
    kept going to ~520ms, so the icon sat fully visible and full-size, still
    rotating, then settled last. That trailing rotate read as "snap into place."
  - Final change: collapse the whole animate-in onto one transition:
    `transition={{ duration: 0.3, ease: "easeOut" }}` (was a per-property mix of
    spring rotate + 0.25s tween). All three properties (opacity, scale, rotate) now
    start and finish together.

See the diffs: `git show a391fcf 2eea164`.

## How it was verified (Playwright, live dev server)

Verified against the user's own dev server at `http://localhost:3000` (their process,
PID was 72730). Do NOT kill or restart port 3000 (CLAUDE.md rule). A parallel dev
server cannot run in this same dir while theirs is up (`.next`/Turbopack conflict) so
an attempt on 3002 died; observing 3000 read-only + HMR from edits is the workflow.

Method: `mcp__playwright__browser_evaluate` sampling the toggle's computed transform
(decode scale via `hypot(a,b)`, rotate via `atan2(b,a)`), opacity, and
`getBoundingClientRect` frame-by-frame across a close-then-open of the wallet.

Post-fix trace confirmed:
- opacity/scale/rotate converge together (~341-394ms), zero overshoot.
- transform strips to `none` exactly at identity; tail dead-flat `(1,1,0)`.
- Click flow: theme flips both ways, label updates, 360 spin settles flat at 0, no
  snap; View Transition circular wipe intact.
- 0 console errors throughout; `npm run lint` = 0 errors (26 pre-existing warnings,
  none in this file).

Playwright note: the MCP tools use `target` (not `ref`) for element refs. See memory
`playwright-mcp-env-fix`.

## Open items / watch-outs (pre-existing, NOT introduced here)

- TEMP quest-gate bypass in `DarkModeToggle.js` (~line 46): 
  `const canToggle = ready || allQuestComp;` with a TODO to restore
  `ready && allQuestComp` before merge. The toggle is currently unlocked
  unconditionally. Untouched by this work; flag to the owner.
- `quest_totals` counts are hand-maintained (see CLAUDE.md). Not affected here.

## If the user says it STILL snaps

Working tree is clean and `HEAD == origin/main` at `2eea164`. Confirm the server on
3000 actually hot-reloaded the file (re-run the frame sampler above; a clean run
shows opacity/scale/rotate finishing within one ~50ms window). If numeric trace is
clean but they still perceive a snap, widen the audit to: the wallet panel
height `0 -> auto` collapse (`Header.js`), the `animate-fade-in-7` inner CSS fade,
and the reduced-motion fallback path in `DarkModeToggle.js` (`handleClick` else
branch). Consider capturing a slowed filmstrip rather than trusting rAF sampling,
which ran coarse (~30-100ms/frame) on this machine.

## Suggested skills

- `impeccable:impeccable` -- if the animate-in needs further motion polish or a
  broader UI pass on the wallet.
- `ui-audit` -- to screenshot the wallet/header flows and check for other drift.
- `review` -- to review the two commits against repo standards before any follow-up.
