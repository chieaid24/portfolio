# PROTOTYPE - hero Explore CTA icon

**Question:** which down-arrow icon should the hero's Explore CTA use?

Two SVGs, switchable on the real home page via `?variant=`:

| Key | Icon | Size | Source file |
| --- | --- | --- | --- |
| B | bare chevron, no disc | h-3.5 | `down-arrow-svgrepo-com (1).svg` |
| C | filled disc, bold arrow knocked out | h-5 | `down-arrow-svgrepo-com.svg` |

A third candidate (`down-arrow-circle-svgrepo-com.svg`, a disc with a thinner
arrow) was cut - it was the same construction as C and read almost identically
at icon size.

Every variant runs the real button logic - cursor-follow flash, hover scale,
border/text color transition, smooth scroll to `#experience` with header
clearance, and the `#experience` hash push.

On hover the arrow floats on a gravity arc between 2px and 9px over 1.7s: the
fall accelerates hard into the bottom, the rise decelerates into a hang at the
apex. Measured, ~90% of each cycle is spent in the top half of the travel.
`prefers-reduced-motion` gets a static 3px drop instead.

Run: `PORT=<port> npm run dev`, then `/?variant=B|C`. Arrow keys or the
floating bottom bar switch. The bar is hidden in production builds.

**Verdict:** _(unfilled - waiting on the pick)_

When decided: fold the winner's icon into `Hero.js`, delete this directory and
the losing icon in `src/icons/ArrowDown*.js`, and drop the prototype imports
from `src/app/page.js`.
