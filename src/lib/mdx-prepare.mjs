// A Vite step that tidies each .mdx in memory just before Astro compiles it.
// The files on disk are never changed, and no wording is touched: it only
// adds wrappers and checks links.
//  1. Two or more consecutive <Moment> blocks (outside a <Timeline>) are
//     wrapped in <MomentStrip>, so they become one scroll-snap strip.
//  2. A <DeeperIntro> (the "Go deeper" divider + "Expand all") goes before
//     the first <GoDeeper>.
//  3. Every link to /work/<slug> must point at an existing case study, and a
//     #hash must match a <GoDeeper id> there. Otherwise the build stops,
//     naming the file and link.
import fs from 'node:fs';
import path from 'node:path';

const WORK = path.resolve('src/content/work');
const ATTRS = String.raw`(?:"[^"]*"|\{[^}]*\}|[^>"{])*`;
const MOMENT = String.raw`<Moment\b${ATTRS}(?:\/>|>[\s\S]*?<\/Moment>)`;
const RUN = new RegExp(String.raw`(?:${MOMENT}\s*){2,}`, 'g');
const TIMELINE = /<Timeline\b[\s\S]*?<\/Timeline>/g;

function checkLinks(body, file) {
  const bad = [];
  for (const m of body.matchAll(/\]\((\/work\/[^)\s]+)\)/g)) {
    const url = m[1];
    const [p, hash] = url.slice('/work/'.length).split('#');
    const slug = p.replace(/\.html$/, '').replace(/\/$/, '');
    const target = path.join(WORK, `${slug}.mdx`);
    if (!fs.existsSync(target)) bad.push(`${url}  (no case study "${slug}")`);
    else if (hash && !fs.readFileSync(target, 'utf8').includes(`<GoDeeper id="${hash}"`)) {
      bad.push(`${url}  (no <GoDeeper id="${hash}"> in ${slug}.mdx)`);
    }
  }
  if (bad.length) throw new Error(`Broken case-study link(s) in ${path.basename(file)}:\n  ${bad.join('\n  ')}`);
}

export function prepare(code, file) {
  let front = '';
  let body = code;
  if (code.startsWith('---')) {
    const end = code.indexOf('\n---', 3);
    if (end !== -1) {
      front = code.slice(0, end + 4);
      body = code.slice(end + 4);
    }
  }
  checkLinks(body, file);

  // Keep Timelines as they are while wrapping runs of Moments elsewhere.
  const kept = [];
  body = body.replace(TIMELINE, (t) => `\u0000TL${kept.push(t) - 1}\u0000`);
  body = body.replace(RUN, (run) => `\n<MomentStrip>\n${run.trim()}\n</MomentStrip>\n\n`);
  body = body.replace(/\u0000TL(\d+)\u0000/g, (_, i) => kept[+i]);

  const count = (body.match(/<GoDeeper\b/g) || []).length;
  if (count) body = body.replace(/<GoDeeper\b/, `<DeeperIntro count="${count}" />\n\n<GoDeeper`);

  // App pages: the summary cards and stats follow the device strip (§2.2).
  if (/^format:\s*["']?app["']?\s*$/m.test(front)) {
    const slug = path.basename(file, '.mdx');
    const intro = `\n\n<AppIntro slug="${slug}" />\n\n`;
    body = body.includes('</DeviceStrip>') ? body.replace('</DeviceStrip>', `</DeviceStrip>${intro}`) : intro + body;
  }

  return front + body;
}

export default function mdxPrepare() {
  return {
    name: 'mdx-prepare',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.mdx')) return null;
      return { code: prepare(code, file), map: null };
    },
  };
}
