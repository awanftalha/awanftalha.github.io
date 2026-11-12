# Publish checklist · compliance-check.mdx

> **Update 12 Nov 2026:** every open question below has been answered. See `docs/checklists/ANSWERS.md`. The rest of this file is kept as a record of the assumptions to check.

Goes with the draft. Nothing in it was invented. The places below were written from inference, or rest on an assumption. Check each one before publishing.

---

## 1. Still open (the build fails until these go)

| Id | What I need |
|---|---|
| **N5** | One concrete thing that changed in the design because of the ten prototype sessions. |
| **N5b** | Now that it's built and in use: has anything been measured since (time per check, back-and-forth with the authority, accounts won)? And is the "What's next" list still current? |

**Resolved:** N4 (the prototypes were built with Claude; the page now says so). Status changed from *beta* to **built and in use**, per your answer. The eyebrow, summary, status line and Outcome are updated, and the "Beta feedback" item in What's next now reads "User feedback".

---

## 2. My editorial choices: confirm

- **The title.** "Proving a manual answers the regulation" (your current H1) is now the one title everywhere. The homepage card currently says "NGFT AI Compliance Check" and the social preview says "Manual compliance check"; both now use the H1. "NGFT AI" moves into the eyebrow.
- **The intro** is condensed from your two intro paragraphs to 41 words. The facts are unchanged.
- **The SEO description is softened.** The old one said the feature is *"replacing a 5–6 day manual review"*, but your own page says it's not yet measured whether it removes those days. The new one reads: "where a manual review takes 5–6 days today." **Also check the social preview image** (`/assets/og/compliance-check.png`) for the word "replacing".
- **The "5–6 days" stat** is labelled **Reported**, with a note that it hasn't been measured against the new flow. That matches your page.

---

## 3. My inference: check it's true

- **The Before image is a diagram, now drawn** (`before-two-documents.webp`): two documents in two windows, with the judgement "in one person's head" between them, labelled DIAGRAM. There was no old screen, because this was a new feature. If you'd rather not show a diagram, delete the `before` lines and the compare screen shows on its own.
- **The quote attribution** reads "Operator, during a research session". Your page refers to "one participant" and "he". If his role is known (Chief Pilot, Safety Manager), it would be stronger to name the role.
- **The loop recordings don't exist yet.** Their alt text describes what each one should show: correcting an extracted requirement · selecting a requirement and the manual scrolling to the passage · a weak-match row described in words. Until recorded, each loop shows the current screenshot with its existing alt text.
- **Decision 03's media.** I paired "Confidence is a sentence" with the *needs review* screenshot. If a better screen shows the confidence wording up close, swap it in.

---

## 4. Strong claims worth a second look

These are your own sentences, kept as they were.

- **"Zero new components while designing"** next to **"One component, added afterwards (Stepper)."** Both are true as worded, and the page explains the difference. An interviewer may still probe it, so be ready to.
- **"That is the part I would defend hardest."** This is now in the skim layer, so it's one of the first things a reader sees. Good, but expect to be asked about it.

---

## 5. What changed from your current page

- **Chapters:** 14 → a skim layer of about 455 words, plus 11 "Go deeper" sections.
- **"By the numbers":** 8 tiles → 4. "15 screens", "1 month" and "2 people" moved into the meta row and the Outcome.
- **Status:** "MVP live, in beta" → "Built and in use". The three "can't yet" claims (days saved, back-and-forth, accounts) stay until N5b says otherwise.
- **"Where it stands"** is now a **Claims** block (what I can claim / what I can't yet) in the skim layer.
- **Decisions:** "Verify before you compare", "The evidence sits next to the verdict" and "Confidence is a sentence" are in the skim layer. "Four verdicts" and "The person decides" are in Go deeper.
- **Validation** became the skim-layer section **"How I prototyped it"**, so there's no separate Validation section.
- No facts, numbers, quotes or caveats changed. British spelling is kept.

---

## 6. Media this page expects

These go in `public/media/compliance-check/`.

| File | What it shows | Status |
|---|---|---|
| `cover.mp4` | 8–12 s overview: a requirement selected → passage highlighted → verdict saved | to record |
| `before-two-documents.webp` | a simple diagram: the EASA document and the manual in two windows | **done** (in `public/media/compliance-check/`) |
| `check-found.mp4` | correcting an extracted requirement on step 02 | to record |
| `compare-scroll.mp4` | selecting a requirement scrolls the manual to the matched passage | to record |
| `weak-match.mp4` | a weak-match row described in words, then Accept or a different passage | to record |
| `prototype.mp4` | optional: a Claude-built prototype in use | if you have one |
