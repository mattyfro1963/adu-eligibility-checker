import type { EligibilityResult } from "@/lib/types/zoning";
import type { Parcel } from "@/lib/types/zoning";
import { SRC } from "@/lib/regulations/sources";

/**
 * Single-family zones eligible for the SB 9 two-unit / lot-split path.
 * Gov. Code § 65852.21 is limited to lots zoned for single-family dwellings
 * (R-1 / RS / RH-1 equivalents) — not multifamily or commercial.
 */
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

const SB9_SOURCES = [SRC.gov65852_21, SRC.gov66411_7, SRC.hcdSb9] as const;

/**
 * SB 9 eligibility under Gov. Code § 65852.21 (2021 Atkins two-unit path).
 * Historic and fire overlays are hard stops here (stricter than ADU law).
 * Tiny Home overlay does not grant or deny SB 9 by itself.
 */
export function evaluateSb9Eligibility(parcel: Parcel): EligibilityResult {
  const reasons: EligibilityResult["reasons"] = [];
  const { zoning, overlays } = parcel;

  // 1. Hard stop: § 65852.21 two-unit / lot-split rights are for
  // single-family residential lots only. Multifamily and commercial fail here.
  if (!isSingleFamilyZoning(zoning)) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Zoning ${zoning} is not a single-family residential district. Gov. Code § 65852.21 two-unit and lot-split rights apply only to lots zoned for single-family dwellings (e.g. R-1, RS).`,
          sources: [...SB9_SOURCES],
        },
      ],
    };
  }

  // 2. Hard stop: SB 9 excludes historic districts.
  if (overlays.historicDistrict) {
    return {
      status: "restricted",
      reasons: [
        {
          text: "Parcel is in a historic district. Gov. Code § 65852.21 excludes historic districts from the SB 9 two-unit and lot-split path.",
          sources: [...SB9_SOURCES],
        },
      ],
    };
  }

  // 3. Hard stop: lot area below SB 9 urban lot-split minimum when known.
  if (
    parcel.lotSizeSqFt != null &&
    parcel.lotSizeSqFt > 0 &&
    parcel.lotSizeSqFt < 1200
  ) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Lot area (${parcel.lotSizeSqFt.toLocaleString()} sq ft) is below the 1,200 sq ft minimum for SB 9 urban lot splits under Gov. Code § 66441.1.`,
          sources: [...SB9_SOURCES, SRC.gov66441_1],
        },
      ],
    };
  }

  // 4. Hard stop: VHFHSZ / mapped fire overlay as SB 9 exclusion.
  // Why: SB 9's wildfire and hazard-area limitations are applied more
  // strictly than ADU's warning-only treatment under Chapter 13.
  if (overlays.vhfhsz || overlays.fireHazard) {
    return {
      status: "restricted",
      reasons: [
        {
          text: "Parcel is in a Very High Fire Hazard Severity Zone or mapped fire overlay. SB 9 eligibility is excluded for these fire-prone areas under this checker’s reading of § 65852.21 hazard limitations (stricter than ADU’s warning-only treatment under Chapter 13).",
          sources: [...SB9_SOURCES, SRC.hcdSb9],
        },
      ],
    };
  }

  let status: "eligible" | "warning" = "eligible";

  // 5. Coastal zone: warning — additional Coastal Act / CDP review.
  if (overlays.coastalZone) {
    status = "warning";
    reasons.push({
      text: "Parcel is in the Coastal Zone. Additional Coastal Act / CDP review may apply to SB 9 projects beyond ministerial processing under §§ 65852.21 and 66411.7.",
      sources: [...SB9_SOURCES],
    });
  }

  // 6. Default: single-family, no SB 9 exclusions → eligible.
  if (reasons.length === 0) {
    reasons.push({
      text: "Single-family residential zoning with no SB 9 exclusions. Two-unit and lot-split path available under Gov. Code §§ 65852.21 and 66411.7 (2021 SB 9 — not the 2025 ADU-ordinance bill also numbered SB 9).",
      sources: [...SB9_SOURCES],
    });
  }

  return { status, reasons };
}
