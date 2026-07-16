// UA-003: light-theme muted gray tokens must hit >=4.5:1 on the surfaces
// they are used on (cream page bg; outline-gray also on secondary panels).
import { withPage, ratio, rgbToHex, assert } from "./_harness.mjs";

await withPage(async (page) => {
  await page.reload({ waitUntil: "load" });
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const probe = (v) => {
      const d = document.createElement("div");
      d.style.color = `var(${v})`;
      document.body.appendChild(d);
      const c = getComputedStyle(d).color;
      d.remove();
      return c;
    };
    return {
      bg: probe("--background"),
      bg2: probe("--background-secondary"),
      outlineGray: probe("--outline-gray"),
      darkBodyText: probe("--dark-body-text"),
      experienceMeta: probe("--experience-meta"),
    };
  });
  const bg = rgbToHex(tokens.bg), bg2 = rgbToHex(tokens.bg2);
  const checks = [
    ["--outline-gray on background", tokens.outlineGray, bg],
    ["--outline-gray on background-secondary", tokens.outlineGray, bg2],
    ["--dark-body-text on background", tokens.darkBodyText, bg],
    ["--experience-meta on background", tokens.experienceMeta, bg],
  ];
  for (const [name, fg, b] of checks) {
    const r = ratio(rgbToHex(fg), b);
    assert(r >= 4.5, `${name}: ${r.toFixed(2)} >= 4.5`);
  }
});
