/**
 * DIY THOW vs turn-key THOW vs foundation ADU cost matrix for SF buyers.
 * Ranges are planning estimates — not live municipal fee APIs.
 * Zero React.
 */

import type {
  CostColumnId,
  CostLineItem,
  GuideMeta,
} from "@/lib/content/guides/types";

export const SF_COST_META: GuideMeta = {
  slug: "tiny-home-cost-matrix",
  title: "Tiny Home Cost Matrix: DIY THOW vs Turn-Key vs Foundation ADU",
  description:
    "Transparent SF buyer ranges for base unit, crane, utility trenching, permits, and contingency across three build paths.",
  eyebrow: "San Francisco · Cost matrix",
  lastReviewed: "2026-08-20",
};

export const SF_COST_INTRO = {
  lead: "Buyers under-estimate soft costs. This matrix compares three common paths — DIY tiny home on wheels, turn-key THOW, and permanent-foundation ADU — and surfaces hidden line items that dominate Bay Area budgets: crane rentals, utility trenching, municipal permits, delivery, and contingency.",
} as const;

export const COST_COLUMNS: Array<{
  id: CostColumnId;
  label: string;
  summary: string;
}> = [
  {
    id: "diy",
    label: "DIY THOW",
    summary:
      "Owner-built or shell build on a trailer chassis. Lowest sticker price; highest schedule and compliance risk.",
  },
  {
    id: "turnkeyThow",
    label: "Turn-key THOW",
    summary:
      "Factory or builder-finished wheeled unit. Higher unit cost; still needs a lawful placement path in SF.",
  },
  {
    id: "foundationAdu",
    label: "Foundation ADU",
    summary:
      "Permanent accessory dwelling on an approved foundation — the primary SF residential path under State ADU Law.",
  },
];

export const COST_LINE_ITEMS: CostLineItem[] = [
  {
    id: "baseUnit",
    label: "Base unit / shell",
    amounts: {
      diy: "$25,000–$80,000",
      turnkeyThow: "$80,000–$200,000+",
      foundationAdu: "$150,000–$450,000+",
    },
    note: "Finish level, size, and labor market drive the spread. ADU figures are SF-typical soft+hard ranges, not bids.",
  },
  {
    id: "trailerChassis",
    label: "Trailer / chassis",
    amounts: {
      diy: "$5,000–$15,000",
      turnkeyThow: "Often included",
      foundationAdu: "N/A",
    },
  },
  {
    id: "foundation",
    label: "Foundation / pier / pad",
    amounts: {
      diy: "$0–$8,000 (if temporary pad)",
      turnkeyThow: "$0–$12,000 (if temporary pad)",
      foundationAdu: "$15,000–$60,000+",
    },
    note: "Permanent residential ADUs need an approved foundation system; wheeled pads are not a substitute for that path.",
  },
  {
    id: "delivery",
    label: "Delivery / tow / escort",
    amounts: {
      diy: "$500–$3,000",
      turnkeyThow: "$1,500–$8,000+",
      foundationAdu: "$2,000–$15,000 (modular delivery)",
    },
  },
  {
    id: "crane",
    label: "Crane / lift (tight SF lots)",
    amounts: {
      diy: "$1,500–$6,000+",
      turnkeyThow: "$1,500–$8,000+",
      foundationAdu: "$2,500–$12,000+",
    },
    note: "Narrow lots, overhead wires, and rear-yard access often force a crane day even for “small” units.",
  },
  {
    id: "trenching",
    label: "Utility trenching (water / sewer / electric)",
    amounts: {
      diy: "$1,000–$5,000+",
      turnkeyThow: "$1,000–$5,000+",
      foundationAdu: "$1,000–$5,000+",
    },
    note: "Distance to laterals, rocky soils, and street opening fees push the upper end. Budget $1,000–$5,000+ before surprises.",
  },
  {
    id: "permitFees",
    label: "Municipal permit & plan-check fees",
    amounts: {
      diy: "$500–$5,000+ (path-dependent)",
      turnkeyThow: "$500–$5,000+ (path-dependent)",
      foundationAdu: "$5,000–$25,000+",
    },
    note: "SF Planning / DBI fees vary by valuation and scope. Confirm current fee schedules — this tool does not scrape live fee APIs.",
  },
  {
    id: "contingency",
    label: "Contingency (recommended)",
    amounts: {
      diy: "15–25% of hard costs",
      turnkeyThow: "10–20% of hard costs",
      foundationAdu: "10–20% of hard costs",
    },
  },
];

export const COST_METHODOLOGY_DISCLAIMER =
  "Ranges are orientation estimates for San Francisco / Bay Area planning conversations as of the guide’s last-reviewed date. They are not quotes, appraisals, or live municipal fee lookups. Always verify permit fees with SF Planning / DBI and obtain contractor bids before committing capital.";
