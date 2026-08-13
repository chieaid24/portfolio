// UA-014: the hero's Explore CTA scrolls to #experience and the section's
// heading lands clear of the fixed header (not hidden behind it).
import { withPage, assert, BASE } from "./_harness.mjs";

const run = (label, viewport) =>
  withPage(
    async (page) => {
      await page.goto(BASE + "/", { waitUntil: "load" });
      await page.waitForTimeout(600);

      const cta = page.getByRole("link", { name: /explore/i });
      assert((await cta.count()) === 1, `${label}: one Explore CTA`);
      assert(
        (await cta.getAttribute("href")) === "#experience",
        `${label}: CTA href = #experience`,
      );

      const before = await page.evaluate(() => window.scrollY);
      await cta.click();
      // Settle the smooth scroll: wait for scrollY to stop moving.
      await page.evaluate(
        () =>
          new Promise((res) => {
            let last = -1;
            let still = 0;
            const t = setInterval(() => {
              if (window.scrollY === last) {
                if (++still > 4) {
                  clearInterval(t);
                  res();
                }
              } else {
                still = 0;
                last = window.scrollY;
              }
            }, 100);
          }),
      );

      const m = await page.evaluate(() => {
        const hdr = document.querySelector("header > div").getBoundingClientRect();
        const h2 = [...document.querySelectorAll("h2")].find(
          (e) => e.textContent.trim() === "Experience",
        );
        const r = h2.getBoundingClientRect();
        return {
          y: window.scrollY,
          gap: r.top - hdr.bottom,
          bottom: r.bottom,
          hash: location.hash,
        };
      });

      assert(m.y > before + 100, `${label}: scrolled down (${before} -> ${m.y})`);
      assert(m.gap > 0, `${label}: heading clears header by ${m.gap.toFixed(1)}px`);
      assert(
        m.bottom < viewport.height,
        `${label}: heading fully in viewport (bottom ${m.bottom.toFixed(1)} < ${viewport.height})`,
      );
      assert(m.hash === "#experience", `${label}: url hash = #experience`);
    },
    { viewport },
  );

await run("mobile", { width: 390, height: 844 });
await run("desktop", { width: 1440, height: 900 });
