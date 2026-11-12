#!/usr/bin/env node
// Lists every <Need id="…"> left in the case studies.
// Production builds (VERCEL_ENV=production, or --strict) FAIL while any remain.
// Preview builds and local runs only warn, so drafts can be reviewed on the preview link.
import { loadWork, lineOf } from "./lib-mdx.mjs";

const strict = process.argv.includes("--strict") || process.env.VERCEL_ENV === "production";
const rows = [];
for (const entry of loadWork()) {
  for (const m of entry.raw.matchAll(/<Need id="([^"]+)">([\s\S]*?)<\/Need>/g)) {
    const text = m[2].replace(/\s+/g, " ").trim();
    rows.push({ file: `${entry.slug}.mdx`, line: lineOf(entry.raw, m.index), id: m[1], text });
  }
}

if (rows.length === 0) {
  console.log("✓ No open questions (<Need>) left in the case studies.");
  process.exit(0);
}

const byFile = Object.groupBy(rows, (r) => r.file);
console.log(`${rows.length} open question(s) in ${Object.keys(byFile).length} case stud${Object.keys(byFile).length === 1 ? "y" : "ies"}:\n`);
for (const [file, list] of Object.entries(byFile)) {
  console.log(`  ${file}`);
  for (const r of list) console.log(`    ${r.id.padEnd(5)} line ${String(r.line).padEnd(4)} ${r.text.slice(0, 90)}${r.text.length > 90 ? "…" : ""}`);
}
if (strict) {
  console.error("\n✗ Production build stopped: answer or delete every <Need> above first.");
  process.exit(1);
}
console.warn("\n⚠ Preview/local build: continuing. These show as outlined boxes on the page.");
