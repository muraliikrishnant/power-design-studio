# Power Design Studio

A small set of analog power applications engineering tools, built around the core of the
job: enhancing/debugging analog IC reference circuits, writing datasheets and application
notes, power delivery network (PDN) analysis and recommendations, and bench validation with
lab equipment (oscilloscope, power supplies, load, network analyzer).

- **Buck Converter Reference Design** — sizes the inductor and output capacitor from your
  ripple targets using the standard switching-regulator design equations, and estimates
  efficiency from conduction, inductor DCR, and switching losses.
- **PDN Impedance Analysis** — models a decoupling capacitor bank (bulk/mid/small, each as an
  R-L-C branch) plus board/plane inductance, sweeps impedance vs frequency, and flags where it
  exceeds a target impedance — the classic PDN "anti-resonance" problem between capacitor
  decades.
- **Application Note Generator** — turns your latest Buck and PDN results into a draft
  markdown write-up (design equations, loss table, recommendations), downloadable as `.md`.
- **Bench Test Log** — a record of oscilloscope/power-supply/load/network-analyzer
  measurements taken while validating a design, kept in the browser (no backend).

Every calculation is a pure function in `lib/`, covered by hand-checked example numbers during
development — there's no backend, database, or account to set up.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

- `lib/types.ts` — shared types for both studies
- `lib/complex.ts` — minimal complex-number arithmetic for the PDN impedance sweep
- `lib/buck.ts`, `lib/buck-data.ts` — buck converter design engine + sample spec
- `lib/pdn.ts`, `lib/pdn-data.ts` — PDN impedance engine + sample decoupling bank
- `lib/appnote.ts` — draft application-note generator
- `lib/storage.ts` — tiny localStorage helper used to carry results between pages
- `app/*` — dashboard, buck converter, PDN analysis, application note, and bench log pages

## Disclaimer

These are educational reference calculations meant to build intuition for the underlying
design and analysis methods. They are not a substitute for a full simulation, lab
characterization, or a vendor's own design tools before committing a design to silicon or a
board spin.
