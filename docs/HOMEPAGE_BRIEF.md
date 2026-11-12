# Homepage rebuild brief for talha.design

> Updated 12 Nov 2026. This brief is now part of a set: start from `docs/CASE_STUDIES_BRIEF.md`, which says what to build in what order. This file covers the homepage only.

---

## 0. What we're building

A new homepage for **talha.design**, modelled on the *structure and interaction language* of **astapable.com** (Evgenii Astapov's portfolio), filled with **my** content.

The reference feels: quiet, light, typographic, lots of white space, one typeface, small UI chrome, and **delight hidden in the details** (scrambling text, a cursor label, cards that lift out of pockets, a live clock, a tiny music player). Nothing shouts. Motion is fast and precise, not floaty.

**Ground rules**
- Inspired by, not copied. Do not use the reference's images, videos, Lottie files, sounds, logos, fonts or copy. Build everything fresh.
- Complete redesign. Do not reuse any of the current homepage's components or styles. Start the homepage from a blank file.
- Keep every existing link working. Case studies move from `/work/<slug>.html` to `/work/<slug>` with permanent redirects (see `docs/CASE_STUDY_SYSTEM.md` §1). The resume PDF and OG images stay where they are.
- Work on a new git branch `homepage-v3`. Don't push to `main` until I say so (Vercel deploys from `main`).
- Before writing code, look through the repo, tell me the current stack and file layout, and confirm the plan in 5–8 bullets.

---

## 1. Stack

- **Astro**, static output, deployed on Vercel. The case studies move to Astro + MDX (see `docs/CASE_STUDY_SYSTEM.md`), and the homepage is `src/pages/index.astro` sharing the same `Base.astro` layout, tokens, nav and footer. Install libraries from npm rather than a CDN.
- **GSAP 3** (all plugins are free now): `gsap`, `ScrollTrigger`, `SplitText`, `ScrambleTextPlugin`, `CustomEase`.
- **Howler.js** for the optional music player and UI sounds.
- **Three.js** only for the optional hero variant B (section 4.2). No other 3D anywhere.
- No Lenis / smooth-scroll library. Native scroll, like the reference.
- Vanilla JS modules, one file per behaviour: `scramble.js`, `cursor.js`, `pockets.js`, `clock.js`, `player.js`, `sounds.js`, `theme.js`, `nav.js`. Initialise behaviours from `data-*` attributes so markup stays clean.

---

## 2. Design tokens

### 2.1 Colour (two themes, toggle in the nav, default = `prefers-color-scheme`, remember choice in `localStorage` wrapped in try/catch)

| Token | Light (matches reference) | Dark |
|---|---|---|
| `--bg` | `#FBFBFB` | `#0D0D0D` |
| `--surface` | `#FFFFFF` | `#151515` |
| `--text` | `#1C1C1C` | `#EDEDED` |
| `--text-muted` | `#6B6B6B` | `#8A8A8A` |
| `--title-ghost` (section titles) | `#CDCDCD` | `#3A3A3A` |
| `--chip` (tag / role label bg) | `#EBEBEB` | `#1F1F1F` |
| `--border` | `#E4E4E4` | `#262626` |
| `--pill` (solid button / cursor label bg) | `#1C1C1C` | `#EDEDED` |
| `--pill-text` | `#FFFFFF` | `#0D0D0D` |
| `--shadow-soft` | `0 10px 30px rgba(0,0,0,.06)` | `0 10px 30px rgba(0,0,0,.5)` |

No accent colour. Colour on the page comes only from the project covers.

### 2.2 Type

- **One typeface for everything.** The reference uses Baru Sans; only use it if I hold a licence. Default to **General Sans** or **Satoshi** (Fontshare, free). Weights: 300 for body, 600 for headings and nav.
- Tight tracking everywhere: body `-0.012em`, headings `-0.02em`, H1 and CTA `-0.033em`.
- The reference scales type with the viewport. Sizes below are at a 1440px-wide viewport; implement with `clamp()` so nothing goes below the minimum.

| Role | Size @1440 | Weight | Line-height | Min |
|---|---|---|---|---|
| Body, nav, tags, footer | 12.5px | 300 (nav 600) | 1.4 | 13px |
| Hero intro | 16px | 300 | 1.3 | 15px |
| H1 (name) | 46px | 600 | 1.0 | 36px |
| Section title (ghost) | 38px | 600 | 1.1 | 28px |
| Card title | 24px | 600 | 1.1 | 20px |
| CTA headline | 76px | 600 | 1.02 | 40px |

### 2.3 Space, shape, motion

- Page gutter `20px`. Grid gap `12px`. Section spacing ≈ `160px` above each section title, `100px` below it.
- Radius: project media `4px`; chips and buttons `4px`; app (pocket) cards `24px` outer / `20px` inner.
- Borders are 1px `--border`. Icon buttons are 30×30 squares with a 1px border.
- **One easing curve:** `CustomEase.create("main", "0.65, 0.01, 0.05, 0.99")`. Use it for almost everything.
- Durations: `0.2s` micro (colour, arrow), `0.4s` hovers, `0.6s` card lifts, `1–1.2s` entrance reveals. Nothing slower.

---

## 3. Page structure (top to bottom)

```
[Fixed top nav]
[Hero: centred media + name bottom-left]
/* Featured Work */   → 2-column grid of 6 case studies
/* Apps */            → 3 "pocket" cards
/* Approach */        → 3 numbered habits
/* Kind Words */      → 3 testimonials
[CTA: Let's simplify your next → (word loop)]
[Footer: stacked info, logo row, live Lahore clock, version line]
[Floating: music player bottom-right]  [Floating: cursor label]
```

---

## 4. Sections in detail

### 4.1 Top nav (fixed, transparent, no background)
- **Left:** wordmark "Talha Farooq Awan" (600) + a grey chip "Product Designer" (`--chip` bg, 4px radius, 300 weight).
- **Centre:** links `Work` `Apps` `Approach` `About` (anchors to sections; About scrolls to the footer info or a future `/about` page). Each link scrambles on hover (4.9).
- **Right:** square bordered icon buttons for LinkedIn and Email, a 1px vertical divider, a theme toggle (sun/moon icon button), then a solid black pill button "Get in touch" with a small sparkle/arrow icon → scrolls to the CTA.
- Mobile (<768px): wordmark + a hamburger that scales open into a full-screen menu (reference calls this a "scaling hamburger": the button grows into the panel; links stagger in from below, 0.05s stagger).

### 4.2 Hero (100vh)
- **Centre:** the hero media, about 340×450 at desktop, sitting on the page background with no frame.
  - **Variant A (preferred, matches the reference):** a muted, looping, autoplaying `<video>` of an isometric 3D-style render of me at my desk (soft white studio light, white desk/chair, small details from my real setup). I will supply `hero.mp4` + `hero.webm` + a poster frame. The video's background must match `--bg` exactly in both themes, so supply/encode two versions or use a transparent WebM with an MP4 fallback.
  - **Variant B (if no video yet):** a small Three.js scene in the same slot: one low-poly object (e.g. a white isometric desk with a laptop) under soft light, slowly idling, tilting a few degrees towards the cursor. Transparent canvas, max 1.5 device pixel ratio, paused when off-screen.
- **Bottom-left, 20px from edges:** H1 "Talha Farooq Awan" and below it the intro, max ~32ch, two lines:
  "I help teams turn complicated products into software people trust."
- **Hero cursor:** while the pointer is over the hero, the cursor label (4.8) shows a short friendly line like "Hi from Lahore".
- **On load:** H1 scrambles in from random characters (4.9), intro lines fade up (SplitText lines, y 20px → 0, 1s, stagger 0.08), nav items fade in. Total intro under 1.5s.

### 4.3 /* Featured Work */
- Section title centred, written as a code comment: `/* Featured Work */` in `--title-ghost`. (All section titles use this pattern.)
- **2-column grid**, full width minus gutters, 12px gap. Single column below 768px.
- **Card anatomy:**
  - Media block, aspect ratio ≈ 16:9, 4px radius, each cover is a **continuously looping mini-story** of the product (MP4/WebM loop or Lottie, muted, `playsinline`, lazy-loaded, paused when off-screen via IntersectionObserver).
  - Meta row under the media, split into two halves: **left half** = tag chips; **right half** = title (24px/600) and a one-line description (300).
  - Whole card is a link to the case study.
  - Hover: cursor label changes to "View {Project} case ›". No scaling or tilting of the card itself; the reference keeps cards still.
- **Content: read it from the case study collection, never type it here.** Show every entry with `featured: true`, sorted by `order`. Each card uses:
  - **Title:** `title`.
  - **One-liner:** `oneLiner`.
  - **Tag chips:** `tags`, plus one status chip from `status`.
  - **Cover:** `cover.video` (the matching `.webp` as its poster), or `cover.poster` until the video exists.
  - **Link:** `/work/<slug>`.

  Today that gives these six, in this order:

| # | Slug | Title |
|---|---|---|
| 1 | `priced-offer` | Turning a phone call into a priced offer |
| 2 | `safety-report` | A two-day safety report, in one guided flow |
| 3 | `compliance-check` | Proving a manual answers the regulation |
| 4 | `hx-insight` | Taking HR off email and spreadsheets |
| 5 | `training-record` | The record that decides who is allowed to fly |
| 6 | `snapgrid` | From finished job to first post |

  The cover videos are made with the loop renderer (`docs/CASE_STUDIES_BRIEF.md`, phase 7). Until they exist, show the poster screenshot. **Don't build coded mini-scenes for covers**: the real loops replace them.

### 4.4 /* Apps */  (the reference's "pocket" cards)
- Row of 3 cards, centred, ~290px wide each, generous gap. Horizontal scroll-snap on mobile.
- **Card anatomy:**
  - **Outer pocket:** `--surface`, 24px radius, soft shadow, 1px border. It holds an inner card.
  - **Inner card:** top area is a coloured gradient band (one colour per app) with two overlapping, slightly rotated app-icon tiles (one dark, one light, ±6°); below it, the app title (24px/600) and a two-line description.
  - The lower part of the inner card is tucked behind the pocket's front lip, a frosted strip (`backdrop-filter: blur(8px)`, semi-transparent `--surface`), so the description reads blurred at rest.
  - Bottom-right of the pocket: a round 34px icon button with an arrow `↗`. If an app's `status` is not `shipped`, show a pill with its status instead ("In trial", "Beta").
- **Hover / focus:** inner card lifts out of the pocket (`y: -70px`, 0.6s, "main" ease), description un-blurs, arrow rotates from `↗` to `→`. Reverse on leave. Same on keyboard focus.
- **Content: read it from the collection** (`featured: false`, sorted by `order`). Use `title`, `oneLiner`, `status`, and a link to `/work/<slug>`. Today that's `hx-timer`, `hx-mobile` and `instructors`, and all three are shipped. The app icons and gradient colours are still mine to supply.

### 4.5 /* Approach */
- Three columns (stack on mobile). Each: a small number `01`/`02`/`03` in `--text-muted`, a 24px/600 title, a two-line body. Thin top border per column.
- Content (from my current site): Diagnose before pixels / Design every state / Design it to ship, with their current one-line explanations.
- Reveal: lines slide up on scroll (SplitText lines, ScrollTrigger `start: "top 80%"`, once).

### 4.6 /* Kind Words */
- Three testimonials from my current site (Christian Müller, Ali AlMustufa, Ahmed Afzal), quoted **verbatim** from the live homepage, with avatar, name, role and a LinkedIn icon link. Copy them across before the old homepage is replaced. Never retype or "tidy" a quote.
- Layout: 3 columns of plain text, quote at 16px/300, no cards, no carousel. On mobile, horizontal scroll-snap.

### 4.7 CTA
- Centred, very large two-line headline:
  **"Let's simplify your next → {word}"**
  `{word}` loops through `product` → `workflow` → `hire` with the scramble loop (speed 0.8, hold 1.5s). The `→` is a drawn SVG arrow sized to the cap height.
- Under it, two bordered buttons side by side: **Email me** (mailto:talhafawan@gmail.com, and copies the address with a small "Copied" toast) and **Book a call** (my calendar link, placeholder `#book` until I send it). Both scramble on hover.
- One small muted line below: "Send me the screen, or the idea. I'll reply within 48 hours with what I'd do first."

### 4.8 Footer
- Centred stack of short lines (300 weight): `Talha Farooq Awan` / `Product Designer` / `Six years designing dense software` / `Based in Lahore, Pakistan`.
- A row of small monochrome logos of places I've worked: NGFT, Punjab Group, Decklaration, TenX (and Toptal). I'll supply SVGs; use `currentColor` so they follow the theme.
- **Live clock** under the logos: `HH:MM:SS PKT` ticking every second, from `Intl.DateTimeFormat` with `timeZone: "Asia/Karachi"`.
- Bottom-left corner: `v.3.0 · Updated {build date}` in muted 12.5px.
- Bottom-left or centre: LinkedIn + Resume (PDF) text links.

### 4.9 Global interactions

**Scramble text** (ScrambleTextPlugin, chars `/!<>-_\[]{}+*^#`)
- `data-scramble="load"`: plays once on page load.
- `data-scramble-hover`: on hover, re-scrambles the element's own text (0.4s). Put it on nav links and buttons.
- `data-scramble="loop" data-scramble-words="product|workflow|hire"`: cycles words forever.
- Always keep the real text in `aria-label` so screen readers never read the scrambled characters.

**Cursor label** (desktop, fine pointers only)
- The system cursor stays visible. A small solid pill (`--pill` bg, `--pill-text`, 12px/500, 6px 10px padding, 4px radius, trailing `›`) follows the pointer, offset ~14px right and ~14px below.
- Follow with `gsap.quickTo` (x/y, 0.35s, "power3.out") for a slight lag.
- Hidden by default; it appears (scale 0.8 → 1, opacity) over any element with `data-cursor-text="…"` and its text scrambles into the new value when the target changes.
- Disable entirely on touch devices and when `prefers-reduced-motion` is set.

**Music player (optional, floating bottom-right)**
- Small dark pill: round play/pause button, a status word (Playing / Paused), a divider, and a track title that marquees when playing. Muted by default; nothing plays until clicked. Howler, one royalty-free lo-fi track I'll supply.

**UI sounds (optional)**
- Very quiet hover and click blips on nav, buttons and cards (`data-sound-hover`, `data-sound-click`), only after the first user interaction, and only when the player isn't muted. Royalty-free files I'll supply; ship without them if absent.

**Section reveals**
- The reference is restrained here. Only: section titles fade/slide up 20px; card meta rows fade in. No parallax, no pinning, no horizontal scroll sections.

---

## 5. Responsive

- ≥1200px: as specified. 768–1199px: same layouts, type clamps down, Apps row may wrap to 2+1.
- <768px: hamburger nav; hero media 70vw wide, name and intro below it (not overlaid); Featured Work single column; Apps and Kind Words become horizontal scroll-snap rows; CTA headline at its minimum size; cursor label off.
- No horizontal page scroll at any width. Test at 375, 768, 1024, 1440, 1920.

---

## 6. Accessibility & performance

- `prefers-reduced-motion`: no scramble (show final text), no cursor label, no pocket lift animation (instant state change), videos show the poster frame with a play button.
- Visible focus rings on everything clickable; pocket cards and project cards work with Tab + Enter.
- Colour contrast AA in both themes (check `--text-muted` on `--bg`).
- Videos: `preload="none"` for everything below the hero, `loading="lazy"` on images, each cover ≤ 1.5MB, posters as AVIF/WebP.
- Lighthouse targets on the homepage: Performance ≥ 90, Accessibility ≥ 95.
- Keep meta title, description and OG image from the current homepage.

---

## 7. Assets I need to provide (use clearly-labelled placeholders until then)

- [ ] `hero.mp4` / `hero.webm` + poster (variant A), or approve variant B
- [ ] Figma frames for the 6 cover loops (made by the loop renderer; see `docs/SHOT_LIST.md`)
- [ ] 3 app icon pairs + gradient colours for the Apps cards
- [ ] Company logo SVGs: NGFT, Punjab Group, Decklaration, TenX, Toptal
- [ ] Calendar booking link
- [ ] Optional: 1 music track, 3–4 UI sound files
- [ ] Font choice confirmed (General Sans vs Satoshi vs licensed Baru Sans)

---

## 8. Build order (stop after each phase, show me a screenshot at 1440 and 375, wait for my OK)

These phases slot into the overall order in `docs/CASE_STUDIES_BRIEF.md`. Follow that file's numbering; the list here is what "the homepage" means inside it.

1. **Skeleton:** tokens, fonts, theme toggle, nav, all sections with real content and placeholder media. No animation.
2. **Featured Work + Apps:** grid, card anatomy, pocket cards with hover lift, all reading from the case study collection.
3. **Motion layer:** CustomEase, scramble (load/hover/loop), cursor label, reveals, hero intro.
4. **Covers:** wire `cover.video` / `cover.poster` from the collection, with off-screen pausing. The videos themselves come from the loop renderer later.
5. **Footer + extras:** live clock, logo row, version line, music player, sounds.
6. **Polish:** responsive pass, reduced motion, a11y, Lighthouse, then a final checklist of what's still a placeholder.

**Acceptance check before you call it done**
- Every link on the page resolves (no 404s), and every old `/work/*.html` URL redirects to its new `/work/<slug>` page.
- Both themes look intentional (not just inverted).
- With motion reduced, the page is fully usable and nothing is hidden.
- The intro finishes in under 1.5s, and every hover responds in under 0.1s.
