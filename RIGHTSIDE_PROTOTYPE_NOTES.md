# Right-side hero prototype — worktree notes

Branch: `remove-hero-subtitle`. Throwaway. Fills the blank right half of the hero
with one of four switchable widgets so a human can pick a look.

## Files (all throwaway — delete when a winner is chosen)

- `src/components/prototype/RightSideVariants.js` — the 4 widgets + registry.
- `src/components/prototype/RightSideSwitcher.js` — floating switcher (bottom
  center), hidden in production (`NODE_ENV === "production"`).
- `src/app/page.js` — wiring: hero is now a 2-col flex row (text left, widget
  right, `hidden md:block`), `rside` state seeded from `?rside=`, switcher at root.

## The four variants (`?rside=`)

- `?rside=1` — **Mission control**: live status card. Pulsing "SYSTEMS NOMINAL",
  the real global Starflare count (GET `/api/counter`), a ticking uptime, region,
  deploy, and a "Ground station" **ASCII globe** — real coastlines orthographically
  projected onto a text grid (`AsciiGlobe`), theme-tinted, auto-rotating, drag to
  spin (pointer drag = yaw/pitch, pitch clamped), with a pulsing gold pin at
  `LOCATION`. Land tests use a raster mask (`getLandMask`): `LAND_GEO` painted once
  to an offscreen canvas via `d3-geo` equirectangular, read back as a bitmask.
  Plays the backend/infra identity.
- `?rside=2` — **Low-poly planet**: compact pill CTA — a tiny spinning r3f
  ringed planet (theme-tinted) inline with "Click to explore" + chevron, with a
  pulsing accent glow. Clicking smooth-scrolls to `#experience` (id + `scroll-mt-28`
  added in `page.js`). For this variant the right column is `md:w-auto` so the
  hero text expands; other variants keep the fixed `19/21rem` column.
- `?rside=3` — **Begin mission**: onboarding card for the earnings game
  (bounty checklist + balance + "Start mission"). Funnels visitors into the gimmick.
- `?rside=4` — **Dotted globe**: r3f **dotted land globe** (real continents)
  with a pin at my location — globe only, no text. Continents come from real coastlines:
  `world-atlas` `land-110m` decoded with `topojson-client`, then a Fibonacci sphere is
  filtered to land points via `d3-geo` `geoContains` (see `buildLandDots`) and drawn as
  an instanced low-poly dot cloud. Location/timezone is the `LOCATION` const at the top
  of `RightSideVariants.js` (currently Waterloo, ON / America/Toronto).
- `?rside=5` — **Now · low-poly earth**: same real coastlines, but a solid faceted
  icosphere flat-shaded like the planet instead of dots. `buildEarthGeometry` builds
  an **adaptively subdivided** icosphere: triangles straddling a coastline refine to
  `EARTH_DETAIL_MAX`, uniform regions (open ocean, continent interiors) stop at
  `EARTH_DETAIL_MIN` — fine detailed coasts, big blocky facets elsewhere. A 2:1
  balance pass + bisection closure keep the variable-size mesh watertight. Every
  vertex is displaced by terrain height (land hills / ocean swells via noise), with
  relief scaled by local facet size so coasts hug sea level while interiors rise.
  Land/ocean per vertex via `geoContains`; facet color = vertex majority, shaded by
  elevation (peaks lighter, shallows lighter, deep water darker). Tune `LAND_BASE`/
  `LAND_RELIEF`/`OCEAN_BASE`/`OCEAN_RELIEF` for terrain, `EARTH_DETAIL_MIN`/`_MAX`
  for facet sizes, `FEATURE_DEPTH` for island-detection sampling. Shares the
  `NowFooter` with #4.

Arrows on the switcher (or `<-` / `->` keys) cycle variants and update the URL.

## Dependencies added for #4

`world-atlas` (coastline data), `topojson-client` (decode), `d3-geo` (`geoContains`).
`land-110m.json` (~100KB) is imported into the client bundle — if the globe wins,
consider lazy-loading it or precomputing the dot positions to a small static array.

## Known gaps / decisions to make

- **The title now wraps to 3 lines.** Adding a right column narrows the left one
  (both live inside `MaxWidthWrapper` = `max-w-3xl`), so "Greetings Earthling, I'm
  Aidan" reflows to 3 lines. To keep it 1-2 lines, the hero needs a wider container
  than the rest of the page (break out of `max-w-3xl`) or a narrower right widget.
- Mobile: right widget is `hidden md:block` (desktop only) — mobile is unchanged.

## Screenshotting in this headless env (WebGL is finicky)

Plain `--headless=new` here FAILS to create WebGL contexts ("BindToCurrentSequence
failed") — recent Chrome disabled software-WebGL fallback, and the default active-
context cap is too low for two canvases (StarBackground + a 3D widget). A blank/crashed
hero in a screenshot is almost always this, NOT a component bug. Flags that work:

```
--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader \
--ignore-gpu-blocklist --max-active-webgl-contexts=32
```

Best real validation is the Playwright MCP (proper emulation) once it's reconnected.

## How to finish (fold the winner in, delete scaffolding)

1. Pick a variant. Rebuild it cleanly inline in `page.js` (drop the throwaway
   Canvas/fetch shortcuts as needed; for #1 wire the real Pusher live counter).
2. Decide the hero width question above (keep title 1-line vs let it wrap).
3. Delete `src/components/prototype/` (both files), the `RightSideSwitcher` render +
   import, `rside`/`changeRside`/`RSIDE_*`, the `?rside=` `useEffect`, and the
   `RightSideVariant` import. Restore the hero to a single column if the winner is
   text-only, or keep the 2-col wrapper.
4. Delete this file. `npm run lint`, restart dev, eyeball, commit.
