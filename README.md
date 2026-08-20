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

Light premium shell (`#F5F5F7`, sticky `doihave.space` header, `max-w-6xl`):

1. **Search hero** — Mapbox-backed autocomplete (or mock demos when the token is unset) via `/api/geocode`.
2. **Results bento** — Mapbox Static preview (`/api/map-preview`, greyscale + CAD reticle) beside **Target Acquired** summary; **Regulatory Diagnostics** map ADU / SB 9 reasons from `src/lib/rules` (no statute branching in components).
3. **Restricted overall** — same bento plus `LeadFallbackForm` for expert review.

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

## Sentry

Errors and performance tracing via `@sentry/nextjs` (Developer tier). Sample rates: 100% traces in development, 10% in production. No Session Replay.

- App Router boundaries (`error.tsx`, `global-error.tsx`) call `Sentry.captureException` because Next.js catches those before global handlers.
- API routes capture unexpected failures in `try/catch`; expected 4xx (validation, not found, outside pilot) are not reported.

Verify locally: hit an instrumented path that throws, then check [Issues](https://envirostar-app.sentry.io/issues/?project=adu-eligibility-checker). For readable production stacks, set `SENTRY_AUTH_TOKEN` on Vercel and deploy a build.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, lucide-react, `@sentry/nextjs`, `@turf/turf` (server adapters only).
