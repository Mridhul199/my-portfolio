# BillDesk BillPay SSO — overview

Single-file case study of a **UI/UX enhancement** to BillDesk's **BillPay SSO**
portal — the whitelabelled bill-pay experience a bank's customers single-sign-on
into — plus a set of **micro-illustrations contributed to the BillDesk design
system (DLS)** for the biller list. Built with the `project-overview` skill,
reusing the BillDesk design system from the sibling overviews.

## The story in one line
BillPay SSO is live across **30–50 partner banks** (per BillDesk). This work
raised the bar on how it looks and feels — clearer biller discovery, consistent
surfaces across bill-pay / recharge / FX — and produced a reusable, two-state
micro-illustration family for biller categories that now lives in the DLS.

## Run
Open `index.html` directly, or serve the folder:
```
python3 -m http.server 8126   # then visit http://localhost:8126
```
No build step — everything inline except image assets.

## Structure
Enhancement / redesign arc:
1. **Hero** — the new biller picker in a browser mockup.
2. **01 Overview** — single sign-on, whitelabel, more-than-bills.
3. **02 Starting point** — functional but flat; a before/after slot anchors the redesign.
4. **03 Goals** — clarify · delight · unify.
5. **04 Add a biller** — pick (search + recents + category illustrations) and details (sample bill + inline help).
6. **05 Recharges** — plan picker + contextual offer banners.
7. **06 FX Retail** — create account + order history (same design language).
8. **07 System contribution** — the DLS micro-illustration set + its active/inactive states.
9. **Design decisions / 08 Impact / 09 Future / 10 Reflection.**

`data-shot` = click-to-zoom (lightbox, Esc closes). Every `<img>` has an
`onerror` labelled-placeholder fallback.

## Screenshots in use
Organised **by feature**.

**Add a biller (`assets/add-biller/`)** — `select-biller`, `biller-details`
**Recharges (`assets/recharges/`)** — `recharge-plans`, `recharge-promo-atm`, `recharge-promo-savings`
**FX Retail (`assets/fx-retail/`)** — `fx-create-account`, `fx-order-history`
**DLS illustrations (`assets/illustrations/`)** — `micro-illustrations` (~40 marks), `new-set-states` (active / inactive)
**Before (`assets/before/`)** — `legacy-add-biller.png` *(empty drop-slot — see note)*

Source PNGs kept in `Screens/` and `illustration/`.

## Note on the "before" state
The existing/legacy workflow screenshots were **not** captured from the web —
web tooling returns page text, not downloadable product screenshots, and scraping
live product UI isn't appropriate. The **02 Starting point** section therefore
frames the legacy pain in words and leaves a labelled drop-slot at
`assets/before/legacy-add-biller.png`; drop the real screenshot there and the
before/after fills in automatically.

## Layout
```
index.html              the doc (sections + inline CSS + lightbox script)
Screens/                original enhancement PNGs (source)
illustration/           original illustration sheets (source)
assets/<feature>/        screenshots grouped by feature
assets/before/           legacy-state drop-slot
logs/                    per-session work logs
```

## Conventions
- One self-contained file; everything inline except images.
- Assets grouped by feature; the lone before/ slot is the redesign anchor.
- **No invented metrics.** "30–50 banks" is per BillDesk (user-provided); the
  rest of impact states the deliverable (enhancement + DLS illustration set), not
  usage numbers. Add real results if available.
