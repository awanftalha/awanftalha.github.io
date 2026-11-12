// Shared helpers for the case-study scripts. No dependencies.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const WORK_DIR = "src/content/work";

/** All case-study files: [{ slug, path, raw, frontmatter (raw text), body }] */
export function loadWork(root = process.cwd()) {
  const dir = join(root, WORK_DIR);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .map((f) => {
      const path = join(dir, f);
      const raw = readFileSync(path, "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) throw new Error(`${f}: no frontmatter block`);
      return { slug: f.replace(/\.mdx$/, ""), path, raw, frontmatter: m[1], body: m[2] };
    });
}

/** Line number (1-based) of an index in a string. */
export function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

/** Plain-text word count of MDX: drops <Need> blocks and all tags/attributes. */
export function countWords(mdx) {
  const text = mdx
    .replace(/<Need\b[\s\S]*?<\/Need>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*|`>_\[\]()]/g, " ");
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’–-]*/gu) || []).length;
}

/** A frontmatter string value (single-line, double-quoted). Good enough for intro/summary fields. */
export function fmString(frontmatter, key) {
  const m = frontmatter.match(new RegExp(`^\\s*${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1].replace(/\\"/g, '"') : "";
}
