# Handoff: light/dark toggle "circle reveal" animation

Branch: `theme-toggle-anim` (worktree). Dev server used during development: `http://localhost:3001`.

## Goal

Replace the old, laggy View-Transitions theme toggle with a lightweight "circle
reveal": clicking the light/dark toggle grows a solid circle from the toggle
button to cover the screen, swaps the theme, then fades the circle out. Two hard
requirements from the owner:

1. All component colors must appear to change at the SAME time (the site's
   components each animate their own colors at different durations, which looked
   staggered).
2. Must run smoothly on slow computers.
3. The circle must be crisp (not pixelated) and centered on the toggle button.

Requirements 1 and 2 and crispness are DONE and verified. Requirement 3
(centered on the toggle) is the OPEN BUG below.

## Where the code lives

- `src/components/DarkModeToggle.js` - the whole animation. Module-level
  `revealTheme(next, setTheme, originEl, shouldReduceMotion)` runs it;
  `snapTheme()` does the instant color swap. Tunables at top:
  `REVEAL_GROW_MS`, `REVEAL_FADE_MS`, `REVEAL_BG` (approx destination bg colors).
- The toggle button ONLY renders when the wallet/earnings panel is open
  (`src/components/Header.js:159` gates it, rendered at `Header.js:197`). To test
  you must open the wallet first (click the "your earnings" trigger).
- `src/app/globals.css:437` `html.no-transition * { transition: none !important }`
  is load-bearing: the reveal adds `no-transition` while covered so every
  component's color snaps together (satisfies requirement 1).

## How it works now

1. On click, compute the toggle button center in viewport coords from
   `event.currentTarget.getBoundingClientRect()`.
2. Create a `position: fixed; inset: 0` disc, append to `document.body`.
3. Grow `clip-path: circle(0 -> maxRadius at cx cy)` over `REVEAL_GROW_MS`
   (crisp vector, no bitmap scaling).
4. On grow finish (fully covered): add `no-transition`, `setTheme(next)` (all
   colors snap at once), wait 2 rAF for the theme class + `--highlight-*` vars to
   paint.
5. Fade the disc out via opacity (compositor), then remove it and drop
   `no-transition`. Promise chain has cleanup on interruption (rapid re-toggle).

Reduced-motion: instant swap, no disc.

## THE OPEN BUG: circle is off-center in the owner's browser

Symptom (owner, real Chrome, ~1920px wide, populated bookmarks/extensions): the
reveal circle consistently starts roughly 195px UP and LEFT of the toggle
button - "close, but not on the toggle." Owner-provided screenshot showed the
circle centered near (800, 270) screen coords while the toggle sits near
(995, ~120) viewport coords.

Crucial: in a clean headless Chromium (Playwright MCP) the circle is PERFECTLY
centered at every width tested - 1280, 1920, 390 (mobile), and scrolled - the
rendered circle center matches the button center with delta (0, 0). So the bug
only manifests in the owner's real browser environment, not in headless.

195 is suspiciously close to `995 * (1 - 1/1.25)` = 199, i.e. a 1.25x factor,
which points at Windows 125% display scaling / `devicePixelRatio = 1.25`, a CSS
`zoom`, or a visual-viewport scale - some factor that makes the clip-path
coordinate space and `getBoundingClientRect` disagree. NOT confirmed yet.

## What has been tried (commit by commit)

- `022a96d` Folded the circle reveal into DarkModeToggle; first used
  `transform: scale()` on a small pre-rastered disc (compositor-only). ->
  Owner reported the edge looked PIXELATED (small bitmap magnified ~8x).
- `0042d89` Switched grow to `clip-path: circle()` (vector, crisp). Fixed the
  pixelation. Centering still measured perfect in headless.
- `2bb200f` Owner then reported off-center. First fix attempt: source the origin
  from `event.currentTarget` instead of the stored `buttonRef` (kills a possible
  null/stale-ref fallback to screen center). Headless still centered. Did NOT
  fix the owner's issue.
- `97b09a0` Second fix attempt: measure the disc's own
  `getBoundingClientRect()` and compute the clip origin relative to it
  (`cx = btnX - box.left`), so a transformed/offset ancestor (e.g. an extension
  wrapper) can't drift the circle. PROVEN in headless: with a simulated
  `<html>` translate, the circle stays on the button (delta 0). BUT the owner
  reported NO CHANGE - "still off, same place." That implies the disc box IS at
  (0,0) in their browser (correction is a no-op), so the root cause is NOT an
  ancestor transform.

## Current best hypothesis

