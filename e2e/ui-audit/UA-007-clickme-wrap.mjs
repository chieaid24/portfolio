// UA-007: the starflare CLICK ME button label must stay on a single line at
// mobile width (wraps to two lines today).
import { withPage, assert, BASE } from "./_harness.mjs";

await withPage(async (page) => {
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.getByRole("button", { name: /your earnings/i }).click();
  await page.waitForTimeout(900);
  const btn = page.getByRole("button", { name: "CLICK ME" });
  const box = await btn.boundingBox();
  assert(box && box.height <= 42, `CLICK ME height ${box ? box.height.toFixed(1) : "?"}px <= 42 (single line)`);
});
