// Shared harness for ui-audit probes (see e2e/ui-audit/README.md).
// Launches headless chromium via playwright-core; probes assert one finding each.
import { createRequire } from "module";

const CANDIDATES = [
  process.env.PLAYWRIGHT_CORE_DIR,
  process.cwd() + "/node_modules",
  process.env.HOME + "/.npm/_npx/9833c18b2d85bc59/node_modules",
].filter(Boolean);

function loadChromium() {
  for (const dir of CANDIDATES) {
    try {
      const req = createRequire(dir + "/x");
      return req("playwright-core").chromium;
    } catch {}
  }
  throw new Error(
    "playwright-core not found. Set PLAYWRIGHT_CORE_DIR to a node_modules dir containing it.",
  );
}

export const BASE = process.env.UA_BASE_URL || "http://localhost:3000";

export async function withPage(fn, { viewport = { width: 390, height: 844 }, theme = "light" } = {}) {
  const chromium = loadChromium();
  const browser = await chromium.launch({
    executablePath: process.env.UA_CHROME || undefined,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({ deviceScaleFactor: 1, viewport });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => { localStorage.clear(); localStorage.setItem("theme", t); }, theme);
    return await fn(page);
  } finally {
    await browser.close();
  }
}

export function lum(hex) {
  const v = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  return "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
}

export function assert(cond, msg) {
  if (!cond) { console.error("RED: " + msg); process.exitCode = 1; }
  else console.log("green: " + msg);
}
