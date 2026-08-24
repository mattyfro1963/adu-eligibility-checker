# Site Audit Report — doihave.space

Oversight pass: Wave 0 integrity verify → Wave 1 parallel audits → Wave 2 major fixes → Wave 2b verify → Wave 3 Tiny Home implications.

**Date:** 2026-08-24  
**Vitest:** 137 passed

---

## Executive severity table

| Severity | Open after Wave 2 | Notes |
|----------|-------------------|--------|
| critical | **0** | All Fix-Policy criticals closed |
| high | **0** | All Fix-Policy highs closed or reclassified |
| medium / low | Backlog below | Deferred per plan |

---

## Fixed majors (Wave 2)

| ID | Bucket | Fix evidence |
|----|--------|--------------|
| Privacy/Terms missing while collecting leads | Legal | [`/privacy`](../../../../src/app/privacy/page.tsx), [`/terms`](../../../../src/app/terms/page.tsx); footer `LEGAL_NAV`; [`LegalConsentNote`](../../../../src/components/features/LegalConsentNote/LegalConsentNote.tsx) on lead/waitlist/builder forms |
| Embed chrome drift vs ARCHITECTURE | IA | [`SiteChrome`](../../../../src/components/features/SiteChrome/SiteChrome.tsx) hides header/footer on `/`; widget legal strip in `HomePageClient` |
| “Demo purposes only” on production `/` | Trust | Demo disclaimer removed; short disclaimer only |
| Footer “Connect” → `/` dead label | Conversion / IA | Removed; Privacy/Terms in footer instead |
| `/#connect` without search | Conversion | Prompt when hash wants connect but no geocode; connect section only when report exists |
| Map pin defaulted to Eligible | Honesty | [`FeaturePin`](../../../../src/components/features/AddressMapPreview/FeaturePin.tsx) neutral when status null |
| Eligible CTA ≠ Connect offer | Conversion | CTA → “Request builder intro”; ConnectSection titles by `overall` |
| Connect on zoning error | Conversion | Connect hidden when `error`; ResultsCard “Retry parcel check” |
| No new-search control | Conversion | “Search another address” in compact `AddressSearch` |
| Sample legend promised Eligible with none | Trust | Legend limited to Warning/Restricted tones present |
| Missing sitemap/robots/OG | SEO | [`sitemap.ts`](../../../../src/app/sitemap.ts), [`robots.ts`](../../../../src/app/robots.ts), root `metadataBase` + OG/Twitter |
| Dual affiliate disclosure strings | Trust | `AFFILIATE_FTC_DISCLOSURE` aliases `AFFILIATE_DISCLOSURE` |
| Buried short disclaimer | Trust | Short disclaimer above overlay facts when report present |
| Raw provider slug | Trust | Friendly provider display names |
| Checklist “cross-checked” overclaim | Trust | Dynamic unverified-aware description |
| ARCHITECTURE monetization docs | IA | Updated for `/#connect` unified landing |
| Post-search missing h1 / error aria | A11y | Compact sr-only h1; `aria-describedby` on search error |

---

## Backlog (medium / low — not fixed this pass)

- Full combobox ARIA keyboard pattern (ArrowUp/Down)
- Mobile: panel-before-map order; header scroll fade
- Dynamic-import ResultsCard/Connect for TTI
- JSON-LD FAQ/Article schema
- About / Contact / standalone FAQ / Pricing pages
- Regulations ↔ Guides bidirectional links; guide page asides
- County landing URLs for THOW SEO
- Wire or delete orphan `GetQuotesModal` / `PartnerOffers` / `EligibleNextSteps`
- Interstitial cancel control
- ExpandableSection semantic h2/h3

---

## Tiny Home Land Search implications

Recommendations only — **no TH platform build in this pass**.

### Frontend flow

Reuse **Address → Analysis → Result → status-gated lead**. Insert **model selection** after address (or after preliminary eligibility) before fit scoring. Do not bury post-result CTAs; keep outcome-colored primary actions visible. Embed widget pattern (no marketing chrome on `/`) is the white-label shape for a manufacturer site.

### Property resolution + confidence

Keep coverage honesty: `lot` vs `jurisdiction`, `overlaysVerified`, null lot area → never confident eligible. Map TH statuses:

| doihave.space today | TH Land Search language |
|---------------------|-------------------------|
| `eligible` + verified overlays/lot | Likely Eligible |
| `warning` / unverified overlays / unknown lot | Eligible With Conditions / Manual Review |
| `restricted` | Likely Ineligible / Manual Review |

### Model fit (future)

Engine today answers statute pathways, not “does Model B fit setbacks.” TH needs a **model DB** + numeric development standards; until then, report “confirm placement locally” as a first-class condition — same honesty pattern as unverified overlays.

### Report + payment

Privacy/Terms + OG/sitemap are now baselines for any paid report. Premium waitlist shows the commerce hole: UI without Stripe. TH checkout should not ship without consent + receipt storage.

### Sales

Status-bifurcated CTAs (builder vs specialist) are the right pattern for qualified TH leads. Include structure intent (`thow` already in `ProjectLeadForm`). Orphan `GetQuotesModal` / `PartnerOffers` are candidates to wire for eligible build-out after model match — not before honesty gates.

### Trust / SEO / IA

Carry short disclaimer near badges, schematic ≠ survey map copy, and legal footer links into any TH white-label. County regulations corpus + SF guides are reusable content; expand to model-specific requirement sheets rather than inventing LLM eligibility.

### Nationwide scaling

Same service split as today: Address/Parcel/Jurisdiction/Zoning adapters → deterministic rules → report. Plug jurisdiction packages; do not fork a new app per city.

---

## Success checklist

- [x] Integrity Vitest green + honesty criteria
- [x] Every public URL audited in Wave 1
- [x] Zero open critical/high Fix-Policy faults
- [x] Privacy + Terms linked from footer and forms
- [x] sitemap.ts + robots.ts + key metadata/OG
- [x] Tiny Home implications written
- [x] No TH model DB / Stripe / admin / fit engine started
