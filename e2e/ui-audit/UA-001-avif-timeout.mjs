// UA-001 (deferred, needs-decision): self-hosted `next start` deadlocks
// encoding AVIF for several PNG sources; browsers that send
// Accept: image/avif wait forever and show empty gray boxes.
// Green requires either dropping 'image/avif' from images.formats or the
// underlying sharp/libheif issue being resolved in the serving environment.
import { assert, BASE } from "./_harness.mjs";

const url = BASE + "/_next/image?url=%2Fcanopy%2Fcanopy_test_1.png&w=828&q=75";
const ctl = new AbortController();
const t = setTimeout(() => ctl.abort(), 15000);
try {
  const res = await fetch(url, { headers: { Accept: "image/avif" }, signal: ctl.signal });
  await res.arrayBuffer();
  clearTimeout(t);
  assert(res.ok, `AVIF request completed: ${res.status}`);
} catch (e) {
  clearTimeout(t);
  assert(false, `AVIF request completed under 15s (${e.name})`);
}
