// UA-007: the starflare CLICK ME button label must stay on a single line at
// mobile width. Originally audited at 390 only; 375 and 320 (iPhone SE / mini)
// are narrower and were never covered, so all three are checked.
import { withPage, assert, BASE } from "./_harness.mjs";

for (const width of [320, 375, 390]) {
  await withPage(
    async (page) => {
      await page.goto(BASE + "/", { waitUntil: "load" });
      await page.getByRole("button", { name: /your earnings/i }).click();
      await page.waitForTimeout(900);
      const box = await page.getByRole("button", { name: "CLICK ME" }).boundingBox();
      assert(
        box && box.height <= 42,
        `vw=${width}: CLICK ME height ${box ? box.height.toFixed(1) : "?"}px <= 42 (single line)`,
      );
    },
    { viewport: { width, height: 844 } },
  );
}
