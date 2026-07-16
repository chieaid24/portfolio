// UA-004: wallet panel controls need >=24px hit areas (WCAG 2.5.8 AA).
import { withPage, assert, BASE } from "./_harness.mjs";

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }]) {
  await withPage(async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.getByRole("button", { name: /your earnings/i }).click();
    await page.waitForTimeout(900);
    const targets = [
      page.getByRole("button", { name: "Close" }),
      page.getByRole("button", { name: "Bounty info" }),
      page.getByRole("button", { name: "Starflare info" }),
      page.getByRole("button", { name: /switch to (dark|light) mode/i }),
    ];
    for (const t of targets) {
      const box = await t.boundingBox();
      const name = await t.evaluate((el) => el.getAttribute("aria-label") || el.textContent.trim());
      assert(box && Math.min(box.width, box.height) >= 23.5,
        `${viewport.width}px "${name}": ${box ? box.width.toFixed(0) + "x" + box.height.toFixed(0) : "missing"} >= 24`);
    }
  }, { viewport });
}
