# talha.design rebuild · start here

> **Claude Code: read this file first.** It's the master brief for rebuilding talha.design: the new homepage, all 9 case studies, and their video loops. It says what to build, in what order, and where every other file fits. Begin with phase 0 and stop after every phase.

---

## 0. The files, and where they go

Put these in the repo before starting. `docs/` is never deployed; Astro only builds `src/` and `public/`.

| File | Goes in | What it is |
|---|---|---|
| `CASE_STUDIES_BRIEF.md` | `docs/` | **This file.** The order of work. |
| `HOMEPAGE_BRIEF.md` | `docs/` | The new homepage: design tokens, sections, motion. |
| `CASE_STUDY_SYSTEM.md` | `docs/` | The case-study system: Astro, schema, layouts, the 20 components, redirects, QA. |
| `SHOT_LIST.md` | `docs/` | Every video loop and image: which Figma frames, what moves, how long. |
| `CASE_STUDY_AUDIT.md` | `docs/` | Background: why the case studies changed. Read it once; nothing to build from it. |
| `LOOP_SCENES.md` | `docs/` | The scene format the loop renderer reads (phase 7). |
| `diagrams/` | `docs/` | SVG sources of the "before" diagrams, plus two optional diagrams Talha can choose to use. |
| `check-needs.mjs` · `skim-words.mjs` · `media-check.mjs` · `render-loop.mjs` · `lib-mdx.mjs` · `make-diagrams.py` · `README.md` | `scripts/` | **Already written and tested.** Use them as they are; don't rewrite them. The README lists the `package.json` lines to add. |
| `before-two-documents.webp` | `public/media/compliance-check/` | The first finished still (a diagram). |
| `*.checklist.md` (7 files) | `docs/checklists/` | Per case study: open questions, assumptions, media. For Talha, not for building. |
| `priced-offer.mdx` · `safety-report.mdx` · `compliance-check.mdx` · `hx-insight.mdx` · `training-record.mdx` · `snapgrid.mdx` · `hx-timer.mdx` · `hx-mobile.mdx` · `instructors.mdx` | `src/content/work/` | The 9 case studies. **Content, not code: never edit their words.** |

---

## 1. Ground rules (they apply to every phase)

1. **Branch `homepage-v3`.** Never push to `main` until Talha says so; Vercel deploys `main`. Commit at the end of each phase with a plain-English message.
2. **Stop after every phase.** Show screenshots at 1440px and 375px (light and dark where it matters), say what's done and what's next, and wait for an OK.
3. **Keep `docs/PROGRESS.md`.** After each phase, add three lines: what was done, what's waiting on Talha, and the Vercel preview link. Talha is new to git and terminals, so explain anything he needs to do in plain words.
4. **Never change content in the `.mdx` files.** Numbers, quotes, claims, caveats, alt text and British spelling ("organised", "colour") stay exactly as written. If something looks wrong, say so; don't fix it.
5. **Don't invent anything.** `<Need>` boxes mark facts only Talha can supply. Leave them. They show on previews and block only the production build (system §4.13).
6. **Fresh design.** Don't reuse the current site's components or styles. The reference site (astapable.com) is inspiration only: none of its assets, fonts, sounds or copy.
7. **Ask before installing anything system-wide** (ffmpeg, say). Give Talha the one command for his OS and wait.
8. **Old links must keep working.** Every `/work/<slug>.html` gets a permanent redirect to `/work/<slug>`.

---

## 2. The phases

| # | Phase | Follow | Done when |
|---|---|---|---|
| **0** | **Look and plan.** Inspect the repo, `vercel.json` and current pages. List every existing `/work/*.html`, every file under `/assets/`, and the stack. Confirm the plan in 5–8 bullets. Create the branch. | this file | Talha says OK |
| **1** | **Scaffold.** Astro + MDX, static output on Vercel; `Base.astro` with tokens, fonts, theme toggle, nav and footer shells; the `work` collection and schema; `[slug].astro`; redirects. Wire the provided scripts into `package.json` (`scripts/README.md`), including `prebuild` → `check-needs.mjs`. | System §1, §3, phase 1 · Homepage §2 | `npm run build` passes locally with an empty collection; redirects listed |
| **2** | **Case components.** All 20 components on `/work/_kit` with placeholder content. | System §4, §5 | Kit page screenshots in both themes |
| **3** | **The 9 case studies.** Add `priced-offer.mdx` first and render it for review. After OK, add the other 8. | System phases 3–4 | Every page renders, no schema errors, open `<Need>`s listed per page |
| **4** | **Homepage structure.** Skeleton, Featured Work and Apps reading from the collection, Approach, Kind Words, CTA. | Homepage phases 1–2 | Screenshots; cards link to the new pages |
| **5** | **Motion.** Scramble, cursor label, reveals and hero intro on the homepage; fade-ups, cursor labels and Go deeper animation on case pages. | Homepage phase 3 · System §5 | Reduced-motion check passes |
| **6** | **Footer, extras, polish.** Clock, logos, version line, optional player and sounds; responsive pass; a11y; Lighthouse. | Homepage phases 5–6 | Both acceptance lists (homepage §8, system phase 6) pass, except media |
| **7** | **Loops.** Install the renderer's two tools, write a scene file per loop from the Figma frames, render the pilot, then the rest in batches. | Section 3 below · `SHOT_LIST.md` · `LOOP_SCENES.md` | `npm run media:check` clean; media review page approved |
| **8** | **Ready to merge.** Run the full QA again, then report: every remaining `<Need>` by page, every placeholder asset, and any social preview image whose text no longer matches its page. | System phase 6 | Talha answers the remaining questions and says merge |

