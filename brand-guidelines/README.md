# doihave.space — Brand Guidelines

Precision ADU and SB 9 eligibility navigation for all California counties. Institutional and precise — not noisy marketing.

## What's in this folder

| File | Use when you need… |
|------|-------------------|
| [tone-of-voice.md](./tone-of-voice.md) | Voice rules, tone adjectives, disclaimer tiers, naming, visual voice |
| [product-features.md](./product-features.md) | Feature headlines, benefits, coverage honesty, out-of-scope claims |
| [customer-pain-points.md](./customer-pain-points.md) | Persona × pain × message × CTA direction |
| [style-references.md](./style-references.md) | Annotated in-app copy seeds (learn the style from live product) |
| [copy-prompts.md](./copy-prompts.md) | Reusable Cursor prompt skeletons and filled examples |

## When to read

Before writing or editing:

- UI copy in `src/components/features/` (search, results, connect, leads)
- Editorial content in `src/lib/content/` (guides, affiliates, premium)
- README or meta descriptions
- Any outbound marketing that references eligibility outcomes

## How to use in Cursor

1. **Auto-load:** Open or edit a file under `src/lib/content/`, connect/partners UI, or `brand-guidelines/` — the [brand-guidelines rule](../.cursor/rules/brand-guidelines.mdc) applies.
2. **Manual mention:** Type `@brand-guidelines` in any prompt when writing copy outside those paths.

## Hard boundaries (do not mix)

| Layer | Location | Content type |
|-------|----------|--------------|
| Statute / regulations | `src/lib/regulations/` | Cited claims, disclaimers, briefing prose — authored by Regulations Expert agent |
| Commercial / editorial | `src/lib/content/` | Affiliates, guides corpus, premium catalog |
| Engine logic | `src/lib/rules/` | Eligibility branching — never paste marketing copy here |

Statute citations and legal framing stay in `lib/regulations/`. Partner blurbs and CTAs stay in `lib/content/` or UI components. Never invent eligibility outcomes in marketing copy.

## Related project rules

- [`.cursor/rules/product-role.mdc`](../.cursor/rules/product-role.mdc) — CTA bifurcation by `overall` status
- [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc) — Three-layer architecture
- [`src/lib/regulations/agent.ts`](../src/lib/regulations/agent.ts) — Canonical disclaimer factory
