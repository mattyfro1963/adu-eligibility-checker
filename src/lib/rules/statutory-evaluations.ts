import { SRC } from "@/lib/regulations/sources";
import { SB9_LOT_SPLIT_MIN_SQFT } from "@/lib/rules/unit-capacity";
import {
  isResidentialZoning,
  isSingleFamilyZoning,
} from "@/lib/rules/zoning-class";
import type {
  StatutoryEvaluation,
  StatutoryOutcome,
} from "@/lib/types/statutory-evaluation";
import type { Parcel, ZoningReport } from "@/lib/types/zoning";

function outcome(passed: boolean, lotVerified: boolean): StatutoryOutcome {
  if (!lotVerified) return "unverified";
  return passed ? "pass" : "fail";
}

function primaryReasonText(
  report: ZoningReport,
  program: "adu" | "sb9",
): string | undefined {
  const result = program === "adu" ? report.adu : report.sb9;
  return result?.reasons[0]?.text;
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
  const lotVerified = report.analysisScope !== "jurisdiction_context";
  const overlaysVerified =
    report.overlaysVerified === true || parcel.overlaysVerified === true;
  const unverifiedNote =
    "Lot GIS did not run for this coordinate — this check is unverified, not a pass or fail.";
  const overlayUnverifiedNote =
    "Overlay layers were not verified for this parcel — this check is unverified, not a pass or fail.";

  function overlayOutcome(passed: boolean): StatutoryOutcome {
    if (!lotVerified || !overlaysVerified) return "unverified";
    return passed ? "pass" : "fail";
  }

  const sb9Evaluations: StatutoryEvaluation[] = [
    {
      ruleId: "SB9-R1",
      program: "sb9",
      title: "Single-Family Zoning",
      outcome: outcome(isSingleFamilyZoning(zoning), lotVerified),
      severity: "blocking",
      citation: SRC.gov65852_21.label,
      description: lotVerified
        ? (primaryReasonText(report, "sb9") ??
          "Property must be located within a single-family residential zone (e.g., R-1).")
        : unverifiedNote,
    },
    {
      ruleId: "SB9-R2",
      program: "sb9",
      title: "Historic District Exclusion",
      outcome: overlayOutcome(!overlays.historicDistrict),
      severity: "blocking",
      citation: SRC.gov65852_21.label,
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Parcel must not be located within an established historic district or designated landmark.",
    },
    {
      ruleId: "SB9-R3",
      program: "sb9",
      title: "Fire Hazard Severity Zone",
      outcome: overlayOutcome(!(overlays.vhfhsz || overlays.fireHazard)),
      severity: "blocking",
      citation: SRC.hcdSb9.label,
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Properties in Very High Fire Hazard Severity Zones are excluded from the SB 9 two-unit and lot-split path under this checker.",
    },
    {
      ruleId: "SB9-R4",
      program: "sb9",
      title: "Coastal Zone Permit Review",
      outcome: overlayOutcome(!overlays.coastalZone),
      severity: "caution",
      citation: "Cal. Pub. Res. Code § 30000",
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Properties within the Coastal Overlay Zone require Coastal Commission authorization.",
    },
    {
      ruleId: "SB9-R5",
      program: "sb9",
      title: "Minimum Lot Area",
      outcome:
        lotSizeSqFt == null || lotSizeSqFt <= 0
          ? "unverified"
          : lotSizeSqFt >= SB9_LOT_SPLIT_MIN_SQFT
            ? "pass"
            : "fail",
      severity: "blocking",
      citation: SRC.gov66441_1.label,
      description:
        lotSizeSqFt != null && lotSizeSqFt > 0
          ? `Parcel area is ${lotSizeSqFt.toLocaleString()} sq ft (${SB9_LOT_SPLIT_MIN_SQFT.toLocaleString()} sq ft minimum for SB 9 lot splits).`
          : "Lot area was not verified — confirm parcel size with assessor or GIS before relying on SB 9 lot-split rights.",
    },
  ];

  const aduEvaluations: StatutoryEvaluation[] = [
    {
      ruleId: "ADU-R1",
      program: "adu",
      title: "Residential Zoning",
      outcome: outcome(isResidentialZoning(zoning), lotVerified),
      severity: "blocking",
      citation: SRC.gov66314.label,
      description: lotVerified
        ? (primaryReasonText(report, "adu") ??
          "Property must be zoned for residential dwellings under Gov. Code Chapter 13.")
        : unverifiedNote,
    },
    {
      ruleId: "ADU-R2",
      program: "adu",
      title: "Fire Hazard Overlay",
      outcome: overlayOutcome(!(overlays.vhfhsz || overlays.fireHazard)),
      severity: "caution",
      citation: SRC.gov66314.label,
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Fire hazard overlays trigger objective safety standards but do not deny ministerial ADU rights by themselves.",
    },
    {
      ruleId: "ADU-R3",
      program: "adu",
      title: "Historic District Review",
      outcome: overlayOutcome(!overlays.historicDistrict),
      severity: "caution",
      citation: SRC.gov66314.label,
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Historic districts require objective design standards; ADU rights remain under Chapter 13.",
    },
    {
      ruleId: "ADU-R4",
      program: "adu",
      title: "Coastal Zone Permit Review",
      outcome: overlayOutcome(!overlays.coastalZone),
      severity: "caution",
      citation: SRC.hcdFactSheets2026.label,
      description:
        !lotVerified
          ? unverifiedNote
          : !overlaysVerified
            ? overlayUnverifiedNote
            : "Coastal Development Permit or Coastal Act review may apply in addition to ministerial ADU processing.",
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
