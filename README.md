# Talha Farooq Awan — Portfolio

The homepage is a plain HTML file (`public/index.html` + `public/home/`). The case studies
are built with **Astro** from the `.mdx` files in `src/content/work/` (spec:
`docs/CASE_STUDY_SYSTEM.md`). Astro copies everything in `public/` into the site untouched,
so the homepage is exactly as written. Vercel runs `npm run build` and serves `dist/`, with
clean URLs: `/work/priced-offer.html` permanently redirects to `/work/priced-offer`.

## Run it

```bash
npm install
```

once, then

```bash
npm run dev
```

and open the address it prints (usually <http://localhost:4321>). `npm run build` makes the
finished site in `dist/`; it first runs `check:needs`, which stops a production build while
any `<Need>` placeholder is left.

Other checks: `npm run check:skim` (skim-layer word counts), `npm run media:check` (posters,
loop sizes, loops still to make).

## Structure

```
public/index.html     Homepage v3 (paths below under public/home/)
home/css/tokens.css   Homepage tokens: colour (light + dark), type, space, radius, motion
home/css/home.css     Homepage layout and components
home/css/covers.css   The six coded project covers
home/js/*.js          One module per behaviour, started from main.js:
                      theme, nav (scaling menu), clock, pockets (app cards), scramble,
                      cursor (label), reveal (intro + scroll), covers, orb (hero),
                      motion (GSAP + the "main" ease)
home/fonts/           General Sans 300 and 600 (Fontshare, self-hosted)
public/assets/        Resume, OG images, portrait, testimonial photos, project screens
public/media/<slug>/  New loops and before/after images (named in docs/SHOT_LIST.md)
src/content/work/     The nine case studies (.mdx) — content, not to be edited by code
src/content.config.ts Collection + schema
src/layouts/          Base.astro (the homepage's head, nav, footer, scripts)
src/components/site/  Nav, footer and icons, copied from the homepage
src/pages/work/       [slug].astro: one page per case study at /work/<slug>
scripts/              check-needs, skim-words, media-check, render-loop
docs/                 Briefs, checklists, shot list, diagrams
og/                   Share-card generator for assets/og/*.png (not deployed)
```

## Homepage (v3)

- Libraries load from jsDelivr at pinned versions: GSAP 3.15.1 with CustomEase,
  ScrollTrigger, SplitText and ScrambleTextPlugin (in `<head>`).
- Every animation is skipped under `prefers-reduced-motion`, and if GSAP fails to load: the
  page then shows everything as is.
- Behaviours start from data attributes: `data-scramble="load"`, `data-scramble-hover`,
  `data-scramble="loop" data-scramble-words="a|b|c"`, `data-cursor-text`, `data-pocket`,
  `data-reveal`, `data-cover`, `data-orb`.
- Anchors the case studies link back to: `#work`, `#approach`, `#about` (the footer) and
  `#contact` (the CTA). `#apps` and `#testimonials` also exist.
- **Covers:** each project's cover is a coded scene in `home/css/covers.css`, played by
  `home/js/covers.js`. The markup is the finished frame; the script plays the story up to it.
- **Section titles** use `#929292` (light) / `#5F5F5F` (dark) instead of the brief's ghost
  greys, which fail the 3:1 contrast large text needs.

### Still placeholders

| What | Where it goes |
| --- | --- |
| Company logo SVGs (NGFT, Punjab Group, Decklaration, TenX, Toptal) | `.footer__logos`, use `currentColor` |
| Booking link | "Book a call" `href="#book"` in the CTA |
| App icon tiles and gradient colours | the three `.pocket` cards (`--app-a`, `--app-b`) |
| Version line date | footer, "v.3.0 · Updated …" (typed by hand) |

## Case studies

`work/` holds one page per Home card. The Home cards link to them. Every page is built
from its NGFT_design frame, with all copy as written there.

| Page                          | Figma frame                  | Hero                 |
| ----------------------------- | ---------------------------- | -------------------- |
| `work/priced-offer.html`      | Offer page                   | added                |
| `work/compliance-check.html`  | Manual compliance check      | added                |
| `work/safety-report.html`     | SMS safety manager flow      | added                |
| `work/instructors.html`       | Instructor tablet app        | three screens, added |
| `work/training-record.html`   | Training management          | added                |

### Long-form case studies

All five share one layout: header, hero, then a sticky side nav beside numbered
sections. Pages end on their last section, then the footer: the "Next case study" card
and the side nav's next link were removed from every page (2026-10-05).

**Hero screen.** Every page has its hero, at `assets/work/<page>/hero.png`, and it's
click-to-enlarge on its own. Each is the screen inside the Figma frame named `img/hero —
…`, exported at 2x without the frame (so without its drop shadow): compliance check
571:8072 (Check 10, the manual revised mid-review) and safety report 581:10139 (Screen
12, ECCAIRS all decided), in NGFT_design.

In Figma the hero sits 80px down a 760-tall panel that crops it, so only its top 680px
ever shows, and Figma's export returns just that: 2240 × 1360. On the page the `<img>`
has the class `slot__img--top` and that real height, so it keeps its own height at the
top instead of being stretched to fill the taller slot.

Known gap: the hero drifts up to 40px as its panel crosses the viewport (CSS scroll
timeline). With a 680-tall image, that lift shows a strip of the empty slot under the
screen (about 21px with the hero in view, 31px mid-scroll). Figma's read-only exports all
crop to the visible 680, so a full-height (2240 × 1593) export needs the screen copied
outside its panel first. Swap that in, keep `slot__img--top` and set `height="1593"`, and
the drift shows real screen.

**Screens in the sections** are exported from the Figma frames into
`assets/work/<page>/`. The large ones are 2x (1928 wide) and the tablet screens 2x
(840 wide). The small grid screens exist in Figma only at thumbnail size, so they're
exported at 4x: 1848 wide on the compliance check, 844 wide on the safety report and
training management. Every screen opens in a full-size lightbox on click, Enter or
Space.

**Screen sets.** Screens that share a `data-zoom-group` value page through together: the
lightbox shows previous / next buttons and an "N of M" counter, and the arrow keys move.
Each page's grid is one set (the compliance check's six flow screens, the safety
report's four states, the instructors' seven screens, training management's sixteen).
A grid can set its own entrance gap with `data-stagger` (training management uses 40ms).

**Side nav.** It's written by hand: each link's `href` must match a section's `id`, and
the section's heading needs `tabindex="-1"` so a click can move focus to it. Below
1024px the same list becomes a chip bar under the Nav.

### The case study template

No page uses the Figma *Case study template* any more; each was rebuilt from its
NGFT_design frame. Its styles (C-codes) are still in `styles.css` and `motion.css` in
case a future case study starts from it. What follows describes that template.

**Placeholder copy** is in square brackets, e.g. `[Your role]`, and carries a
`data-todo` attribute that greys it out on the page so you can spot what's left. Search
for `data-todo` and replace each bracketed text. Delete the attribute as you go.

**Screens** work like Home: each slot has a commented-out `<img>` with a suggested path
under `assets/work/<slug>/`.

| Slot                 | Export (2x)  | Notes                                                        |
| -------------------- | ------------ | ------------------------------------------------------------ |
| Hero                 | 2240 × 1520  | Figma labels it 2240x1400, but the frame is 1120 × 760; a 1400-tall export gets its sides trimmed |
| Before               | 1656 × 1040  |                                                              |
| Step 01–05           | 1240 × 1120  | Don't add `loading="lazy"`; all five preload, per the notes  |
| State                | 1320 × 800   |                                                              |

**Changing the shape of a page.** Sections are independent: delete one and its motion
goes with it. The stepper takes any number of steps, but keep the tab, screen and caption
counts equal. Give each new tab the next `id="step-N"`. The first tab needs
`aria-selected="true"` and `tabindex="0"`, and the first screen and caption need
`is-active`. The states grid takes pairs in `.states__row`; the outcome grid holds
four columns. A number counts up if you wrap it as
`<span class="count" data-count="N">N</span>`. An ink state marker
(`state__marker--ink`) means a system failure; accent is everything else.

**Hero panel colour** follows each project's Home card: tint, sunken, inverse or
surface (`panel--*` on `.cs-hero__panel`).

## Motion system

The build notes refer to codes S1–S12 and tokens such as `--dur-slow`, defined on a
"Foundations > Motion system" page. **That page isn't in the Figma file.** The layer
annotations fully define S1–S3; I defined the rest here to match how the notes use
them. Change a token in `css/tokens.css` and both the CSS and the JS timelines follow.

| Code | What it does                                                             | Source             |
| ---- | ------------------------------------------------------------------------ | ------------------ |
| S1   | Primary button: arrow nudges (2, −2), press scales to 0.98, accent focus ring | Figma annotation |
| S2   | Secondary button: fills ink, label and arrow flip to ink-inverse, arrow nudges | Figma annotation |
| S3   | Text link: underline goes ink to accent, offset 3px to 5px               | Figma annotation   |
| S4   | Nav link: 1px underline draws in from the left                           | defined here       |
| S5   | Sticky nav: frosts once the page scrolls                                 | defined here       |
| S6   | Enter: fade up 16px                                                      | defined here       |
| S7   | Card enter: panel rises 40px; the screen inside settles 80ms behind it   | defined here       |
| S8   | Card hover: screen lifts 8px with a deeper shadow; title underline       | defined here       |
| S9   | Rule: draws left to right                                                | defined here       |
| S10  | Count: 0 to the number, cubic ease-out                                   | defined here       |
| S11  | Word rise: each word rises out of a mask; the accent word turns accent 200ms after it lands | defined here |
| S12  | Reduced motion: no entrances, count-ups or parallax; the stepper swap fades without sliding | defined here |

The case study notes (C1–C10) also define their own motion in full, built as written:
the back link's arrow nudge, the hero's scroll-linked parallax, sticky section heads, the
stepper's active bar and swap, and the state markers.
The parallax uses CSS `animation-timeline: view()`, which is in Chrome and Safari 26 but
not yet Firefox. Per the notes there's no JS fallback, so those browsers just don't get it.

The two long-form pages follow their own build notes in NGFT_design: CS1–CS10 for the
offer page, MC1–MC14 for the compliance check. Each section's HTML comment names its
code. On top of the offer page's motion, the compliance check adds:

- MC6: the numbers tiles fade up row by row; 10, 5, 4, 15, 1 and 2 count up, while
  "5–6" and "Zero" only fade
- MC7: the pull quote and method callout's accent bar draws top to bottom, the text
  rises once it's halfway, then the source line fades in
- MC8: each of the five steps draws its rule, then number, title and body rise; the
  Step 04 screen follows the last row
- MC10: the failure table's top rule draws, the labels rise, then the six rows, 40ms
  apart; its screen follows the last row
- MC11: "What shipped" enters first and "What is not measured yet" 120ms later; each
  marker scales in once its row has landed
- MC12: the six flow screens rise in reading order, 60ms apart, each as it's scrolled to

The later pages reuse all of that, and add:

- SM6: "This is revolutionary." rises word by word (S11) instead of fading up
- SM8, TM7: each decision draws its rule, then label, title and body rise; its
  full-width screen follows the text, and the caption fades in once the screen lands
- SM11: each "Measures" row draws its rule, then both cells rise, rows 60ms apart
- IT3: the hero panel fades, the three tablet screens rise 40px one after another,
  120ms apart, and each caption fades in after its screen. No parallax
- IT7: each screen step draws its rule, then number, title and body rise, then the
  panel. Text left, screen right on every row; below 1024px they stack
- IT10: the eight test cases rise T1 to T8, 40ms apart
- TM10: the sixteen screens rise in reading order, 40ms apart

| Token            | Value | Token           | Value                           |
| ---------------- | ----- | --------------- | ------------------------------- |
| `--dur-instant`  | 90ms  | `--ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--dur-fast`     | 160ms | `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--dur-base`     | 240ms | `--ease-press`  | `cubic-bezier(0.3, 0, 0.6, 1)`  |
| `--dur-slow`     | 560ms | `--stagger`     | 60ms                            |
| `--dur-slower`   | 800ms | `--stagger-word` | 50ms                           |
| `--dur-count`    | 900ms | `--rule-lead`   | 100ms                           |

The hero intro finishes at 1280ms with these values, inside the notes' 1.3s budget. If
you lengthen `--dur-slow`, check that budget again.

### Where the build goes past the notes

The notes don't give these an entrance, so they got one to match their neighbours:

- About: the "Experience" label and the two buttons fade up (S6)
- Contact: the button, email and note fade up (S6) as the headline's last word lands
- Case study: the steps' titles darken on hover, the same colour as the active step,
  so it's clear they're clickable
- Long-form case studies: the hero caption fades up (S6) just after its panel
- Compliance check: the subtitle under the title fades up (S6) at 100ms, between the
  title and the lede
- Lightbox sets: previous / next wrap around, from the last screen back to the first
- SM7: the notes time the count-ups with `--dur-reveal`, a token the Motion system page
  would define. It isn't in the file, so they use `--dur-count` like every other count
- IT3: the notes don't give the triptych a start time; it starts at 300ms like the
  other heroes, and its screens rise over `--dur-slow`

Otherwise, what the notes leave static stays static. On Home: the status chips, the nav and the footer. On case studies: the eyebrow, the outcomes
heading, the sticky Problem and Constraints heads, and the whole Flow section apart from
the stepper's own motion.

## Accessibility and fallbacks

- Entrance states only exist under the `.motion` class. An inline script in `<head>`
  adds it only when the visitor hasn't asked for reduced motion. With reduced motion
  or no JavaScript, the page renders complete, with final numbers and no hidden text.
- If `main.js` hasn't run within 2.5s, the class is removed so nothing stays hidden.
- Hover states apply only to devices that can hover, so tapping a card goes straight to
  the case study with no stuck hover (per the H5 notes).
- The split headlines carry an `aria-label` with the full sentence, so screen readers
  don't read them word by word.
- The flow stepper is a real tablist. Left and right arrows, Home and End move between
  steps, and the panel's label follows the selected step. Without JavaScript, step 01
  shows.
- The lightbox is a native modal `<dialog>`, so focus stays inside it. Esc or a click
  closes it, and focus goes back to the screen that opened it, or to the one you paged
  to. The "3 of 6" counter is a live region, so paging is announced.
- The side nav's links move focus to the section heading, and jumps are instant under
  reduced motion.
- The copy-email button announces "Email address copied" through a live region. If the
  clipboard is blocked, it opens a `mailto:` link instead.

## Fonts

Schibsted Grotesk and Geist Mono load from Google Fonts. Offline, the page falls back
to the system sans-serif and monospace fonts.
