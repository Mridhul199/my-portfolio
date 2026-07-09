# Mridhul Aswin — Portfolio

Static personal portfolio. One dark, minimal theme across the home shell and
every case study; product screenshots stay framed in light. No framework, no
build step — plain HTML/CSS, image assets only.

## Structure

```
index.html                     Home — dark shell (hero · work · about · contact)
styles/
  shell.css                    Home design system (dark)
  casestudy-dark.css           Dark override layer shared by all case studies
scripts/reveal.js               Shared entrance/scroll-reveal motion (all pages)
admin-dashboard/                Case study — admin & dashboard designs
wallet/                         Case study — Wallet Solution (SDK + admin portal)
bill-pay-portal/                Case study — Bill-Pay Portal refresh + DLS illustrations
in-app-travel-booking/          Case study — in-app travel booking buyer flow
recurring-payments-hub/         Case study — Recurring Payments Hub
whitelabel-theme-automation/    Case study — Whitelabel Theming, Automated
kyc-tokenization/               Case study — KYC Tokenization concept
dls-overview/                   Case study — DLS Component Catalog
resume/                         Résumé page
assets/                         favicon, og images, headshot
.nojekyll                       disables Jekyll on GitHub Pages
```

All case studies are dark-themed (product screenshots kept in light frames).
Each is a single HTML file (inline CSS, own assets) plus the shared
`styles/casestudy-dark.css` dark layer, and carries a slim "← Mridhul Aswin"
bridge bar back to the home page.

## Run locally

```
python3 -m http.server 8080    # then open http://localhost:8080
```

Serve from the repo root so the relative paths (`wallet/...`, `styles/...`,
`assets/...`) resolve. All URLs are relative, so the site also works under a
GitHub Pages subpath (`username.github.io/<repo>/`).

## Deploy (GitHub Pages — CI/CD)

Live: **https://mridhul199.github.io/my-portfolio/**

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` publishes the repo root to GitHub Pages — no build step.

One-time setup (already done): repo **Settings → Pages → Source: GitHub Actions**.
After that, pushing to `main` is the entire release process.

`.nojekyll` is present so Pages serves files as-is. All URLs are relative, so the
site works under the `/my-portfolio/` subpath; a custom domain can be added later
in Settings → Pages with no code changes.

## Notes

- Case-study screenshots double as home work-card covers; every `<img>` has an
  `onerror` fallback that reveals a labelled placeholder if a path breaks.
- Scroll-reveal and hover motion respect `prefers-reduced-motion`.
- All case studies use generic, non-identifying terminology for the specific
  clients/products involved — real names and logos are not disclosed anywhere
  on this site.
