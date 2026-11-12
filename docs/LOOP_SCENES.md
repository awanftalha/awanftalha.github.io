# Loop scenes · how `scripts/render-loop.mjs` reads a loop

Each loop in `docs/SHOT_LIST.md` gets a folder: `media-src/<slug>/<name>/`, which is git-ignored. It holds the Figma exports and one `scene.json` that says what happens, in order.

```
node scripts/render-loop.mjs priced-offer/send-checklist            # render
node scripts/render-loop.mjs priced-offer/send-checklist --preview  # also writes preview.html to watch in a browser
```

Output: `public/media/<slug>/<name>.mp4` (H.264, ≤ 2 MB; quality is lowered automatically until it fits) and `<name>.webp`, the first frame, used as the poster.

**Requirements:**
- `npm i -D playwright` and `npx playwright install chromium`, or set `CHROME_PATH` to an installed Chrome.
- `ffmpeg` on PATH. Ask Talha before installing it.

---

## The scene file

```json
{
  "size": [1440, 900],
  "frames": { "01": "01.png", "02": "02.png", "03": "03.png" },
  "layers": {
    "checklist": { "src": "move-checklist.png", "x": 1084, "y": 480, "w": 332, "h": 300 }
  },
  "cursor": { "start": [900, 700] },
  "steps": [
    { "wait": 0.8 },
    { "move": [1250, 824], "dur": 0.7 },
    { "click": true },
    { "show": "02", "transition": "cut", "with": true, "delay": 0.12 },
    { "layer": "checklist", "from": { "y": 16, "opacity": 0 }, "to": { "y": 0, "opacity": 1 }, "dur": 0.5, "with": true },
    { "wait": 1.0 },
    { "move": [1200, 560], "dur": 0.6 },
    { "click": true },
    { "hide": "checklist", "with": true, "delay": 0.12 },
    { "show": "03", "dur": 0.5, "with": true },
    { "highlight": [328, 396, 712, 48], "dur": 1.4 },
    { "wait": 0.6 }
  ],
  "loopBack": 0.6
}
```

| Field | Meaning |
|---|---|
| `size` | The Figma frame's size in CSS px (not the 2x export size). All coordinates use this space, so they can be read straight from Figma. |
| `frames` | The full-screen states, `"01"` first. Exported at 2x. |
| `layers` | Parts that move on their own (Figma layers named `move:<what>`). `x y w h` is the layer's box in the frame. Optional fields: `"visible": true` to start shown; `"clip": [x, y, w, h]` to show it only inside a box (use this for scrolling panes). |
| `cursor.start` | Where the cursor (or touch dot) starts and returns to at the loop's end. |
| `scale` | Output pixel ratio. Default: 1 for desktop frames, 2 for phone and tablet (width under 1000). The output is never wider than 1440px. |
| `touch` | `true` shows a touch dot instead of an arrow. Default: on when the frame is under 1000px wide. |
| `loopBack` | Seconds spent cross-fading back to frame 01 at the end, so the loop has no jump. Default 0.6. |

## Steps

Steps run one after another. Add `"with": true` to start a step at the same moment as the one before it, and `"delay": 0.12` to start it a little later. A state change usually lands about 0.12 s after a click.

| Step | Does | Default `dur` |
|---|---|---|
| `{ "wait": 0.8 }` | Holds | the number given |
| `{ "move": [x, y] }` | Moves the cursor or touch dot | 0.6 |
| `{ "click": true }` | A click ring (or tap pulse) at the cursor | 0.35 |
| `{ "show": "02", "transition": "fade" }` | Changes the full-screen state. `fade` · `cut` · `slide-left` · `slide-up` | 0.5 |
| `{ "highlight": [x, y, w, h] }` | A thin neutral outline that fades in, holds and fades out. Optional `radius` | 1.0 |
| `{ "layer": "name", "from": {…}, "to": {…} }` | Animates a layer's `x`, `y` (offsets in px), `opacity` and `scale` | 0.5 |
| `{ "reveal": "name" }` | Wipes a layer in from left to right (use it for typed text) | 0.8 |
| `{ "scroll": "name", "by": -1200 }` | Scrolls a clipped layer's content by that many px | 1.2 |
| `{ "hide": "name" }` | Fades a layer out | 0.3 |

All motion uses the site's one easing curve, `cubic-bezier(0.65, 0.01, 0.05, 0.99)`.

## Rules (from SHOT_LIST.md)

- **Only states that exist as Figma frames.** If a step in the shot list needs a frame that isn't there, leave it out and tell Talha. Never draw UI.
- **Rhythm:** hold the first state about 0.8 s, give each step 1.2–2 s, keep transitions at 0.4–0.6 s, and aim for 6–12 s in total (covers 10 s).
- **Coordinates come from the Figma layer positions,** not guesses. Read them from the Figma file's structure.
- **Check every render** by opening the MP4, or a contact sheet of a few frames, before calling it done.
