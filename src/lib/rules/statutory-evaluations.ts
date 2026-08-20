import { SRC } from "@/lib/regulations/sources";
import { SB9_LOT_SPLIT_MIN_SQFT } from "@/lib/rules/unit-capacity";
import type { StatutoryEvaluation } from "@/lib/types/statutory-evaluation";
import type { Parcel, ZoningReport } from "@/lib/types/zoning";

function isSingleFamilyZoning(zoning: string): boolean {
  const z = zoning.toUpperCase();
  switch (z) {
    case "R-1":
    case "RS":
    case "RH-1":
      return true;
    default:
      return z.startsWith("R-1") || z.startsWith("RH-1");
  }
}

function isResidentialZoning(zoning: string): boolean {
  const z = zoning.toUpperCase();
  switch (z) {
    case "C-1":
    case "C-2":
    case "C-3":
    case "M-1":
    case "M-2":
    case "PDR":
      return false;
    case "RS":
    case "RH":
      return true;
    default:
      return z.startsWith("R-") || z.startsWith("RM") || z.startsWith("RH-");
  }
}

function primaryReasonText(
  report: ZoningReport,
  program: "adu" | "sb9",
): string | undefined {
  const result = program === "adu" ? report.adu : report.sb9;
  return result.reasons[0]?.text;
}

/**
 * Projects parcel facts and engine outcomes into a statutory checklist
 * for UI display. Does not re-run eligibility — mirrors engine rules.
 */
export function buildStatutoryEvaluations(
  parcel: Parcel,
  report: ZoningReport,
): StatutoryEvaluation[] {
  const { zoning, overlays } = parcel;
  const lotSizeSqFt = report.lotSizeSqFt ?? parcel.lotSizeSqFt ?? null;

  const sb9Evaluations: StatutoryEvaluation[] = [
    {
      ruleId: "SB9-R1",
      program: "sb9",
      title: "Single-Family Zoning",
      passed: isSingleFamilyZoning(zoning),
      severity: "blocking",
      citation: SRC.gov65852_21.label,
      description:
        primaryReasonText(report, "sb9") ??
        "Property must be located within a single-family residential zone (e.g., R-1).",
    },
    {
      ruleId: "SB9-R2",
      program: "sb9",
      title: "Historic District Exclusion",
      passed: !overlays.historicDistrict,
      severity: "blocking",
      citation: SRC.gov65852_21.label,
      description:
        "Parcel must not be located within an established historic district or designated landmark.",
    },
    {
      ruleId: "SB9-R3",
      program: "sb9",
      title: "Fire Hazard Severity Zone",
      passed: !(overlays.vhfhsz || overlays.fireHazard),
      severity: "blocking",
      citation: SRC.hcdSb9.label,
      description:
        "Properties in Very High Fire Hazard Severity Zones are excluded from the SB 9 two-unit and lot-split path under this checker.",
    },
    {
      ruleId: "SB9-R4",
      program: "sb9",
      title: "Coastal Zone Permit Review",
      passed: !overlays.coastalZone,
      severity: "caution",
      citation: "Cal. Pub. Res. Code § 30000",
      description:
        "Properties within the Coastal Overlay Zone require Coastal Commission authorization.",
    },
    {
      ruleId: "SB9-R5",
      program: "sb9",
      title: "Minimum Lot Area",
      passed:
        lotSizeSqFt == null ||
        lotSizeSqFt <= 0 ||
        lotSizeSqFt >= SB9_LOT_SPLIT_MIN_SQFT,
      severity: "blocking",
      citation: SRC.gov66441_1.label,
      description:
        lotSizeSqFt != null && lotSizeSqFt > 0
          ? `Parcel must meet minimal lot sizing requirements (${SB9_LOT_SPLIT_MIN_SQFT.toLocaleString()} sq ft minimum for SB 9 lot splits).`
          : "Lot area was not verified — confirm parcel size with assessor or GIS before relying on SB 9 lot-split rights.",
    },
  ];

  const aduEvaluations: StatutoryEvaluation[] = [
    {
      ruleId: "ADU-R1",
      program: "adu",
      title: "Residential Zoning",
      passed: isResidentialZoning(zoning),
      severity: "blocking",
      citation: SRC.gov66314.label,
      description:
        primaryReasonText(report, "adu") ??
        "Property must be zoned for residential dwellings under Gov. Code Chapter 13.",
    },
    {
      ruleId: "ADU-R2",
      program: "adu",
      title: "Fire Hazard Overlay",
      passed: !(overlays.vhfhsz || overlays.fireHazard),
      severity: "caution",
      citation: SRC.gov66314.label,
      description:
        "Fire hazard overlays trigger objective safety standards but do not deny ministerial ADU rights by themselves.",
    },
    {
      ruleId: "ADU-R3",
      program: "adu",
      title: "Historic District Review",
      passed: !overlays.historicDistrict,
      severity: "caution",
      citation: SRC.gov66314.label,
      description:
        "Historic districts require objective design standards; ADU rights remain under Chapter 13.",
    },
    {
      ruleId: "ADU-R4",
      program: "adu",
      title: "Coastal Zone Permit Review",
      passed: !overlays.coastalZone,
      severity: "caution",
      citation: SRC.hcdFactSheets2026.label,
      description:
        "Coastal Development Permit or Coastal Act review may apply in addition to ministerial ADU processing.",
    },
  ];

  return [...sb9Evaluations, ...aduEvaluations];
}

export function filterStatutoryEvaluations(
  evaluations: StatutoryEvaluation[],
  program: "adu" | "sb9" | "all" = "all",
): StatutoryEvaluation[] {
  if (program === "all") return evaluations;
  return evaluations.filter((item) => item.program === program);
}
