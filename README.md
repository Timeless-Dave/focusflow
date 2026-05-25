# FocusFlow

Teacher-focused SPA for ADHD classroom support — marketing landing, onboarding stepper (`Stepper`, `BorderGlow`), interactive backgrounds (`GridScan`, `PixelSnow`, etc.), Magic Bento, galleries, and a library of reusable motion components under [`web/src/components/ui/`](./web/src/components/ui/).

## Repository layout

| Path | Purpose |
|------|---------|
| [`assets/brand/`](./assets/brand/) | Source-of-truth brand assets — logo, favicon, auth illustration SVGs (`prepare`/`prebuild` copies them into `web/public/brand`). |
| [`web/`](./web/) | Next.js + React application (`pnpm`; see [`web/README.md`](./web/README.md)). |

## Quick start

```bash
cd web
pnpm install    # hooks `prepare` → sync-brand
pnpm dev        # http://localhost:3000
pnpm build
pnpm preview
```
