/**
 * Cited, versioned regulations types for the tiny-home briefing expert.
 * Zero React. Every visitor-facing claim carries at least one official source.
 */

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
  analysisScope: "sf_pilot_lot" | "statewide_context_only";
  corpusVersion: string;
  lastReviewed: string;
  sourcesUsed: SourceRef[];
  disclaimer: string;
};

export type ResultsBriefing = {
  region: string;
  isCalifornia: boolean;
  /** Use-first summary sentences for this search. */
  summary: CitedClaim[];
  checklist: ChecklistItem[];
  /** CA building-path outline; empty when not California. */
  outline: OutlineSection[];
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
