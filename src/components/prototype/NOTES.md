# PROTOTYPE - hero Explore CTA

Two open questions, two independent axes, both switchable on the real home page.
Both drive the production component (`src/components/ExploreCta.js`) through its
props - nothing about the button's behavior differs between variants.

Run: `PORT=<port> npm run dev`, then e.g. `/?weight=thin&bold=soft`. The two
floating bars stack bottom-center; the bars are hidden in production builds.

## 1. Chevron weight - `?weight=`, left/right arrow keys

`ArrowDownChevron` is now generated from one number: `thickness`, the vertical
gap between the arms' two 45-degree edges, in viewBox units. Perpendicular
stroke weight is `thickness / sqrt(2)`; the shape stays vertically centered as
it thins, so a lighter chevron sits in the same place instead of drifting up.

| Key | thickness | rendered at `h-3` |
| --- | --- | --- |
| `regular` | 167 | 2.8px - what shipped before |
| `thin` | 140 | 2.3px |
| `thinner` | 118 | 2.0px |

## 2. Hover brightness - `?bold=`, up/down arrow keys

The label doesn't change font weight on hover - it brightens, from
`--outline-gray` toward `--main-text`, which is what reads as "bolder". So the
knob is the hover color's opacity.

| Key | class | |
| --- | --- | --- |
| `full` | `md:hover:text-main-text/75` | what shipped before |
| `soft` | `md:hover:text-main-text/68` | |
| `softer` | `md:hover:text-main-text/62` | |

Floor: below ~60% the mix stops reading brighter than the resting
`--outline-gray` in light theme (it inverts and the hover looks weaker than
rest), so these three steps sit just above that. The border keeps its own
`/75` - only the label's hover changes.

**Verdicts:** _(both unfilled - waiting on the picks)_

When decided: bake the winning `thickness` into `ArrowDownChevron`'s default and
the winning class into `HOVER_TEXT` in `ExploreCta.js`, drop the now-unused
props, delete this directory, and drop the prototype imports from
`src/app/page.js`.

---

## Settled

**Icon (2026-08-13).** B, the bare chevron, won over C (a filled disc with a
bold arrow knocked out), then shrank from `h-3.5` to `h-3`. A third candidate (a
disc with a thinner arrow) was cut earlier - same construction as C, and
near-identical at icon size. `ArrowDownCircleOutline` is deleted.

**Hover bounce (2026-08-13).** Cut. The arrow used to drop and float on a
gravity arc while hovered (Tailwind's `animate-bounce` easing pair measured off
tedawf.com, stretched to a 1.3s period and ~28% travel). Dropped by request
before it was ever compared - the CTA is now motionless apart from its scale and
color transition, and `ExploreCta` no longer pulls in framer-motion.
