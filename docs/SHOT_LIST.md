# Shot list · every loop and image the case studies need

Step 5 of 6 · 37 loops and 6 stills across the 9 case studies · file names match the `.mdx` drafts exactly

---

## 1. Yes, Claude can make the loops from your Figma designs

You don't need to screen-record anything. Each loop is built from your Figma frames:

1. **You give me the frames.** For each loop, give me the screen states it moves through: start, middle, end.
2. **I compose them into a short animated scene.** A cursor moves and clicks, the state changes with a smooth transition, and a highlight lands on what matters.
3. **I render the scene frame by frame** in a headless browser and encode it as an MP4 (H.264, no audio, ≤ 2 MB), plus a matching first-frame poster (`.webp`).

The result shows your **designed** interaction, built from your real frames. Check each loop against what actually shipped; the publish checklists already flag this.

### Two ways to run it

| | **A · Here in this chat (recommended to start)** | **B · Claude Code, in your repo** |
|---|---|---|
| How frames arrive | You export each loop's frames from Figma as PNG and drop them in this chat (a zip is fine) | Claude Code pulls the frames straight from Figma through its Figma connection |
| Rendering | Done here: the browser and video encoder are already installed | Claude Code installs the encoder on your machine and renders into `public/media/` |
| Best for | The pilot, and doing all 37 in batches | Re-rendering later when a design changes |

**You chose B.** The renderer is already written and tested (`scripts/render-loop.mjs`, scene format in `docs/LOOP_SCENES.md`), so Claude Code only has to pull your frames, write a short scene file per loop and run it. Route A stays available as a backup: this chat can't pull frames from Figma directly, so you'd drop the exported PNGs here.

