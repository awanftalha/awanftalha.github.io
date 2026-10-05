# Talha Farooq Awan — Portfolio (final)

Built from the Figma file **talha's portfolio final** (`Rfar4zyPbRmfMEoppIylJQ`):

- page *Home*, frame `Home / Desktop 1440` (node `2:2`), with **Build notes / Motion / Home**
- page *Case study template*, frame `Case study / Desktop 1440` (node `7:2`), with
  **Build notes / Motion / Case study**

The five case studies come from the Figma file **NGFT_design**
(`wGsQoUHES7HZmTIF29Wod9`), page *05 Case study · Offer page*. Each frame has its own
**Build notes / Motion / Case study: …** frame beside it:

- `Case study / Offer page (portfolio design)` (node `548:1458`), CS-codes
- `Case study / Manual compliance check (portfolio design)` (node `571:8024`), MC-codes
- `Case study / SMS safety manager flow (portfolio design)` (node `581:10089`), SM-codes
- `Case study / Instructor tablet app (portfolio design)` (node `558:5718`), IT-codes
- `Case study / Training management (portfolio design)` (node `564:8024`), TM-codes

No build step and no dependencies: plain HTML, CSS and one JS file.

## Run it

```bash
python3 -m http.server 4175 --directory portfolio-final
```

Run that from the folder above this one, then open <http://localhost:4175>. In the Claude
desktop app you can also start the `portfolio-final` preview from `.claude/launch.json`.

## Structure

```
index.html        Home. Each section opens with a comment naming its H-code.
work/*.html       The five case studies. Section comments name their CS-, MC-, SM-, IT- or TM-code.
css/tokens.css    Colour, type and motion tokens (mirrors the Figma variables)
css/styles.css    Layout and components, static styles only (Home, template, long-form)
css/motion.css    The motion system: S1–S12, hovers, entrances, then case-study motion
js/main.js        Timelines per H-, C- and case-study code, side nav, lightbox, stepper,
                  count-ups, word splits, email copy, nav
assets/           talha-avatar.jpg (from the Figma file), favicon.svg
assets/work/      Screens exported from NGFT_design, one folder per case study
```

## Filling in your data

Every placeholder link uses an `href` that starts with `#todo`, so you can search for
it. Until you replace one, clicking it does nothing.

| Search for                  | Where                                     | Replace with                 |
| --------------------------- | ----------------------------------------- | ---------------------------- |
| `#todo-ai-chat-widget`      | Manual compliance check: next case study  | the AI assistant case study  |

The LinkedIn links (About button, and the footer on every page) go to
https://www.linkedin.com/in/talha-f-5145611b2/ in a new tab.

The About section's "Resume (PDF)" button downloads `assets/talha-farooq-awan-resume.pdf`.
To update the resume, replace that file and keep its name.

