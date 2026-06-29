# BillDesk Wallet Solution — overview

Single-file case study of the BillDesk Wallet Solution — a stored-value wallet
shipped as an embeddable **SDK** plus an operator **admin portal**, themed for
Mumbai Metro and FedEx. Built with the `project-overview` skill
(`~/.claude/skills/project-overview`).

## Run
Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8124   # then visit http://localhost:8124
```

No build step, no dependencies — everything is inline except the image assets.
(Reuses the BillDesk design system / `<style>` block from the Netbanking 2.0
overview, so the two docs look like one family.)

## Story / structure
Linear problem → solution → impact arc:

1. **Hero** — the SDK in a phone mockup (Metro wallet), one-line pitch.
2. **01 Overview** — one wallet, two halves (SDK · admin portal · whitelabel).
3. **02 Problem** — pay-fresh-every-time friction for high-frequency payments.
4. **03 Goals** — store / embed / operate.
5. **Unit 01 — The Wallet SDK** — the wallet screen (low vs funded), top-up
   (pipeline + sheet→amount), one-tap pay → metro QR ticket, three design
   decisions, mobile + desktop form factors.
6. **Unit 02 — Whitelabel (FedEx)** — same SDK re-skinned, quote-aware top-up
   with the 2× upsell, branded Prepay-&-Ship sign-up.
7. **Unit 03 — The Admin Portal** — money dashboard, merchant onboarding, spend
   ledger, fund remittance + reconciliation (with the in-product how-to guide).
8. **07 Scaling It** — one SDK, any merchant; the closed loop generalizes.
9. **08 Impact** — what shipped (honest, no invented metrics).
10. **09 Future scope** / **10 Reflection**.

Any element with `data-shot="<path>"` is click-to-zoom (lightbox; Esc closes).
Every `<img>` has an `onerror` fallback that reveals a labelled placeholder.

## Screenshots in use
Assets are organised **by feature**, one folder per part.

**Hero / SDK (`assets/sdk/`)**
- `metro-wallet-funded.png` — funded wallet (also the hero phone mockup)
- `metro-wallet-low.png` — near-empty balance
- `metro-addfunds-sheet.png` — top-up bottom-sheet, quick chips
- `metro-addfunds-amount.png` — ₹500 entered, Continue
- `metro-qr-ticket.png` — one-tap result: scannable metro QR ticket
- `sdk-desktop-wallet.png` — same SDK on desktop (detailed table)

**Whitelabel — FedEx (`assets/whitelabel/`)**
- `fedex-wallet.png` — the wallet re-skinned in FedEx purple
- `fedex-addfunds-quote.png` — top-up opened against a shipment quote
- `fedex-addfunds-2x.png` — ₹5000 selected, 2×-the-quote discount banner
- `fedex-signup.png` — branded Prepay & Ship sign-up

**Admin portal (`assets/admin/`)**
- `admin-dashboard.png` — inward/outward, receivable/payable, reconciled, holdings
- `admin-merchants-add.png` — merchant registry + Add Merchant modal
- `admin-payments.png` — wallet spend ledger (status, amount, charge)
- `admin-remittance-guide.png` — fund remittance with the in-product how-to guide

`Screens/` holds the original dropped PNGs (pre-rename source).

## Layout
```
index.html              the doc (sections + inline CSS + lightbox script)
Screens/                original dropped screenshots (source)
assets/
  sdk/                  consumer wallet SDK (Metro + desktop)
  whitelabel/           FedEx-themed screens
  admin/                operator admin portal
  future/               next-phase screenshots
logs/                   per-session work logs
```

## Conventions
- **One self-contained file**; everything inline except image assets.
- **Assets grouped by feature** — one `assets/<part>/` folder per part.
- **No invented metrics.** Impact states only what's verifiable from the screens
  (two live whitelabels, mobile + desktop, end-to-end admin). Drop in real
  numbers (active wallets, top-up volume, etc.) when available.
