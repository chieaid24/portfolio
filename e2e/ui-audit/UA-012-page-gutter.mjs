// UA-012: the page gutter must grow with the viewport, and content must never
// be wider than it is on desktop (704px). max-w-3xl equals the md breakpoint,
// so a stepped gutter used to leave the 768-1023 band at 720px content -- wider
// than desktop -- then snap back at lg. Content must rise and hold, never dip.
import { withPage, assert } from "./_harness.mjs";

const MAX_CONTENT = 704; // the measure at >=768; nothing may exceed it
const MIN_GUTTER = 16; // the phone gutter; nothing may go under it
const WIDTHS = [375, 640, 700, 767, 768, 1023, 1024, 1280];

const measured = [];
for (const width of WIDTHS) {
  const m = await withPage(
    (page) =>
      page.evaluate(() => {
        const el = document.querySelector("div.mx-auto.max-w-3xl");
        const pad = parseFloat(getComputedStyle(el).paddingLeft);
        return { pad: +pad.toFixed(1), content: +(el.getBoundingClientRect().width - pad * 2).toFixed(1) };
      }),
    { viewport: { width, height: 844 } },
  );
  measured.push({ width, ...m });
  assert(m.content <= MAX_CONTENT + 0.5, `vw=${width}: content ${m.content}px <= ${MAX_CONTENT}`);
  assert(m.pad >= MIN_GUTTER - 0.5, `vw=${width}: gutter ${m.pad}px >= ${MIN_GUTTER}`);
}

// Widening the window must never narrow the content (catches the lg snap).
for (let i = 1; i < measured.length; i++) {
  const prev = measured[i - 1];
  const cur = measured[i];
  assert(
    cur.content >= prev.content - 0.5,
    `monotonic: vw=${prev.width} content ${prev.content}px -> vw=${cur.width} content ${cur.content}px (never narrows)`,
  );
}
