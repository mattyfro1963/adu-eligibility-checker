# Product Features

Copy-ready feature inventory for landing pages, ads, and UI. Each row: **headline → benefit → proof / honesty note**.

Engineering detail lives in [ARCHITECTURE.md](../ARCHITECTURE.md). This doc is for **marketing truth**, not implementation spec.

## Feature table

| Feature | Benefit headline | Proof / honesty note |
|---------|------------------|----------------------|
| **Statewide address search** | Check any California address in seconds | Mapbox geocode (or mock for demos); free jurisdiction path for all counties |
| **ADU + SB 9 engine** | Statute-grounded Eligible / Warning / Restricted | Real `if`/`else` in `src/lib/rules/` — never canned status on mock data |
| **Coverage honesty** | Know what was verified vs inferred | Lot GIS when a provider covers the coordinate; else county/city guidance + statewide ADU floor |
| **Results dashboard** | See map, overlays, program tabs, and a cited briefing | Engine reasons rendered with statute citations (`CitedText`) |
| **Analysis interstitial** | Transparent step-by-step evaluation | County requirements → local zoning (when available) → ADU / SB 9 |
| **SF buyer guides** | THOW legality, cost matrix, wheels vs foundation | `/guides` — linked from results for San Francisco place matches |
| **Regulations directory** | County and city tiny-home corpus statewide | `/regulations` — orient here, confirm locally before you buy |
| **Connect** | Builder match for complex or high-intent sites | `/connect` — prefilled from search (address, coords, status) |
| **Partners** | Curated build-out research aids | Disclosed affiliates — not official endorsements |
| **Premium tools (waitlist)** | Checklists, outreach templates, budgeting sheets | Checkout not live — always include waitlist honesty note |
| **Embeddable widget** | Drop the checker on partner sites | `/` — no site header/footer; iframe-friendly |

## Coverage matrix (landing copy)

**Default (free):** Mapbox geocoding + county/city requirement corpus → jurisdiction-context eligibility for every CA address. No paid parcel API required.

**Lot GIS (when available):**

| Scope | Provider | Cost |
|-------|----------|------|
| San Francisco | DataSF local GeoJSON | Free |
| Other jurisdictions | Optional open-data packs | Free where licensed |
| Statewide lot GIS | Regrid API | Paid — opt-in only (`REGRID_ENABLED=true`) |

Provider order: SF DataSF → open-data packs → Regrid (if enabled) → jurisdiction fallback. Uncovered counties are **not errors** — they return `coverage: "jurisdiction"`.

**One-paragraph version for heroes:**

> Every California address gets free county requirements and statute-grounded ADU analysis. Lot-level zoning applies where GIS covers your coordinate — San Francisco today, more jurisdictions as open-data packs ship. Optional paid Regrid is off by default.

## What we help users decide

- Can I add an ADU under Gov. Code § 65852.2 (state ADU law)?
- Can I pursue an urban lot split under SB 9 (Gov. Code § 65852.21)?
- Is a THOW, park model, or foundation-mounted unit the lawful pathway here?
- What overlays (fire, historic, coastal) affect my next step?
- Who should I talk to next — planning staff, a specialist, or a builder?

## Out of scope — never claim

- Permit issuance or guaranteed approval
- Legal representation or personalized legal advice
- Guaranteed builder quality or marketplace escrow
- Lot-level district codes for counties without GIS coverage
- Endorsement of affiliate products for a specific parcel
- "Eligible" as a substitute for local design review or overlay clearance

## Primary user journey (for CTA copy)

```
/ (search) → Analysis interstitial → ResultsCard → Open Connect
```

Partners and specialist leads also live on `/partners` and `/connect`. Monetization CTAs belong on those routes — not on the embeddable `/` widget.
