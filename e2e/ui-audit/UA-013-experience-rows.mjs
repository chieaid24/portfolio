// UA-013: an experience entry's company and date must each stay on one line.
// They share a flex row; at narrow widths there is no room for both, and each
// wrapping independently interleaves two ragged blocks 8px apart. The row
// stacks below sm so each gets the full column. Also guards the section against
// horizontal overflow and sub-11px text (the type floor from UA-006/UA-008).
import { withPage, assert } from "./_harness.mjs";

const TYPE_FLOOR = 11;

async function auditExperience(page) {
  return page.evaluate(() => {
    const heading = [...document.querySelectorAll("h2")].find((e) => /experience/i.test(e.textContent));
    const section = heading.closest("section") || heading.parentElement.parentElement;
    const res = { wrapped: [], overflow: [], tiny: [] };

    const lines = (p) =>
      Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight));

    const box = section.getBoundingClientRect();
    for (const el of section.querySelectorAll("*")) {
      const b = el.getBoundingClientRect();
      if (b.width === 0) continue;
      if (b.right > box.right + 0.5 || b.left < box.left - 0.5) res.overflow.push(el.tagName);
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "auto")
        res.overflow.push(el.tagName + ":scroll");
    }

    // Each entry's subtitle is a <p> immediately followed by the period <p>.
    const subtitles = [...section.querySelectorAll("p")].filter(
      (p) =>
        p.nextElementSibling &&
        p.nextElementSibling.tagName === "P" &&
        p.parentElement.classList.contains("flex"),
    );
    for (const sub of subtitles) {
      const period = sub.nextElementSibling;
      if (lines(sub) > 1 || lines(period) > 1)
        res.wrapped.push({
          entry: `${sub.textContent.trim()} | ${period.textContent.trim()}`,
          subLines: lines(sub),
          periodLines: lines(period),
        });
    }

    for (const el of section.querySelectorAll("p,h3,span,button")) {
      if (!el.textContent.trim()) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 11) res.tiny.push(`${el.textContent.trim().slice(0, 20)} @ ${fs}px`);
    }
    return res;
  });
}

for (const width of [320, 375, 390, 768]) {
  await withPage(
    async (page) => {
      // The section renders below the fold; scroll it in before measuring.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
      });
      await page.waitForTimeout(1000);
      const r = await auditExperience(page);
      assert(r.wrapped.length === 0, `vw=${width}: company/date rows single-line (wrapped: ${JSON.stringify(r.wrapped)})`);
      assert(r.overflow.length === 0, `vw=${width}: no horizontal overflow (found: ${r.overflow.join(",")})`);
      assert(r.tiny.length === 0, `vw=${width}: all text >=${TYPE_FLOOR}px (under: ${r.tiny.join(",")})`);
    },
    { viewport: { width, height: 844 } },
  );
}