**If a Figma frame already has a motion timeline** (Figma's built-in animation), it can be exported to MP4 as it is, without going through my renderer.

---

## 2. Preparing the Figma file (about 10 minutes per case study)

1. **Make one page** called `Portfolio loops`.
2. **Make one Section per loop**, named exactly like the file without `.mp4`, for example `priced-offer/quick-capture`.
3. **Inside each Section, add one frame per state**, named `01`, `02`, `03`… in order. All frames in a Section must be **the same size**.
4. **Use demo data only.** Use no real client, pilot, patient or employee names; your current screenshots already use invented data, so reuse them.
5. **Keep anything that should move on its own as its own named layer** (a dropdown, a toast, a checklist expanding, a signature). Then I can animate that layer by itself instead of cross-fading the whole screen.
6. **Export:** select a Section → Export → PNG at **2x**. For layers that move on their own, also export the layer as its own PNG.

**Screen sizes:**

| Device | Frame size |
|---|---|
| Desktop | 1440 × 900 (or your product's real width) |
| Phone | 390 × 844 |
| Tablet (iPad Air portrait) | 834 × 1194 |

Export the **bare screen only**. The site draws the device frame around it.

---

## 3. How every loop is built

| | |
|---|---|
| Length | 6–12 s; covers 10 s |
| Frame rate | 30 fps |
| Rhythm | hold the first state 0.8 s → each step 1.2–2 s → transitions 0.4–0.6 s → cross-fade back to the start so it loops without a jump |
| Easing | the site's one curve: `cubic-bezier(0.65, 0.01, 0.05, 0.99)` |
| Cursor | a neutral arrow; each click shows a small 12px ring that fades in 0.2 s. No cursor on phone and tablet loops: a soft touch dot instead |
| Highlight | a thin neutral outline around the element that changed, fading after 0.8 s. No accent colour, to match the site |
| Typing | text appears character by character where a field is its own layer; otherwise the field cross-fades from empty to filled |
| Output | `public/media/<slug>/<name>.mp4` plus `public/media/<slug>/<name>.webp` (first frame, used as the poster) |
| Limits | max 1440px wide, ≤ 2 MB, no audio |

---

## 4. The loops, case study by case study

**Priority 1** is the 6 featured case studies. Their covers double as the homepage card covers. **Priority 2** is the 3 app pages.

### P1 · priced-offer (Turning a phone call into a priced offer)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | 01 Job & client · 02 Flight · 03 Compose & send | cursor clicks each rail node; the canvas switches context | 10 s |
| `quick-capture.mp4` | 01 quick capture empty · 02 client · 03 + date and route · 04 + passengers · 05 full offer opened behind it | fields fill one by one; the capture panel opens into the full structure | 8 s |
| `location-field.mp4` | 01 empty field · 02 site name typed, saved-site glyph · 03 coordinates pasted, coordinates glyph · 04 area drawn, area glyph | each entry resolves; the glyph swaps with a highlight | 9 s |
| `send-checklist.mp4` | 01 offer with open issues · 02 Send pressed, "N issues" shown, checklist expanded · 03 a row clicked, the canvas jumps to the field | cursor presses Send; the checklist expands; jump to field | 8 s |

### P1 · safety-report (A two-day safety report, in one guided flow)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | 01 inbox · 02 review · 03 ECCAIRS all decided | a report is opened and moves through its steps | 10 s |
| `synopsis-source.mp4` | 01 review step · 02 a synopsis line hovered, its source sentence highlighted · 03 a suggested hazard kept | hover → source highlight → keep | 8 s |
| `eccairs-exceptions.mp4` | 01 "7 need a decision" · 02 one kept · 03 one corrected with a reason · 04 the counter down | two decisions made; the counter ticks down | 9 s |
| `risk-matrix.mp4` | 01 empty risk fields · 02 severity chosen · 03 probability chosen, cell 3A intolerable · 04 a similar risk linked | the matrix cell lights as each value lands | 9 s |

### P1 · compliance-check (Proving a manual answers the regulation)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | 01 compare, nothing selected · 02 requirement selected, passage highlighted · 03 verdict saved, next one selected | select → evidence → save → next | 10 s |
| `check-found.mp4` | 01 extracted requirements · 02 one requirement corrected · 03 the page-break warning resolved | one correction made | 8 s |
| `compare-scroll.mp4` | 01 compare, nothing selected · 02 requirement selected · **plus one tall frame of the whole manual pane** | the manual pane scrolls to page 19 and the passage highlights | 8 s |
| `weak-match.mp4` | 01 a weak-match row · 02 a different passage selected or Accept | the confidence sentence, then a decision | 7 s |

### P1 · hx-insight (Taking HR off email and spreadsheets)

These four can be built from the screenshots already on your site (`leave-01…04` and so on), if you send them to me. Figma exports at 2x will look sharper.

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | leave-01 · leave-03 · leave-04 | request → approve → notification | 10 s |
| `leave.mp4` | leave-01 · 02 · 03 · 04 | Ayesha asks → Bilal's inbox → approve → she knows | 10 s |
| `resourcing.mp4` | resourcing-01 · 02 · 03 · 04 | gap → request a role → ranked people → book | 10 s |
| `onboarding.mp4` | onboarding-01 · 02 · 03 | plan from the offer → owners → nudge the late ones | 8 s |
| `attendance.mp4` | attendance-02 · 03 · 04 | missed clock-out → exceptions → lock the week | 9 s |

### P1 · training-record (The record that decides who is allowed to fly)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | 01 dashboard · 02 running session · 03 sign-off | three steps of the loop | 10 s |
| `session-rail.mp4` | 01 running session · 02 End pressed: still disabled, the rail names the missing items | press → refusal with the reason | 7 s |
| `sign-off.mp4` | 01 sign-off cascade · 02 signed · 03 the validity statement | the signature cascade completes | 8 s |
| `validity-written.mp4` | 01 completion screen **with each of the 4 records as its own layer** | the four records appear one by one; OUTSIDE NGFT lands last | 7 s |

### P1 · snapgrid (From finished job to first post)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | s1-b (phone) · s4 (web) · s6 (web) | capture → review → publish | 10 s |
| `ghost-camera.mp4` | s1-a · s1-b · s1-c, **plus the ghost overlay as its own layer** | the ghost fades in, the shot lines up, it's taken, uploads start | 7 s · phone |
| `review.mp4` | s4 before decisions · approvals done · one sent back as blurry with a reason | approve, approve, send back with a reason | 8 s |
| `publish.mp4` | s6 empty composer · photos picked · scheduled | only consented photos pickable → schedule | 7 s |

### P2 · instructors (The instructors put the paper down) · tablet

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | 01 my day · 03 running · 05 grading | the instructor's day | 10 s · tablet |
| `running.mp4` | 03 before the tap · after Pass · the next exercise up | tap Pass → segment fills → next | 7 s |
| `grading.mp4` | 05 grade sheet · Partial chosen · quick phrase added · repeat moved | the follow-up after a Partial | 8 s |
| `sign.mp4` | 07 sign screen · signed (**signature as its own layer, or I draw one**) | a signature is drawn; confirm | 7 s |

### P2 · hx-timer (One button, always in reach)

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | timer-01 · 02 · 04 · 07 | start → tracking → break → day filed | 10 s |
| `switch.mp4` | timer-02 · 03 · the new task running | type "tax" → pick → old entry saved, new one runs | 7 s |
| `idle.mp4` | timer-02 · 05 · after discard | the idle dialog → discard | 7 s |
| `menubar.mp4` | timer-06 closed · dropdown open · on a break | the menu bar dropdown with the window closed | 7 s |

### P2 · hx-mobile (The quick jobs, in your pocket) · phone

| File | Frames you give me | What moves | Length |
|---|---|---|---|
| `cover.mp4` | clock-1 · tab-home · tab-leave | lock screen → home → leave | 10 s |
| `clock-in.mp4` | clock-1 · clock-2 | Clock in now → Live Activity | 7 s |
| `fix-punch.mp4` | clock-3 · clock-4 · clock-5 | the miss → fix sheet → pending | 8 s |
| `approve.mp4` | approve-1 · 2 · 3 · 4 | notification → expanded → approve → done with undo | 8 s |

---

## 5. Stills

| File | Who makes it | Notes |
|---|---|---|
| `priced-offer/before-annotated.webp` | **You** supply the redacted original screen; **I** add the five numbered callouts from the diagnosis | approved (N3) |
| `priced-offer/rejected-directions.webp` | Reconstructed lo-fi wireframes | **done** |
| `safety-report/before-three-tools.webp` | Diagram | **done** (in use) |
| `compliance-check/before-two-documents.webp` | Diagram: two documents, two windows | **done** |
| `hx-insight/before-email-sheets.webp` | Not used: you chose no Before image | dropped |
| `training-record/before-paper-excel.webp` | Diagram | **done** |

Diagrams I draw follow the site's tokens: one typeface, greys, no accent colour, and both light and dark versions.

---

## 6. Optional real recordings

| File | Notes |
|---|---|
| `priced-offer/prototype.mp4` | The Claude-built prototype of the offer flow. If it has a link (a published artifact, say), send it and I can record it headlessly. Otherwise, record 10 s yourself. |
| `safety-report/prototype.mp4` | Same, for the SMS prototype. |

---

## 7. Suggested order

1. **Pilot:** one loop, `priced-offer/send-checklist.mp4`, so you can approve the motion style before I make the rest.
2. **The 6 covers.** They also fill the homepage's Featured Work grid.
3. **The other P1 loops** (22), one case study at a time.
4. **P2** (12 loops) and the diagram stills.

Total: 37 loops (9 covers + 28 in the pages), 6 stills, 2 optional recordings.
