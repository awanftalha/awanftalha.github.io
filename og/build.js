#!/usr/bin/env node
/* Renders og/template.html to assets/og/<slug>.png at 1200x627, one per page.
   Needs the site served locally (the template reads ../css/tokens.css) and
   headless Chrome. Usage: node og/build.js http://127.0.0.1:4199 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ORIGIN = process.argv[2] || 'http://127.0.0.1:4199';
const CHROME = process.env.CHROME ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = path.join(__dirname, '..');
const covers = JSON.parse(fs.readFileSync(path.join(__dirname, 'covers.json'), 'utf8'));
const outDir = path.join(root, 'assets', 'og');
fs.mkdirSync(outDir, { recursive: true });

for (const [slug, c] of Object.entries(covers)) {
  const q = new URLSearchParams({ label: c.label, title: c.title, metric: c.metric });
  const url = `${ORIGIN}/og/template.html?${q}`;
  const out = path.join(outDir, `${slug}.png`);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,627',
    '--virtual-time-budget=4000',
    `--screenshot=${out}`,
    url,
  ], { stdio: 'ignore' });
  const { size } = fs.statSync(out);
  console.log(`${slug}.png  ${(size / 1024).toFixed(0)} KB`);
}
