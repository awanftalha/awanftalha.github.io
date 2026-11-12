// Build-time media helpers for the case-study components. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC = path.resolve('public');
const file = (src) => path.join(PUBLIC, decodeURI(src.split(/[?#]/)[0]));

/** True when a site path like "/assets/x.png" exists in public/. */
export function onDisk(src) {
  return typeof src === 'string' && src.startsWith('/') && fs.existsSync(file(src));
}

/** Warn about missing media while developing; silent in builds. */
export function warn(msg) {
  if (import.meta.env.DEV) console.warn(`[case] ${msg}`);
}

/** For a loop, its matching first-frame poster (same path, .webp) if it exists. */
export function posterFor(video, fallback) {
  if (!video) return fallback;
  const webp = video.replace(/\.(mp4|webm|mov)$/i, '.webp');
  return onDisk(webp) ? webp : fallback;
}

export const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src || '');

const cache = new Map();
/** Pixel width and height of a PNG, WebP or JPEG in public/, read from its header. */
export function dims(src) {
  if (!onDisk(src)) return null;
  if (cache.has(src)) return cache.get(src);
  let out = null;
  try {
    const b = fs.readFileSync(file(src));
    if (b.readUInt32BE(0) === 0x89504e47) {
      out = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    } else if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const kind = b.toString('ascii', 12, 16);
      if (kind === 'VP8X') out = { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      else if (kind === 'VP8 ') out = { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      else if (kind === 'VP8L') {
        const bits = b.readUInt32LE(21);
        out = { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    } else if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          out = { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch { out = null; }
  cache.set(src, out);
  return out;
}

/** Plain-text word count of rendered HTML, and reading minutes at 220 wpm. */
export function readingMinutes(html) {
  const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’–-]*/gu) || []).length;
  return Math.max(1, Math.round(words / 220));
}
