// UA-006: starflare caption must be >=11px on mobile (site floor 12px, 11px
// allowed in this space-constrained column).
import { withPage, assert, BASE } from "./_harness.mjs";

await withPage(async (page) => {
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.getByRole("button", { name: /your earnings/i }).click();
  await page.waitForTimeout(900);
  const fs = await page.getByText(/You've sent \d+ flare/).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  assert(fs >= 11, `starflare caption font-size ${fs}px >= 11`);
});
