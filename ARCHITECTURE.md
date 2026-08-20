# ADU Eligibility Checker — Architecture

Canonical reference for folder theory, the decision engine, page wiring, and security hygiene. Keep aligned with `.cursorrules`, `.cursor/rules/architecture.mdc`, and `README.md`.

## Folder Theory

### 1. Routing-intensive (`src/app/`)

Next.js framework contract only — network, caching, SSR. Not a place for statute logic or reusable UI.

- `route.ts` stays thin (traffic cop): validate → adapter/rules → JSON, plus `setTimeout` for `loading.tsx` / `Spinner`.
- `error.tsx` is `"use client"`.
- `page.tsx` is the **client composition root** (`"use client"` required for `useState`). It must **import** `AddressSearch`, `ResultsCard`, and `LeadFallbackForm` — never paste those components' markup or fetch logic into the page. It owns only cross-component state and the zoning fetch that glues them together. No statute `if`/`else` in the page (that lives in `src/lib/rules`).

### 2. Component-intensive (`src/components/`)

Visual representation and client interaction. Split generic `ui/` from domain `features/`.

- **No `index.ts` barrels in `ui/` or `features/`.** Use `AddressSearch/AddressSearch.tsx` (not `index.tsx`).
- Named exports. Tailwind only: `emerald-600` Eligible, `amber-500` Warning, `rose-600` Restricted.
- Icons only from `lucide-react`.
- Complex state in colocated hooks (`useAddressSearch.ts`).

### 3. Logic-intensive (`src/lib/`)

Heart of the app. **Zero React.** Portable to a Node CLI or worker.

- **Engine (`lib/rules/`):** Split ADU (§ 65852.2) from SB 9 (§ 65852.21). Real `if`/`else` on parcel **facts**. Do not store Eligible/Warning/Restricted on mock parcels. `lib/rules/index.ts` orchestrates unified `ZoningReport`.
- **Mocks and adapters (`lib/mock/` + `lib/adapters/`):** Routes call a `Geocoder` adapter for addresses. SF pilot zoning uses `pilot-zoning.ts` (server-side Turf + `public/data/pilot-zoning.geojson`). **Turf/GeoJSON only in adapters** — never in `lib/rules/` or UI. Phase 2 may add `regrid-geocoder.ts` with zero changes to rules or UI.

## Decision Engine Logic

Monitor `src/lib/rules/*.ts`. The engine must contain **actual branching**, not a map of address → canned status.

**Inputs (facts only):** `zoning`, `tinyHomeFriendly`, `fireHazard` / `vhfhsz`, `historicDistrict`, `coastalZone`.

**Outputs:** per-program `EligibilityResult` plus `reasons[]` (statute-cited). Overall badge: `restricted` if both programs restricted; else `warning` if either is warning or one restricted; else `eligible`.

### ADU — `adu-standard.ts` (Gov. Code § 65852.2)

1. **Single-family / residential zoning (hard stop).** Not residential → `restricted`.
2. **Fire hazard overlay (warning).** `vhfhsz` or `fireHazard` → `warning`.
3. **Tiny Home friendly overlay.** `tinyHomeFriendly` → eligible + note.
4. **Historic district (warning).** Objective design standards under § 65852.2.
5. **Coastal zone (warning).** Coastal Act / CDP may apply.
6. **Default.** Qualifying residential → `eligible`.

### SB 9 — `sb9-eligibility.ts` (Gov. Code § 65852.21)

1. **Single-family zoning (hard stop).** Not R-1/RS → `restricted`.
2. **Historic district (hard stop).** → `restricted`.
3. **Fire hazard / VHFHSZ (hard stop).** → `restricted` (stricter than ADU).
4. **Coastal zone (warning).**
5. **Default.** → `eligible`.

### Forbidden in the engine

- Status copied from mock JSON.
- `if (address === "123 Main")` demo branches.
- Empty functions always returning `eligible`.
- React, fetch, or Mapbox inside `src/lib/rules/`.

## Page Wiring (`src/app/page.tsx`)

Import features explicitly (no barrels). State: `geocodeResult`, `report`, `isZoningLoading`, `error`.

Flow: `AddressSearch` → `onResolved` → page fetches `/api/zoning?lat=&lng=` → pilot PIP adapter → rules → `Spinner` while loading → `LeadFallbackForm` when `overall === "restricted"` → `ResultsCard` otherwise.

Forbidden: pasted AddressSearch markup, rule engine branches, `evaluateEligibility` on client.

## Security and Git Hygiene

- `.cursorignore`: `.env*`, `.next/`, `node_modules/`, `*.pem`, `*.key`, `coverage/`, `*.log`.
- `.env.example` defines `NEXT_PUBLIC_API_URL`. Never commit `.env`.
- `src/lib/env.ts` Zod-validates at build/start. Mock-required: `NEXT_PUBLIC_API_URL`. Mapbox/Regrid optional until Phase 2.

## Binding Placement Rules

Forbidden: second root `app/`; reusable UI in `src/app/` or `src/lib/`; React in `src/lib/`; statute logic in components; feature/ui `index.ts` barrels; extra `*.css` besides `src/app/globals.css`.
