# PROTOTYPE - hero Explore CTA icon

**Question:** which down-arrow icon should the hero's Explore CTA use?

Three SVGs, switchable on the real home page via `?variant=`:

| Key | Icon | Source file |
| --- | --- | --- |
| A | filled disc, thin arrow knocked out | `down-arrow-circle-svgrepo-com.svg` |
| B | bare chevron, no disc | `down-arrow-svgrepo-com (1).svg` |
| C | filled disc, bold arrow knocked out | `down-arrow-svgrepo-com.svg` |

A and C are the same construction and read almost identically at h-6; the
difference is arrow weight. B is the only structurally different one.

Every variant runs the real button logic - cursor-follow flash, hover scale,
border/text color transition, smooth scroll to `#experience` with header
clearance, and the `#experience` hash push. On hover the arrow drops and bounces
between 2px and 6px until the pointer leaves; `prefers-reduced-motion` gets a
static 3px drop instead.

Run: `PORT=<port> npm run dev`, then `/?variant=A|B|C`. Arrow keys or the
floating bottom bar switch. The bar is hidden in production builds.

**Verdict:** _(unfilled - waiting on the pick)_

When decided: fold the winner's icon into `Hero.js`, delete this directory and
the two losing icons in `src/icons/ArrowDown*.js`, and drop the prototype
imports from `src/app/page.js`.
