/**
 * Cited, versioned regulations types for the tiny-home briefing expert.
 * Zero React. Every visitor-facing claim carries at least one official source.
 */

import type { RegulationsAuthor } from "@/lib/regulations/agent";
import type { LocationRequirement } from "@/lib/regulations/location-requirements";

export type SourceRef = {
  label: string;
  href: string;
};

export type CitedClaim = {
  text: string;
  sources: SourceRef[];
};

export type BuildingPath = "adu" | "parkModel" | "cabin" | "modular";

export type PrimaryUse =
  "dwelling" | "homeOccupation" | "studio" | "storage" | "retail" | "unknown";

export type ChecklistItem = {
  id: string;
  title: string;
  detail: CitedClaim;
};

export type OutlineSection = {
  id: string;
  title: string;
  claims: CitedClaim[];
};

export type SearchReceipt = {
  issuedAt: string;
  formattedAddress: string;
  place: string;
  region: string;
  /** SF assessor block/lot when a local parcel index resolved it. */
  mapblklot: string | null;
  /** Lot GIS when a zoning provider matched; else county/city + statewide context. */
  analysisScope: "lot_zoning" | "jurisdiction_context";
  corpusVersion: string;
  lastReviewed: string;
  author: RegulationsAuthor;
  sourcesUsed: SourceRef[];
  disclaimer: string;
};

export type GuideLinkRef = {
  slug: string;
  title: string;
  href: string;
};

export type ResultsBriefing = {
  region: string;
  isCalifornia: boolean;
  author: RegulationsAuthor;
  /** Use-first summary sentences for this search. */
  summary: CitedClaim[];
  /** Jurisdiction-aware requirement list with tiny-home explanations. */
  requirements: LocationRequirement[];
  checklist: ChecklistItem[];
  /** CA building-path outline; empty when not California. */
  outline: OutlineSection[];
  /** SF buyer-guide deep links; only when place is San Francisco. */
  guideLinks: GuideLinkRef[];
  receipt: SearchReceipt;
};

export type StateProfile =
  | {
      published: true;
      code: string;
      name: string;
      useDoctrine: CitedClaim[];
      outline: OutlineSection[];
      /** SF-specific checklist when place is San Francisco; else statewide. */
      sfChecklist: ChecklistItem[];
      caChecklist: ChecklistItem[];
    }
  | {
      published: false;
      code: string;
      name: string;
    };
