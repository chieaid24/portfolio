// PROTOTYPE - throwaway. How thin should the Explore CTA's chevron be?
// Switchable via ?weight= on the real home page. `thickness` is the arms'
// vertical edge gap in viewBox units (see src/icons/ArrowDownChevron.js);
// rendered weight at h-3 is thickness / sqrt(2) / 512 * 12 px.

export const WEIGHTS = {
  regular: { name: "Regular (2.8px)", thickness: 167 },
  thin: { name: "Thin (2.3px)", thickness: 140 },
  thinner: { name: "Thinner (2.0px)", thickness: 118 },
};

export const WEIGHT_KEYS = Object.keys(WEIGHTS);
