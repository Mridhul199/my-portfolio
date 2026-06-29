# Netbanking 2.0 — Admin Portal (overview)

Single-file case study of the Netbanking 2.0 admin/back-office portal. Built with
the `project-overview` skill (`~/.claude/skills/project-overview`).

## Run
Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

No build step, no dependencies — everything is inline except the image assets.

## Structure — landing + feature modals
The landing page is a short case-study intro (hero · overview · problem · goals)
followed by a **feature card grid** (`#features`). Each feature card opens that
feature's full write-up in a **modal overlay** — there's no long vertical scroll
through every unit. Impact and What's-next close the landing.

Each feature's sections are wrapped in a `.fmodal` (`id="m-<feature>"`,
display:none until opened). A `[data-open="<feature>"]` control — a card or a
chrome-nav link — opens the matching modal; close via the ✕, the scrim, or Esc.

To add a feature:
1. Add a `<button class="fcard" data-open="<feature>">…</button>` to `#features`.
2. Wrap the feature's sections in
   `<div class="fmodal" id="m-<feature>" role="dialog" aria-modal="true" aria-hidden="true"><div class="fmodal-scrim" data-fmodal-close></div><div class="fmodal-card"><button class="fmodal-x" data-fmodal-close>✕</button><div class="fmodal-body"> … </div></div></div>`.
3. (Optional) add a `[data-open="<feature>"]` link to the chrome nav.

The lightbox (`data-shot`) sits above the modal (z-index 100 vs 80), so
click-to-zoom still works inside a feature modal.

## Status
- **Unit 01 — Dashboard:** fully written up (business view, insight→action,
  graph-logic system, performance view) with real screenshots.
- **Unit 02 — UAM:** fully written up (overview, problem, users & lifecycle,
  invite & assign roles, the access model) with real screenshots.
- **Unit 03 — Maker-Checker (Bank Refund Reports):** fully written up (overview,
  problem, reports queue, bulk actions + state filter, the acknowledge step) with
  real screenshots.
- **Unit 04 — Merchant Configuration:** fully written up (registry, configure
  flow, transaction limits, blacklisting) with real screenshots. MCC + MID
  registry; amount / count / custom (time-boxed) limits; blacklist for
  compliance / fraud control.
- **Unit 05 — Whitelabel (IDBI + HSBC):** fully written up (two banks, sign-in,
  themed end-to-end, the token system) with real screenshots. Same portal as
  IDBI (light/green) and HSBC (dark/red) from one token layer.
- Later units: statement upload, settlements.

## Screenshots in use
Assets are organised **by feature**, one folder per unit (newer units), with the
earlier units still flat in `assets/after/`.

**Hero (`assets/hero/`)**
- `checkout-netbanking-2.png` — consumer-side context: Netbanking 2.0 inside a
  BillDesk checkout (Bank app / QR / website, NBBL switch). Sits in the two-column
  hero opposite the intro copy.

**Unit 01 — Dashboard (`assets/after/`)**
- `business-dashboard.png` — full business view
- `peak-time-insights.png` — heatmap + Insights & Actionables
- `graph-logic.png` — the DLS graph-logic spec
- `performance-dashboard.png`, `system-health.png` — Performance view
- `business-overview.png` — alt business view (not currently placed)

**Unit 02 — UAM (`assets/after/`)**
- `uam-users.png` — All Users table + lifecycle states
- `uam-invite-details.png` — invite & assign-roles wizard
- `uam-access-custom.png`, `uam-access-preset.png` — the access model two-up
- `uam-invite-modal.png` — single-view invite variant (not currently placed)

**Unit 03 — Maker-Checker (`assets/maker-checker/`)**
- `maker-checker-reports.png` — Bank Refund Reports queue (File State / Status)
- `maker-checker-bulk.png` — bulk-select toolbar + acknowledge guard tooltip
- `maker-checker-filter.png` — File State filter dropdown
- `maker-checker-confirm.png` — irreversible acknowledge confirmation modal

**Unit 04 — Merchant Configuration (`assets/merchant-config/`)**
- `merchant-config-list.png` — MCC/MID registry (Blacklist + Transaction Limit cols)
- `merchant-config-search.png` — configure modal, search the entity
- `merchant-config-category.png` — resolved MCC: Blacklist + Set Transaction Limit
- `merchant-config-mid.png` — same flow scoped to a MID
- `merchant-config-amount-limit.png` — per-transaction amount limit builder
- `merchant-config-custom-limit.png` — time-boxed custom limit (date range + amount/count)
- `merchant-config-blacklist.png` — blacklist confirmation (red band, Continue & Blacklist)

**Unit 05 — Whitelabel (`assets/whitelabel/`)**
- `whitelabel-idbi-dashboard.png`, `whitelabel-hsbc-dashboard.png` — same dashboard, two themes
- `whitelabel-idbi-login.png`, `whitelabel-hsbc-login.png` — branded sign-in
- `whitelabel-idbi-invite.png` — UAM invite modal, IDBI theme
- `whitelabel-idbi-password.png`, `whitelabel-idbi-2fa.png` — auth flows, re-tinted
- `whitelabel-hsbc-settlement.png` — settlement recon, HSBC dark theme
- `whitelabel-hsbc-moodboard.png` — HSBC token moodboard (primary/secondary/accent)

Later units: `assets/statement-upload/`, `assets/settlements/`.

## Layout
```
index.html              the doc (sections + inline CSS + lightbox script)
assets/
  after/                Unit 01–02 screenshots (earlier flat convention)
  <feature>/            one folder per feature/unit, e.g. maker-checker/
  future/               vision / next-phase screenshots
logs/                   per-session work logs
```

## Conventions
- **Assets are grouped by feature** — each unit gets its own `assets/<feature>/`
  folder rather than a shared before/after split. The doc is net-new, so there's
  no "before" UI to mirror; the units are the organising principle.
- Every `<img>` carries an `onerror` fallback that reveals a labelled placeholder,
  so a missing file degrades gracefully and tells you which path to drop.
- Any element with `data-shot="<path>"` is click-to-zoom (lightbox).
- This is a net-new portal — no "before" UI. The "before" is the manual,
  spreadsheet-driven process, framed in each unit's Problem section.
