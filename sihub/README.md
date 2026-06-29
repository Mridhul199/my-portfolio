# SIHUB overview

Single-file case study of the SIHUB recurring-mandate redesign. Built with the
`project-overview` skill (`~/.claude/skills/project-overview`).

## Run
Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

No build step, no dependencies — everything is inline except the image assets.

## Layout
```
index.html              the doc (10 sections, inline CSS + 2 small scripts)
assets/
  before/               legacy-state screenshots
  after/                revamped-state screenshots (mobile + desktop)
  future/               SiHub+ vision screenshots
logs/                   per-session work logs
```

## Interactive playground (Section 07)
Pick a bank → its recurring-payment screen re-skins live (Mobile / Desktop toggle).
- The token engine maps a bank's primary HEX → 20 tokens, then sets CSS vars
  (`--pv-fill`, `--pv-brand-dark`, …) on `.pv-wrap`; the screens read those vars.
- Banks with a separate accent (Federal, Yes, BoB) drive the top bar from the
  raw accent; buttons stay on the primary.
- No external art — bank logos fall back to a text wordmark, so the playground
  has zero asset dependencies.

## Conventions
- Every `<img>` carries an `onerror` fallback that reveals a labelled placeholder, so a
  missing file degrades gracefully and tells you which path to drop.
- Any element with `data-shot="<path>"` is click-to-zoom (lightbox).
- Keep assets in `assets/{before,after,future}/`; don't inline large binaries.
- Inline scripts: (1) lightbox, (2) theme playground. Verify both parse/run
  before shipping (JavaScriptCore + a tiny DOM shim works without a browser).
