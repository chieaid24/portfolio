// UA-009: UI-served image sources must be <=1600px wide and <=700KB.
// (open_graph is excluded: scraper-only, never rendered in a flow.)
import { readFileSync, statSync, readdirSync } from "fs";
import { join, relative } from "path";
import { assert } from "./_harness.mjs";

function pngSize(buf) {
  if (buf.subarray(0, 8).toString("latin1") !== "\x89PNG\r\n\x1a\n") return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpgSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const root = new URL("../../public", import.meta.url).pathname;
const files = walk(root)
  .map((p) => relative(root, p))
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .filter((f) => !f.startsWith("open_graph/") && !f.startsWith("icons-src/"));
assert(files.length > 10, `inventoried ${files.length} images`);
for (const f of files) {
  const p = join(root, f);
  const buf = readFileSync(p);
  const size = f.toLowerCase().endsWith("png") ? pngSize(buf) : jpgSize(buf);
  const kb = Math.round(statSync(p).size / 1024);
  if (!size) continue;
  assert(size.w <= 1600, `${f}: width ${size.w}px <= 1600`);
  assert(kb <= 700, `${f}: ${kb}KB <= 700`);
}
