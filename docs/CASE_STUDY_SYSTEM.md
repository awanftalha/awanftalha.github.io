# Case study system · spec for Claude Code

> This is Step 2 of the case-study rebuild. It sits alongside `HOMEPAGE_BRIEF.md` and uses the same tokens, type, motion and nav/footer. Read both before starting.
> The case study content itself arrives separately as `.mdx` files (one per case study). This spec only covers the **system** that renders them: the stack, schema, layouts and components.

---

## 0. Ground rules

1. **Look before building.** Inspect the repo and the existing `vercel.json`, and tell me in 5–8 bullets what you found and what you'll change. Wait for my OK.
2. **Work on the same branch as the homepage rebuild** (`homepage-v3`). Never push to `main` until I say so. Vercel deploys `main`.
3. **Nothing goes live until all 9 case studies are migrated.** Review everything on the Vercel preview link for the branch.
4. **Content is not yours to change.** Never edit numbers, quotes, research claims, caveats or attributions in the `.mdx` files. If something looks wrong, tell me; don't fix it. Keep my British spelling ("organised", "colour").
5. **Don't invent anything.** Anywhere content is missing, the `.mdx` files contain a `<Need>` placeholder. Leave it there. The production build must fail while any remain, but preview builds must still succeed (see 4.13).
6. **Stop after each phase in section 8**, show me screenshots at 1440px and 375px, and wait.

---

## 1. Stack and structure

- **Astro** (current stable version), static output, deployed on Vercel as now. Use **MDX** through `@astrojs/mdx`.
- GSAP, ScrollTrigger and CustomEase as in the homepage brief. No other animation library.
- The homepage from `HOMEPAGE_BRIEF.md` becomes `src/pages/index.astro`. Its project cards and app cards **read from the case study collection**, so titles, one-liners, tags and covers have exactly one source.

```
src/
  content/
    work/                     ← one .mdx per case study (supplied by me)
      priced-offer.mdx
      compliance-check.mdx
      training-record.mdx
      instructors.mdx
      safety-report.mdx
      hx-insight.mdx
      snapgrid.mdx
      hx-timer.mdx
      hx-mobile.mdx
  content.config.ts           ← collection + schema (section 3)
  layouts/
    Base.astro                ← head, nav, footer, theme, cursor (shared with homepage)
    CaseLayout.astro          ← format: "case"
    AppLayout.astro           ← format: "app"
  components/case/            ← section 4
  pages/
    index.astro
    work/[slug].astro         ← renders a collection entry with its layout
    work/_kit.astro           ← component test page, noindex, not linked anywhere
public/
  assets/                     ← keep everything that exists today (og/, work/, testimonials/, resume PDF)
  media/<slug>/               ← NEW video loops and before/after images (named in SHOT_LIST.md)
```

### URLs (must not break)

- Keep the existing slugs exactly as they are: `priced-offer`, `compliance-check`, `training-record`, `instructors`, `safety-report`, `hx-insight`, `snapgrid`, `hx-timer`, `hx-mobile`.
- New pages live at `/work/<slug>`. Check how the current `vercel.json` handles clean URLs and trailing slashes, and keep that behaviour.
- Add permanent redirects from every old `/work/<slug>.html` to `/work/<slug>`.
- Set canonical URLs from the slug. Keep the existing OG images at `/assets/og/<slug>.png`.

---

## 2. The two formats

### 2.1 `format: "case"` (two-speed page)

Everything above the first **Go deeper** is the *skim layer*, which should take about 2 minutes. The rest is collapsed by default.

```
[Eyebrow chips]          NGFT OPS · Dispatch · Shipped
[H1]                     one sentence
[Intro]                  ≤ 45 words
[Meta row]               Role · Team · Timeline · Research · Status · Updated
[Cover]                  <Loop> or image, wide
[Summary]                4 cards: Problem / My role / What changed / Result   (from frontmatter)
[Stats]                  3–4 tiles with a source label                        (from frontmatter)
/* Before and after */   <BeforeAfter>
/* What we found */      optional, ≤ 100 words: the one research finding the design rests on
/* Key decisions */      3 × <Decision> (each with a loop or image)
/* How I prototyped it */ optional <Decision>-style block
/* Outcome */            claim + mechanism, ≤ 120 words, optional <Claims>
/* Reflection */         one or two sentences
— Go deeper —            <GoDeeper> × n   (research, diagnosis, states, system, validation, full reflection, full screen set)
[Series nav]             only if part of a series
[CTA + Next case study]
```

