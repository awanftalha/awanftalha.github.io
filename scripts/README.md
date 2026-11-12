# scripts/

Tested helper scripts for the case studies. They need no dependencies, except `render-loop.mjs`, which needs Playwright and ffmpeg.

Add these to `package.json`:

```json
"scripts": {
  "prebuild": "node scripts/check-needs.mjs",
  "check:needs": "node scripts/check-needs.mjs",
  "check:skim": "node scripts/skim-words.mjs",
  "media:check": "node scripts/media-check.mjs",
  "loop": "node scripts/render-loop.mjs"
}
```

and this line to `.gitignore`:

```
media-src/
```

| Script | What it does | Fails when |
|---|---|---|
| `check-needs.mjs` | Lists every open `<Need>` by file, id and line | Production builds (`VERCEL_ENV=production` or `--strict`) while any remain. Preview builds only warn. |
| `skim-words.mjs` | Prints the skim-layer and full word counts and both reading times per case study | Only with `--strict`, if a page's skim layer is over 700 words |
| `media-check.mjs` | Checks every image and loop the pages reference: existing posters present, loops ≤ 2 MB, each loop has its `.webp` poster | A missing existing asset or an oversized loop. Loops not made yet are listed, not errors. |
| `render-loop.mjs` | Renders one loop from Figma frames (see `docs/LOOP_SCENES.md`) | A bad scene file, missing frames, or a loop that won't fit in 2 MB |

All four read `src/content/work/*.mdx` and must be run from the repo root.
