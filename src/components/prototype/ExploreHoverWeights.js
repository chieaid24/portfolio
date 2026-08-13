// PROTOTYPE - throwaway. How much should the Explore CTA's label brighten on
// hover? Switchable via ?bold= on the real home page.
//
// Class strings are literal so Tailwind's scanner emits them. Below ~60% the
// mix stops reading brighter than the resting --outline-gray in light theme,
// which is the floor these steps sit above.

export const HOVERS = {
  full: { name: "Full (75%)", cls: "md:hover:text-main-text/75" },
  soft: { name: "Soft (68%)", cls: "md:hover:text-main-text/68" },
  softer: { name: "Softer (62%)", cls: "md:hover:text-main-text/62" },
};

export const HOVER_KEYS = Object.keys(HOVERS);
