# Light Mode Implementation

Spec: `tasks/prd-light-mode.md` (ready-for-agent). Dev server: http://localhost:3001

## Foundation
- [ ] providers.js — `defaultTheme="dark"`, `enableSystem={false}`, attribute class, default storageKey
- [ ] globals.css — add `@custom-variant light`, `.light {}` override block, `html` bg → `var(--page-bg)`, scrollbar/selection per-mode
- [ ] DarkModeToggle.js — refactor manual classList/localStorage → `useTheme()` (resolvedTheme/setTheme); keep quest gating, add spin on success
- [ ] ThemeSection.js — mount toggle absolutely top-right of the themes box (positioning context)
- [ ] money-context.js — add `onLightColor` per theme; pick deeper shade in light mode via resolvedTheme for `--highlight-color`/`--highlight-light-color`

## Hardcoded-color sweep (migrate to theme vars)
- [ ] page.js (home) / about / projects / project[slug] / not-found
- [ ] Header / ExpandedHeader / Footer
- [ ] ProjectCard / SkillDisplay / Experience
- [ ] SpotifyEmbed (drive theme prop from mode) / ChessWidget / ClashWidget / WidgetCarousel / HorizontalSlideshow / YoutubePlayer
- [ ] BountyInfo / StarflareInfo / StarflareSection / ToolTip / DevBalanceInput
- [ ] 3D model viewer + loader surface

## Starfield day-sky
- [ ] StarBackground — container bg + `<color attach="background">` mode-aware
- [ ] StarComponent — star core mode-aware (dark core in light), keep accent halo

## Verify (Playwright MCP against :3001)
- [ ] Default dark first paint, no flash either mode
- [ ] Locked toggle dims+shakes; unlocked spins + switches to warm-white
- [ ] Light renders cohesively across home/about/projects/experience + day-sky + widgets
- [ ] Accents legible across all 6 themes; console clean
- [ ] Dark unchanged vs main

## Review

**Foundation** — done & verified:
- providers: `defaultTheme="dark"`, `enableSystem={false}`.
- globals.css: `@custom-variant light`, `.light{}` warm-white palette, `html` bg→`var(--page-bg)`,
  new vars `--page-bg`, `--widget-surface`, `--widget-surface-2`, `--color-main-text`,
  per-mode `::selection` + scrollbar hover.
- DarkModeToggle: refactored to `useTheme()`; quest gating preserved; spin-on-success (reduced-motion aware).
- ThemeSection: toggle mounted absolute top-right.
- money-context: `onLightColor` deeper accent per theme; swapped in via `resolvedTheme` (mounted-safe).

**Sweep** — migrated to theme vars (dark byte-identical):
home, about, projects, project[slug] (+inverted GitHub button), Header, Footer, ProjectCard,
Experience (active-tab text stays white on accent), SkillDisplay (claimed vs accent states),
SpotifyEmbed (theme follows mode; mounted-gated), ClashWidget, HorizontalSlideshow,
StarflareSection, BountyInfo, StarflareInfo. not-found / YoutubePlayer / ModelViewer already mode-safe.

**Starfield**: StarBackground day-sky gradient + transparent scene in light; StarComponent two-tone
sprite (dark core + accent halo) in light, mounted-gated to avoid hydration mismatch.

**Verified (Playwright/eval against :3001):**
- Default first paint = dark; no hydration errors after mounted-gates (console clean).
- Dark-mode CSS vars byte-identical to original `:root` (no regression).
- Light `/about` renders cohesive warm-white; red-words legible deeper blue (#1b86c0).
- Day-sky gradient applies in light; scene transparent.
- Toggle: complete quests → interactive, flips theme (dark↔light), spins; incomplete → dimmed
  (opacity .5), cursor default, hint title, no theme change.

**Not done (flagged):**
- ChessWidget, ExpandedHeader, DevBalanceInput, WidgetCarousel, ToolTip = dead/commented code,
  not mounted anywhere — skipped per minimal-impact (ChessWidget is PRD-listed but commented out).
- Hero starfield stars need a human eyeball: the animating WebGL canvas can't be screenshotted by
  the preview tool (it never idles). Logic verified, visuals not.
