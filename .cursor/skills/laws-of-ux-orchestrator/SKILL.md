---
name: laws-of-ux-orchestrator
description: >-
  Route doihave.space UI/UX review to 1–3 of the 30 Laws of UX subagents using
  concrete product triggers (address search, sample reports, interstitial,
  results card, site map, connect/leads, empty/error, mobile, eligibility
  badge). Use for design critique, funnel audits, or psychology-grounded UX
  justification on src/app and src/components/features. Run locally.
disable-model-invocation: true
---

# Laws of UX orchestrator

Principles from [Laws of UX](https://lawsofux.com/) (Jon Yablonski). Subagents live under `.cursor/agents/laws-of-ux/`.

**Agent:** `@.cursor/agents/laws-of-ux-orchestrator.md`
**Index:** `@.cursor/agents/laws-of-ux/README.md`
**Local slash:** type **`/laws-of-ux`** in Cursor Agent chat (`.cursor/commands/laws-of-ux.md`; skill alias `.cursor/skills/laws-of-ux/`).

## When to apply

- User names a **surface** (search, results, map, interstitial, connect, badge, mobile, error) or asks for Laws of UX / psychology-based rationale.
- After UI implementation (before or with `integrity-orchestrator` if eligibility honesty is in play).
- When choosing which heuristic explains a *specific* failure (slow zoning ack → Doherty; unfamiliar address box → Jakob's)—not "review the UX".

## Routing procedure

1. **Name the surface** (route + component). If you do not know it, search `src/app` / `src/components/features` and cite the real file.
2. **Match one trigger row** in the matrix. Prefer **1–3 laws**. Full 30-law audit only on request, or when `/laws-of-ux` is run with no named trigger (home funnel).
3. **Load** `@.cursor/agents/laws-of-ux/<slug>.md` and follow that agent's observe → diagnose → prescribe method (do not only recite the principle).
4. **Bind findings to doihave.space files.** Agent files were copied from Envirostar and still mention `apps/web/src` names; **do not hunt those paths**. Use the surface map below.
5. **Emit findings** in the agent's finding block: LAW, SURFACE, OBSERVATION, SEVERITY, RECOMMENDED CHANGE, DO NOT CHANGE.
6. If eligibility, SB 9, overlay, or coverage copy is at issue, hand off to `integrity-orchestrator`. Do not rewrite `src/lib/rules/`.

## Product-trigger matrix (prefer 1–3)

| Product trigger | Primary laws |
|-----------------|--------------|
| Home address (`AddressSearch`, `useAddressSearch`) | Jakob's Law, Postel's Law, Paradox of the Active User |
| Sample reports / topic cards (`SampleReportButtons`, `SearchTopicCards`) | Hick's Law, Choice Overload, Miller's Law |
| Analysis interstitial (`AnalysisInterstitial`) | Goal-Gradient Effect, Doherty Threshold, Zeigarnik Effect |
| Results + badge (`ResultsCard`, `eligibility-badge`) | Cognitive Bias, Mental Model, Selective Attention |
| Site map (`AddressMapPreview`, `InteractiveSiteMap`, `MapSiteLegend`) | Chunking, Cognitive Load, Uniform Connectedness, Prägnanz |
| Connect / leads (`ConnectSection`, `LeadFallbackForm`, `ProjectLeadForm`) | Fitts's Law, Peak-End Rule, Flow |
| Empty / error / unsupported state | Peak-End Rule, Postel's Law, Paradox of the Active User |
| Mobile / `SiteHeader` | Fitts's Law, Hick's Law, Selective Attention |
| Green / Yellow / Red chrome | Cognitive Bias, Mental Model, Tesler's Law |
| Nav / regulations / guides | Hick's Law, Choice Overload, Miller's Law |
| Duplicate CTAs or client-side eligibility | Occam's Razor, Tesler's Law, Pareto Principle |
| Grouping / spacing / `@theme` tokens | Proximity, Common Region, Similarity |
| Ambiguous pins / busy map | Prägnanz, Selective Attention |
| What to fix first | Pareto Principle, Occam's Razor, Parkinson's Law |

## doihave.space surface map (bind here, not Envirostar)

- `src/app/HomePageClient.tsx` — idle search → interstitial → results composition
- `src/components/features/AddressSearch/AddressSearch.tsx`
- `src/components/features/AddressSearch/useAddressSearch.ts`
- `src/components/features/AddressSearch/SampleReportButtons.tsx`
- `src/components/features/AddressSearch/SearchTopicCards.tsx`
- `src/components/features/AnalysisInterstitial/AnalysisInterstitial.tsx`
- `src/components/features/ResultsCard/ResultsCard.tsx`
- `src/components/ui/eligibility-badge.tsx`
- `src/components/features/AddressMapPreview/AddressMapPreview.tsx`
- `src/components/features/AddressMapPreview/InteractiveSiteMap.tsx`
- `src/components/features/AddressMapPreview/MapSiteLegend.tsx`
- `src/components/features/SiteHeader/SiteHeader.tsx`
- `src/components/features/ConnectPage/ConnectSection.tsx`
- `src/components/features/LeadFallbackForm/LeadFallbackForm.tsx`
- `src/components/features/ProjectLeadForm/ProjectLeadForm.tsx`
- `src/app/globals.css` — `@theme` tokens

## Full audit mode

When the user requests **all 30 laws**, or runs `/laws-of-ux` with no named trigger, iterate agents in index order (`README.md` table) on the home funnel. Batch output by severity; deduplicate overlapping findings. Still one primary law per finding. Launch law subagents with `environment: local`.

## Required output format

```markdown
## UX review scope

<paths / surfaces>

## Laws invoked

- <Law name> — @.cursor/agents/laws-of-ux/<slug>.md

## Findings

| Severity | Law | Surface | Observation | Recommendation | Do not change |
|----------|-----|---------|-------------|----------------|---------------|
| ... | ... | ... | ... | ... | ... |

## Verdict

- **Ship:** yes | no | yes with follow-ups
- **Next:** integrity-orchestrator | none
```

Each row must trace to an agent finding block. Do not emit principle recitations without a SURFACE and a RECOMMENDED CHANGE.

## Guardrails

- Product is the Tiny Home on Wheels Lot Eligibility Checker for CA / OR / WA — not an ADU automatic green-light, not legal advice.
- Engine owns eligibility (`src/lib/rules/`); flag client-side reimplementation.
- Do not invent "approved", "denied", "loophole", or THOW-equals-ADU copy. Status vocabulary is Eligible / Warning / Restricted.
- `coverage: "jurisdiction"` is the normal free path — not a rose error.
- Do not fetch lawsofux.com at runtime unless the user asks; agents embed principles locally.

## Related skills

- `integrity-orchestrator` — SB 9 overclaim, overlay honesty, coverage UX, geometry disclaimers
- `.cursorrules` / `ARCHITECTURE.md` — folder theory and THOW-primary overall
