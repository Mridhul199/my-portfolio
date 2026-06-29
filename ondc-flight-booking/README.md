# ONDC Flight Booking — overview

Single-file case study of an **ONDC flight-booking buyer app** designed for a
bank, with **BillDesk acting as the bank's Technology Service Provider (TSP)**.
Built with the `project-overview` skill (`~/.claude/skills/project-overview`),
reusing the BillDesk design system from the Netbanking 2.0 / Wallet overviews.

## The story in one line
A bank wants to sell flights to its customers but has no travel stack. It joins
**ONDC** as a *buyer app*; **BillDesk** is its *TSP*, designing and building the
booking experience — search → results → review → seats/meals → payment — that
plugs into ONDC's open travel network. Built **with ONDC**. **HDFC is not the
client** — the journey was themed into HDFC's identity to *prove whitelabel
capability*: the same flow wears any partner bank's brand.

### ONDC roles (context)
ONDC (Open Network for Digital Commerce) is a Govt-of-India / DPIIT protocol, not
a platform. Four roles: **Buyer NP** (here, the bank), **Seller NP** (airlines /
travel sellers), **Gateway** (matches buyer↔sellers), **TSP** (here, BillDesk —
supplies the software so a buyer with no commerce tech can participate). The
Buyer-App TSP model is aimed exactly at banks, fintechs, telcos.

## Run
Open `index.html` directly, or serve the folder:
```
python3 -m http.server 8125   # then visit http://localhost:8125
```
No build step — everything inline except image assets.

## Structure
Linear problem → solution → impact arc:
1. **Hero** — flight results in a browser mockup; one-line pitch.
2. **01 Overview** — a flight store inside the bank (customer / bank / network).
3. **02 ONDC & where we sit** — what ONDC is + the buyer→gateway→seller pipeline; BillDesk as TSP.
4. **03 Problem / 04 Goals** — banks have no travel stack; ONDC is a protocol, not a UI.
5. **05 Process — Wireframe → VD** — same flow, bank-shell wireframes vs BillDesk DLS visual design.
6. **The booking flow** — Search · Results · Review & traveller · Seats & meals · Payment (each a before/after where both fidelities exist).
7. **Design decisions** — fare-on-calendar, refund-as-timeline, sticky fare summary, persona fares, one-flow-two-skins.
8. **07 Scaling / 08 Impact / 09 Future / 10 Reflection.**

`data-shot` = click-to-zoom (lightbox, Esc closes). Every `<img>` has an
`onerror` labelled-placeholder fallback.

## Screenshots in use
Organised **by booking step**; fidelity encoded in the filename (`-wf-` wireframe,
`-vd-` visual design).

**Search (`assets/search/`)** — `search-vd-oneway`, `search-vd-destination`,
`search-vd-date`, `search-vd-travelers`, `search-wf-destination`
**Results (`assets/results/`)** — `results-vd`, `results-wf`
**Review & traveller (`assets/review/`)** — `review-vd-traveler`, `review-wf-booking`
**Seats & meals (`assets/addons/`)** — `addons-vd-seats`, `addons-vd-seatmap`, `addons-wf-seatmeal`
**Payment (`assets/payment/`)** — `payment-wf`

Source PNGs kept in `VD/` and `Wireframe/` (+ `Wireframe/_extracted/`).

## Layout
```
index.html              the doc (sections + inline CSS + lightbox script)
VD/                      original visual-design PNGs (source)
Wireframe/               original wireframe PNGs + the dropped .zip (source)
assets/<step>/           screenshots grouped by booking step (wf + vd)
logs/                    per-session work logs
```

## Conventions
- One self-contained file; everything inline except images.
- **Assets grouped by feature/step**, not before/after — wireframe vs VD is a
  fidelity axis carried in the filename (`-wf-`, `-vd-`), so the before/after
  *pairs* live inside each step folder.
- **No invented metrics.** These are designs (wireframe → VD); impact states the
  design deliverable and the TSP/ONDC arrangement, not usage numbers. Add real
  results if/when it ships.
