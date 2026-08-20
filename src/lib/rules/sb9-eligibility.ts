import type { EligibilityResult } from "@/lib/types/zoning";
import type { Parcel } from "@/lib/types/zoning";

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

/**
 * SB 9 eligibility under Gov. Code § 65852.21.
 * Historic and fire overlays are hard stops here (stricter than ADU law).
 * Tiny Home overlay does not grant or deny SB 9 by itself.
 */
export function evaluateSb9Eligibility(parcel: Parcel): EligibilityResult {
  const reasons: string[] = [];
  const { zoning, overlays } = parcel;

  // 1. Hard stop: § 65852.21 two-unit / lot-split rights are for
  // single-family residential lots only. Multifamily and commercial fail here.
  if (!isSingleFamilyZoning(zoning)) {
    return {
      status: "restricted",
      reasons: [
        `Zoning ${zoning} is not a single-family residential district. Gov. Code § 65852.21 two-unit and lot-split rights apply only to lots zoned for single-family dwellings (e.g. R-1, RS).`,
      ],
    };
  }

  // 2. Hard stop: SB 9 excludes historic districts. Why: the statute carves
  // historic resources out of the ministerial two-unit path; ADU law does not
  // use historic status as a hard ban (see adu-standard.ts warning).
  if (overlays.historicDistrict) {
    return {
      status: "restricted",
      reasons: [
        "Parcel is in a historic district. Gov. Code § 65852.21 excludes historic districts from the SB 9 two-unit and lot-split path.",
      ],
    };
  }

  // 3. Hard stop: mock MVP treats VHFHSZ / mapped fire overlay as an SB 9
  // exclusion. Why: SB 9's wildfire and hazard-area limitations are applied
  // more strictly than ADU's warning-only treatment under § 65852.2.
  if (overlays.vhfhsz || overlays.fireHazard) {
    return {
      status: "restricted",
      reasons: [
        "Parcel is in a Very High Fire Hazard Severity Zone or mapped fire overlay. SB 9 eligibility is excluded for fire-prone areas in this mock MVP (stricter than ADU's warning-only treatment under § 65852.2).",
      ],
    };
  }

  let status: "eligible" | "warning" = "eligible";

  // 4. Coastal zone: warning — additional Coastal Act / CDP review, not a
  // commercial-style hard ban.
  if (overlays.coastalZone) {
    status = "warning";
    reasons.push(
      "Parcel is in the Coastal Zone. Additional Coastal Act / CDP review may apply to SB 9 projects beyond ministerial processing.",
    );
  }

  // 5. Default: single-family, no SB 9 exclusions → eligible.
  if (reasons.length === 0) {
    reasons.push(
      "Single-family residential zoning with no SB 9 exclusions. Two-unit and lot-split path available under Gov. Code § 65852.21.",
    );
  }

  return { status, reasons };
}