Since the ancestor-offset fix changed nothing for the owner, the coordinate
mismatch is likely from `devicePixelRatio` (OS display scaling ~125%), a CSS
`zoom` on html/body, or `visualViewport` scale/offset - things that make
`clip-path` px and `getBoundingClientRect` px diverge, and which a clean
headless browser does not have. Stale cached JS (owner not hard-refreshing) is
also not fully ruled out.

## Next step: get real numbers from the owner's browser

A diagnostic snippet was sent to the owner (output still pending). Have them run
it in DevTools Console (with the wallet open) and paste the `TOGGLE_DIAG` output:

```js
(() => {
  const t = document.querySelector('button[aria-expanded]');
  if (t && t.getAttribute('aria-expanded') === 'false') t.click();
  setTimeout(() => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => /Switch to (light|dark) mode/i.test(b.getAttribute('aria-label') || ''));
    const p = document.createElement('div');
    Object.assign(p.style, { position: 'fixed', inset: '0', pointerEvents: 'none' });
    document.body.appendChild(p);
    const pr = p.getBoundingClientRect(); p.remove();
    const cs = getComputedStyle;
    console.log('TOGGLE_DIAG', JSON.stringify({
      dpr: devicePixelRatio,
      inner: [innerWidth, innerHeight],
      vv: visualViewport ? { w: visualViewport.width, h: visualViewport.height, ox: visualViewport.offsetLeft, oy: visualViewport.offsetTop, scale: visualViewport.scale } : null,
      scroll: [scrollX, scrollY],
      htmlTransform: cs(document.documentElement).transform,
      htmlZoom: cs(document.documentElement).zoom,
      bodyTransform: cs(document.body).transform,
      bodyZoom: cs(document.body).zoom,
      fixedProbeOrigin: { left: pr.left, top: pr.top, w: pr.width, h: pr.height },
      toggleRect: btn ? (r => ({ left: r.left, top: r.top, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }))(btn.getBoundingClientRect()) : 'NOT FOUND',
    }, null, 2));
  }, 700);
})();
```

Interpretation guide:
- `dpr` != 1 with a `zoom` present on html/body -> the mismatch is `zoom`-based;
  fix by computing the origin in the same units clip-path uses (avoid mixing
  `getBoundingClientRect` CSS px with a zoomed coordinate space).
- `vv.scale` != 1 or `vv.ox/oy` != 0 -> visual-viewport (pinch) offset; account
  for `visualViewport.offsetLeft/Top` and `scale`.
- `fixedProbeOrigin` left/top != 0 -> a fixed element does NOT start at (0,0)
  in their browser; the `97b09a0` correction should already handle that, so if
  it's non-zero yet still broken, the correction may need to also divide by a
  scale factor.
- If all look normal (dpr 1, no zoom, probe at 0,0, toggleRect matches the
  visible toggle) -> suspect stale JS; confirm a cache-disabled hard refresh.

## Possible robust fixes to consider

- Derive the origin from the click event's `clientX/clientY` AND normalize by
  `visualViewport` (offset + scale) so the origin is expressed in the same space
  the fixed disc / clip-path use.
- Or abandon absolute-coordinate clip-path: mount the growing circle as an
  element positioned at the button via the button's offset within a known
  container, so no viewport-coordinate translation is needed.
- Whatever the fix, RE-VERIFY it still passes the headless centered checks
  (delta 0 at 1280/1920/390/scrolled) so it does not regress the clean case.

## Other verified-good behavior (do not regress)

- Crisp vector edge (clip-path circle).
- All colors change together: while covered, `no-transition` is on and a real
  component (header nav link) reads `transition-duration: 0s` (measured).
- Reduced-motion -> instant swap.
- Rapid double-toggle / interruption -> cleans up, no leftover discs, no
  unhandled promise rejections.
- Lint: 0 errors. Console: 0 errors across all tested flows.

## Merge blocker (pre-existing, not part of this work)

`src/components/DarkModeToggle.js` has a TEMP override:
`const canToggle = ready || allQuestComp;` (around line 47) that unlocks the
toggle unconditionally for testing. The in-code comment says restore
`const canToggle = ready && allQuestComp;` before merging. Left as-is so the
owner can keep testing. MUST be restored before this branch merges.

## Prototype history (already cleaned up)

This started as a multi-variant prototype (a floating switcher + 5 animation
variants: dip / circle / wipe / sync / vt) so the owner could pick live. Owner
chose the circle reveal. The switcher and variants module were deleted; only the
chosen animation remains folded into DarkModeToggle. Earlier commits
`2212963` and `de30ce0` contain that prototype scaffolding if you need to
reference the other variants.
