# Style References

Annotated **in-app copy seeds** from the live product. No external emails or ads yet — add performance notes when you have them.

Each entry: **context → copy → why it works**.

---

## Hero / search

**Source:** `src/components/features/AddressSearch/AddressSearch.tsx`

**Eyebrow:**
> State of California · ADU & SB 9

**Headline:**
> Small Footprint. Elevated Living.

**Subhead:**
> Enter a California address below for ADU and SB 9 eligibility, county requirements, and tiny-home guidance.

**Coverage footnote:**
> All CA counties — free county requirements; SF lot GIS when available.

**Placeholder:**
> Enter a California address...

**Why it works:** Editorial headline with institutional eyebrow; subhead stacks three concrete benefits; footnote delivers coverage honesty without killing momentum.

---

## Jurisdiction honesty banner

**Source:** `src/components/features/ResultsCard/ResultsCard.tsx`

**Copy:**
> Lot zoning was not verified for this coordinate. Eligibility below reflects published county/city guidance plus the statewide ADU floor — confirm base district and overlays with local Planning/Building.

**Why it works:** Amber trust pattern — never oversells GIS. Names what *was* applied (county guidance + ADU floor) and what the user must still do.

---

## Regulations mission

**Source:** `src/lib/regulations/agent.ts`

**Copy:**
> Helps homeowners, investors, and developers navigate zoning ordinances, permitting processes, and building code considerations with cited official sources.

**Why it works:** Audience triad in one sentence; "cited official sources" signals precision without claiming legal advice.

---

## Full disclaimer lead

**Source:** `src/lib/regulations/agent.ts` (`formatRegulationsDisclaimer`)

**Copy:**
> Informational only — not legal advice, not a permit, and not a substitute for your local planning & building department or a licensed land-use attorney.

**Why it works:** Three negations (not legal advice, not a permit, not a substitute) cover the main user misconceptions.

---

## Statewide regulations lead

**Source:** `src/lib/content/ca-tiny-home-regulations.ts`

**Copy:**
> California is broadly friendly to tiny living, but permission almost always turns on local zoning, building codes, and whether the unit is site-built, foundation-mounted, or a park model / tiny home on wheels (THOW). Use this guide to orient, then confirm with your city or county before you buy or place a unit.

**Why it works:** Optimistic opener immediately grounded in local rules and unit classification — sets correct expectations.

---

## SF THOW guide — loopholes reframe

**Source:** `src/lib/content/guides/sf-thow-zoning.ts`

**Title:**
> Is a Tiny Home on Wheels Legal in San Francisco? Rules, Permits, and Loopholes.

**Lead:**
> In San Francisco, a tiny home on wheels is not a free-floating occupancy class. Lawfulness turns on use (dwelling vs recreation), HCD classification, local zoning, and whether State ADU Law's ministerial path applies to a foundation-mounted ADU — or a locally authorized moveable tiny house. "Loopholes" here means lawful pathways and hard stops, not workarounds that dodge permits.

**Why it works:** SEO-friendly title with immediate reframe; lists the actual decision factors without dumbing down.

---

## Affiliate blurb pattern

**Source:** `src/lib/content/affiliates.ts`

**Solar (Jackery-style):**
> Portable solar generators commonly used for staging power and off-grid subsystems during build-out.

**Composting toilet:**
> Composting toilet systems often researched for staged or remote builds — confirm local sanitation rules before purchase.

**Why it works:** Factual use case, no superlatives, no legal claims; optional "confirm local rules" on sensitive categories.

---

## Affiliate disclosure

**Source:** `src/lib/content/affiliates.ts`

**Copy:**
> Featured resources are curated manufacturer links. doihave.space may earn a commission if you buy through them, at no extra cost to you. These are not official partnerships, endorsements, or legal advice for your parcel.

**Why it works:** Commission transparency + three explicit "not" statements.

---

## Warning lead form

**Source:** `src/components/features/LeadFallbackForm/LeadFallbackForm.tsx`

**Headline:**
> Specialist review recommended

**Body:**
> This parcel shows warnings in the diagnostics above. A specialist can help interpret overlays and permitting pathways — this form does not invent new statute.

**Why it works:** Amber tone — helpful, not alarmist; "does not invent new statute" reinforces trust boundary.

---

## Restricted lead form

**Source:** `src/components/features/LeadFallbackForm/LeadFallbackForm.tsx`

**Headline:**
> Restricted — expert compliance review

**Body:**
> Movable tiny homes / THOW placement is restricted on this parcel under the pilot overlays and applicable local rules. Review the diagnostics above for engine reasons — this form does not invent new statute.

**Follow-up:**
> You may still qualify for a permanent-foundation ADU pathway. Local compliance experts manually audit complex lots and route referrals through our review queue.

**Why it works:** Rose urgency without false promises; offers alternate pathway without overriding engine outcome.

---

## Connect page disclaimer

**Source:** `src/components/features/ConnectPage/ConnectPage.tsx`

**Copy:**
> Informational matching only — not a permit or marketplace guarantee.

**Why it works:** Short matching-tier disclaimer — sets expectations for builder intro, not escrow.

---

## Premium waitlist honesty

**Source:** `src/lib/content/premium-tools.ts`

**Subtitle:**
> Practical checklists, outreach templates, and budgeting sheets for homeowners, investors, and developers navigating California ADU and SB 9 projects.

**Honesty note:**
> These tools are forthcoming downloadables with suggested prices shown for planning only. Join the waitlist to be notified when checkout opens — no payment is collected on this page, and nothing here is legal advice.

**Why it works:** Commercial transparency template — no fake urgency, no hidden checkout.

---

## Adding external references later

When you have high-performing emails, ads, or landing pages:

1. Append a new `##` section with channel, date, and metric (open rate, CTR, conversion).
2. Paste full copy.
3. Note 2–3 bullets on **why it worked** using vocabulary from [tone-of-voice.md](./tone-of-voice.md).
