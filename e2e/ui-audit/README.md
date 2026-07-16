# ui-audit probes

Regression probes from the 2026-07-15 responsive UI audit (mobile 390px /
tablet 768px, light + dark). Each file asserts one audited rule; its name
matches the finding id in the audit ledger.

Run a probe:

```bash
UA_BASE_URL=http://localhost:3000 node e2e/ui-audit/UA-005-nav-targets.mjs
```

Exit code 0 = green. RED lines print the measured value that failed.

Browser-based probes launch headless chromium through `playwright-core`.
The repo does not depend on it; the harness resolves it from
`PLAYWRIGHT_CORE_DIR` (a node_modules dir containing playwright-core), the
project node_modules, or a local npx cache. `UA_CHROME` may point at a
chromium binary; unset, playwright-core's default resolution applies.

File-only probes (UA-002 token scan, UA-009 asset budget) need no browser.

| Probe | Rule |
| --- | --- |
| UA-001 | self-hosted AVIF optimizer must answer within 15s (deferred: needs-decision on `images.formats`) |
| UA-002 | light-mode accents >=4.5:1 on cream and under white text |
| UA-003 | light-mode gray tokens >=4.5:1 on their surfaces |
| UA-004 | wallet controls >=24px hit area |
| UA-005 | header nav links >=24px hit height |
| UA-006 | starflare caption >=11px |
| UA-007 | CLICK ME stays single-line at 320/375/390px |
| UA-008 | clash stats >=11px |
| UA-009 | UI image sources <=1600px wide and <=700KB |
| UA-011 | project cards bob only at >=md, still below it |
| UA-012 | page gutter grows with the viewport; content never exceeds the 704px desktop measure, and never narrows as the window widens |
| UA-013 | experience company/date each stay single-line; section has no overflow and no sub-11px text |
