# Hero layout prototype

**Question:** with the title spanning the full column, where does the globe widget go
when it drops below the title -- horizontal, lower, sitting beside the description and
the buttons -- and what happens to the "adjusted local time" readout?

**How to look:** dev server, `/?variant=A` (or B, C, D). Floating bar at the bottom
cycles variants; the left/right arrow keys do the same. `current` is the existing
2-col hero, kept in the cycle for comparison. The bar never renders in a production build.

| key | name | shape |
| --- | --- | --- |
| `current` | Current | title in the left column, globe card on the right |
| `A` | Instrument panel | title full width; one wide bordered console below it: copy + buttons \| globe \| telemetry column (local time, station, coords), split by vertical rules |
| `B` | Bare rail | no card at all: big globe on the left, copy + buttons on the right, clock as a bare mono line under the globe |
| `C` | Telemetry strip | title, copy, buttons read as a normal stack; the globe shrinks into a thin full-width instrument rail pinned to the bottom of the fold, with station / local time / coords / online spread across it |
| `D` | Flat world band | the globe unrolled: a wide equirectangular ASCII map that pans east forever, full width under the title, with copy + buttons beneath it and the clock on the caption line |

Local time shrinks in every variant -- from the stacked "ADJUSTED LOCAL TIME" block to a
small mono readout (a telemetry cell in A and C, a bare line in B and D).

**Verdict:** _(unfilled -- pick a variant, or a mix, then fold it into `src/app/page.js`
and delete `src/components/prototype/`.)_

Shared production edits made for this: `MissionControl.js` now exports `AsciiGlobe`
(with `rows` / `fontPx` props), `useLocalTime`, `LOCATION`, and the land-mask helpers.
Those exports are worth keeping; everything under `prototype/` is throwaway.
