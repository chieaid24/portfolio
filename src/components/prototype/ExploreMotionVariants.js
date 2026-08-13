// PROTOTYPE - throwaway. Does the hero's Explore CTA arrow bounce on hover, or
// stay still? Switchable via ?variant= on the real home page. Once one wins,
// hard-code the winner's `bounce` in Hero.js and delete this directory.

export const VARIANTS = {
  bounce: { name: "Arrow bounces", bounce: true },
  still: { name: "No bounce", bounce: false },
};

export const VARIANT_KEYS = Object.keys(VARIANTS);
