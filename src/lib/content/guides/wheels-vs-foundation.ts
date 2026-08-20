/**
 * Wheels vs foundation decision tree + comparison rows for SF buyers.
 * Zero React.
 */

import { SRC } from "@/lib/regulations/sources";
import type {
  ComparisonRow,
  DecisionNode,
  GuideMeta,
} from "@/lib/content/guides/types";

export const WHEELS_VS_FOUNDATION_META: GuideMeta = {
  slug: "wheels-vs-foundation",
  title: "Wheels vs Foundation: Financing, Insurance, Depreciation, Longevity",
  description:
    "Decision tree and side-by-side trade-offs between THOW / park-model paths and permanent-foundation ADUs in San Francisco.",
  eyebrow: "San Francisco · Decision tree",
  lastReviewed: "2026-08-20",
};

export const WHEELS_VS_FOUNDATION_INTRO = {
  lead: "Choosing wheels versus a permanent foundation is a financing, insurance, depreciation, and compliance decision — not just a lifestyle preference. In San Francisco, the foundation ADU path is usually the clearer residential route under State ADU Law; wheeled units need an express local or park pathway.",
} as const;

export const DECISION_NODES: DecisionNode[] = [
  {
    id: "primary-use",
    question: "Is the primary use full-time dwelling on this SF lot?",
    guidance: {
      text: "Residential occupancy follows CBC/CRC (or factory-built / manufactured) standards. Recreational or seasonal park-trailer use is a different class under HCD guidance.",
      sources: [SRC.hcdTinyHomesIb, SRC.sfPlanning],
    },
    outcomes: [
      {
        label: "Yes — full-time dwelling",
        nextId: "adu-path",
        summary:
          "Bias toward a permanent-foundation ADU unless SF expressly allows a moveable tiny house as an ADU on this lot.",
      },
      {
        label: "No — workshop / storage / seasonal",
        nextId: "non-dwelling",
        summary:
          "Do not assume dwelling rights later. A change of use requires Planning confirmation before occupancy.",
      },
    ],
  },
  {
    id: "adu-path",
    question:
      "Can this lot support a ministerial ADU under Chapter 13 + SF standards?",
    guidance: {
      text: "State ADU Law sets a floor; SF zoning and overlays still control setbacks, access, and whether a wheeled unit is locally authorized as an ADU.",
      sources: [SRC.govChapter13, SRC.sfPlanningAdu, SRC.datasfZoning],
    },
    outcomes: [
      {
        label: "Yes — residential ADU path looks open",
        nextId: "finance",
        summary:
          "Foundation ADU is usually the bankable path. Run the cost matrix before comparing turn-key THOW stickers.",
      },
      {
        label: "No / restricted overlays",
        summary:
          "Treat wheeled placement as high-friction. Seek a compliance audit (permanent ADU workaround, redesign, or alternate lot) rather than ordering a THOW first.",
      },
    ],
  },
  {
    id: "non-dwelling",
    question: "Will you convert to housing within 24 months?",
    guidance: {
      text: "Converting storage or studio use to housing is a change of use — plan residential standards up front if conversion is likely.",
      sources: [SRC.hcdTinyHomesIb, SRC.sfDbi],
    },
    outcomes: [
      {
        label: "Likely yes",
        nextId: "adu-path",
        summary:
          "Design for dwelling standards now; wheels-only shortcuts rarely survive a change-of-use review.",
      },
      {
        label: "No",
        summary:
          "Keep the use honest on the permit. A chassis may be fine for non-dwelling accessory use where zoning allows it — still confirm locally.",
      },
    ],
  },
  {
    id: "finance",
    question:
      "Do you need conventional mortgage / HELOC / construction financing?",
    guidance: {
      text: "Permanent ADUs are commonly financed against real property. Many lenders treat THOWs closer to vehicles or personal property unless titled and secured under a product that accepts them.",
      sources: [SRC.hcdAdu, SRC.sfPlanningAdu],
    },
    outcomes: [
      {
        label: "Need conventional real-estate financing",
        summary:
          "Prefer foundation ADU. Expect appraisal, plans, and permitted scope — plan permit fees and contingency into the draw schedule.",
      },
      {
        label: "Cash / specialty / RV-style lending",
        summary:
          "Turn-key THOW may be purchasable, but SF placement legality is independent of the loan. Confirm the lawful pathway before delivery.",
      },
    ],
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: "financing",
    dimension: "Financing",
    wheels:
      "Often personal-property / specialty / cash. Harder to fold into a primary mortgage without a lender product that accepts THOWs.",
    foundation:
      "Typically real-property construction or renovation financing when permitted as an ADU; more lender familiarity.",
  },
  {
    id: "depreciation",
    dimension: "Depreciation / resale",
    wheels:
      "Chassis-based units can depreciate like vehicles or RVs; resale depends on title, condition, and whether a buyer has a lawful place to put it.",
    foundation:
      "Permitted ADUs generally track real-estate valuation (lot + improvements), subject to market and rental rules.",
  },
  {
    id: "insurance",
    dimension: "Insurance",
    wheels:
      "May require RV, trailer, or specialty policies; homeowners carriers often exclude unpermitted dwellings.",
    foundation:
      "Usually endorsed onto a homeowners / landlord policy once permitted and certificated for occupancy.",
  },
  {
    id: "longevity",
    dimension: "Longevity & maintenance",
    wheels:
      "Axles, tires, seals, and tow stresses add maintenance. Highway moves increase wear.",
    foundation:
      "Building-code durability path; maintenance resembles other accessory structures (roof, envelope, systems).",
  },
  {
    id: "compliance",
    dimension: "SF compliance friction",
    wheels:
      "High unless an express moveable-tiny-house ADU or park path applies. Wheels-off myths do not create ADU rights.",
    foundation:
      "Primary residential pathway under State ADU Law + SF ADU program, still subject to lot overlays and standards.",
  },
];
