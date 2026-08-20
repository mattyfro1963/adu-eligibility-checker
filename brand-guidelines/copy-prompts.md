# Copy Prompts

Reusable Cursor prompt templates for doihave.space. Always start with `@brand-guidelines` (or edit a file under `src/lib/content/` so the rule auto-loads).

---

## Universal skeleton

```
@brand-guidelines

Goal: [exact reader action — click, submit, reply, check address]
Format: [hero / email / ad / 3-part sequence / CTA button / meta description]
Audience: [homeowner | investor | developer | builder]
Tone: [pick 2–3 from tone-of-voice.md — e.g. precise, direct, institutional]
Constraints: [word count, character limit, must include disclaimer tier X]
Context: [eligible | warning | restricted — if outcome-specific; omit if N/A]
Do not: [invent legal outcomes, claim lot GIS everywhere, use hype words, imply endorsements]
```

---

## Example A — Landing hero refresh

```
@brand-guidelines

Goal: User enters a California address and clicks Evaluate
Format: Eyebrow (≤8 words) + headline (≤6 words) + subhead (≤30 words) + coverage footnote (≤20 words)
Audience: Homeowner
Tone: Direct, precise, conversational
Constraints: Must include coverage honesty in footnote; no "guaranteed eligible"
Do not: Claim lot GIS for all counties; use "approved" or "denied"
```

**Reference:** See current hero in [style-references.md](./style-references.md) — "Small Footprint. Elevated Living." pattern.

---

## Example B — Connect page CTA for warning parcels

```
@brand-guidelines

Goal: Submit specialist review form (warning variant)
Format: Section eyebrow + H2 + 2-sentence body + button label (≤4 words)
Audience: Homeowner with overlay warnings on their parcel
Tone: Institutional, reassuring — amber not rose
Constraints: ≤120 words total; matching-tier disclaimer not required on form itself; mention diagnostics above
Context: overall = warning
Do not: Use rose/restricted language; promise permit approval; invent new statute
```

**Expected voice:** "Specialist review recommended" — see [style-references.md](./style-references.md).

---

## Example C — Partner affiliate card

```
@brand-guidelines

Goal: Click outbound partner link for build-out research
Format: Partner name + 1-sentence blurb (≤22 words)
Audience: Homeowner with eligible parcel, build-out intent
Tone: Factual, commercial-transparent
Constraints: Describe common use case only; no superlatives; sensitive categories need "confirm local rules"
Context: eligible
Do not: Imply endorsement, legality on user's parcel, or "best" / "#1" language
```

**Reference blurb shape:** "Portable solar generators commonly used for staging power and off-grid subsystems during build-out."

---

## Example D — Meta description for /regulations

```
@brand-guidelines

Goal: Click from Google SERP to /regulations
Format: Meta title (≤60 chars) + meta description (≤155 chars)
Audience: Anyone researching California tiny-home and ADU rules
Tone: Precise, helpful
Constraints: Include "doihave.space"; orient + confirm locally; no legal advice claims
Do not: Promise eligibility; list every county
```

---

## Example E — 3-part email sequence (waitlist nurture)

```
@brand-guidelines

Goal: Waitlist signup → open email 2 → click back to checker
Format: 3 emails — (1) welcome + honesty, (2) pain point + feature, (3) CTA to check address
Audience: Homeowner researching ADU
Tone: Direct, institutional, conversational
Constraints: Each email ≤150 words; email 1 includes short disclaimer; no fake checkout urgency
Do not: Invent statute changes; claim "we guarantee eligibility"
```

---

## Example F — Builder signup (B2B)

```
@brand-guidelines

Goal: Licensed builder submits beta network signup on /connect
Format: Eyebrow + H2 + 3-bullet value prop + button label
Audience: ADU / tiny-home builder
Tone: Professional, direct — no consumer hype
Constraints: ≤100 words; informational matching disclaimer required
Do not: Guarantee lead volume or lead quality scores
```

---

## Outcome-specific CTA matrix

Copy prompts for post-search CTAs **must** respect outcome bifurcation (see [product-role.mdc](../.cursor/rules/product-role.mdc)).

| `overall` | Primary CTA voice | Secondary | Do not |
|-----------|-------------------|-----------|--------|
| **eligible** | Build-out / outfit ("Outfit the build") | Browse partners | Reuse rose "Request Review" CTA |
| **warning** | Specialist review (amber) | Narrow affiliate research subset | Lead with full partner shop grid |
| **restricted** | Expert compliance review (rose) | Low-emphasis alternate pathways below form | Put product shop grid above expert form |

---

## Quick prompts (copy-paste)

**New affiliate blurb:**
```
@brand-guidelines Write a 1-sentence blurb for [PARTNER] in [CATEGORY]. Factual use case only, ≤22 words, confirm local rules if sanitation/power related.
```

**Results briefing sentence:**
```
@brand-guidelines Write one plain-language sentence explaining why [OVERLAY] triggers a warning for ADU on this parcel. Cite engine tone from tone-of-voice.md, no invented statute.
```

**Connect prefilled intro:**
```
@brand-guidelines Write 2 sentences for Connect page when user arrives from search with status=[eligible|warning|restricted]. Include matching-tier disclaimer. ≤60 words.
```

---

## Checklist before shipping copy

- [ ] Status words are Eligible / Warning / Restricted (not approved/denied)
- [ ] Coverage honesty included if discussing GIS or statewide reach
- [ ] Correct disclaimer tier for surface (full / short / commercial / matching)
- [ ] No statute claims outside `src/lib/regulations/`
- [ ] Outcome-specific CTA matches matrix above
- [ ] Affiliate copy includes transparency if commercial
