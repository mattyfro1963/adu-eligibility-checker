# ADU Eligibility Checker

Check California ADU (Gov. Code Chapter 13, §§ 66310–66342) and SB 9 (Gov. Code §§ 65852.21 / 66411.7) eligibility for San Francisco properties. Zoning comes from a local DataSF GeoJSON pilot (point-in-polygon), not a canned mock status map.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server             |
| `npm run build`      | Production build                     |
| `npm run start`      | Start production server              |
| `npm run lint`       | ESLint                               |
| `npm run format`     | Prettier write                       |
| `npm run typecheck`  | TypeScript check                     |
| `npm run test`       | Vitest (decision engine + pilot PIP) |
| `npm run test:watch` | Vitest watch mode                    |

## Architecture (Three Layers)

1. **`src/app/`** — Routing-intensive: thin API routes, client `page.tsx` composition root.
2. **`src/components/`** — Component-intensive: `ui/` primitives and `features/` domain components (no barrels).
3. **`src/lib/`** — Logic-intensive: zero React. Rules engine, adapters, mocks, validations.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder theory, decision-engine if/else spec, page wiring, and security hygiene.

## SF Pilot Zoning

- **Data:** [`public/data/pilot-zoning.geojson`](./public/data/pilot-zoning.geojson) — SF Zoning Districts from [DataSF 3i4a-hu95](https://data.sfgov.org/d/3i4a-hu95) (PDDL). Large (~33MB); SF coverage only. Runtime reads the local file only — no live DataSF fetches.
- **Lookup:** `/api/zoning?lat=&lng=` → `src/lib/adapters/pilot-zoning.ts` (Turf `booleanPointInPolygon`) → `evaluateEligibility`. Overlays default to `false` in this pilot.
- **Turf** stays in adapters only — not in rules or UI.

Search a real San Francisco address (Mapbox geocode when configured, else mock geocode for demo strings). Points outside SF polygons return 404.

## Product UI

Light premium shell (`#F5F5F7`, sticky `doihave.space` header, `max-w-6xl`). Primary CTA/active/link token is `#0066CC`.

1. **Search hero** — “Discover your property's true potential.” Mapbox-backed autocomplete (or mock demos when the token is unset) via `/api/geocode`. **Evaluate Lot** submit; SF pilot honesty stays under the bar. Three value props (zoning / parcel facts / ADU & SB 9) sit below search.
2. **Analysis interstitial** — full-screen overlay while geocode is resolved and zoning is loading. Checklist is honest to the pipeline (locate → DataSF PIP → ADU rules → SB 9 rules). No invented transit overlays.
3. **Evaluation dashboard** — 60/40 static Mapbox preview (`/api/map-preview`, greyscale) + scrollable data panel (address, APN/`mapblklot`, zoning, overlay facts, ADU/SB 9 segmented `RuleDetail`). **Parcel briefing** + Buyer guides strip remain below. Engine reasons come from `src/lib/rules` (no statute branching in components).
4. **Get Quotes** — modal reuses `ProjectLeadForm` + `POST /api/lead`; matched contractors render in-modal (`ContractorMatchGrid`). Copy is connect-with-licensed-builders, not a guaranteed marketplace.
5. **Eligible overall** — `PartnerOffers` product partner grid (build-out / outfit) with disclosure; link to `/partners`. No expert lead form.
6. **Warning overall** — soft specialist lead (amber) plus a narrow affiliate subset labeled as optional research. No rose restricted CTA.
7. **Restricted overall** — diagnostics stay visible; `LeadFallbackForm` for expert review, then low-emphasis alternate-pathway offers below the form. Continues to `/connect` (prefilled address) for full project lead + contractor match. Get Quotes still works from the dashboard.
8. **Connect (`/connect`)** — homeowner project lead form + mock nearby ADU/tiny-home contractor matches; builder beta signup ($20–$100/lead). APIs: `POST /api/lead` (`project` | `quote_interest` | `restricted_review`), `POST /api/builder-signup` (console + optional webhooks).

CTAs bifurcate by `overall` after each search (mint `searchId` for affiliate tracking). Partner catalog lives in `src/lib/content/`; statute copy stays in `src/lib/regulations/`.

## SF Buyer Guides

Standalone `/guides` (SF-only): THOW legality, cost matrix (crane, trenching `$1,000–$5,000+`, permits), wheels-vs-foundation. Corpus in `src/lib/content/guides/` (zero React). Statewide county directory remains at `/regulations`.

## How Eligibility Is Decided

Parcel **facts** (zoning from PIP; overlays default false) flow from the pilot adapter → `/api/zoning` → `src/lib/rules`. Outcomes are derived by statute branching in `adu-standard.ts` and `sb9-eligibility.ts`, never copied from mock JSON. See ARCHITECTURE.md for the full decision order.

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3000`)

Optional:

- `MAPBOX_ACCESS_TOKEN` — real address geocoding + static map preview (server-only). If unset, `VITE_MAPBOX_ACCESS_TOKEN` is accepted as a fallback (legacy Vercel/Vite naming). Never use a `NEXT_PUBLIC_*` Mapbox token.
- `VITE_MAPBOX_ACCESS_TOKEN` — optional alias for `MAPBOX_ACCESS_TOKEN` only

**Vercel:** set `MAPBOX_ACCESS_TOKEN` (preferred) or keep existing `VITE_MAPBOX_ACCESS_TOKEN`. Both are server-only — do not expose as `NEXT_PUBLIC_*`. Redeploy after changing env so geocode + map preview pick up the token.
- `REGRID_API_KEY` — Phase 2 parcels
- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` — error reporting (omit to disable)
- `SENTRY_AUTH_TOKEN` — build-time source map upload (production)
- `LEAD_WEBHOOK_URL` — optional Slack/Discord-compatible webhook for homeowner project leads, quote interest, and restricted compliance reviews (`POST /api/lead`). Server-only.
- `BUILDER_WEBHOOK_URL` — optional webhook for builder partner signups (`POST /api/builder-signup`)
- `NEXT_PUBLIC_AFFILIATE_*` — optional affiliate outbound URLs for eligible next-steps (see `.env.example`). Cards omit when unset. No commission rates in UI copy.

## Sentry

Errors and performance tracing via `@sentry/nextjs` (Developer tier). Sample rates: 100% traces in development, 10% in production. No Session Replay.

- App Router boundaries (`error.tsx`, `global-error.tsx`) call `Sentry.captureException` because Next.js catches those before global handlers.
- API routes capture unexpected failures in `try/catch`; expected 4xx (validation, not found, outside pilot) are not reported.

Verify locally: hit an instrumented path that throws, then check [Issues](https://envirostar-app.sentry.io/issues/?project=adu-eligibility-checker). For readable production stacks, set `SENTRY_AUTH_TOKEN` on Vercel and deploy a build.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, lucide-react, `@sentry/nextjs`, `@turf/turf` (server adapters only).
