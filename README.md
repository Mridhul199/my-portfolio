# Mridhul Aswin — Portfolio

Static personal portfolio. One dark, minimal theme across the home shell and
both case studies; product screenshots stay framed in light. No framework, no
build step — plain HTML/CSS, image assets only.

## Structure

```
index.html              Home — dark shell (hero · work · about · contact)
styles/
  shell.css             Home design system (dark)
  casestudy-dark.css    Dark override layer shared by both case studies
netbanking-2/           Case study — Netbanking 2.0 admin portal (dark)
wallet/                 Case study — BillDesk Wallet Solution (dark)
assets/                 favicon, og-image, headshot, resume.pdf
.nojekyll               disables Jekyll on GitHub Pages
```

Each case study is a single HTML file (inline CSS, own assets) plus the shared
`styles/casestudy-dark.css` dark layer, and carries a slim "← Mridhul Aswin"
bridge bar back to the home page.

## Run locally

```
python3 -m http.server 8080    # then open http://localhost:8080
```

Serve from the repo root so the relative paths (`netbanking-2/...`, `wallet/...`,
`styles/...`, `assets/...`) resolve. All URLs are relative, so the site also
works under a GitHub Pages subpath (`username.github.io/<repo>/`).

## Deploy (GitHub Pages)

1. Create a GitHub repo and push this directory.
2. Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Site goes live at `https://<user>.github.io/<repo>/`.
4. (Optional) add a custom domain in Settings → Pages, then update absolute
   references if any are added later.

`.nojekyll` is present so GitHub Pages serves files as-is.

## Placeholders to replace

Marked in the home page with a dashed underline (`.ph-mark`):

- Hero intro line and headline positioning
- Bio copy (About section)
- `assets/headshot.jpg` — drop in and uncomment the `<img>` in the About block
- `assets/resume.pdf` — replace the placeholder PDF
- `assets/og-image.png` — replace the social preview
- Email (`mailto:hello@example.com`), LinkedIn URL — search the home page

## Notes

- Case-study screenshots double as home work-card covers; every `<img>` has an
  `onerror` fallback that reveals a labelled placeholder if a path breaks.
- Scroll-reveal and hover motion respect `prefers-reduced-motion`.
- Planning docs and original source screenshots live in `_planning/` (not deployed).
