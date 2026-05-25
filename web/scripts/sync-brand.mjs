import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../assets/brand');
const PUBLIC = path.resolve(__dirname, '../public/brand');
const APP = path.resolve(__dirname, '../app');

/** Source-only files — kept in assets/brand, not published to public/brand */
const SKIP_PUBLIC = new Set(['logo-wordmark.png']);

const PARTNER_FETCH = [
  { file: 'classdojo.svg', url: 'https://cdn.simpleicons.org/classdojo' },
  { file: 'googleclassroom.svg', url: 'https://cdn.simpleicons.org/googleclassroom' },
  { file: 'canvas.svg', url: 'https://cdn.simpleicons.org/instructure/E72429' },
  { file: 'clever.svg', url: 'https://cdn.simpleicons.org/clever/1565C0' },
  { file: 'schoology.svg', url: 'https://cdn.simpleicons.org/powerschool/E57200' }
];

const APPTegy_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" role="img" aria-label="Apptegy">
  <rect width="120" height="32" rx="6" fill="#7C3AED"/>
  <text x="60" y="21" text-anchor="middle" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700">Apptegy</text>
</svg>`;

const PARTNER_FALLBACKS = {
  'classdojo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#30C4C4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.5 7c1.8 1.2 4.2 1.2 6 0 .6-.4 1.5-.2 1.9.4s.2 1.5-.4 1.9c-2.8 1.9-6.6 1.9-9.4 0-.6-.4-.8-1.2-.4-1.9s1.3-.8 1.9-.4z"/></svg>`,
  'clever.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1565C0" d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.2 7.5 3.75v7.5L12 19.8l-7.5-3.75v-7.5L12 4.2z"/><path fill="#1565C0" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>`,
  'schoology.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E57200" d="M12 2C8 2 5 5.5 5 9.5c0 2.2 1 4.2 2.6 5.5L12 22l4.4-7c1.6-1.3 2.6-3.3 2.6-5.5C19 5.5 16 2 12 2zm0 3c2.8 0 5 2.4 5 5.5 0 1.4-.6 2.7-1.6 3.6L12 17.8 8.6 14c-1-1-1.6-2.2-1.6-3.6C7 7.4 9.2 5 12 5z"/></svg>`
};

async function syncPartners() {
  const dir = path.join(SRC, 'partners');
  await fs.mkdir(dir, { recursive: true });

  for (const partner of PARTNER_FETCH) {
    const dest = path.join(dir, partner.file);
    try {
      const res = await fetch(partner.url);
      if (!res.ok) throw new Error(`${res.status}`);
      await fs.writeFile(dest, await res.text());
      console.log('[sync-brand] partner', partner.file);
    } catch (err) {
      const fallback = PARTNER_FALLBACKS[partner.file];
      if (fallback) {
        await fs.writeFile(dest, fallback);
        console.log('[sync-brand] partner fallback', partner.file);
      } else {
        console.warn('[sync-brand] partner fetch failed:', partner.file, err.message);
      }
    }
  }

  await fs.writeFile(path.join(dir, 'apptegy.svg'), APPTegy_SVG);
  console.log('[sync-brand] partner apptegy.svg');
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    if (SKIP_PUBLIC.has(ent.name)) continue;
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

execFileSync(process.execPath, [path.join(__dirname, 'generate-favicon.mjs')], {
  stdio: 'inherit'
});

await syncPartners();
await copyDir(SRC, PUBLIC);

for (const stale of ['logo-wordmark.png', 'favicon-32.png']) {
  try {
    await fs.unlink(path.join(PUBLIC, stale));
    console.log('[sync-brand] removed public/', stale);
  } catch {
    /* already absent */
  }
}

await fs.mkdir(APP, { recursive: true });
for (const [srcName, destName] of [
  ['favicon.png', 'icon.png'],
  ['favicon-dark.png', 'icon-dark.png'],
  ['apple-icon.png', 'apple-icon.png']
]) {
  const srcPath = path.join(SRC, srcName);
  try {
    await fs.copyFile(srcPath, path.join(APP, destName));
  } catch {
    /* optional asset */
  }
}

console.log('[sync-brand] synced', SRC, '->', PUBLIC, '+ app icons');
