# ADU Eligibility Checker

Check California ADU (Gov. Code § 65852.2) and SB 9 (Gov. Code § 65852.21) eligibility for San Francisco properties using a mock-data MVP.

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
| `npm run test` | Vitest (decision engine) |
| `npm run test:watch` | Vitest watch mode |

## Architecture (Three Layers)

1. **`src/app/`** — Routing-intensive: thin API routes, client `page.tsx` composition root.
2. **`src/components/`** — Component-intensive: `ui/` primitives and `features/` domain components (no barrels).
3. **`src/lib/`** — Logic-intensive: zero React. Rules engine, adapters, mocks, validations.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder theory, decision-engine if/else spec, page wiring, and security hygiene.

## How Eligibility Is Decided

Parcel **facts** (zoning, overlays) flow from mock geocoder → `/api/zoning` → `src/lib/rules`. Outcomes are derived by statute branching in `adu-standard.ts` and `sb9-eligibility.ts`, never copied from mock JSON. See ARCHITECTURE.md for the full decision order.

## Mock Addresses

Try these in the search box:

- `123 Main St` — R-1, no overlays (eligible)
- `456 Oak Ave` — R-1 + Tiny Home overlay
- `789 Pine Rd` — R-1 + fire/VHFHSZ (ADU warning, SB 9 restricted)
- `100 Market St` — C-2 commercial (restricted)
- `555 Beach Blvd` — R-1 + coastal zone

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3000`)

Optional (Phase 2):

- `MAPBOX_ACCESS_TOKEN`
- `REGRID_API_KEY`

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, lucide-react.
