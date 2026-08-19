@AGENTS.md

# Browser checks (Playwright)

Playwright is **already installed globally** — do not `npm install` it into a
scratchpad. That wastes time and pulls a build whose browser revision may not
match what is on disk.

Import it by absolute path:

```js
const { chromium } = await import(
  "file:///C:/Users/lijis/AppData/Roaming/npm/node_modules/playwright/index.mjs"
);
const browser = await chromium.launch({ args: ["--no-sandbox"] });
```

Browsers live in the default cache, `%LOCALAPPDATA%\ms-playwright`, which holds
several revisions so the global install always finds its match. **Leave
`PLAYWRIGHT_BROWSERS_PATH` unset.** There is a second copy of the browsers at
`E:\playwright`, but it carries only one revision — pointing at it breaks the
global install with "Executable doesn't exist … chromium_headless_shell-1223".

The dev server must be up first (`pnpm dev`, port 3000); poll it rather than
sleeping:

```bash
timeout 60 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'
```

Always check `console --errors` equivalents — listen for `pageerror` and
`console` events — and open any dropdown or dialog the change touches. A
screenshot alone will not catch a menu that throws only when opened.
