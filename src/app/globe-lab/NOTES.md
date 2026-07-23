# globe-lab — light-mode ASCII globe prototype

Throwaway. Route: `/globe-lab?variant=A..D&mode=light|dark&accent=#hex`
(arrow keys cycle variants; bottom bar toggles mode + accent).

## Question

The hero ASCII globe looks bad in light mode: the ASCII reads faint, and the
`bg-black/25 backdrop-blur-[3px]` disc behind it (added to lift the globe off the
dark starfield) becomes a muddy grey smudge on the day-sky gradient. What should
the light-mode globe look like instead?

Constraint from the ask: keep the hero layout frozen; only change how the globe
is drawn. So every variant reuses the real Hero layout (HeroLab.js) and swaps
just the disc/backdrop + layer colors (GlobeTreatment.js). Dark mode always
renders the untouched production treatment, so the mode toggle proves dark is
unchanged.

Supporting change: `AsciiGlobe` gained optional `landColor` / `oceanColor` /
`oceanOpacity` props (backward compatible; defaults reproduce today's look) so a
treatment can color ocean and land independently.

## Variants

- **A — Ink globe, no disc.** Drop the disc entirely. Land = deepened accent,
  ocean = slate dots. Crisp, editorial. Reads directly on the sky.
- **B — Frosted day porthole.** A soft white frosted lens with a thin ring.
  Neutral backdrop guarantees contrast for any accent.
- **C — Deep-space porthole.** A dark navy disc with a crisp rim: a window into
  space in the middle of the day. Bright accent + gold pin pop hardest here;
  matches the site's space/telemetry theme.
- **D — Accent halo.** No hard edge; a soft accent glow behind a monochrome orb.
  Softest, but muddiest and most accent-dependent.

## Findings (screens captured at 1280 wide, coral + green accents)

- The "before" grey blurred disc is the clear offender: murky and low-contrast.
- **A and D depend on a dark-enough accent.** With the light green theme the
  globe washes out on the bare sky.
- **B and C put a neutral backdrop behind the globe, so the accent pops no
  matter the hue** — the robust choices across all purchasable themes.
- **C reads the best and is the most on-brand** (space viewport); **B is the
  safe, quiet pick.** A is clean but its right limb goes ragged with no disc to
  contain the ocean dots. D is the weakest.

## Verdict

RECOMMEND **C (deep-space porthole)**, with **B (frosted)** as the quieter
alternative. AWAITING owner pick before folding the winner into
`components/Hero.js` (scoped to `.light`) and deleting this folder.
