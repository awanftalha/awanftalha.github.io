# Diagrams

These are the "before" diagrams for case studies where there's no old screen to show. They're simple illustrations in the site's tokens, labelled **DIAGRAM** in the corner so nobody mistakes them for screenshots.

| File | Used by | Status |
|---|---|---|
| `before-two-documents.svg` | `compliance-check` | **In use.** Exported to `public/media/compliance-check/before-two-documents.webp` |
| `before-three-tools.svg` | `safety-report` | **In use** (`public/media/safety-report/`) |
| `before-paper-excel.svg` | `training-record` | **In use** (`public/media/training-record/`) |
| `rejected-directions.svg` | `priced-offer` | **In use** (`public/media/priced-offer/`), labelled RECONSTRUCTED WIREFRAME |
| `before-email-sheets.svg` | `hx-insight` | Not used (no Before image on that page). Kept as a spare. |

- **Font:** they were drawn with Inter Display as a stand-in. The SVGs ask for General Sans or Satoshi first, so once the site font is chosen and installed, re-export them with `python3 scripts/make-diagrams.py` (writes the SVGs) and any SVG-to-WebP export at 2880 × 1800.
- **Text:** all wording comes from the case studies themselves. Nothing in them is a real document or a real email.
