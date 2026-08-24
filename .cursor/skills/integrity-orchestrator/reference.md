# Integrity Orchestrator — Reference

Vulnerability matrix and key file map for audit/fix subagents.

## Vulnerability matrix

| # | Claim | Severity | Primary paths | Locked fix |
|---|-------|----------|---------------|------------|
| 1 | SB 9 `eligible` when lot area unknown | critical | `sb9-eligibility.ts`, GIS parcel builders, `statutory-evaluations.ts` (SB9-R5) | Never `eligible` when `lotSizeSqFt` null/≤0 → `warning` + reason aligned with SB9-R5 |
| 2 | Binary Eligible too strong when local confirm needed | high | `adu-standard.ts`, `compute-overall.ts`, ResultsCard badges | Engine: unknown critical inputs → warning; UX: confidence/honesty copy beside badge |
| 3 | Overlay “Clear” without provenance | critical | `zoning-overlays.ts`, ResultsCard overlay rows, Parcel.overlays | Stub → Not verified / unchecked; no false Clear |
| 4 | Approximate map geometry vs spatial eligibility | medium | `approximate-site.ts`, MapSiteLegend, InteractiveSiteMap | Copy/legend only; rules stay district PIP |
| 5 | Regulations “agent” read as generative LLM | medium | `regulations/agent.ts`, `compose-briefing.ts`, byline/disclaimer | Attribution + disclaimer; keep deterministic corpus |
| 6 | State floor blurred with parcel conclusions | medium | `compose-briefing.ts`, `location-requirements.ts`, ResultsCard | Scope banners: statewide floor vs local confirm |
| 7 | Coverage/provider not prominent | high | `/api/zoning`, HomePageClient parse, ResultsCard, SearchReceipt | Persist + display coverage/provider beside badge |
| 8 | Lead-gen after favorable feasibility | high | ResultsCard CTA, ConnectSection, affiliates content | Bifurcate CTAs by `overall`; commercial out of rules |

## Key file map

### Rules / types

- `src/lib/rules/sb9-eligibility.ts` — SB 9 engine; lot-size hard stop only when known
- `src/lib/rules/adu-standard.ts` — ADU engine
- `src/lib/rules/compute-overall.ts` — overall status combiner
- `src/lib/rules/index.ts` — `evaluateEligibility` orchestrator
- `src/lib/rules/jurisdiction-context.ts` — fallback when no lot GIS (SB 9 already warning)
- `src/lib/rules/statutory-evaluations.ts` — checklist projection (SB9-R5 unverified)
- `src/lib/types/zoning.ts` — `EligibilityStatus`, `Overlays`, `Parcel`, `ZoningReport`

### Adapters / API

- `src/lib/adapters/zoning-overlays.ts` — stub `lookupOverlays` → `emptyOverlays()`
- `src/lib/adapters/sf-datasf-zoning.ts` — district PIP; no `lotSizeSqFt`
- `src/lib/adapters/open-data-zoning.ts` / `regrid-zoning.ts` — same gap
- `src/app/api/zoning/route.ts` — returns `{ report, coverage, provider }`

### Map

- `src/lib/map/approximate-site.ts` — schematic lot geometry (not survey/GIS)
- Map legend / InteractiveSiteMap under `src/components/features/`

### Regulations

- `src/lib/regulations/agent.ts` — attribution identity (not an LLM runtime)
- `src/lib/regulations/compose-briefing.ts` — pre-written CitedClaims only
- `src/lib/regulations/corpus.ts` — `CORPUS_VERSION` / `LAST_REVIEWED`

### UI / leads

- `src/app/HomePageClient.tsx` — may discard `coverage` / `provider`
- `src/components/features/ResultsCard/ResultsCard.tsx` — badges, overlays, CTAs
- `src/components/features/ConnectPage/ConnectSection.tsx` — status-bifurcated CTAs
- `src/lib/content/affiliates.ts` — commercial catalog (not statute)

### Tests

- `src/lib/__tests__/adu-rules.test.ts`
- `src/lib/__tests__/statutory-evaluations.test.ts`
- `src/lib/__tests__/unit-capacity.test.ts`
- `src/lib/__tests__/jurisdiction-context.test.ts`
- `src/lib/__tests__/regulations-briefing.test.ts`
- `src/lib/__tests__/sample-report-summaries.test.ts`

## Starting evidence (pre-confirmed)

Do not re-litigate; add tests/UX proofs:

1. `sb9-eligibility.ts` skips lot check when `lotSizeSqFt` null → defaults eligible for clean SF.
2. Live GIS adapters omit `lotSizeSqFt` → production lot path hits #1.
3. `buildStatutoryEvaluations` marks SB9-R5 `unverified` while badge can stay green.
4. `lookupOverlays` always returns empty/false overlays.
5. Jurisdiction fallback already forces SB 9 `warning`.
6. Regulations briefing is deterministic (no LLM fetch in `src/`).

## Acceptance checklist

- [ ] SB 9 cannot return `eligible` when lot area is unknown
- [ ] Overlay stub cannot render as “Clear”
- [ ] Lot-GIS results show coverage/provider honesty next to eligibility chrome
- [ ] Schematic map disclaimer cannot be confused with survey-grade spatial eligibility
- [ ] Regulations attribution does not imply generative legal conclusions
- [ ] Lead CTAs follow overall status bifurcation; rules/affiliates layers stay separate
- [ ] Vitest green, including new regressions for #1
