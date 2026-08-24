import type { EligibilityResult } from "@/lib/types/zoning";
import type { Parcel } from "@/lib/types/zoning";
import { SRC } from "@/lib/regulations/sources";
import { SB9_LOT_SPLIT_MIN_SQFT } from "@/lib/rules/unit-capacity";
import { isSingleFamilyZoning } from "@/lib/rules/zoning-class";

const SB9_SOURCES = [SRC.gov65852_21, SRC.gov66411_7, SRC.hcdSb9] as const;

function lotAreaKnown(parcel: Parcel): boolean {
  return parcel.lotSizeSqFt != null && parcel.lotSizeSqFt > 0;
}

/** Overlay booleans are trusted only when explicitly verified (demo/GIS layers). */
function overlaysChecked(parcel: Parcel): boolean {
  return parcel.overlaysVerified === true;
}

/**
 * SB 9 eligibility under Gov. Code § 65852.21 (2021 Atkins two-unit path).
 * Historic and fire overlays are hard stops here (stricter than ADU law).
 * Tiny Home overlay does not grant or deny SB 9 by itself.
 * Unknown lot area or unchecked overlays → warning, never eligible.
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

  // 2. Hard stop: SB 9 excludes historic districts (only when overlays verified).
  if (overlaysChecked(parcel) && overlays.historicDistrict) {
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
    lotAreaKnown(parcel) &&
    parcel.lotSizeSqFt != null &&
    parcel.lotSizeSqFt < SB9_LOT_SPLIT_MIN_SQFT
  ) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Lot area (${parcel.lotSizeSqFt.toLocaleString()} sq ft) is below the ${SB9_LOT_SPLIT_MIN_SQFT.toLocaleString()} sq ft minimum for SB 9 urban lot splits under Gov. Code § 66441.1.`,
          sources: [...SB9_SOURCES, SRC.gov66441_1],
        },
      ],
    };
  }

  // 4. Hard stop: VHFHSZ / mapped fire overlay as SB 9 exclusion (verified only).
  // Why: SB 9's wildfire and hazard-area limitations are applied more
  // strictly than ADU's warning-only treatment under Chapter 13.
  if (
    overlaysChecked(parcel) &&
    (overlays.vhfhsz || overlays.fireHazard)
  ) {
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

  // 5. Lot area not verified — cannot claim SB 9 lot-split path confidently.
  if (!lotAreaKnown(parcel)) {
    status = "warning";
    reasons.push({
      text: "Lot area was not verified — confirm parcel size with assessor or GIS before relying on SB 9 lot-split rights (Gov. Code § 66441.1 requires at least 1,200 sq ft for urban lot splits).",
      sources: [...SB9_SOURCES, SRC.gov66441_1],
    });
  }

  // 6. Overlay layers not queried — do not claim “no SB 9 exclusions.”
  if (!overlaysChecked(parcel)) {
    status = "warning";
    reasons.push({
      text: "Fire, historic, and coastal overlay layers were not verified for this parcel. Confirm exclusions with local Planning before relying on SB 9 ministerial processing under §§ 65852.21 and 66411.7.",
      sources: [...SB9_SOURCES],
    });
  }

  // 7. Coastal zone: warning — additional Coastal Act / CDP review.
  if (overlaysChecked(parcel) && overlays.coastalZone) {
    status = "warning";
    reasons.push({
      text: "Parcel is in the Coastal Zone. Additional Coastal Act / CDP review may apply to SB 9 projects beyond ministerial processing under §§ 65852.21 and 66411.7.",
      sources: [...SB9_SOURCES],
    });
  }

  // 8. Default: single-family, verified lot area, verified overlays, no exclusions.
  if (reasons.length === 0) {
    reasons.push({
      text: "Single-family residential zoning with no SB 9 exclusions. Two-unit and lot-split path available under Gov. Code §§ 65852.21 and 66411.7 (2021 SB 9 — not the 2025 ADU-ordinance bill also numbered SB 9).",
      sources: [...SB9_SOURCES],
    });
  }

  return { status, reasons };
}
