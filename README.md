# ADU Eligibility Checker

Check California ADU (Gov. Code Chapter 13, §§ 66310–66342) and SB 9 (Gov. Code §§ 65852.21 / 66411.7) eligibility for **all California counties**. Every search returns jurisdiction-aware tiny-home requirements; lot-level zoning applies where a GIS provider covers the coordinate.

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
| `npm run test`       | Vitest (decision engine + zoning PIP) |
| `npm run test:watch` | Vitest watch mode                    |

## Architecture (Three Layers)

1. **`src/app/`** — Routing-intensive: thin API routes, client `page.tsx` composition root.
2. **`src/components/`** — Component-intensive: `ui/` primitives and `features/` domain components (no barrels).
3. **`src/lib/`** — Logic-intensive: zero React. Rules engine, adapters, mocks, validations.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder theory, decision-engine if/else spec, page wiring, and security hygiene.

## Zoning coverage matrix

| Scope | Provider | Source | Refresh |
|-------|----------|--------|---------|
| San Francisco | `sf-datasf` | Local `public/data/pilot-zoning.geojson` (DataSF 3i4a-hu95, PDDL) | Snapshot in repo (~33MB); no live fetch |
| Optional open-data packs | `open-data` | `public/data/zoning/{jurisdiction}.geojson` | Add packs as licensed; none shipped by default |
| Statewide parcels | `regrid` | Regrid API (`REGRID_API_KEY`) | Live when key set; skipped when unset |
| Overlays | stub | Progressive CalFire / coastal / historic | Defaults `false` until local layers |

Provider order in `zoning-lookup.ts`: SF DataSF → open-data packs → Regrid → none.

- **Lookup:** `/api/zoning?lat=&lng=` → `lookupParcel` → `evaluateEligibility` when covered. Response: `{ report, coverage: "lot" \| "none", provider }` with **200** even when uncovered (jurisdiction context still shows in Results).
- **Turf** stays in adapters only — not in rules or UI.

Search any California address (Mapbox geocode when configured, else mock geocode for demo strings). Points without a matching provider return `coverage: "none"` — expected for most counties until Regrid or open-data packs are configured.

## Product UI

Embeddable checker on `/` (no site header/footer). Cream canvas (`#F9F8F6`), charcoal text (`#2C2C2C`), taupe accents (`#9E826C`). Primary CTA token is `#0066CC`. Eligibility: `emerald-600` / `amber-500` / `rose-600`.

1. **Search** — Serif headline + address combobox via `/api/geocode` (statewide CA; no SF proximity bias). **Evaluate** submits; county coverage note under the bar.
2. **Analysis interstitial** — county requirements → local zoning when available → ADU/SB 9.
3. **Results** — Map preview + panel (zoning when covered, overlays, ADU/SB 9, briefing, **location requirements**, checklist, citations). Engine reasons from `src/lib/rules` only. Outline link to `/connect` for leads/quotes.

Embed on a client site:

```html
<iframe src="https://your-host/" title="ADU eligibility checker" style="width:100%;min-height:720px;border:0"></iframe>
```

Partners and specialist leads remain on `/partners` and `/connect`.

## SF Buyer Guides

Standalone `/guides` (SF-focused content): THOW legality, cost matrix (crane, trenching `$1,000–$5,000+`, permits), wheels-vs-foundation. Corpus in `src/lib/content/guides/` (zero React). Briefings attach these links only for San Francisco place matches. Statewide county directory remains at `/regulations`.

## How Eligibility Is Decided

Parcel **facts** (zoning from a provider; overlays default false) flow from `zoning-lookup` → `/api/zoning` → `src/lib/rules`. Outcomes are derived by statute branching in `adu-standard.ts` and `sb9-eligibility.ts`, never copied from mock JSON. See ARCHITECTURE.md for the full decision order. Without lot coverage, the checker still composes county/city + statewide requirements.

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3000`)

Optional:

- `MAPBOX_ACCESS_TOKEN` — real address geocoding + static map preview (server-only). Put it in `.env.local` (or `.env`) and restart `npm run dev`. If unset, `VITE_MAPBOX_ACCESS_TOKEN` is accepted as a fallback (legacy Vercel/Vite naming). Never use a `NEXT_PUBLIC_*` Mapbox token.
- `VITE_MAPBOX_ACCESS_TOKEN` — optional alias for `MAPBOX_ACCESS_TOKEN` only

**URL-restricted tokens:** if your Mapbox token has URL restrictions in the Mapbox dashboard, keep your site origin (e.g. `https://doihave.space` and `http://localhost:3000`) in the token's allowed URLs. The server adapters send `NEXT_PUBLIC_API_URL` as the `Referer` so restricted tokens work server-side — make sure `NEXT_PUBLIC_API_URL` matches one of the allowed URLs, or use an unrestricted token.

**Vercel:** set `MAPBOX_ACCESS_TOKEN` (preferred) or keep existing `VITE_MAPBOX_ACCESS_TOKEN`. Both are server-only — do not expose as `NEXT_PUBLIC_*`. Redeploy after changing env so geocode + map preview pick up the token.
- `REGRID_API_KEY` — statewide parcel/zoning via Regrid (server-only). When unset, non-SF lots use jurisdiction context only unless an open-data pack matches.
- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` — error reporting (omit to disable)
- `SENTRY_AUTH_TOKEN` — build-time source map upload (production)
- `LEAD_WEBHOOK_URL` — optional Slack/Discord-compatible webhook for homeowner project leads, quote interest, and restricted compliance reviews (`POST /api/lead`). Server-only.
- `BUILDER_WEBHOOK_URL` — optional webhook for builder partner signups (`POST /api/builder-signup`)
- `NEXT_PUBLIC_AFFILIATE_*` — optional affiliate outbound URLs for eligible next-steps (see `.env.example`). Cards omit when unset. No commission rates in UI copy.

## Sentry

Errors and performance tracing via `@sentry/nextjs` (Developer tier). Sample rates: 100% traces in development, 10% in production. No Session Replay.

- App Router boundaries (`error.tsx`, `global-error.tsx`) call `Sentry.captureException` because Next.js catches those before global handlers.
- API routes capture unexpected failures in `try/catch`; expected 4xx (validation) and uncovered zoning (`coverage: "none"`) are not reported.

Verify locally: hit an instrumented path that throws, then check [Issues](https://envirostar-app.sentry.io/issues/?project=adu-eligibility-checker). For readable production stacks, set `SENTRY_AUTH_TOKEN` on Vercel and deploy a build.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, lucide-react, `@sentry/nextjs`, `@turf/turf` (server adapters only).
