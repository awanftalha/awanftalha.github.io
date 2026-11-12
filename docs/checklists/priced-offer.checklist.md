# Publish checklist · priced-offer.mdx

> **Update 12 Nov 2026:** every open question below has been answered. See `docs/checklists/ANSWERS.md`. The rest of this file is kept as a record of the assumptions to check.

Goes with the pilot draft. Nothing in the draft was invented, but the places below were written from inference, from your answers today, or rest on an assumption. Check each one before publishing.

---

## 1. Still open (the build fails until these go)

| Id | What I need |
|---|---|
| **N2** | The Claude-built prototypes: how many dispatchers and sessions, and one thing those sessions changed. Plus a short screen recording if you have one (`prototype.mp4`). |
| **N3b** | Any sketches of the rejected directions (the density reorganisation, a wizard)? If not, delete the note. |

**Resolved:** N3 (the original screen will be shown, redacted; you supply `before-annotated.webp`) and N2b (the final prototype was also tested, so the trade-off paragraph is gone).

---

## 2. Written from your answers today: confirm the wording

- **The headline number.** "2–3 h → ~20 min from offer to a complete dispatch plan", source labelled **Logged**, with the note "From the system's logs and the team's own estimate". You chose to use only this figure, so **the old "~50% call to sent offer" figure is gone from the page entirely**.
- **The social preview image.** `/assets/og/priced-offer.png` may still say "halved". Open it and check, because the page text can't fix an image.
- **The prototyping section.** "I used Claude to build low- and mid-fidelity clickable prototypes of the offer flow, and tested them with dispatchers. The final interactive prototype was tested with users too, before the build." This assumes the people in the early tests were dispatchers. Correct it if they were someone else (ops managers, say).
- **The Validation "During" bullet** puts the Claude-built prototypes before the full interactive prototype. That order is my assumption.
- **The trade-off paragraph is deleted.** Your old page said you skipped a formal test of the final prototype; you told me today that you did test it. If that test was informal, say so and I'll describe it accurately.

---

## 3. My inference: check it's true

- **"Three changes contribute"** in the Outcome. I linked three changes already described on your page (one entry pass removed, derived fields, no location modals) to the 20-minute figure. You haven't told me these explain it. If something else drove most of the drop (crew defaults, for example), say so and I'll rewrite the paragraph.
- **The status line.** "In daily use across 8 operators", status as of 11 Nov 2026. This comes from your current page. Confirm it's still true today.
- **The new title.** "Turning a phone call into a priced offer" is now the H1, social title, homepage card title and next-link label everywhere. This was my pick from your three existing names.
- **The second sentence of the homepage one-liner** is new: "Offer to full dispatch plan in about 20 minutes, down from 2–3 hours."
- **Next case study → SMS.** The next-link order now follows the homepage order: OPS, SMS, Compliance, HX Insight, Training, SnapGrid, then the three apps.
- **The alt text on the new loops and the Before image** describes recordings that don't exist yet. When you record them, make sure they show what the alt text says, or tell me what they actually show. Until then, each loop falls back to its current screenshot with that screenshot's existing alt text (`posterAlt`).

---

## 4. Strong claims worth a second look

These are your own sentences, kept as they were. They're the kind an interviewer will push on.

- **"Removing a transcription pass … takes that error population to zero."** This is only true if no dispatcher still uses paper. Is that so at all 8 operators?
- **"Training is no longer a prerequisite."** Is that reported by operators, or your reading of it?
- **"Removing them deleted roughly a third of the interface."** Was that measured (fields, pixels), or is it an estimate?

---

## 5. Derived figures (labelled as arithmetic on the page)

- **~500–1,200 offers a day:** 50–60 dispatchers × 10–20 calls each.

---

## 6. What changed from your current page

- The skim layer (everything above "Go deeper") is now about 380 words, plus the summary cards and stats. That's about a 2-minute read.
- Nothing was deleted except the ~50% figure. Everything else moved into the 11 "Go deeper" sections.
- Wording was lightly tightened for rhythm (some dashes became commas, some long sentences were split). No facts, numbers, quotes or caveats changed. British spelling is kept.
- The "4 → 1 lifecycle stages" stat moved up into the stat tiles. The Go deeper table now lists the old field count instead, so nothing is repeated.

---

## 7. Media this page expects

These go in `public/media/priced-offer/`. Until they exist, the page shows the current screenshots as posters, so it still works.

| File | What it shows | Status |
|---|---|---|
| `cover.mp4` | 8–12 s overview loop of the redesigned page | to record |
| `before-annotated.webp` | the original page, redacted, with the 5 causes marked | you supply |
| `quick-capture.mp4` | client, date, route, passengers in one pass | to record |
| `location-field.mp4` | a site name, coordinates and a drawn area resolving in one field | to record |
| `send-checklist.mp4` | Send pressed with issues → checklist expands → jump to a field | to record |
| `prototype.mp4` | optional: an AI-built prototype in use | waiting on N2 |
| `rejected-directions.webp` | optional: sketches of the density reorganisation and the wizard | waiting on N3b |

The full shot list for all 9 case studies comes in Step 5.