**My work.** Under "My work across six years" (`#work`, where the Work link, "See the
work" and every case study's back link land) comes the work (`#selected-work`): the six case
study cards. The sixth, full width like the first, is HX Insight
(`work/hx-insight.html`, Punjab Group of Companies, shipped June 2024): its thumbnail is a
motion graphic (see "HX Insight card motion graphic" below).

**HX Insight desktop timer and mobile app.** Two short case studies,
`work/hx-timer.html` ("One button, always in reach") and `work/hx-mobile.html` ("The
quick jobs, in your pocket"), built from the frames "Case study / HX Insight desktop timer"
and "Case study / HX Insight mobile app" in talha-s-portfolio-final. On Home they share a
row: the timer is the wide card, the mobile app the narrow one, both with static screens.
Each page is a header, a hero, a flow stepper (the C6 tablist: `.stepper`, one
`[data-step-screen]` and one `[data-step-caption]` per step, `id="step-N"`), and on the
timer page two "rest of the day" screens in a C7 states row. Their screens were exported at
2× from the source frames in the Figma file HX-insight-new ("Desktop timer / HX Timer for
Mac" and "Mobile app / Employee self-service") and converted to WebP (quality 90):
`assets/work/hx-timer/timer-01…07.webp` (2560 × 1760) and `assets/work/hx-mobile/*.webp`
(804 × 1748). They are `.screenshot` and `.phone` images, which keep the Figma corners
(12 and 24) and a soft shadow. The old template's `.shot` is a different thing. Next-case
order: HX Insight → timer → mobile app → training record.

**HX Insight case study.** Built from the Figma frame "Case study / HX Insight, four
flows / Desktop 1440" in talha-s-portfolio-final, with the same blocks as the other case
studies: header, hero, outcomes (`.numbers`), side nav, sections, a constraints table and
the next card (to the training record). Each flow is a `.beats` grid: four screens, two
across, each with a time-and-person label and one line of text; the screens open in the
lightbox and page through their flow. Its 16 screens are in `assets/work/hx-insight/` as WebP
(quality 90) at 2× (2880 × 2096), exported from the "Screen" frames on the Flow 1 to
Flow 4 pages of the Figma file HX-insight-new; the hero reuses `leave-03.webp`.

**Screens.** Each empty image slot has a commented-out `<img>` inside it. Uncomment it
and point it at your file. It fills the slot, cropped from the top, and covers the
"Drop screen" text. Export at the size the slot names (2x):

| Card                                          | Slot size   |
| --------------------------------------------- | ----------- |
| Turning a phone call into a priced offer      | Hover-to-play thumbnail, see below |
| Manual compliance check                       | Motion graphic, see below |
| A two-day safety report, in one guided flow   | Motion graphic, see below |
| The instructors put the paper down            | Motion graphic, see below |
| The record that decides who is allowed to fly | Motion graphic, see below |
| About portrait                                | Done: `assets/talha-portrait.jpg` (1033 × 1254) |

**Offer card thumbnail.** The offer card has no slot. Its panel holds a `.wt` thumbnail:
at rest the finished offer screen; on hover (or Tab to the card) it replays the case
study in about three seconds, and on touch it plays once when 60% in view. Files:
`css/offer-thumb.css`, `js/offer-thumb.js` (the component and its `WorkThumb.OFFER`
config), and `assets/work/priced-offer/offer-final.webp` (poster, 2100 × 1355) plus
`offer-base.webp` (the same screen with every animated layer empty). `main.js` mounts it
when the card is within 300px of the viewport, and not at all under reduced motion. Its
panel and screen geometry are the `--wt-*` variables at the top of `offer-thumb.css`, set
to where `.slot--2080x1320` put the screen; under 600px the screen sits at 17% instead of
12% so the call chip fits above it, and under 360px it widens to 90% so the chip's longest
label ("On the call · Thomas Bruger, Alpine Rescue") isn't clipped at the card's edge. The home page loads Inter (400–700) for its counting
totals. To re-export the two images: the source is the case study hero in NGFT_design,
*05 Case study · Offer page*, node 548:1505. Scale a clone to 1680 wide and export at
1.25× for `offer-final`; for `offer-base`, set every animated layer to opacity 0 (not
hidden, which reflows the auto layout) and export the same way. If anything moved, update
the native-pixel coordinates in `WorkThumb.OFFER`.

**Compliance card motion graphic.** The Manual compliance check card has no slot either.
Its panel holds `<div class="mg" data-mg="compliance">` with the graphic as an inline SVG
(800 × 520), which as authored is the finished frame: five verdicts traced to manual
pages, 140 requirements checked, the coverage bar and the Report ready stamp. On hover
(or Tab to the card) `js/compliance-thumb.js` replays how it got there in about 2.8s;
leaving mid-play fast-forwards to the finished frame; on touch it plays once when 60% in
view. Styles are in `css/compliance-thumb.css`; the verdict chips use Inter 500/600.
`main.js` mounts it on load, also under reduced motion: it never plays then, but it still
switches narrow cards (under 520px) to the compact layout, which drops the tiny type and
keeps the shapes, icons, count and stamp. The SVG is `aria-hidden` because the card title
and outcome already say what it shows. Its markup came from `make_svg.py` in the handoff
(compliance-thumbnail-handoff.zip): to change the rows, pages or counts, edit that script,
re-run it and paste the new SVG over the old one, keeping `aria-hidden="true"
focusable="false"` in place of its `role`/`aria-label`. The IDs, pages, verdicts and counts
are from the case study screens (NGFT_design, page *12 NGFT AI · Manual compliance check*).

**SMS card motion graphic.** The safety report card works the same way: its panel holds
`<div class="sd" data-sd="sms">` with an inline SVG (880 × 800, the panel's own ratio and
dark ground). At rest it is one report, SR-2026-0142, closed: stepper complete, six of six
checks, the lock. On hover (or Tab) `js/sms-thumb.js` takes that report through Inbox,
Review, ECCAIRS, Risk and Close in about 17.4s: `main.js` mounts it with `{ speed: 1.6 }`,
much slower than the handoff's default 0.72 (7.9s), so each step can be read. Higher is slower;
every beat scales together. Leaving mid-play fast-forwards to the closed frame (10×); touch plays
it once when 60% in view; under 440px wide the secondary text is hidden. Styles are in
`css/sms-thumb.css`; the report uses Inter 400/600/700. `main.js` mounts it on load, also
under reduced motion (never plays, still gets the compact layout). The SVG is
`aria-hidden`, and its `id="sdc-lift"` filter must stay unique on the page. Two of its
`<text>` elements carry `data-count="need"` / `"corr"` for the component's own counters,
which is why the site's S10 reset in `main.js` only touches `.count[data-count]`. Its
markup came from `make_svg.py` in the handoff (sms-thumbnail-handoff.zip): edit that,
re-run it and paste the new SVG over the old one, keeping `aria-hidden="true"
focusable="false"` in place of its `role`/`aria-label`.

**Instructor card motion graphic.** The instructors card works the same way: its
`panel--surface` holds `<div class="tb" data-tb="tablet">` with an inline SVG (880 × 800,
the panel's ratio). At rest the signed tablet (6 pass · 2 partial · 1 repeat · 3 h 52, the
signature, Signed) lies over the ticked paper sheet. On hover (or Tab) `js/tablet-thumb.js`
plays the paper sheet being ticked and put down, the tablet arriving mid-session, an
outcome recorded mid-exercise, the session running on to 9 of 9, and the signing, in about
8.9s at the handoff's speed (1); pass `{ speed }` in `main.js` to change it (higher is
slower). Leaving mid-play fast-forwards to the signed frame (10×); touch plays it once
when 60% in view; under 440px wide the smallest type is hidden. Styles are in
`css/tablet-thumb.css`; the tablet uses Inter 400–700. The panel draws the 1px line, so
the graphic's own inset line is switched off in `styles.css`. `main.js` mounts it on load,
also under reduced motion (never plays, still gets the compact layout). The SVG is
`aria-hidden`, and its ids `tbc-paper`, `tbc-device` and `tbc-screen` must stay unique on
the page. Its markup came from `make_svg.py` in the handoff (tablet-thumbnail-handoff.zip):
edit that, re-run it and paste the new SVG over the old one, keeping `aria-hidden="true"
focusable="false"` in place of its `role`/`aria-label`.

**Training card motion graphic.** The training card works the same way: its sunken
panel holds `<div class="tr" data-tr="training">` with an inline SVG (800 × 520). At rest
it is Tomasz Bielik's complete AW139 Type Rating record: six sessions, three repeats
cleared in later sessions, 0 checks outstanding, the padlock open, the examiner's
signature and the validity written to the roster (16 Sep 2026 → 16 Sep 2027,
revalidation 18 Jun, "Can be rostered"). On hover (or Tab) `js/training-thumb.js` fills
the record session by session, traces each repeat to where it was cleared, counts the
outstanding checks 39 → 0 (zero only after session 6, and only then does the lock open),
signs and writes the validity, in about 6.7s at the handoff's speed (1); pass `{ speed }`
in `main.js` to change it (higher is slower). Leaving mid-play fast-forwards to the end
(10×); touch plays it once when 60% in view; under 480px wide the small labels, months
and legend are hidden. Styles are in `css/training-thumb.css`; the record uses Inter
400/600/700. `main.js` mounts it on load, also under reduced motion (never plays, still
gets the compact layout). The SVG is `aria-hidden`, and its `id="trc-sheet"` filter must
stay unique on the page. Its markup came from `make_svg.py` in the handoff
(training-thumbnail-handoff.zip): edit that, re-run it and paste the new SVG over the old
one, keeping `aria-hidden="true" focusable="false"` in place of its `role`/`aria-label`.

**HX Insight card motion graphic.** The full-width HX Insight card has no slot. Its tint
panel holds `<div class="hx" data-hx="hx-insight">` with an inline SVG (800 × 520), which
fills the panel on the HX navy and centres itself where the ratios differ. As authored it
is the finished frame: four tiles, 01 Leave approved, 02 Resourcing confirmed (Zain
booked from 2 Nov), 03 Onboarding all ready and 04 Attendance locked. On hover (or Tab)
`js/hx-thumb.js` plays the four flows in turn in about 9.3s at the handoff's speed (1),
lighting only the tile that is playing, with one pointer clicking Approve, Assign, Nudge 3
owners and Approve and lock; readiness counts 61% → 83% and Ready to lock 3 → 6 of 6.
Leaving mid-play fast-forwards to the finished frame; touch plays it once when 60% in
view; reduced motion never plays. Under 480px wide it drops its smallest type and the two
result bars switch to short labels. It uses the product's type: Plus Jakarta Sans
600/700, Geist 400/600 and Geist Mono 500, loaded in `index.html`. The SVG's ids
(`hxc-glow`, `hxc-tile`) must stay unique on the page. Its markup came from `make_svg.py`
in the handoff (hx-thumbnail-handoff.zip): edit that, re-run it and paste the new SVG over
the old one, keeping `aria-hidden="true" focusable="false"` in place of its
`role`/`aria-label`.

**Status chips.** `chip--solid` is the filled chip (Shipped). `chip--outline` is the
bordered one (Proof of concept, In trial).

**Counted numbers.** Any `<span class="count" data-count="N">N</span>` counts up from 0.
Keep both values in sync when you change the number.

## Case studies

`work/` holds one page per Home card. The Home cards link to them. Every page is built
from its NGFT_design frame, with all copy as written there.

| Page                          | Figma frame                  | Next card leads to     | Hero                 |
| ----------------------------- | ---------------------------- | ---------------------- | -------------------- |
| `work/priced-offer.html`      | Offer page                   | compliance check       | added                |
| `work/compliance-check.html`  | Manual compliance check      | AI chat widget (`#todo`) | added              |
| `work/safety-report.html`     | SMS safety manager flow      | offer page             | added                |
| `work/instructors.html`       | Instructor tablet app        | safety report          | three screens, added |
| `work/training-record.html`   | Training management          | instructors            | added                |

### Long-form case studies

All five share one layout: header, hero, then a sticky side nav beside numbered
sections, then the Next card.

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

**Next case study.** Each page leads where its Figma Next card does (table above). The
compliance check's Next card (and its side-nav link) say "Bringing the answer to the
work · NGFT · Approved concept": the AI chat widget case study in the Figma file. That
page doesn't exist yet, so both links are `#todo-ai-chat-widget`. Point them at the
page once it's built.

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
stepper's active bar and swap, the state markers and the Next card's hover and press.
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
