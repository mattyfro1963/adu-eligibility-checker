# Laws of UX subagents

Thirty Cursor subagents—one per principle from [Laws of UX](https://lawsofux.com/) (Jon Yablonski). Copied from the Envirostar pack. The master orchestrator routes **1–3** of these using **doihave.space** product triggers, not a generic UX review.

Each agent file still contains Envirostar `apps/web/src` examples. **When reviewing this repo, bind to `src/app` and `src/components/features` (see orchestrator surface map).** Do not hunt Envirostar paths.

The generator `scripts/generate_laws_of_ux_agents.py` is the Envirostar source of the 30 files. Do not regenerate unless you intend to replace these copies.

| # | Law | Agent file | Invoke when (doihave.space) |
|---|-----|------------|------------------------------|
| 1 | Aesthetic-Usability Effect | [aesthetic-usability-effect.md](aesthetic-usability-effect.md) | first paint of `/`, compact search, interstitial, empty/error ResultsCard, or map chrome looks unfinished or glossy-but-broken |
| 2 | Choice Overload | [choice-overload.md](choice-overload.md) | HomePage or SiteHeader shows several equal CTAs, sample reports + topic cards compete, or regulations/guides/partners compete with address search |
| 3 | Chunking | [chunking.md](chunking.md) | ResultsCard is one flat dump, interstitial is a single spinner, or key findings / rule details are an unsectioned wall |
| 4 | Cognitive Bias | [cognitive-bias.md](cognitive-bias.md) | EligibilityBadge, Green/Yellow/Red, or map hatch is readable as permit approval, 'you can place a THOW', or ADU-equivalent |
| 5 | Cognitive Load | [cognitive-load.md](cognitive-load.md) | map + briefing + dimensions + checklists + connect compete on first results paint |
| 6 | Doherty Threshold | [doherty-threshold.md](doherty-threshold.md) | address debounce, zoning fetch, map pan/zoom, or interstitial feels like dead air |
| 7 | Fitts's Law | [fitts-law.md](fitts-law.md) | Search/Connect CTA, mobile SiteHeader, map zoom, or any control smaller than 44px |
| 8 | Flow | [flow.md](flow.md) | address → interstitial → results → connect is interrupted by dead ends, hash-only connect, or map/list desync |
| 9 | Goal-Gradient Effect | [goal-gradient-effect.md](goal-gradient-effect.md) | AnalysisInterstitial progress or connect CTAs do not show that the guest is near a lot reading |
| 10 | Hick's Law | [hicks-law.md](hicks-law.md) | too many decisions before address search, sample-report matrices, or nav force a choice before the default lot path |
| 11 | Jakob's Law | [jakobs-law.md](jakobs-law.md) | address autocomplete, map pins/popups, or eligibility report behaves unlike familiar geocoder/property-report patterns |
| 12 | Law of Common Region | [law-of-common-region.md](law-of-common-region.md) | results card vs map, connect forms, or badge+summary fail to bound related controls |
| 13 | Law of Proximity | [law-of-proximity.md](law-of-proximity.md) | label/field pairs on AddressSearch, dimension rows, map legend, or error alerts sit closer to the wrong neighbor |
| 14 | Law of Prägnanz | [law-of-pragnanz.md](law-of-pragnanz.md) | map pins, lot overlay, hatch, or hero elevation are ornate or ambiguous at a glance |
| 15 | Law of Similarity | [law-of-similarity.md](law-of-similarity.md) | primary vs secondary buttons diverge, Eligible/Warning/Restricted styling is inconsistent, or links and buttons swap clothes |
| 16 | Law of Uniform Connectedness | [law-of-uniform-connectedness.md](law-of-uniform-connectedness.md) | search → reading → results stages, or dimension row ↔ map highlight lack a visible connector |
| 17 | Mental Model | [mental-model.md](mental-model.md) | titles/IA say ADU approval or permit, teaser looks like a survey plat, or status words do not match engine overall |
| 18 | Miller's Law | [millers-law.md](millers-law.md) | SiteHeader nav, sample reports, key findings, or a checklist presents more than ~7 items without collapse or a count summary |
| 19 | Occam's Razor | [occams-razor.md](occams-razor.md) | duplicate Search/Connect controls, extra wizard steps, or client recomputation of eligibility when the server already sent it |
| 20 | Paradox of the Active User | [paradox-of-the-active-user.md](paradox-of-the-active-user.md) | first paint of `/` is not self-explanatory, tooltips are required to proceed, or errors omit the next action |
| 21 | Pareto Principle | [pareto-principle.md](pareto-principle.md) | UX time is going to demo/marketing instead of address → reading → results → connect |
| 22 | Parkinson's Law | [parkinsons-law.md](parkinsons-law.md) | optional fields, unbounded topic cards, or missing wait estimates let guests configure forever before the first lot reading |
| 23 | Peak-End Rule | [peak-end-rule.md](peak-end-rule.md) | results-ready, zoning failure, or connect ending is buried, harsh, or framed as a permit verdict |
| 24 | Postel's Law | [postels-law.md](postels-law.md) | AddressSearch rejects common address formats, API errors are inconsistent, or unsupported states are treated as app failure |
| 25 | Selective Attention | [selective-attention.md](selective-attention.md) | Search/Connect is not the most salient element, map motion steals focus, or legal/disclaimer animation competes with the next action |
| 26 | Serial Position Effect | [serial-position-effect.md](serial-position-effect.md) | Search is buried mid-nav or mid-page, ResultsCard omits an end CTA, or disclaimers appear only in the middle of a scroll |
| 27 | Tesler's Law | [teslers-law.md](teslers-law.md) | UI dumps raw zoning payloads, client recomputes overall, or advanced rule detail is either forced on first paint or missing on demand |
| 28 | Von Restorff Effect | [von-restorff-effect.md](von-restorff-effect.md) | more than one isolated CTA, rainbow map hits, or the eligibility badge fails to stand out from info chrome |
| 29 | Working Memory | [working-memory.md](working-memory.md) | address disappears after zoning, guests must recall APN, or new search drops context without a way back |
| 30 | Zeigarnik Effect | [zeigarnik-effect.md](zeigarnik-effect.md) | in-progress zoning or connect hash cannot be resumed—or resume uses guilt/dark patterns |

## Orchestration

- **Master agent:** [../laws-of-ux-orchestrator.md](../laws-of-ux-orchestrator.md)
- **Skill:** `@.cursor/skills/laws-of-ux-orchestrator/SKILL.md`
- **Slash command:** type **`/laws-of-ux`** in Cursor **Agent chat** → [../../commands/laws-of-ux.md](../../commands/laws-of-ux.md) (user-global copy: `~/.cursor/commands/laws-of-ux.md`). Matching skill [`../../skills/laws-of-ux/SKILL.md`](../../skills/laws-of-ux/SKILL.md).
- **Run locally** (`environment: local`).

## Regenerate

```bash
python3 scripts/generate_laws_of_ux_agents.py
python3 scripts/validate_laws_of_ux_agents.py
```

The generator still emits Envirostar surfaces. Edit law content there only if you intend to replace these copies. Prefer editing the orchestrator / command / README for doihave.space routing.
