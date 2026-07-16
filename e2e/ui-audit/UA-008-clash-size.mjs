// UA-008: ClashWidget stats text must be >=11px on mobile (10px today; the
// site floor elsewhere is 12px).
import { withPage, assert, BASE } from "./_harness.mjs";

await withPage(async (page) => {
  await page.goto(BASE + "/about", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const fs = await page.getByText("Career wins", { exact: true }).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  assert(fs >= 11, `clash stats font-size ${fs}px >= 11`);
});
