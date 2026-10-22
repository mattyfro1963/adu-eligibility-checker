import type { EligibilityStatus, ZoningReport } from "@/lib/types/zoning";

export type KeyFindingId =
  | "zoning"
  | "mapblklot"
  | "lot-area"
  | "parcel-boundary"
  | "overlays"
  | "unit-capacity"
  | "placement"
  | "certification"
  | "transport"
  | "lot-readiness"
  | "adu"
  | "sb9";

export type KeyFinding = {
  id: KeyFindingId;
  text: string;
};

function statusWord(status: EligibilityStatus): string {
  switch (status) {
    case "eligible":
      return "Eligible";
    case "warning":
      return "Warning";
    case "restricted":
      return "Restricted";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function providerDisplayName(
  provider: string | null | undefined,
): string {
  if (provider === "sf-datasf") {
    return "San Francisco DataSF (California pilot)";
  }
  if (provider === "open-data") return "open zoning data";
  if (provider === "regrid") return "Regrid";
  if (provider) return provider;
  return "lot GIS";
}

/** Fixed order — every search shows every unit, including unverified ones. */
export const KEY_FINDING_IDS: readonly KeyFindingId[] = [
  "zoning",
  "mapblklot",
  "lot-area",
  "parcel-boundary",
  "overlays",
  "unit-capacity",
  "placement",
  "certification",
  "transport",
  "lot-readiness",
  "adu",
  "sb9",
] as const;

/**
 * Key findings from a zoning report. Every unit is always present when a
 * report exists — unverified GIS or empty findings still get a row.
 * Copy is derived from engine fields; not legal advice.
 */
export function buildKeyFindings(report: ZoningReport | null): KeyFinding[] {
  if (!report) return [];

  const isJurisdictionContext = report.analysisScope === "jurisdiction_context";
  const overlaysUnchecked = report.overlaysVerified !== true;
  const providerLabel = report.zoningProvider?.trim() || null;
  const zoningLabel = report.zoning.trim();
  const zoningKnown =
    !isJurisdictionContext &&
    zoningLabel.length > 0 &&
    zoningLabel.toLowerCase() !== "not verified" &&
    zoningLabel.toLowerCase() !== "unverified";

  const zoning: KeyFinding = {
    id: "zoning",
    text: zoningKnown
      ? `District ${report.zoning} from ${providerDisplayName(providerLabel)}. Confirm occupancy and wheeled-unit rules with local Planning.`
      : "Base zoning was not verified at this coordinate — candidacy uses published county/city guidance plus state profiles.",
  };

  const mapblklot: KeyFinding = {
    id: "mapblklot",
    text: report.mapblklot
      ? `APN / mapblklot ${report.mapblklot}.`
      : "APN / mapblklot was not verified for this search.",
  };

  const lotArea: KeyFinding = {
    id: "lot-area",
    text:
      report.lotSizeSqFt != null && report.lotSizeSqFt > 0
        ? `Lot area ${report.lotSizeSqFt.toLocaleString()} sq ft from GIS — still confirm setbacks and coverage with a survey before delivery.`
        : "Lot area was not verified from GIS for this search — treat size-dependent pathways as provisional.",
  };

  const parcelBoundary: KeyFinding = {
    id: "parcel-boundary",
    text: report.parcelBoundary
      ? report.boundarySource === "mock"
        ? "Parcel outline is demo assessor geometry for this sample — not a recorded survey."
        : "Assessor parcel boundary is drawn from GIS — not a recorded survey."
      : "Parcel outline was not verified — map geometry is schematic only, not a recorded survey.",
  };

  const overlays: KeyFinding = {
    id: "overlays",
    text:
      isJurisdictionContext || overlaysUnchecked
        ? "Overlay layers (coastal, fire, historic, tiny-home) were not verified for this parcel."
        : "Overlay facts were checked against mapped layers where available — still confirm with Planning/Building.",
  };

  const unitCapacity: KeyFinding = {
    id: "unit-capacity",
    text: report.unitCapacity
      ? `GIS lot area supports up to ${report.unitCapacity.maxAllowableUnits} dwelling units on this parcel — confirm locally. Unit capacity is not a THOW placement permit.`
      : "Dwelling-unit capacity was not verified because lot area is unknown. Confirm locally. Unit capacity is not a THOW placement permit.",
  };

  return [
    zoning,
    mapblklot,
    lotArea,
    parcelBoundary,
    overlays,
    unitCapacity,
    {
      id: "placement",
      text: `Placement ${statusWord(report.dimensions.placement.status)} — local THOW / park-model path. A THOW is not automatically an ADU.`,
    },
    {
      id: "certification",
      text: `Certification ${statusWord(report.dimensions.certification.status)} — size and seal fit for the featured plan.`,
    },
    {
      id: "transport",
      text: `Transport ${statusWord(report.dimensions.transport.status)} — delivery and route logistics; oversize permits still depend on the hauler route.`,
    },
    {
      id: "lot-readiness",
      text: `Lot readiness ${statusWord(report.dimensions.lotReadiness.status)} — utilities and occupancy readiness.`,
    },
    {
      id: "adu",
      text: `ADU pathway ${statusWord(report.adu.status)} (optional — not automatic from wheeled placement).`,
    },
    {
      id: "sb9",
      text: report.sb9
        ? `SB 9 ${statusWord(report.sb9.status)} (other pathway — does not set THOW overall).`
        : "SB 9 was not scored for this search (other pathway — does not set THOW overall).",
    },
  ];
}