- Show reading time as two numbers in the meta row: **"2 min skim · 12 min full"**. Compute them at build time (220 words per minute).
- **Desktop (≥1200px):** a slim sticky contents rail on the left listing the skim sections, then "Go deeper (n)". Clicking a Go deeper entry opens that section and scrolls to it. No rail on mobile.

### 2.2 `format: "app"` (short page)

```
[Eyebrow] [H1] [Intro] [Meta row: Role · Platform · People · Status · Updated]
[Device strip]           horizontal, scroll-snap strip of the key screens in device frames
[Summary]                4 cards
[Stats]                  optional, 2–4 tiles
/* Key moments */        3 × <Decision> with loops (tablet/phone frames)
[Day timeline]           optional <Timeline> (e.g. HX Timer's "Zain's day")
/* Where it stands */    status + what's next
— Go deeper —            optional
[Series nav] [CTA + Next]
```

---

## 3. Frontmatter schema

Validate everything with Zod in `src/content.config.ts` (adjust imports to the installed Astro version). The build fails on a missing or invalid field.

```ts
// sketch — adapt to the Astro version in the repo
const stat = z.object({
  value: z.string(),                      // "~50%", "30–40 → 10–12"
  label: z.string(),
  source: z.enum(["measured", "logged", "reported", "combined", "derived", "count"]),
  note: z.string().optional(),            // shown on hover/tap
});

const work = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),                    // the ONE title: H1, OG title, homepage card, next-link
    format: z.enum(["case", "app"]),
    order: z.number(),                    // homepage + next-link order
    featured: z.boolean(),                // true → homepage Featured Work grid; false → Apps section
    company: z.string(),                  // "NGFT", "HX Insight · Punjab Group", "SnapGrid"
    eyebrow: z.array(z.string()),         // chips
    intro: z.string(),
    oneLiner: z.string(),                 // homepage card description
    tags: z.array(z.string()),            // homepage card chips
    meta: z.object({
      role: z.string(),
      team: z.string().optional(),
      timeline: z.string().optional(),
      research: z.string().optional(),
      platform: z.string().optional(),
      people: z.string().optional(),
    }),
    status: z.enum(["shipped", "beta", "trial", "concept", "in-use"]),
    statusNote: z.string().optional(),    // "Live in beta at 8 operators"
    statusAsOf: z.coerce.date(),          // shown as "Status as of Nov 2026"
    updated: z.coerce.date(),
    cover: z.object({ video: z.string().optional(), poster: z.string(), alt: z.string() }),
    summary: z.object({ problem: z.string(), role: z.string(), changed: z.string(), result: z.string() }),
    stats: z.array(stat).max(4),
    series: z.object({ name: z.string(), part: z.number(), of: z.number() }).optional(),
    next: z.string(),                     // slug of the next case study
    nda: z.boolean().default(false),
    seo: z.object({ description: z.string(), ogImage: z.string() }),
  }),
});
```

- **Next-case links are generated** from `next` and the target's own `title` and `eyebrow`, never typed by hand. This fixes the mislabelled links on the current site.
- **Series nav is generated** from every entry sharing a `series.name`.

---

## 4. Components (`src/components/case/`, all usable in MDX)

Make every component below available inside the `.mdx` files **without imports** (pass them through the `components` prop when rendering the entry), because the content files I supply don't import anything.

All components follow the homepage tokens: one typeface, `--title-ghost` code-comment section titles (`/* Key decisions */`), 4px radius on media, no colour except what's in the media.

