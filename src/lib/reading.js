// Reading times and the page outline, worked out at build time.
// Reading time uses scripts/lib-mdx.mjs, the same rule as `npm run check:skim`:
// skim = body words before the first <GoDeeper> + intro + the four summary
// cards; full = all body words + the same. 220 words per minute.
import { loadWork, countWords, fmString } from '../../scripts/lib-mdx.mjs';

const WPM = 220;
let cache = null;

export function readingTimes(slug) {
  cache ??= new Map(loadWork().map((e) => [e.slug, e]));
  const e = cache.get(slug);
  if (!e) return null;
  const cut = e.body.indexOf('<GoDeeper');
  const skimBody = cut === -1 ? e.body : e.body.slice(0, cut);
  const top = ['intro', 'problem', 'role', 'changed', 'result'].map((k) => fmString(e.frontmatter, k)).join(' ');
  const skim = countWords(skimBody) + countWords(top);
  const full = countWords(e.body) + countWords(top);
  return { skim: Math.max(1, Math.round(skim / WPM)), full: Math.max(1, Math.round(full / WPM)), hasDeeper: cut !== -1 };
}

/** Same id rule as SectionTitle.astro, so rail links match the headings. */
export const slugify = (s) => s.replace(/&[#\w]+;/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Skim sections (the "## " code-comment headings) and Go deeper entries, in page order.
export function outline(body) {
  const sections = [...body.matchAll(/^##\s+\/\*\s*(.+?)\s*\*\/\s*$/gm)].map((m) => ({ id: slugify(m[1]), label: m[1] }));
  const deeper = [...body.matchAll(/<GoDeeper\s+id="([^"]+)"\s+title="([^"]+)"/g)].map((m) => ({ id: m[1], label: m[2] }));
  return { sections, deeper };
}
