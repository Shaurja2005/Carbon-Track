# EcoTrace

A browser-only carbon footprint estimator. Answer six short questions about how you travel, power your home, eat, and shop — and get your estimated annual CO₂e footprint, a breakdown by category, a comparison against regional averages and the 1.5 °C science-based target, and a ranked list of the highest-impact actions you can take.

Everything runs in your browser. No account, no server, no data ever leaves your device.

**Author:** Sauryadipta Bhattacharya

---

## Features

- Multi-step questionnaire covering transport, home energy, food, and consumption
- Annual footprint estimate in kg CO₂e with category breakdown (bar chart + donut)
- Comparison against the 1.5 °C personal target (2.3 t CO₂e/yr) and your regional average
- Ranked, personalized reduction tips with estimated kg savings per action
- Goal tracker — set a reduction target and track progress across recalculations
- History trend chart — recalculate over time and watch your footprint change
- Smart insight narratives — a plain-language interpretation of your results
- Country leaderboard — see where your footprint sits relative to 30 countries
- Weekly challenge engine — one actionable micro-challenge per week, saved locally
- Carbon badge export — download a shareable PNG summary of your footprint
- Reduction pledge timeline — milestone-based progress toward your goal
- Dark and light theme with persistent preference
- Full keyboard navigation and screen reader support (WCAG 2.1 AA target)
- Strict Content Security Policy with per-request nonces

---

## Quick Start

```bash
# Prerequisites: Node >= 20, npm >= 10
git clone https://github.com/your-username/ecotrace.git
cd ecotrace
cp .env.example .env.local   # edit if needed — no values are required for local dev
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Development

```bash
npm run dev          # start the Next.js dev server (HMR enabled)
npm run lint         # ESLint
npm run typecheck    # TypeScript (tsc --noEmit)
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)
npm run test         # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run test:coverage # Vitest with V8 coverage report
npm run test:e2e     # Playwright end-to-end tests
npm run build        # production build
```

---

## Environment Variables

No variables are required for a working local or production build. The app is fully client-side and ships no secrets.

Copy `.env.example` to `.env.local` to override optional values:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Absolute URL used in OG/share meta tags |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | _(unset)_ | Enables Plausible privacy-first analytics |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub.
2. Import the repository in the [Vercel dashboard](https://vercel.com/new).
3. No additional settings are needed — `vercel.json` and `next.config.ts` handle everything.
4. After deployment, verify security headers at [securityheaders.com](https://securityheaders.com) and the [Mozilla Observatory](https://observatory.mozilla.org).

### Any Node host

```bash
npm ci
npm run build
npm start            # starts the Next.js production server on PORT (default 3000)
```

The app does not require a database or any external service.

---

## CI/CD

The `.github/workflows/ci.yml` pipeline runs on every push to `main` and on every pull request. Three jobs run in parallel:

| Job | Steps |
|---|---|
| **quality** | `npm run lint` → `npm run typecheck` → `npm run format:check` |
| **test** | `npm run test:coverage` (Vitest + V8 coverage, artifact uploaded) |
| **e2e** | Playwright Chromium against a production build (report uploaded) |

All jobs use Node 20 and `npm ci` for deterministic installs.

---

## Project Structure

```
src/
  app/                  Next.js App Router pages
    calculator/         Multi-step footprint questionnaire
    dashboard/          Results, charts, tips, goals
  components/
    calculator/         Form shell, step panels, validation
    charts/             Recharts wrappers (lazy-loaded)
    dashboard/          All dashboard cards and features
    home/               Landing page sections
    layout/             Header, footer, theme toggle
    ui/                 Primitive components (Button, Card, Icon, …)
  lib/                  Pure business logic — no React, no side-effects
    calculator.ts       Footprint computation
    comparisons.ts      Target and regional average comparisons
    emission-factors.ts All emission factor constants and types
    narratives.ts       Plain-language insight generator
    challenges.ts       Weekly challenge engine
    country-data.ts     30-country per-capita dataset
    pledge.ts           Milestone-based goal tracker
    badge-export.ts     Canvas PNG badge generator
    storage.ts          Safe localStorage layer (Zod-validated)
    tips-engine.ts      Personalized ranked reduction tips
    schemas.ts          Zod schemas — single source of truth for types