| # | Component | Props | Behaviour |
|---|---|---|---|
| 4.1 | `<Summary>` | from frontmatter | 4 cards in a row (2×2 at tablet, stacked on mobile). Labels: Problem, My role, What changed, Result. |
| 4.2 | `<Stats>` | from frontmatter | 3–4 tiles: big value (38px/600), label (300), and a **small source label** (Measured · Logged · Reported · System + reported · Arithmetic · Count) in `--text-muted`. `note` opens in a small popover on hover or tap. |
| 4.3 | `<BeforeAfter before after beforeAlt afterAlt caption mode="slider\|stack">` | | `slider`: a drag handle reveals before/after. Keyboard accessible (it's an `<input type="range">` underneath), cursor label shows "Drag". Below 768px it always stacks, labelled BEFORE / AFTER. **If one of the two files doesn't exist yet, render the other on its own with the caption** (and log a warning in dev), so pages work before every asset is made. |
| 4.4 | `<Loop src poster alt posterAlt caption device="none\|desktop\|tablet\|phone" ratio>` | | A muted, autoplaying, looping, `playsinline` video that **only plays while ≥40% visible** (IntersectionObserver) and pauses otherwise. `preload="none"` with the poster shown first. **If `src` is missing or the file doesn't exist, render the poster image alone, using `posterAlt`** (the video's `alt` describes a recording that doesn't exist yet), so pages work before the recordings exist and screen readers hear what's actually shown. **When the video exists, use its matching first-frame poster** (same path, `.webp` instead of `.mp4`) if that file exists, so the poster and the first video frame are identical; otherwise fall back to `poster`. The same applies to `cover.video` in frontmatter. With `prefers-reduced-motion`, show the poster with a small play button. Optional device frame drawn in CSS (no image frames). |
| 4.5 | `<Decision n title>` children, media passed as a child with `slot="media"` | | Numbered block: `01` in muted text, title (24px/600), body (≤ 60 words) on the left; media (a `<Loop>` or image) on the right, about 60% width. Alternate sides on desktop, stack on mobile. Fades up 20px when it enters view. |
| 4.6 | `<Quote by note>` children | | Large 22px/300 quote, attribution below. `note` renders in italic muted text (for "Paraphrased, not verbatim" notes). Keep the note visible; never hide it. |
| 4.7 | `<Moment time title src alt>` children (`time` optional; no chip when absent) (`src` may be an image or an `.mp4`; video plays as a `<Loop>`) | | A step in a timestamped story (HX Insight, SnapGrid, HX Timer). `time` is shown in a mono-style chip. Several in a row become a horizontal scroll-snap strip with a progress line. |
| 4.8 | `<Timeline>` + `<Moment>` | | A compact vertical day timeline for app pages. |
| 4.9 | `<States>` + `<State title src alt>` children (`src` image or `.mp4`) | | A grid of failure/edge states (3 columns desktop, 1 mobile). Each card: media, title, 1–2 lines. Clicking opens the lightbox (4.12). |
| 4.10 | `<GoDeeper id title summary>` children | | Built on native `<details>/<summary>` so it works without JS. The closed row shows a `+` icon, the title, a one-line summary and "x min". Opening animates height (0.4s, "main" ease). Deep links: visiting `#<id>` opens it. Print styles open all. An "Expand all" text button appears above the first one. |
| 4.11 | `<Claims>` with `<Claim kind="can\|cannot">` | | A two-column "What I can claim / What I can't yet" block. |
| 4.12 | `<Gallery>` + `<Figure src alt caption>` | | The full screen set as a grid. Opens an accessible lightbox (focus trapped, Esc closes, arrow keys move between images, captions shown). |
| 4.13 | `<Need id>` children | | A placeholder for missing facts. **In dev:** a bright outlined box showing "⟨NEED {id}⟩ …". **In production builds (`VERCEL_ENV=production`, i.e. `main`), the build fails** and lists every remaining `<Need>` with its file and id (provided: `scripts/check-needs.mjs`, wired as `prebuild`). **On preview builds and locally it only warns**, and the boxes stay visible, so I can review drafts on the branch's preview link. |
| 4.14 | `<SeriesNav>` | auto | "Part 1 of 2 · Training (web) → Part 2 · Instructor's Tablet", shown under the meta row and again at the end. |
| 4.15 | `<Snapshot>` | | For NDA work: "This is a snapshot. Ask me for the full walkthrough", plus an Email button. Used when `nda: true`. |
| 4.16 | `<Note>` children | | A small muted aside for arithmetic or method notes ("Arithmetic from the two figures above"). |
| 4.17 | Markdown tables | | Styled automatically: 12.5px text, 1px rows, no zebra striping. Horizontal scroll inside the table on mobile, never on the page. |
| 4.18 | `<Figure>` | `src alt caption wide` | Image with caption. `alt` is required (TypeScript error without it). `wide` breaks out to the media width. |
| 4.19 | `<DeviceStrip device="phone\|tablet\|desktop">` + `<Figure>` children | | The app-page device strip: a horizontal scroll-snap row of screens, each in a CSS device frame, caption under each. Arrow buttons on desktop, swipe on touch, keyboard scrollable. Clicking a screen opens the lightbox (4.12). |
| 4.20 | `<Link>`-style cross-reference | plain Markdown links | Links to another case study are written as `/work/<slug>` (for example `/work/training-record#research`). Check at build time that every such link points to an existing slug and, if it has a `#`, to an existing `<GoDeeper id>`. |

---

## 5. Layout and visual rules

- **Widths:** body text max 62ch (about 640px); media up to 1200px; the cover is full width inside the 20px page gutters.
- **Spacing:** sections are 120px apart in the skim layer and 64px apart inside Go deeper.
- **Section titles** use the homepage's code-comment style in `--title-ghost`, 38px/600. Headings inside Go deeper use 24px/600 instead.
- **Meta row:** label in `--text-muted` 12.5px, value 12.5px/600, wrapping onto two lines on mobile.
- **Go deeper rows** look like a quiet list: a 1px top border, `+` on the left, the title, then the summary in muted text, and the reading time right-aligned.
- **Both themes** (light and dark) must look intentional. Screenshots and posters get a 1px `--border` so light UI screenshots don't melt into a light background.
- **Cursor label** (from the homepage): "Play" over a paused loop, "Drag" over BeforeAfter, "Open" over gallery images, "View {title} ›" on the next-case link.
- **Motion budget:** fade-up on Decisions and section titles only. No scramble on body text, no parallax, no pinned scroll.

---

## 6. Media rules

- **New files** go in `public/media/<slug>/`, named exactly as in `SHOT_LIST.md`. **Existing screenshots** stay where they are (`/assets/work/<slug>/`) and are used as posters until the loops exist.
- **Loops:** MP4 (H.264), optionally plus WebM, no audio track, max 1440px wide, 5–15 seconds, **≤ 2 MB each**. `npm run media:check` (provided: `scripts/media-check.mjs`) lists any loop over 2 MB, any missing poster, and which loops aren't made yet.
- If total media grows past about 200 MB, tell me, and we'll move the videos to a video CDN instead of the repo.

---

## 7. Accessibility, SEO and performance

- Every image needs `alt`. Keep the existing alt text from the current pages, which is already good.
- Videos are decorative loops: give them `aria-label` from `alt`. Use no controls except the reduced-motion play button.
- Keep focus visible everywhere. `<details>` must stay keyboard-operable. The lightbox traps focus.
- `<title>` and OG title come from `title`; the description comes from `seo.description`.
- Targets for every case page: Lighthouse Performance ≥ 90, Accessibility ≥ 95, no layout shift from media (always set width/height or aspect ratio).

---

## 8. Build phases (stop and show me after each)

1. **Scaffold:** Astro + MDX, `Base.astro` sharing the nav, footer and tokens with the homepage, the `work` collection and schema, `[slug].astro` routing, redirects. No content yet.
2. **Components:** build every component in section 4 and show them all on `/work/_kit` using placeholder content, in both themes, at 1440px and 375px.
3. **Pilot:** drop in `priced-offer.mdx` (supplied after Step 3) and render it. I review before anything else.
4. **The other eight:** add the remaining `.mdx` files as I supply them. Check each renders with no schema errors.
5. **Homepage wiring:** the homepage cards and app cards read from the collection (`featured`, `order`, `title`, `oneLiner`, `tags`, `cover`).
6. **QA pass**, all of which must pass before I merge:
   - [ ] Every old `/work/*.html` URL redirects to its new page (list them with status codes).
   - [ ] Every internal link resolves; the next-case and series links are correct.
   - [ ] The production build passes with **zero `<Need>`** left, or you list exactly which remain.
   - [ ] `npm run check:skim` (provided: `scripts/skim-words.mjs`) shows every case page's **skim layer** under 700 words.
   - [ ] `npm run media:check` is clean.
   - [ ] Lighthouse targets met on 3 sample pages; reduced motion checked; print view checked (Go deeper opens).
   - [ ] Light and dark screenshots of one case page and one app page.
