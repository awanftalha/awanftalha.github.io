#!/usr/bin/env node
// Prints the skim-layer word count per case study (body words before the first <GoDeeper>,
// plus the intro and the four summary cards), the full count, and both reading times.
// Flags any page whose skim layer is over the limit (default 700).
import { loadWork, countWords, fmString } from "./lib-mdx.mjs";

const LIMIT = Number(process.env.SKIM_LIMIT || 700);
const WPM = 220;
let over = 0;
const out = [];
for (const e of loadWork()) {
  const cut = e.body.indexOf("<GoDeeper");
  const skimBody = cut === -1 ? e.body : e.body.slice(0, cut);
  const top = ["intro", "problem", "role", "changed", "result"].map((k) => fmString(e.frontmatter, k)).join(" ");
  const skim = countWords(skimBody) + countWords(top);
  const full = countWords(e.body) + countWords(top);
  const flag = skim > LIMIT ? "  ← over limit" : "";
  if (flag) over++;
  out.push([e.slug, skim, full, Math.max(1, Math.round(skim / WPM)), Math.max(1, Math.round(full / WPM)), flag]);
}
console.log("case study".padEnd(20), "skim".padStart(5), "full".padStart(6), "  read time");
for (const [s, skim, full, ms, mf, flag] of out)
  console.log(s.padEnd(20), String(skim).padStart(5), String(full).padStart(6), `  ${ms} min skim · ${mf} min full${flag}`);
console.log(`\nLimit: ${LIMIT} words in the skim layer. ${over ? `${over} page(s) over.` : "All pages within it."}`);
process.exit(over && process.argv.includes("--strict") ? 1 : 0);
