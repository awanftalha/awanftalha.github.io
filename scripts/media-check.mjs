#!/usr/bin/env node
// Checks every media file the case studies reference.
//   ✗ errors (exit 1): a poster or existing image that's missing, or a loop over 2 MB
//   · pending (no error): a loop or still from SHOT_LIST.md that hasn't been made yet
//   ! warning: a loop that exists without its matching first-frame .webp poster
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadWork } from "./lib-mdx.mjs";

const PUBLIC = join(process.cwd(), "public");
const MAX = 2 * 1024 * 1024;
const errors = [], pending = [], warnings = [];
let ok = 0, totalBytes = 0;

const exists = (p) => existsSync(join(PUBLIC, p));
const size = (p) => statSync(join(PUBLIC, p)).size;

for (const e of loadWork()) {
  const refs = new Set();
  for (const m of e.raw.matchAll(/(?:src|poster|before|after|video)\s*[:=]\s*"(\/(?:media|assets)\/[^"]+)"/g)) refs.add(m[1]);
  for (const p of refs) {
    const isNew = p.startsWith("/media/");
    if (!exists(p)) {
      (isNew ? pending : errors).push(`${e.slug}: ${p}${isNew ? "" : "  (existing asset missing)"}`);
      continue;
    }
    ok++;
    if (p.endsWith(".mp4")) {
      const b = size(p); totalBytes += b;
      if (b > MAX) errors.push(`${e.slug}: ${p} is ${(b / 1048576).toFixed(2)} MB (limit 2 MB)`);
      const poster = p.replace(/\.mp4$/, ".webp");
      if (!exists(poster)) warnings.push(`${e.slug}: ${p} has no matching poster ${poster}`);
    }
  }
}

console.log(`✓ ${ok} referenced file(s) present${totalBytes ? `, loops total ${(totalBytes / 1048576).toFixed(1)} MB` : ""}.`);
if (pending.length) console.log(`\n· ${pending.length} new file(s) not made yet (see docs/SHOT_LIST.md). The pages fall back to posters:\n  ` + pending.join("\n  "));
if (warnings.length) console.log(`\n! ${warnings.length} warning(s):\n  ` + warnings.join("\n  "));
if (totalBytes > 200 * 1048576) console.log("\n! Loops total over 200 MB: time to move videos to a video CDN (see CASE_STUDY_SYSTEM.md §6).");
if (errors.length) { console.error(`\n✗ ${errors.length} error(s):\n  ` + errors.join("\n  ")); process.exit(1); }
