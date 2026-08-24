# Tiny Home on Wheels Lot Eligibility Checker — Architecture

Canonical reference for folder theory, the decision engine, page wiring, and security hygiene. Keep aligned with `.cursorrules`, `.cursor/rules/architecture.mdc`, and `README.md`.

## Product framing

**Public name:** Tiny Home on Wheels Lot Eligibility Checker
**Published states:** California, Oregon, Washington
**Primary result:** Green / Yellow / Red THOW lot candidacy across placement, certification, transport, and lot readiness.
**ADU:** Optional pathway only — never imply THOW equals ADU.
**SB 9:** Other pathways / regulations — not primary overall.

## Folder Theory

### 1. Routing-intensive (`src/app/`)

Next.js framework contract only — network, caching, SSR. Not a place for statute logic or reusable UI.

- `route.ts` stays thin (traffic cop): validate → adapter/rules → JSON, plus `setTimeout` for `loading.tsx` / `Spinner`.
- `error.tsx` is `"use client"`.
- `page.tsx` is the **client composition root** (`"use client"` required for `useState`). It must **import** feature components — never paste markup or fetch logic into the page. No statute `if`/`else` in the page (that lives in `src/lib/rules`).

### 2. Component-intensive (`src/components/`)

Visual representation and client interaction. Split generic `ui/` from domain `features/`.

- **No `index.ts` barrels in `ui/` or `features/`.** Use `AddressSearch/AddressSearch.tsx` (not `index.tsx`).
- Named exports. Green / Yellow / Red map to `eligible` / `warning` / `restricted` (emerald / amber / rose).
- Icons only from `lucide-react`.
- Complex state in colocated hooks (`useAddressSearch.ts`).

### 3. Logic-intensive (`src/lib/`)

Heart of the app. **Zero React.** Portable to a Node CLI or worker.

- **Engine (`lib/rules/`):** THOW dimensions drive `thowOverall` / `overall`. ADU (`adu-standard.ts`) is an optional pathway. SB 9 remains computed but demoted from primary chrome. Real `if`/`else` on parcel **facts**. Reasons are `CitedClaim[]` with official source URLs.
- **Mocks and adapters (`lib/mock/` + `lib/adapters/`):** Geocoder for CA/OR/WA addresses. Lot zoning via `zoning-lookup.ts`. **Turf/GeoJSON only in adapters**.
- **Regulations expert (`lib/regulations/`):** State profiles publish CA/OR/WA. Components render only.
- **Affiliates (`lib/content/affiliates.ts`):** Commercial/editorial — never in `lib/regulations/` or `CitedClaim`.

## Decision Engine Logic

**Overall reducer:** any dimension `restricted` → Red; else any `warning` → Yellow; else Green. **ADU status does not alone set overall.**

### Dimensions

- **Placement** (`placement.ts`): express THOW/PMRV/RV path can support Green; generic ADU floor alone does not; ban / non-residential → Red.
- **Certification** (`certification.ts`): ≤400 sq ft; NOAH / ANSI A119.5 / RVIA / unknown.
- **Transport** (`transport.ts`): route-qualified logistics only — never blanket “no pilot car.”
- **Lot readiness** (`lot-readiness.ts`): utilities / occupancy; unverified → Yellow.

### ADU pathway — `adu-standard.ts` (Gov. Code Chapter 13)

Kept. THOW-as-ADU only where local ordinance says so. Does not feed `thowOverall`.

### SB 9 — `sb9-eligibility.ts`

Other pathways only; not primary ResultsCard chrome.

### Forbidden in the engine

- Status copied from mock JSON.
- Address-demo branches.
- Empty functions always returning `eligible`.
- React, fetch, or Mapbox inside `src/lib/rules/`.

## Page Wiring (`src/app/page.tsx`)

Flow: idle `AddressSearch` → `/api/zoning` → `AnalysisInterstitial` → `ResultsCard` (THOW dimensions + ADU pathway). Connect CTAs key on `overall` (= `thowOverall`).

## Cascadia coverage

| Scope | Provider |
|-------|----------|
| CA / OR / WA default | Mapbox geocode + `evaluateJurisdictionContext` |
| SF lot GIS | `sf-datasf-zoning` |
| Optional packs / Regrid | `open-data-zoning` / `regrid-zoning` |

Unsupported states return Red with locked copy. `coverage: "jurisdiction"` is normal — not an error.

## Outcome Monetization

Bifurcate by `overall` (= `thowOverall`): Green → builder intro; Yellow → specialist review; Red → expert compliance form.

## Binding Placement Rules

Forbidden: second root `app/`; reusable UI in `src/app/` or `src/lib/`; React in `src/lib/`; statute logic in components; feature/ui barrels; extra CSS besides `globals.css`.
