---
name: integrity-orchestrator
description: >-
  Orchestrates parallel audit and sequential fix subagents for doihave.space
  eligibility data-integrity issues (SB 9 overclaim, overlay honesty, coverage
  UX, geometry disclaimers, regulations framing, lead-gen separation). Use when
  the user asks to run an integrity audit, eligibility honesty review, SB9
  overclaim review, or to orchestrate integrity subagents.
---

# Integrity Orchestrator

Single orchestrator for product/data-integrity passes. Read [reference.md](reference.md) for the vulnerability matrix and file map.

## Mode

Default: **audit with evidence → fix in priority order → verify with Vitest**.

Public-site security scanning is out of scope.

## Orchestrator rules (binding)

1. Wave 1 is read-only — do not edit product code while auditing.
2. One owner path per fix (see roster) to avoid merge thrash.
3. Highest priority always: **#1 SB 9 + unknown critical inputs**.
4. Subagents must cite `file:line` and add/extend Vitest; no “looks fine” closures.
5. Keep `AGENTS.md` Next.js-only; this skill lives under `.cursor/skills/`.

## Fix policy (locked)

1. Unknown critical SB 9 inputs → never `eligible`. Null/≤0 `lotSizeSqFt` (and stubbed/unverified overlays) → SB 9 `warning`; align badge with SB9-R5 checklist.
2. Empty overlay stub must not read as “Clear.” Prefer unverified/unchecked until real PIP layers ship.
3. Persist and display `coverage` + `provider` beside eligibility chrome; lot path gets honesty callout.
4. Map stays schematic; rules stay district PIP — do not feed approximate lot polygons into eligibility.
5. Regulations “agent” stays deterministic corpus; tighten byline/disclaimer; sharpen state-floor vs local-confirm banners.
6. Lead CTAs bifurcate by `overall` on ResultsCard like Connect; commercial ranking stays out of `lib/rules/`.

## Wave protocol

```text
Wave 1 (parallel audits) → merge findings → Wave 2 (sequential fixes) → Wave 3 (verify)
```

### Wave 1 — Launch six Task subagents in parallel

Use the prompt templates below. Collect each output schema. Merge into a priority backlog (#1 first).

### Wave 2 — Fix sequentially

1. `rules-integrity` (#1, #2 engine)
2. `overlay-provenance` (#3)
3. `coverage-ux` (#7, badge confidence copy)
4. `geometry-honesty` (#4)
5. `regs-framing` (#5, #6)
6. `leadgen-separation` (#8)

### Wave 3 — Verify

Run `npm test`. Ensure regression: lot GIS parcel with null `lotSizeSqFt` must not yield SB 9 `eligible`.

## Output schema (every subagent)

```markdown
### Claim
### Evidence
(file:line citations)
### Severity
critical | high | medium | low
### Fix
(concrete change; or “n/a — audit only”)
### Tests
(existing / needed)
### Risks
```

## Subagent roster

| ID | Owns | Allowed | Forbidden |
|----|------|---------|-----------|
| `rules-integrity` | #1, #2 engine | `src/lib/rules/**`, `src/lib/types/zoning.ts`, related `__tests__` | UI, affiliates, regulations prose |
| `overlay-provenance` | #3 | `zoning-overlays.ts`, parcel/API types, zoning route | Map schematic, lead forms |
| `geometry-honesty` | #4 | `src/lib/map/**`, map features, legend copy | Rules status logic |
| `coverage-ux` | #7, #2 UX | `HomePageClient`, `ResultsCard`, receipt/legend, API client parse | Statute if/else in rules |
| `regs-framing` | #5, #6 | `src/lib/regulations/**`, byline/disclaimer components | Changing eligibility outcomes |
| `leadgen-separation` | #8 | `ConnectSection`, Results CTAs, `lib/content/affiliates*` | `lib/rules`, regulations corpus |
| `verify` | all | tests + `npm test` | Feature edits unless test-only |

## Prompt templates

### rules-integrity (audit or fix)

```text
You are rules-integrity for doihave.space.
Allowed: src/lib/rules/**, src/lib/types/zoning.ts, src/lib/__tests__/*rules*, statutory-evaluations, unit-capacity.
Forbidden: UI, affiliates, regulations prose.
Focus: SB 9 must not return eligible when lotSizeSqFt is null/≤0; align with SB9-R5 unverified; unknown overlays should not default eligible when policy requires warning.
Return the integrity output schema (Claim, Evidence, Severity, Fix, Tests, Risks).
Cite file:line. [AUDIT ONLY | IMPLEMENT FIXES per Fix policy #1–#2]
```

### overlay-provenance

```text
You are overlay-provenance for doihave.space.
Allowed: src/lib/adapters/zoning-overlays.ts, parcel/overlay types, zoning API route, report projection that surfaces overlays.
Forbidden: map schematic, lead forms.
Focus: emptyOverlays() stub must not render as Clear; model unverified/unchecked until PIP ships.
Return output schema. [AUDIT ONLY | IMPLEMENT FIX]
```

### geometry-honesty

```text
You are geometry-honesty for doihave.space.
Allowed: src/lib/map/**, AddressMapPreview, InteractiveSiteMap, MapSiteLegend, related copy.
Forbidden: rules status logic.
Focus: schematic lot vs district PIP eligibility; strengthen disclaimers so approximate geometry is not read as survey/eligibility geometry.
Return output schema. [AUDIT ONLY | IMPLEMENT FIX]
```

### coverage-ux

```text
You are coverage-ux for doihave.space.
Allowed: HomePageClient, ResultsCard, SearchReceipt, MapSiteLegend, API response parsing for coverage/provider.
Forbidden: statute if/else in lib/rules.
Focus: persist coverage + provider from /api/zoning; show honesty beside eligibility badge; lot GIS pilot callout.
Return output schema. [AUDIT ONLY | IMPLEMENT FIX]
```

### regs-framing

```text
You are regs-framing for doihave.space.
Allowed: src/lib/regulations/**, RegulationsAuthorByline, disclaimers, compose-briefing scope banners.
Forbidden: changing eligibility status outcomes in lib/rules.
Focus: deterministic corpus must not read as live LLM advice; state-floor vs local-confirm clarity.
Return output schema. [AUDIT ONLY | IMPLEMENT FIX]
```

### leadgen-separation

```text
You are leadgen-separation for doihave.space.
Allowed: ConnectSection, ResultsCard CTAs, lib/content/affiliates*, PartnerOffers wiring.
Forbidden: lib/rules, regulations corpus claims.
Focus: bifurcate ResultsCard CTAs by overall status; no universal builder intro; keep commercial copy out of rules.
Return output schema. [AUDIT ONLY | IMPLEMENT FIX]
```

### verify

```text
You are verify for doihave.space integrity pass.
Run npm test. Add missing regressions for SB 9 eligible-when-lot-unknown if absent.
Report pass/fail with failing test names. Test-only edits allowed.
```

## Acceptance criteria

- [ ] SB 9 cannot return `eligible` when lot area is unknown
- [ ] Overlay stub cannot render as “Clear”
- [ ] Lot-GIS results show coverage/provider honesty next to eligibility chrome
- [ ] Schematic map disclaimer cannot be confused with survey-grade spatial eligibility
- [ ] Regulations attribution does not imply generative legal conclusions
- [ ] Lead CTAs follow overall status bifurcation; rules/affiliates layers stay separate
- [ ] Vitest green, including new regressions for #1
