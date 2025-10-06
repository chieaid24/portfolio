import { createPayoutGenerator } from "./payout.js";

export const defaultMixtureConfig = {
  cost: 5,
  targetEV: 5.40,     
  min: 0.30,
  cap: 100,

  baseMode: 4.5,
  baseMax: 9,

  tailStart: 10,      // define what counts as “jackpot”
  tailK: 0.6,         // fatter tail

  tailWeight: 0.10,   // 10% of draws come from tail

  roundToCents: true,
};

export const defaultGenerator = createPayoutGenerator(defaultMixtureConfig);
