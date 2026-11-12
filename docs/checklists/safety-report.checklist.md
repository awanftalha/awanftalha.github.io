# Publish checklist · safety-report.mdx

> **Update 12 Nov 2026:** every open question below has been answered. See `docs/checklists/ANSWERS.md`. The rest of this file is kept as a record of the assumptions to check.

This was your shortest case study and the one with the most gaps, so it has the most open items. Nothing was invented. Each gap is marked in the page and listed here.

---

## 1. Still open (the build fails until these go)

| Id | What I need |
|---|---|
| **N8c** | The Before. **A diagram is ready**: `docs/diagrams/options/before-three-tools.webp`. Copy it into `public/media/safety-report/` to use it, or supply a redacted legacy screen with the same name. |
| **N8d** | You designed it yourself and prototyped it with Claude (now on the page). Still needed: who tried the prototype, whether it was the version shown at the concept review, and one thing it changed. |

**Resolved on 12 Nov:**
- **N8.** Analysis time is now **2–3 days → about 2 hours, logged by the system**. This is in the stat tile, Result card, one-liner, SEO description and Outcome.
- **N9.** You have nothing you'd do differently, so the **Reflection section is removed** rather than filled with something you didn't say. Expect an interviewer to ask anyway; it's worth having one spoken answer ready.
- **N10.** Nothing was fixed; the system was built from scratch. The Constraints section now says exactly that.

**Still unknown (no box on the page):**
- **How many operators use it.** The page says "some of the operators".
- **Which of the three measures are tracked.** The table now notes that analysis time is logged.
- **The "before" figure.** The quote in research says "about two days" and the stat says "2–3 days". Both are your words; they're close enough to read as consistent.

---

## 2. From your answers: confirm the wording

- **The status** changed from "proof of concept, not yet built" to **"Built and in use at some of the operators"**. The eyebrow now says "In use".
- **The headline number:** "2–3 days → ~2 h to analyse a safety report", labelled **Logged**.
- **Christian's testimonial** on the homepage says report analysis went "from two days to a few hours". That agrees with the logged figure.

---

## 3. My inference: check it's true

- **The title.** "A two-day safety report, in one guided flow" (your current social preview title) is now the one title everywhere. The H1 used to say "…redesigned as one guided flow".
- **"12 safety managers at 12 operators."** Your page says the BA visited twelve operators, but your other NGFT pages say NGFT works with eight. If some of the twelve were prospects or other organisations, say so, because an interviewer may notice the difference.
- **The Outcome sentence** "The design goes after the re-typing first, because research named it the biggest pain" builds on your line "This replaces the re-typing that research named as the biggest pain". It doesn't claim the saving came from there. Once you have the logged number, tell me what drove it and I'll state it.
- **The "How it's measured" table** used to be "Next: proving it against the two-day baseline". I kept the three measures; the Time to close row now notes that analysis time is logged. Tell me if the other two are tracked.
- **"The design goes after the re-typing first."** This is my reading of your Decision 3 line; confirm it reflects your priorities.

---

## 4. What changed from your current page

- **Chapters:** 5 → a skim layer of about 300 words, plus 7 Go deeper sections. This page was already short, so the work here was filling gaps rather than cutting.
- **Decisions:** "The AI does the first pass", "ECCAIRS by exception" and "One screen for risk" are in the skim layer. "Start with what's urgent" (inbox) and "A real finish line" (close) are in Go deeper.
- **New sections:** How I prototyped it (N8d still open) and Constraints (filled). Reflection was removed at your answer.
- **Kept:** the "invented data" note.
- No facts, numbers or quotes changed apart from the status update. British spelling is kept.

---

## 5. Media this page expects

These go in `public/media/safety-report/`.

| File | What it shows | Status |
|---|---|---|
| `cover.mp4` | 8–12 s: inbox → review → ECCAIRS all decided | to record |
| `before-three-tools.webp` | the legacy system (redacted) or the ready diagram | diagram ready · your choice (N8c) |
| `synopsis-source.mp4` | hovering a synopsis line highlights its source sentence; a hazard is kept | to record |
| `eccairs-exceptions.mp4` | keeping one uncertain value, correcting another with a one-tap reason | to record |
| `risk-matrix.mp4` | choosing severity and probability; the 5×5 cell turns intolerable; a similar risk is linked | to record |
