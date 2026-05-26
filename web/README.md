# FocusFlow — web app

Next.js **15**, React **19**, **`pnpm`**.

## Scripts

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm sync-brand # optional: regenerate favicons + copy assets locally
pnpm build      # prebuild → sync-brand (skips Python on Vercel)
pnpm start
```

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `web`.
3. Add environment variables (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. In **Supabase → Authentication → URL Configuration**, add redirect URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://<your-vercel-domain>/api/auth/callback`
5. Deploy. Build log should include: `[sync-brand] skipping generate-favicon (Vercel build)`.

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
