# PROTOTYPE - hero Explore CTA hover motion

**Question:** should the Explore CTA's arrow bounce on hover, or stay still?

Two variants, switchable on the real home page via `?variant=`:

| Key | Behavior |
| --- | --- |
| `bounce` | arrow drops and floats on a gravity arc while hovered |
| `still` | arrow never moves; only the border/text color and scale respond |

Both run the same production component (`src/components/ExploreCta.js`) with
its `bounce` prop flipped - cursor-follow flash, hover scale, border/text color
transition, smooth scroll to `#experience` with header clearance, and the
`#experience` hash push are identical either way.

The bounce arc hangs at the top, accelerates hard into the fall, then
decelerates back up. The easing pair is Tailwind's `animate-bounce`, measured
off https://tedawf.com/ rather than copied from the docs, then stretched for
more float.

| | tedawf.com | here |
| --- | --- | --- |
| easing (fall / rise) | `cubic-bezier(.8,0,1,1)` / `cubic-bezier(0,0,.2,1)` | same |
| period | 1000ms | 1300ms |
| travel | 25% of icon height | ~28% |
| dwell in top half | 80% | 77% |

Travel is expressed in percentages so it scales with the icon.
`prefers-reduced-motion` gets a static 20% drop instead.

Run: `PORT=<port> npm run dev`, then `/?variant=bounce|still`. Arrow keys or the
floating bottom bar switch. The bar is hidden in production builds.

**Verdict:** _(unfilled - waiting on the pick)_

When decided: hard-code the winner as the `bounce` default in
`src/components/ExploreCta.js`, drop the prop if it's no longer needed, delete
this directory, and drop the prototype imports from `src/app/page.js`.

---

## Settled: icon (2026-08-13)

**B, the bare chevron, won** over C (filled disc, bold arrow knocked out), and
was then shrunk from `h-3.5` to `h-3`. It now lives in `ExploreCta.js`;
`ArrowDownCircleOutline` is deleted. A third candidate (a disc with a thinner
arrow) was cut earlier - same construction as C, near-identical at icon size.