---

## 3. Phase 7 · the loop renderer

The 37 loops in `SHOT_LIST.md` are made from Talha's Figma frames, not screen recordings.

### 3.1 Inputs

- **The Figma connection.** If the Figma tools aren't available in this session, stop and tell Talha he needs to connect Figma to Claude Code. Don't guess at menu paths.
- **The file.** Talha gives a Figma file link with a page called `Portfolio loops`.
  - One Section per loop, named `<slug>/<name>` (for example `priced-offer/send-checklist`).
  - Frames inside named `01`, `02`, … in order, all the same size.
  - Layers that should move on their own are named `move:<what>` (for example `move:checklist`).
- **What each loop shows.** Read the "Frames" and "What moves" columns of `SHOT_LIST.md` for each loop.

### 3.2 Make each loop

The renderer is already written and tested: `scripts/render-loop.mjs`. The scene format is in `docs/LOOP_SCENES.md`. Don't rewrite either; if something is missing, extend the renderer and say what changed.

1. **Install the two tools** the renderer needs:
   - Playwright: `npm i -D playwright`, then `npx playwright install chromium`.
   - ffmpeg: ask Talha first, and give him the one command for his OS.
2. **Pull the frames.** For a Section, read its structure (frames, `move:` layers, their positions), then export each frame and each `move:` layer as PNG at 2x into `media-src/<slug>/<name>/`. Add `media-src/` to `.gitignore`, because source frames don't ship.
3. **Write `scene.json`.** Base it on the shot list's "What moves" column, using the real layer coordinates from Figma. **Only use states that exist as frames.** If the shot list asks for a state with no frame, skip that step and list it for Talha. Never draw UI that isn't in Figma.
4. **Render and review.** Run `npm run loop -- <slug>/<name>`. The output goes to `public/media/<slug>/<name>.mp4` and `.webp`, and those names already match the `.mdx` files. Before showing Talha, check the result yourself: watch the MP4, or pull a contact sheet of 6–8 frames with ffmpeg, and confirm the cursor lands on the right things.

### 3.3 Order and review

1. **Pilot:** `priced-offer/send-checklist`. Show it and wait. Talha approves the motion style before anything else is made.
2. **The 6 covers.** They also fill the homepage's Featured Work grid.
3. **The other 22 Priority 1 loops,** one case study per batch.
4. **The 12 Priority 2 loops** (the app pages).

After each batch, update a review page at `/work/_media` (noindex, not linked) showing every loop with its name, length and file size, and run `npm run media:check`.

### 3.4 Stills

- **Diagrams are already drawn.**
  - `compliance-check/before-two-documents.webp` is in place.
  - `before-three-tools` (SMS) and `before-email-sheets` (HX Insight) are ready in `docs/diagrams/options/` and go live only if Talha chooses them.
  - Re-export all three once the site font is installed (`docs/diagrams/README.md`).
- **Real screens Talha supplies** are never altered beyond what he asked for. The one exception is the five numbered callouts on `priced-offer/before-annotated.webp`, which he asked for.

---

## 4. What only Talha can do

Claude Code should keep this list current in `docs/PROGRESS.md`, ticking items off as they arrive.

- [x] **Answer the open questions.** All done on 12 Nov; see `docs/checklists/ANSWERS.md`. `npm run check:needs` passes.
- [ ] **The Figma file** with the `Portfolio loops` page, prepared as in `SHOT_LIST.md` §2.
- [ ] **Stills:** only the redacted original offer page is left (`priced-offer/before-annotated.webp`). The other stills are drawn diagrams, already in `public/media/`.
- [ ] **Homepage assets** (`HOMEPAGE_BRIEF.md` §7): the hero video or the Three.js fallback, company logos, app icons and colours, the calendar link, and the font choice.
- [ ] **Check the social preview images** in `/assets/og/`. Some may still say things the pages no longer claim (for example "halved" on the offer page, or "replacing" on the compliance check).

---

## 5. How Talha drives this

Say these to Claude Code, one at a time, and wait for each phase to finish:

1. "Read `docs/CASE_STUDIES_BRIEF.md` and do phase 0."
2. "Looks good, do phase 1." (and so on through phase 6)
3. "Here's my Figma file: ‹link›. Do phase 7, pilot loop only."
4. "Approved. Make the 6 covers." Then "Next batch: ‹case study›."
5. "Do phase 8."
6. When every question is answered: "Merge `homepage-v3` into `main`." This is the only step that changes the live site.
