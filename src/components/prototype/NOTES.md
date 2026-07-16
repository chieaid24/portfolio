# Hero shaping prototype

**Question:** today the copy sits hard-left and the globe hard-right, with ~130px of
dead space between them. What if copy + links + globe read as *one centered block*,
with the copy right-aligned along the globe's arc instead of along a straight edge?

**How to look:** dev server, `/?variant=shaped`. The bar at the bottom (or the ←/→
keys) flips between it and `current`, which is today's hero, untouched, for A/B. The
bar never renders in a production build.

| key | name | shape |
| --- | --- | --- |
| `current` | Current | title flush left + full width; copy/links left, globe pushed right by `justify-between` |
| `shaped` | Shaped | title centered; copy + links + globe centered as one block; each copy line right-aligned to the globe's left arc |

## What `shaped` does

- **Line breaks are frozen**, not reflowed. The two copy lines are literals in
  `COPY_LINES`, matching exactly where the live `<p>` breaks at md+ today. Each line is
  laid out flush-right against one column edge, then moved by `transform` only — so
  nothing the arc does can re-break a line. **Editing the copy means re-checking those
  breaks by hand.**
- **The arc is read off the pixels, not off `sqrt(R² - y²)`.** The globe is made of
  characters, so its disc is a staircase — at 15 rows the left edge is *dead flat* for
  the five rows around the waist, which is exactly where the copy sits. Aligning to the
  ideal circle left visibly uneven clearance (3px at one line, 12px at the next), so
  `readGlobeEdge()` scans the rendered `<pre>` grids for each row's first painted column
  and lines hug *that*. The ocean glyphs fill the whole disc, so the outline is static;
  rotation only changes what's inside it.
- **The globe is fixed** at 15 rows @ 9.5px — a 133px disc. That matches the left
  column's measured 132px and is a step up from the old 108px disc, while keeping the
  character texture. Nothing measures the copy and resizes the globe, so there is no
  reflow loop.
- **md- is untouched**: the globe is hidden below md, so there is no arc to align to;
  that breakpoint keeps today's plain left-aligned stack with a normally-flowing `<p>`.

## Tunables (top of `HeroVariants.js`)

| name | default | effect |
| --- | --- | --- |
| `GLOBE_ROWS` / `GLOBE_FONT_PX` | `15` / `9.5` | disc size = `(ROWS-1) * FONT_PX` |
| `GAP` | `16` | clearance between a line's right edge and the globe's edge |
| `BAND_RULE` | `true` | `true` = judge a line by its closest approach anywhere in its ink band (uniform clearance, nothing can touch the disc); `false` = sample the edge at the line's center row only |
| `INK_INSET` | `[4, 4, 0]` | per-line trim of the line box down to glyph ink |
| `OPTICAL_CENTER` | `true` | center on painted ink, not the layout box |
| `CENTER_TITLE` | `true` | title centered over the block vs. flush left |

**Verdict:** _(unfilled — settle the tunables, then fold `ShapedHero` into
`src/app/page.js` and delete `src/components/prototype/`.)_
