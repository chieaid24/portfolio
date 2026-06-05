# Lessons

Patterns captured after corrections / non-obvious environment fixes. Reviewed at session start.

---

## Making the Playwright MCP work in this environment (WSL2, no root)

**Symptom.** The `playwright` MCP server (`@playwright/mcp@latest`, configured in `.mcp.json`) failed on
the first `browser_navigate` with:

```
Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome
Run "npx playwright install chrome"
```

and `npx playwright install chrome` then fails because installing the Google Chrome **channel** needs
`sudo` (password-gated, unavailable here).

**Root cause (two separate problems).**
1. The MCP defaulted to the **`chrome` channel** (system Google Chrome), which isn't installed. The
   Playwright-managed **bundled chromium** *is* installed under `~/.cache/ms-playwright/` — the MCP just
   wasn't told to use it.
2. The bundled chromium still couldn't launch: it was missing system shared libraries that normally come
   from `sudo apt-get install` — NSS (`libnspr4.so`, `libnss3.so`, `libnssutil3.so`, `libsmime3.so`) and
   ALSA (`libasound.so.2`, symbol `snd_device_name_get_hint@ALSA_0.9`). None existed anywhere on the
   filesystem.

**Fix — install the libs WITHOUT root, point the bundled chromium at them.**

`apt-get download` + `dpkg-deb -x` fetch and unpack `.deb`s as an unprivileged user (no `sudo`, no
system install). We extract the `.so` files into a stable cache dir and expose them via `LD_LIBRARY_PATH`.

```bash
# 1. Download the .deb packages (unprivileged — writes into cwd, installs nothing).
mkdir -p /home/secur/.cache/playwright-sys-libs/_debs
cd /home/secur/.cache/playwright-sys-libs/_debs
apt-get download libnss3 libnspr4 libasound2t64
#   NOTE: on Ubuntu 24.04 "noble", the package is libasound2t64, NOT libasound2
#   (`apt-get download libasound2` errors with "no candidate version").

# 2. Extract every .deb, then collect the shared objects into the parent cache dir.
for d in *.deb; do dpkg-deb -x "$d" extracted; done
cp -a extracted/usr/lib/x86_64-linux-gnu/*.so* /home/secur/.cache/playwright-sys-libs/

# 3. Sanity-check: the bundled chromium should now resolve every lib.
LD_LIBRARY_PATH=/home/secur/.cache/playwright-sys-libs \
  ldd ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | grep -i "not found"
#   -> prints nothing == success
```

The libs live in `~/.cache/playwright-sys-libs/` (persistent across jobs). If that dir is ever wiped,
re-run the three steps above to rebuild it.

**Permanent wiring — already applied to `.mcp.json`** so the MCP "just works" for every agent:

```jsonc
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--browser", "chromium", "--no-sandbox"],
      "env": { "LD_LIBRARY_PATH": "/home/secur/.cache/playwright-sys-libs" }
    }
  }
}
```

- `--browser chromium` → use the bundled chromium, not the missing `chrome` channel.
- `--no-sandbox` → required under WSL2.
- `env.LD_LIBRARY_PATH` → the MCP's node process passes its env to the chromium child it spawns, so the
  child finds the NSS/ALSA libs.

A restart of the MCP server (new session) picks up the `.mcp.json` change.

**Ad-hoc fallback (driving a browser from a one-off Node script, no MCP).** `playwright-core` lives in
the npx cache. Launch the bundled binary directly with the same lib path:

```js
const { chromium } = require("/home/secur/.npm/_npx/<hash>/node_modules/playwright-core");
const b = await chromium.launch({
  executablePath: "/home/secur/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox"],
});
```

Run it with `LD_LIBRARY_PATH=/home/secur/.cache/playwright-sys-libs node script.js`.
(Either binary works once the libs resolve: the full `chrome-linux64/chrome`, or the lighter
`chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.)

**Worktree dev-server gotcha.** When validating from inside a worktree, start the dev server with the
harness's own background mode, **not** `nohup ... &` in a one-shot Bash call — the latter gets reaped when
the Bash invocation returns, so the server dies before you can hit it.
