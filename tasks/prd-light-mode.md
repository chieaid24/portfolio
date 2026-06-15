# PRD: Light Mode

Status: ready-for-agent
Branch: `worktree-light-mode`

## Problem Statement

The portfolio site renders dark-only. There is no way for a visitor who prefers a
light interface to switch. A half-built `DarkModeToggle` component exists but is
wired to nothing, the light CSS was never authored, and every color either lives
in `:root` as a dark value or is hardcoded per component — so the site is
effectively locked to dark. A visitor who finds dark interfaces hard to read, or
who simply wants the choice, has no affordance to change it.

## Solution

Add a true light mode that a visitor can opt into. The default first paint stays
**dark** (preserving the site's identity); light is opt-in and remembered across
visits. Switching themes is treated as a **gamification reward**: the toggle only
unlocks once the visitor has completed every quest in the earnings system,
consistent with the rest of the site's play-money economy. The toggle lives in
the top-right corner of the Themes section inside the wallet panel and spins when
pressed. In light mode the whole site reads as a warm off-white interface,
including a "day sky" reskin of the hero starfield, and the purchasable accent
colors are tuned so they stay legible on the lighter background.

## User Stories

1. As a visitor, I want a light/dark toggle, so that I can read the site in
   whichever appearance I prefer.
2. As a first-time visitor, I want the site to open in dark mode by default, so
   that I see the intended branded experience before I choose otherwise.
3. As a returning visitor, I want my light/dark choice remembered, so that I do
   not have to re-pick it every visit.
4. As a returning light-mode visitor, I want the page to paint light immediately
   on load, so that I never see a dark flash before the theme applies.
5. As a player of the earnings game, I want the theme toggle to unlock only after
   I complete all quests, so that switching themes feels like an earned reward.
6. As a player who has not finished all quests, I want the locked toggle to show a
   dimmed icon and shake when I click it, so that I understand it is not yet
   available and why.
7. As a player who has not finished all quests, I want a hint that the progress
   bars track quest completion, so that I know how to unlock the toggle.
8. As a player who has completed all quests, I want the toggle to become fully
   visible and interactive, so that I can claim and use the reward.
9. As a visitor, I want the unlocked toggle to spin when I press it, so that the
   switch feels responsive and playful.
10. As a visitor, I want to find the toggle in the top-right corner of the Themes
    section of the wallet panel, so that it sits alongside the other
    appearance controls.
11. As a light-mode visitor, I want the page background, text, cards, header, and
    footer to be warm off-white with dark text, so that the whole interface is
    cohesively light.
12. As a light-mode visitor, I want the project, about, and experience reading
    surfaces to be light, so that long-form copy is comfortable to read.
13. As a light-mode visitor, I want the hero starfield to become a warm "day sky"
    with stars that have dark cores and keep their accent-colored halo, so that
    the stars stay visible against the light background.
14. As a light-mode visitor, I want to keep clicking the stars to earn Starflares,
    so that the core interaction still works in light mode.
15. As a light-mode visitor, I want the Spotify, Clash, Chess, slideshow, and
    carousel widgets to adopt light surfaces, so that no panel looks broken or
    stranded as a dark block.
16. As a light-mode visitor, I want the 3D model viewer and its loader to sit on a
    light surface, so that it matches the rest of the page.
17. As a light-mode visitor who has purchased an accent color, I want that accent
    to stay legible as link, border, and highlighted-word text on the warm-white
    background, so that accents do not wash out.
18. As a visitor switching modes, I want a brief, smooth color transition, so that
    the change does not jar.
19. As a dark-mode visitor, I want the dark theme to look exactly as it does today
    after this change ships, so that nothing I already like regresses.
20. As a visitor on either mode, I want the scrollbar and selection colors to suit
    the active theme, so that chrome details stay consistent.
21. As a keyboard or screen-reader user, I want the toggle to expose its state and
    an accessible label, so that I can operate it without sight of the icon.
22. As a visitor who prefers reduced motion, I want the spin and transitions to
    respect that preference, so that motion does not cause discomfort.
23. As the site owner, I want no new quests or reward ids introduced by this work,
    so that the hand-maintained `quest_totals` tallies stay correct.

## Implementation Decisions

**Theme mechanism**
- Adopt `next-themes` as the single source of truth. `ThemeProvider` is configured
  `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`, and keeps the
  default `storageKey` (`"theme"`) — which matches the key the existing toggle
  already used, and does not collide with the money-context storage keys.
- The `<html>` class (`dark` / `light`) is applied by next-themes' blocking inline
  script before first paint, eliminating the dark flash for light-mode visitors.
- Reuse the existing `DarkModeToggle` component as the entry point. Refactor its
  internals from manual `classList` / `localStorage` manipulation to `useTheme()`
  (`resolvedTheme` + `setTheme`). Its quest-gating wrapper is preserved:
  `canToggle = ready && getAllQuestsComplete()`.

**Toggle behavior & placement**
- Mounted absolutely positioned in the top-right corner of the Themes section
  (the bordered box rendered by `ThemeSection`), which becomes the positioning
  context.
- Successful press animates a 360° spin. The locked/denied state keeps the
  existing shake plus dimmed icon and the "progress bars track quests" tooltip.
- No new reward id, `RewardRedText`, tracked project, or link is added — the toggle
  is gated by the *existing* all-quests-complete condition, so `quest_totals`
  is untouched.

**CSS architecture**
- `:root` keeps all current dark values byte-for-byte (zero dark-theme
  regression). Light mode is authored as a single `.light { … }` override block
  that next-themes activates via the `light` class.
- Add a symmetric `@custom-variant light (&:where(.light, .light *))` to mirror the
  existing `dark` custom variant.
- The hardcoded `html { background: #02030a }` becomes `var(--page-bg)`, with
  `:root` keeping `#02030a` and `.light` overriding it.
- Light palette mood is **warm off-white**: page `#faf8f5`, secondary `#f2ede6`,
  card/elevated `#ffffff`, body text `#2b2620`, headings `#1c1813`, with matching
  warmer overrides for `--background-highlight`, `--outline-gray`,
  `--outline-dark-gray`, `--dark-body-text`, `--spotify-background`, scrollbar, and
  selection colors. (Final hexes tuned in-browser.)

**Hardcoded-color sweep**
- Components that currently bake dark colors (`text-white`, `bg-white`, `bg-black`,
  `bg-[#1f1f1f]`, `bg-[#2a2a2a]`, `bg-[#484848]`, `bg-[#5B5B5B]`, white/opacity
  utilities, neutral grays, etc.) are migrated to the theme CSS variables
  (`text-main-text`, `bg-background`, `bg-background-secondary`, `border-outline-*`,
  `text-body-text`, …) so they flip with the mode. `SpotifyEmbed` already accepts a
  `theme` prop (0=dark, 1=light) and is driven from the active mode.

**Starfield day-sky**
- `StarBackground`'s container background and `<color attach="background">` become
  mode-aware: the current near-black in dark, a warm light gradient in light.
- `StarComponent`'s radial-gradient core (currently white) becomes mode-aware so it
  is dark in light mode; the accent-colored halo (driven by `highlightHex`) is
  retained. The Starflare click-to-earn mechanic is unchanged.

**Accent legibility on light**
- Each of the six themes in `RAW_THEME_OPTIONS` gains an `onLightColor` (a deeper
  shade) alongside its existing `color` / `lightColor`.
- Because money-context sets `--highlight-color` / `--highlight-light-color` via an
  inline style on `<html>` (which overrides any `.light` CSS rule), the selection
  between the standard and the deeper `onLightColor` is made inside money-context,
  keyed off the active resolved theme. So in light mode the accent fed to links,
  borders, `bg-highlight-color`, and `RewardRedText` is the legible deeper shade.

## Testing Decisions

A good test here exercises **external, visitor-observable behavior** — what paints
on screen and what the controls do — not internal class names, hook wiring, or
the specific hex constants. No unit test framework is configured in this repo, so
the highest and preferred seam is the **rendered page driven through the Playwright
MCP** against the worktree dev server. The secondary seam is the **CSS-variable
contract**: asserting that toggling the mode swaps the documented variables and the
`html` class.

Modules / behaviors validated through the Playwright (browser) seam:
- Default first load paints dark; no light/dark flash on reload in either mode.
- With quests incomplete, the toggle is dimmed and shakes (no theme change) on
  click; with all quests complete it is interactive and spins on press and the
  page switches to warm-white.
- Light mode renders cohesively across home, about, projects, and experience
  pages, including the day-sky starfield (stars visible, halo intact) and the
  Spotify / Clash / Chess / slideshow / carousel / model-viewer surfaces.
- Accent colors stay legible on light across all six purchasable themes (spot-check
  link/highlight text and swatch borders).
- The browser console is free of errors during the above.
- Dark mode is unchanged versus current `main` (side-by-side screenshot compare).

Prior art: there is no automated suite, but `CLAUDE.md` already prescribes
Playwright-MCP visual validation of UI changes against a per-worktree dev server —
this PRD follows that established practice as its test seam.

## Out of Scope

- System / `prefers-color-scheme` auto-detection (explicitly disabled;
  default-dark + opt-in only).
- Per-mode variants of the *light* tint already used for accent halos beyond the
  added `onLightColor`.
- Adding, removing, or re-tallying quests or rewards.
- Any redesign of the dark theme itself.
- A settings page or any toggle surface outside the Themes section.
- Server-persisted theme preference (remains client-side `localStorage`).
- Email / share / OG-image variants for light mode.

## Further Notes

- The toggle is intentionally low-discoverability (gated reward inside the wallet
  panel) — that is by design, not an oversight.
- Warm-white base vs. the originally cool day-sky idea: the hero gradient is nudged
  warmer so the starfield harmonizes with the warm page rather than clashing.
- Risk is concentrated in the hardcoded-color sweep and the starfield reskin;
  the `.light`-overrides-only approach keeps the dark theme safe by construction.
- Approximate touch surface: ~30 files.
