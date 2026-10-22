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

/**
 * Key findings from a zoning report. Only omit a row when the field is
 * absent — never drop zoning, lot area, overlays, dimensions, or ADU when
 * the report exists. Copy is derived from engine fields; not legal advice.
 */
export function buildKeyFindings(report: ZoningReport | null): KeyFinding[] {
  if (!report) return [];

  const findings: KeyFinding[] = [];
  const isJurisdictionContext = report.analysisScope === "jurisdiction_context";
  const overlaysUnchecked = report.overlaysVerified !== true;
  const providerLabel = report.zoningProvider?.trim() || null;

  if (isJurisdictionContext) {
    findings.push({
      id: "zoning",
      text: "Base zoning was not verified at this coordinate — candidacy uses published county/city guidance plus state profiles.",
    });
  } else if (report.zoning) {
    findings.push({
      id: "zoning",
      text: `District ${report.zoning} from ${providerDisplayName(providerLabel)}. Confirm occupancy and wheeled-unit rules with local Planning.`,
    });
  }

  if (report.mapblklot) {
    findings.push({
      id: "mapblklot",
      text: `APN / mapblklot ${report.mapblklot}.`,
    });
  }

  if (report.lotSizeSqFt != null && report.lotSizeSqFt > 0) {
    findings.push({
      id: "lot-area",
      text: `Lot area ${report.lotSizeSqFt.toLocaleString()} sq ft from GIS — still confirm setbacks and coverage with a survey before delivery.`,
    });
  } else {
    findings.push({
      id: "lot-area",
      text: "Lot area was not verified from GIS for this search — treat size-dependent pathways as provisional.",
    });
  }

  if (report.parcelBoundary) {
    findings.push({
      id: "parcel-boundary",
      text:
        report.boundarySource === "mock"
          ? "Parcel outline is demo assessor geometry for this sample — not a recorded survey."
          : "Assessor parcel boundary is drawn from GIS — not a recorded survey.",
    });
  }

  findings.push({
    id: "overlays",
    text:
      isJurisdictionContext || overlaysUnchecked
        ? "Overlay layers (coastal, fire, historic, tiny-home) were not verified for this parcel."
        : "Overlay facts were checked against mapped layers where available — still confirm with Planning/Building.",
  });

  if (report.unitCapacity) {
    findings.push({
      id: "unit-capacity",
      text: `GIS lot area supports up to ${report.unitCapacity.maxAllowableUnits} dwelling units on this parcel — confirm locally. Unit capacity is not a THOW placement permit.`,
    });
  }

  findings.push({
    id: "placement",
    text: `Placement ${statusWord(report.dimensions.placement.status)} — local THOW / park-model path. A THOW is not automatically an ADU.`,
  });
  findings.push({
    id: "certification",
    text: `Certification ${statusWord(report.dimensions.certification.status)} — size and seal fit for the featured plan.`,
  });
  findings.push({
    id: "transport",
    text: `Transport ${statusWord(report.dimensions.transport.status)} — delivery and route logistics; oversize permits still depend on the hauler route.`,
  });
  findings.push({
    id: "lot-readiness",
    text: `Lot readiness ${statusWord(report.dimensions.lotReadiness.status)} — utilities and occupancy readiness.`,
  });

  findings.push({
    id: "adu",
    text: `ADU pathway ${statusWord(report.adu.status)} (optional — not automatic from wheeled placement).`,
  });

  if (report.sb9) {
    findings.push({
      id: "sb9",
      text: `SB 9 ${statusWord(report.sb9.status)} (other pathway — does not set THOW overall).`,
    });
  }

  return findings;
}
