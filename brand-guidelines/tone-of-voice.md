# Tone of Voice

## Core positioning

**doihave.space** is a precision ADU and SB 9 eligibility and zoning navigation tool for all California counties. It helps **homeowners, investors, and developers** navigate zoning ordinances, permitting processes, and building code considerations — with lot GIS where providers cover the coordinate, and honest county/city requirements otherwise.

The voice feels **architectural and pro-tooling**: trust and clarity over marketing hype. We explain outcomes with engine reasons and statute citations. We never invent legal advice or canned eligibility.

## Tone adjectives

Pick **3–4 per piece**. Mix institutional precision with plain-language accessibility.

| Use | Avoid |
|-----|-------|
| Precise, direct, institutional | Hype ("game-changer", "unlock your dream ADU") |
| Honest about coverage limits | Implying lot GIS everywhere in California |
| Statute-first, plain-language second | Invented legal advice or guaranteed outcomes |
| Question-led headlines | Clickbait urgency ("Act now before SB 9 expires!") |
| Conversational when explaining next steps | Jargon without context (R-1, ministerial — define or skip) |

## Voice rules

1. **Lead with the parcel decision** — "Can I build?", "Can I split?", "What permits apply?"
2. **Name overlays plainly** — fire hazard (VHFHSZ), historic district, coastal zone.
3. **Use fixed status vocabulary** — **Eligible**, **Warning**, **Restricted**. Never "approved", "denied", or "green-lit".
4. **Reframe "loopholes" immediately** — lawful pathways and hard stops, not workarounds that dodge permits.
5. **Coverage honesty is non-negotiable** — say when lot zoning was not verified; explain what the jurisdiction path still provides.
6. **Commercial transparency** — disclose affiliates; never imply official partnerships or endorsements.

## Disclaimer tiers

Use the right tier for the surface. Do not stack all tiers on one screen.

| Tier | When | Canonical lead |
|------|------|----------------|
| **Full** | Guides, regulations pages, search receipts, county directory | "Informational only — not legal advice, not a permit, and not a substitute for your local planning & building department or a licensed land-use attorney." |
| **Short** | Footer, compact inline UI | "Informational only — not legal advice. Confirm requirements with your local planning and building departments." |
| **Commercial** | Affiliate cards, partner directory | "Featured resources are curated manufacturer links. doihave.space may earn a commission if you buy through them, at no extra cost to you. These are not official partnerships, endorsements, or legal advice for your parcel." |
| **Matching** | Connect, builder match, quote modals | "Informational matching only — not a permit or marketplace guarantee." |

Full-tier copy ends with: "Authored by the doihave.space Regulations Expert." (regulations surfaces only)

## Naming hierarchy

| Context | Use |
|---------|-----|
| Primary brand | **doihave.space** |
| Product descriptor | "ADU & SB 9 eligibility checker" |
| Regulations author | "doihave.space Regulations Expert" |
| Avoid as standalone brand | "Eligibility Check" (header chrome only) |

UTM and outbound links use `utm_source=doihave.space`. Affiliate links use `rel="sponsored noopener noreferrer"`.

## Visual voice (for copywriters coordinating with design)

Canonical tokens live in `src/app/globals.css` (not legacy README color notes). The primary checker (`/`) is modern luxury + place-based brochure energy — cream canvas, charcoal type, muted taupe secondary — with the map visually leading. Vermilion is a sparse accent (links, small marks), not page or CTA energy. Status emerald / amber / rose is eligibility-only (live outcomes); sample chips use muted editorial cream/taupe/rose/gold tokens.

| Element | Spec |
|---------|------|
| Checker canvas | `--surface-luxury` / `--luxury-cream` |
| Checker chrome borders | `--border-luxury` (taupe-leaning hairline) |
| Search shell shadow | `--shadow-brochure-input` / `.shadow-brochure-input` |
| Body / UI type | Lato (`--font-sans` / `--font-lato`) — body **15–16px** (~1.6 line-height), labels, eyebrows, badges, inputs, data (`.font-mono`), topic titles, results · secondary `--text-secondary` · luxury headings `--text-luxury` / `--luxury-charcoal` |
| Display / hero H1 | Lato via `.font-display` — **bold 700** · hero scale **3rem / 48px → 4rem / 64px**, tight leading (hierarchy via scale + weight, not a second family) |
| Muted / captions | `--text-tertiary` · taupe eyebrows `--luxury-taupe` |
| Default actions | `--action-primary` (charcoal/ink) — not vermilion |
| Brand accent (sparse) | `--text-brand` / `--action-brand` vermilion `#fc4a2b` |
| Status — eligible | `--status-eligible` (+ `-fg` / `-muted` / `-border`) · vocabulary **Eligible**; live badge **Green** |
| Status — warning | `--status-warning` family (`#f59e0b`) · vocabulary **Warning**; live badge **Yellow** |
| Status — restricted | `--status-restricted` · vocabulary **Restricted**; live badge **Red** |
| Sample chips (editorial only) | `--chip-editorial-fill` / `-border` / `-rose` / `-gold` (+ `-fg`) — muted brochure tones; label Warning / Restricted example outcomes clearly |
| Map overlays | `--map-lot-*`, `--map-zone-*`, `--map-hatch` |
| Eyebrow labels | Lato via `.font-label` — 11px, uppercase, **light 300**, tracking **~0.18em** (architectural blueprint) |

**One font only:** Lato for everything (display, body, labels, technical specs). No Playfair Display, Instrument Serif, Outfit, Cormorant Garamond, Montserrat, Source Serif 4, Söhn, IBM Plex Mono, or any serif / second family.

**Typography hierarchy:** titles = Lato bold (700) at large scale; body = crisp 15–16px Lato; eyebrows = wide-tracked light all-caps Lato.

**Status vocabulary:** Eligible / Warning / Restricted — never "approved" or "denied". Live badges stay Green / Yellow / Red with `status-*` tokens; do not mute live eligibility into taupe.

**Eyebrow pattern:** short uppercase Lato labels — e.g. "Lot readiness report", "Builder match · Lead routing", "State of California · ADU & SB 9". Prefer taupe/luxury over vermilion on chrome labels; keep dimension labels (Placement, Certification, Transport, Utilities) clear.

**Layout feel:** editorial luxury — max width ~1200px, cream map-forward surfaces, thin taupe rules, soft brochure shadows. Not SaaS dashboard noise; not rustic cottage.

## Outcome-colored CTAs

Match copy tone to eligibility outcome (see [copy-prompts.md](./copy-prompts.md)):

- **Eligible** — build-out intent, product partners, emerald-adjacent confidence (not guarantees)
- **Warning** — amber specialist review, interpret overlays, softer commercial weight
- **Restricted** — rose expert compliance review, alternate pathways below the form, no shop grid above the lead form
