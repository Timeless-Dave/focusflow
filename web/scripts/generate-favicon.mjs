/**
 * Build transparent brand marks + light/dark favicons from logo-wordmark.png.
 * Extracts the left F mark for favicon / logo-mark; full wordmark gets a clear PNG.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.resolve(__dirname, '../../assets/brand');
const py =
  process.env.PYTHON ??
  (fs.existsSync(path.resolve(__dirname, '../../.venv/bin/python3'))
    ? path.resolve(__dirname, '../../.venv/bin/python3')
    : 'python3');

const script = `
from PIL import Image, ImageEnhance

src = ${JSON.stringify(path.join(BRAND, 'logo-wordmark.png'))}
brand = ${JSON.stringify(BRAND)}

img = Image.open(src).convert('RGBA')
w, h = img.size

# Key out cream / off-white background from corner sample
corners = [img.getpixel((2, 2)), img.getpixel((w - 3, 2)), img.getpixel((2, h - 3)), img.getpixel((w - 3, h - 3))]
cream = tuple(sum(c[i] for c in corners) // len(corners) for i in range(3))
tol = 38

def keyed(im):
    out = im.copy()
    px = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            r, g, b, a = px[x, y]
            if (
                abs(r - cream[0]) <= tol
                and abs(g - cream[1]) <= tol
                and abs(b - cream[2]) <= tol
            ):
                px[x, y] = (r, g, b, 0)
            elif r > 248 and g > 248 and b > 248:
                px[x, y] = (r, g, b, 0)
    return out

def trim_alpha(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im

def column_density(im, x):
    _, ih = im.size
    px = im.load()
    return sum(1 for y in range(ih) if px[x, y][3] > 32)

wordmark = keyed(img)
wordmark.save(f'{brand}/logo-wordmark-clear.png', 'PNG')
print('[generate-brand] logo-wordmark-clear.png')

# Locate F mark: dense columns on the left, then a gap before the wordmark text
cols = [column_density(wordmark, x) for x in range(w)]
peak = max(cols) or 1
threshold = peak * 0.07

left = next((x for x, c in enumerate(cols) if c > threshold), 0)

right = left + 1
in_mark = False
low_streak = 0
gap_needed = max(10, int(w * 0.012))

for x in range(left, w):
    if cols[x] > threshold:
        in_mark = True
        low_streak = 0
        right = x + 1
    elif in_mark:
        low_streak += 1
        if low_streak >= gap_needed:
            right = x - low_streak + 1
            break

# Fallback: icon is ~22% of width for this layout
if right - left > w * 0.4:
    right = int(w * 0.24)

pad = max(4, int(h * 0.03))
mark = wordmark.crop((max(0, left - pad), 0, min(w, right + pad), h))
mark = trim_alpha(mark)

# Square canvas with breathing room
iw, ih = mark.size
side = max(iw, ih)
margin = int(side * 0.08)
canvas_side = side + margin * 2
square = Image.new('RGBA', (canvas_side, canvas_side), (0, 0, 0, 0))
square.paste(mark, ((canvas_side - iw) // 2, (canvas_side - ih) // 2), mark)

square.save(f'{brand}/logo-mark.png', 'PNG')
print(f'[generate-brand] logo-mark.png ({square.size[0]}x{square.size[1]})')

def save_icon(name, im, size):
    im.resize((size, size), Image.Resampling.LANCZOS).save(f'{brand}/{name}', 'PNG')
    print(f'[generate-brand] {name} {size}x{size}')

save_icon('favicon.png', square, 512)
save_icon('apple-icon.png', square, 180)

bright = ImageEnhance.Brightness(square).enhance(1.55)
bright = ImageEnhance.Contrast(bright).enhance(0.92)
save_icon('favicon-dark.png', bright, 512)
save_icon('apple-icon-dark.png', bright, 180)

import os
for legacy in ('favicon-32.png', 'logo-wordmark.png'):
    legacy_path = os.path.join(brand, legacy)
    if legacy == 'logo-wordmark.png':
        continue  # keep source in assets/brand
    if os.path.exists(legacy_path):
        os.remove(legacy_path)
        print(f'[generate-brand] removed {legacy}')
`;

execFileSync(py, ['-c', script], { stdio: 'inherit' });

// Remove stale duplicates from public (re-synced by sync-brand)
const publicBrand = path.resolve(__dirname, '../public/brand');
for (const stale of ['favicon-32.png']) {
  const p = path.join(publicBrand, stale);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('[generate-brand] removed public/', stale);
  }
}
