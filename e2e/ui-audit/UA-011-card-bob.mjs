// UA-011: featured project cards bob only where hover exists (>=md). Below the
// md breakpoint the bob is a pointerless idle animation, so the cards must sit
// still at their layout position.
import { withPage, assert } from "./_harness.mjs";

const CARD = "div.p-px.rounded-xl"; // ProjectCard's animated wrapper

async function bobRange(page) {
  // The cards mount via whileInView; scroll them into view before sampling.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, document.body.scrollHeight * 0.55);
  });
  await page.waitForTimeout(1500);

  const ys = [];
  for (let i = 0; i < 12; i++) {
    ys.push(
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const t = getComputedStyle(el).transform;
        return t === "none" ? 0 : Number(new DOMMatrix(t).m42.toFixed(2));
      }, CARD),
    );
    await page.waitForTimeout(280);
  }
  return Math.max(...ys) - Math.min(...ys);
}

for (const width of [375, 767]) {
  await withPage(
    async (page) => {
      const r = await bobRange(page);
      assert(r < 0.5, `vw=${width}: card bob range ${r.toFixed(2)}px < 0.5 (still)`);
    },
    { viewport: { width, height: 844 } },
  );
}

await withPage(
  async (page) => {
    const r = await bobRange(page);
    assert(r > 3, `vw=768: card bob range ${r.toFixed(2)}px > 3 (bob alive at md)`);
  },
  { viewport: { width: 768, height: 900 } },
);
