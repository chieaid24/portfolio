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

On hover the arrow floats on a gravity arc: it hangs at the top, accelerates
hard into the fall, then decelerates back up. The easing pair is Tailwind's
`animate-bounce`, measured off https://tedawf.com/ rather than copied from the
docs, then stretched for more float.

| | tedawf.com | here |
| --- | --- | --- |
| easing (fall / rise) | `cubic-bezier(.8,0,1,1)` / `cubic-bezier(0,0,.2,1)` | same |
| period | 1000ms | 1300ms |
| travel | 25% of icon height | ~28% |
| dwell in top half | 80% | 77% (B) / 79% (C) |

Travel is expressed in percentages so both icon sizes float by the same
proportion. `prefers-reduced-motion` gets a static 20% drop instead.

Run: `PORT=<port> npm run dev`, then `/?variant=B|C`. Arrow keys or the
floating bottom bar switch. The bar is hidden in production builds.

**Verdict:** _(unfilled - waiting on the pick)_

When decided: fold the winner's icon into `Hero.js`, delete this directory and
the losing icon in `src/icons/ArrowDown*.js`, and drop the prototype imports
from `src/app/page.js`.
