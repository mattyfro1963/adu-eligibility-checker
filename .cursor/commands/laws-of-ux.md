---
name: laws-of-ux
description: >-
  Route doihave.space UI/UX work through the Laws of UX orchestrator
  (targeted 1–3 laws from a product trigger, or a full 30-law audit).
---

# /laws-of-ux

Route doihave.space UI/UX work through the **Laws of UX** orchestrator and law-specific subagents. Run on **this local device** (`environment: local`) — not a cloud subagent.

## Load first

- `@.cursor/skills/laws-of-ux-orchestrator/SKILL.md`
- `@.cursor/agents/laws-of-ux-orchestrator.md`
- `@.cursor/agents/laws-of-ux/README.md`

## This session

You are the **Laws of UX orchestrator**. Start the review in this chat (do not wait for a second prompt once a surface is known):

1. If I named a **product trigger** (address search, sample reports, interstitial, results card, site map, connect/leads, empty/error, mobile, eligibility badge) or `src/app` / `src/components/features` paths, pick **1–3** laws from the product-trigger matrix and load those `@.cursor/agents/laws-of-ux/<slug>.md` files.
2. If I asked for a **full audit**, iterate all 30 laws in index order on the named paths. Still one primary law per finding.
3. If no surface is named, review the **home funnel**: idle `AddressSearch` → `AnalysisInterstitial` → `ResultsCard` + `AddressMapPreview`. Route from the matrix (do not ask again).
4. Each invoked agent runs observe → diagnose → prescribe and emits the finding block: LAW, SURFACE, OBSERVATION, SEVERITY, RECOMMENDED CHANGE, DO NOT CHANGE.
5. After implementation reviews, say whether to run `integrity-orchestrator` next (data-honesty) rather than inventing statute copy.

**Do not** invent legal advice or imply a THOW is automatically an ADU. Product copy stays Tiny Home on Wheels lot candidacy language (Green / Yellow / Red = eligible / warning / restricted).
**Do not** invoke as a generic "UX review" without a surface.
**Do not** change `src/lib/rules/` as a UX fix.

## Usage

- **Targeted review (default):** Name the **product trigger** — address search, sample reports, interstitial, results card, site map, connect/leads, empty/error, mobile, or eligibility badge. Orchestrator picks **1–3** laws.
- **Full audit:** Ask for all 30 laws on named `src/app` / `src/components/features` paths. Still one primary law per finding.
- **After implementation:** Pair with `integrity-orchestrator` when eligibility honesty or SB 9 overclaim is in play.

## Attribution

Principles from [Laws of UX](https://lawsofux.com/) by Jon Yablonski.

Copied from the Envirostar pack (30 law agents + orchestrator); product-trigger matrix retargeted to doihave.space.
