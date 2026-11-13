// Makes an 800px-wide WebP copy of each case study's cover poster
// (<name>-800w.webp, next to the original). Loop.astro offers it to phones
// through srcset, so they don't download the full-size image.
// Run after changing a cover: node scripts/small-posters.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = 'src/content/work';
for (const f of readdirSync(dir).filter((n) => n.endsWith('.mdx'))) {
  const m = readFileSync(join(dir, f), 'utf8').match(/^\s+poster:\s*"([^"]+)"/m);
  if (!m) continue;
  const src = join('public', m[1]);
  const out = src.replace(/\.(png|webp|jpe?g)$/i, '-800w.webp');
  if (!existsSync(src)) continue;
  const { width } = await sharp(src).metadata();
  if (width <= 900) { console.log(`skip (already small): ${m[1]}`); continue; }
  const info = await sharp(src).resize({ width: 800 }).webp({ quality: 82 }).toFile(out);
  console.log(`${m[1]} → ${out.replace('public', '')} (${Math.round(info.size / 1024)} KB)`);
}
