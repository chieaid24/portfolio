// UA-002: light-mode accent (onLightColor) must hit >=4.5:1 on the cream
// background AND >=4.5:1 under white text (CLICK ME / skill pills).
import { readFileSync } from "fs";
import { ratio, assert, withPage, rgbToHex } from "./_harness.mjs";

const BG = "#f5f2ef";
const src = readFileSync(new URL("../../src/lib/money-context.js", import.meta.url), "utf8");
const colors = [...src.matchAll(/onLightColor:\s*"(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
assert(colors.length >= 6, `found ${colors.length} onLightColor tokens`);
for (const c of colors) {
  assert(ratio(c, BG) >= 4.5, `onLightColor ${c} on ${BG}: ${ratio(c, BG).toFixed(2)} >= 4.5`);
  assert(ratio(c, "#ffffff") >= 4.5, `white on ${c}: ${ratio(c, "#ffffff").toFixed(2)} >= 4.5`);
}

// live check: rendered accent text on /projects (default theme, light mode)
await withPage(async (page) => {
  await page.goto((process.env.UA_BASE_URL || "http://localhost:3000") + "/projects", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const col = await page.locator("span:has-text('Undiscovered')").first().evaluate((el) => getComputedStyle(el).color);
  const r = ratio(rgbToHex(col), BG);
  assert(r >= 4.5, `rendered Undiscovered accent ${col}: ${r.toFixed(2)} >= 4.5`);
});