```

---

## Methodology

EcoTrace estimates an individual's **annual** carbon footprint in kg CO₂e (carbon-dioxide equivalent). All figures are approximate and intended for awareness and relative comparison — not audit-grade carbon accounting. Emission factors are in `src/lib/emission-factors.ts`; the calculation is in `src/lib/calculator.ts`.

### Sources

- **UK DESNZ / DEFRA** — Greenhouse Gas Conversion Factors for Company Reporting (2023): road transport, public transport, aviation, heating fuels.
- **US EPA** — Emission Factors for Greenhouse Gas Inventories.
- **IEA / Ember** — Electricity grid carbon intensity by region (2023).
- **Our World in Data** — CO₂ and Greenhouse Gas Emissions; per-capita averages.
- **Scarborough et al. (2023)**, *Nature Food* — Dietary greenhouse gas footprints by diet type.

### Categories and Formulas

All results are annualized (×52 for weekly inputs, ×12 for monthly).

**Transport**

- Car: `km/week × 52 × fuelFactor` — petrol 0.192, diesel 0.171, hybrid 0.111, electric 0.053 kg CO₂e/km.
- Public transport: `km/week × 52 × 0.06` kg CO₂e/passenger-km (blended bus and rail).
- Flights: `shortHaul × 250 + longHaul × 1100` kg CO₂e per one-way flight (includes a non-CO₂ radiative-forcing uplift).

**Home** (attributed per person by dividing by household size)

- Electricity: `kWh/month × 12 × gridIntensity(region) × (1 − renewable%)`.
- Heating: `amount/month × 12 × heatingFactor`. The amount is the physical quantity of fuel burned in its natural unit — m³ for gas, litres for oil, kg for LPG or firewood. Electric resistance uses the grid factor; a heat pump divides by COP 2.8.
- Grid intensity (kg CO₂e/kWh): US 0.37, UK 0.21, EU 0.25, IN 0.71, Global 0.48.

**Food**

- `dietFactor × foodWasteMultiplier`. Diets (kg CO₂e/yr): vegan 1100, vegetarian 1400, pescatarian 1700, low-meat 2200, medium-meat 2800, high-meat 3600. Waste multiplier: low 1.0, medium 1.1, high 1.25.

**Consumption**

- `shoppingFactor × recyclingMultiplier`. Shopping (kg CO₂e/yr): minimal 600, average 1500, frequent 3000. Recycling multiplier 0.92 when recycling routinely.

### Benchmarks

- Per-capita averages (tonnes CO₂e/yr, approximate): US 14.0, UK 5.0, EU 6.5, IN 1.9, Global 4.7.
- Personal target: **2.3 t CO₂e/yr**, aligned with a 1.5 °C pathway.

### Tips Engine

Each tip's estimated saving is derived from the same emission factors used by the calculator, keeping the numbers internally consistent. Tips are generated only when relevant to the person's inputs and ranked by estimated annual saving descending (`src/lib/tips-engine.ts`).

### Limitations

Footprints are modeled from typical factors, not personal utility bills or receipts. Results can differ from a detailed audit. Embodied emissions (manufacturing) are approximated at a high level. Factors are revised periodically by their publishers; update `emission-factors.ts` to refresh them.

---

## Security

The app has no backend, no database, and no secrets. See [SECURITY.md](./SECURITY.md) for the full security model, HTTP header configuration, and vulnerability reporting instructions.

---

## License

MIT. See [LICENSE](./LICENSE) if present.

---

## Contributing

Pull requests are welcome. Please run `npm run lint && npm run typecheck && npm run test` before opening a PR. The CI pipeline enforces all three checks plus format validation.
