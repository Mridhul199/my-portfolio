# Mridhul Aswin — Portfolio

Static personal portfolio. One dark, minimal theme across the home shell and
both case studies; product screenshots stay framed in light. No framework, no
build step — plain HTML/CSS, image assets only.

## Structure

```
index.html              Home — dark shell (hero · work · about · contact)
styles/
  shell.css             Home design system (dark)
  casestudy-dark.css    Dark override layer shared by all case studies
scripts/reveal.js       Shared entrance/scroll-reveal motion (all pages)
netbanking-2/           Case study — Netbanking 2.0 admin portal
wallet/                 Case study — BillDesk Wallet Solution
billpay-sso/            Case study — BillPay SSO portal refresh + DLS illustrations
ondc-flight-booking/    Case study — ONDC flight booking (bank buyer app, BillDesk as TSP)
sihub/                  Case study — SIHUB Standing Instruction Hub (recurring mandates)
assets/                 favicon, og-image, headshot, resume.pdf
.nojekyll               disables Jekyll on GitHub Pages
```

All five case studies are dark-themed (product screenshots kept in light frames).
Each is a single HTML file (inline CSS, own assets) plus the shared
`styles/casestudy-dark.css` dark layer, and carries a slim "← Mridhul Aswin"
bridge bar back to the home page.

## Run locally

```
python3 -m http.server 8080    # then open http://localhost:8080
```

Serve from the repo root so the relative paths (`netbanking-2/...`, `wallet/...`,
`styles/...`, `assets/...`) resolve. All URLs are relative, so the site also
works under a GitHub Pages subpath (`username.github.io/<repo>/`).

## Deploy (GitHub Pages — CI/CD)

Live: **https://mridhul199.github.io/my-portfolio/**

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` publishes the repo root to GitHub Pages — no build step.

One-time setup (already done): repo **Settings → Pages → Source: GitHub Actions**.
After that, pushing to `main` is the entire release process.

`.nojekyll` is present so Pages serves files as-is. All URLs are relative, so the
site works under the `/my-portfolio/` subpath; a custom domain can be added later
in Settings → Pages with no code changes.

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
