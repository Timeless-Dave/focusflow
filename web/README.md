# FocusFlow — web app

Next.js **15**, React **19**, **`pnpm`**.

## Scripts

```bash
pnpm install    # prepare → sync-brand (regenerates favicons + copies assets)
pnpm dev        # http://localhost:3000
pnpm build
pnpm start
```

## Paths & conventions

- **Alias `@`** → `./src` (see `jsconfig.json` + `next.config.mjs`).
- **Brand URLs:** **`/brand/...`** (canonical files under `../../assets/brand/`).
- **Brand assets:** source `logo-wordmark.png` lives in `../../assets/brand/` only. The sync script generates transparent `logo-wordmark-clear.png`, `logo-mark.png` (F icon), and favicons, then copies them to `public/brand/` + `app/icon.png`.
- **Usage:** `logoWordmark` in header/footer; `logoMark` in hero pill, FAB, splash, auth; `favicon.png` / `favicon-dark.png` for browser tabs.
- **Shared presets:** `@/config` barrels `animations.js` + `landing.jsx`.

## Folder map

```
web/
├── app/              # Next.js App Router (layout, page, icon.png)
├── public/brand/
├── scripts/
│   ├── sync-brand.mjs
│   └── generate-favicon.mjs
├── src/
│   ├── components/{auth,landing,backgrounds,ui}
│   ├── config/
│   └── styles/
├── next.config.mjs
└── package.json
```
