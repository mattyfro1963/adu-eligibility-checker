/**
 * SF buyer-guide content types. Zero React.
 * Legal claims reuse CitedClaim / SourceRef from regulations.
 */

import type { CitedClaim } from "@/lib/regulations/types";

export type GuideSlug =
  | "tiny-home-on-wheels-san-francisco"
  | "tiny-home-cost-matrix"
  | "wheels-vs-foundation";

export type GuideLink = {
  slug: GuideSlug;
  title: string;
  description: string;
  href: `/guides/${GuideSlug}`;
};

export type GuideMeta = {
  slug: GuideSlug;
  title: string;
  description: string;
  /** Short eyebrow for layout chrome. */
  eyebrow: string;
  lastReviewed: string;
};

export type GuideSection = {
  id: string;
  title: string;
  claims: CitedClaim[];
};

/** Cost-matrix build paths shown as columns. */
export type CostColumnId = "diy" | "turnkeyThow" | "foundationAdu";

export type CostLineId =
  | "baseUnit"
  | "trailerChassis"
  | "foundation"
  | "delivery"
  | "crane"
  | "trenching"
  | "permitFees"
  | "contingency";

export type CostLineAmounts = Record<CostColumnId, string>;

export type CostLineItem = {
  id: CostLineId;
  label: string;
  amounts: CostLineAmounts;
  note?: string;
};

export type DecisionNode = {
  id: string;
  question: string;
  /** Prefer CitedClaim when the branch cites statute or official guidance. */
  guidance: CitedClaim | { text: string; sources?: never[] };
  /** Next node ids or terminal outcome labels. */
  outcomes: Array<{ label: string; nextId?: string; summary: string }>;
};

export type ComparisonRow = {
  id: string;
  dimension: string;
  wheels: string;
  foundation: string;
};
