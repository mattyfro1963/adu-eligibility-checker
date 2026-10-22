/**
 * San Francisco / APN source catalog — static catalog-page URLs only.
 * Production and CI never fetch these hosts; visitors open links outbound.
 */

import type { SourceRef } from "@/lib/regulations/types";
import { SRC } from "@/lib/regulations/sources";

export type SfFactKind =
  | "zoning"
  | "parcelApn"
  | "historic"
  | "coastal"
  | "fire"
  | "aduPermit"
  | "stateAduSb9"
  | "thowSafety"
  | "ccrProtection";

export type SfSourceEntry = {
  fact: SfFactKind;
  /** How the app obtains the fact (disk / omit / checklist link). */
  inApp: string;
  source: SourceRef;
  notes?: string;
};

/**
 * Exact official layers for SF lot facts. Zoning view ID is verified in-repo
 * (pilot-zoning.geojson). Assessor parcels view acdm-wktn is verified; the
 * full city GeoJSON is fetched offline via scripts/fetch-sf-assessor-parcels.mjs
 * (gitignored). A committed samples extract covers SAMPLE_REPORTS SF chips when
 * the full snapshot is absent — PIM remains the visitor confirm path elsewhere.
 */
export const SF_SOURCE_CATALOG: readonly SfSourceEntry[] = [
  {
    fact: "zoning",
    inApp: "Local PIP on public/data/pilot-zoning.geojson",
    source: SRC.datasfZoning,
    notes:
      "DataSF view 3i4a-hu95 (PDDL). Already committed; do not re-download.",
  },
  {
    fact: "parcelApn",
    inApp:
      "public/data/sf-assessor-parcels.geojson (fetch script) or committed sf-assessor-parcels.samples.geojson for sample chips; else mapblklot null + PIM link",
    source: SRC.datasfParcels,
    notes:
      "SF assessor key is block/lot (mapblklot). Verified DataSF view acdm-wktn. Full city extract is gitignored — run scripts/fetch-sf-assessor-parcels.mjs. Samples extract covers SAMPLE_REPORTS SF coordinates.",
  },
  {
    fact: "historic",
    inApp: "Overlay stays false until a local overlay snapshot exists",
    source: SRC.sfPim,
    notes: "Visitor confirms historic status on PIM; no live overlay fetch.",
  },
  {
    fact: "coastal",
    inApp: "Overlay stays false until a local overlay snapshot exists",
    source: SRC.sfPim,
    notes: "Coastal zone confirmation via PIM / local layers when snapshotted.",
  },
  {
    fact: "fire",
    inApp: "Overlay stays false until a local overlay snapshot exists",
    source: SRC.sfPim,
    notes: "Fire / VHFHSZ via local snapshot later; no live CAL FIRE fetch.",
  },
  {
    fact: "aduPermit",
    inApp: "Linked in SF application checklist only",
    source: SRC.sfPlanningAdu,
  },
  {
    fact: "stateAduSb9",
    inApp: "Linked; never scraped",
    source: SRC.hcdAdu,
  },
  {
    fact: "thowSafety",
    inApp: "Linked in checklist/outline; never scrape ANSI paywall",
    source: SRC.hcdTinyHomesIb,
  },
  {
    fact: "ccrProtection",
    inApp: "Cited in CA outline and checklists; CC&Rs cannot prohibit ADUs",
    source: SRC.civ4751,
    notes:
      "Civil Code § 4751 makes anti-ADU HOA covenants void and unenforceable.",
  },
] as const;

/** SB 9 unit-path statutes — always listed, even when the lot is not SB 9 Green. */
export function sb9ReceiptSources(): SourceRef[] {
  return [SRC.gov65852_21, SRC.gov66411_7, SRC.hcdSb9];
}

/** Sources listed on an SF pilot-lot search receipt. */
export function sfPilotReceiptSources(): SourceRef[] {
  return [
    SRC.datasfZoning,
    SRC.datasfParcels,
    SRC.sfPim,
    SRC.sfPlanningAdu,
    SRC.sfDbi,
    SRC.hcdAdu,
    SRC.hcdTinyHomesIb,
    SRC.govChapter13,
    ...sb9ReceiptSources(),
    SRC.civ4751,
    SRC.civ4740,
  ];
}

/** Sources when CA search is outside SF pilot coverage. */
export function caStatewideReceiptSources(): SourceRef[] {
  return [
    SRC.hcdAdu,
    SRC.hcdTinyHomesIb,
    SRC.govChapter13,
    SRC.hcdFactSheets2026,
    SRC.cbscBulletin2601,
    ...sb9ReceiptSources(),
    SRC.civ4751,
    SRC.civ4740,
  ];
}
