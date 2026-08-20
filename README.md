# ADU Eligibility Checker

Check California ADU (Gov. Code § 65852.2) and SB 9 (Gov. Code § 65852.21) eligibility for San Francisco properties. Zoning comes from a local DataSF GeoJSON pilot (point-in-polygon), not a canned mock status map.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest (decision engine + pilot PIP) |
| `npm run test:watch` | Vitest watch mode |

## Architecture (Three Layers)

1. **`src/app/`** — Routing-intensive: thin API routes, client `page.tsx` composition root.
2. **`src/components/`** — Component-intensive: `ui/` primitives and `features/` domain components (no barrels).
3. **`src/lib/`** — Logic-intensive: zero React. Rules engine, adapters, mocks, validations.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder theory, decision-engine if/else spec, page wiring, and security hygiene.

## SF Pilot Zoning

- **Data:** [`public/data/pilot-zoning.geojson`](./public/data/pilot-zoning.geojson) — SF Zoning Districts from [DataSF 3i4a-hu95](https://data.sfgov.org/api/v3/views/3i4a-hu95/query.geojson?accessType=DOWNLOAD) (PDDL). Large (~33MB); SF coverage only.
- **Lookup:** `/api/zoning?lat=&lng=` → `src/lib/adapters/pilot-zoning.ts` (Turf `booleanPointInPolygon`) → `evaluateEligibility`. Overlays default to `false` in this pilot.
- **Turf** stays in adapters only — not in rules or UI.

Search a real San Francisco address (Mapbox geocode when configured, else mock geocode for demo strings). Points outside SF polygons return 404.

## How Eligibility Is Decided

Parcel **facts** (zoning from PIP; overlays default false) flow from the pilot adapter → `/api/zoning` → `src/lib/rules`. Outcomes are derived by statute branching in `adu-standard.ts` and `sb9-eligibility.ts`, never copied from mock JSON. See ARCHITECTURE.md for the full decision order.

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3000`)

Optional:

- `MAPBOX_ACCESS_TOKEN` — real address geocoding
- `REGRID_API_KEY` — Phase 2 parcels

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, lucide-react, `@turf/turf` (server adapters only).
