import type { EligibilityResult } from "@/lib/types/zoning";
import type { Parcel } from "@/lib/types/zoning";

/**
 * Whether the lot is zoned for a single-family or multifamily dwelling.
 * Gov. Code § 65852.2 ministerial ADU rights attach to those residential
 * use districts, not commercial- or industrial-only sites.
 */
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

/**
 * ADU eligibility under Gov. Code § 65852.2.
 * Branches on parcel facts only — never reads a canned status from mock data.
 * Overlay warnings accumulate; zoning hard-stops return immediately.
 */
export function evaluateAduStandard(parcel: Parcel): EligibilityResult {
  const reasons: string[] = [];
  const { zoning, overlays } = parcel;

  // 1. Hard stop: § 65852.2 ministerial ADU applies to lots zoned for
  // residential dwellings. Commercial-only sites (e.g. C-2) have no
  // statewide ADU right, so we restrict rather than warn.
  if (!isResidentialZoning(zoning)) {
    return {
      status: "restricted",
      reasons: [
        `Zoning ${zoning} is not a single-family or multifamily residential district. Gov. Code § 65852.2 ministerial ADU rights apply to lots zoned for residential dwellings, not commercial-only sites.`,
      ],
    };
  }

  let status: "eligible" | "warning" = "eligible";

  // 2. Fire / VHFHSZ: warning, not denial. Why: § 65852.2 does not authorize
  // denying an ADU solely because of a fire overlay; objective Ch. 7A /
  // defensible-space standards still apply, so keep the ADU path open (amber UI).
  if (overlays.vhfhsz || overlays.fireHazard) {
    status = "warning";
    reasons.push(
      "Parcel is in a Very High Fire Hazard Severity Zone or mapped fire hazard overlay. Objective fire-safety and Chapter 7A / defensible-space standards apply, but § 65852.2 does not authorize denying the ADU solely for this overlay.",
    );
  }

  // 3. Tiny Home friendly overlay: affirmative local policy, not a restriction.
  // Compact / THOW-style ADUs remain subject to § 65852.2 size and utility rules.
  // Does not upgrade a prior warning to eligible.
  if (overlays.tinyHomeFriendly) {
    reasons.push(
      "Local Tiny Home friendly overlay supports compact and THOW-style ADUs, still subject to § 65852.2 size, utility, and setback requirements.",
    );
  }

  // 4. Historic district: warning. Why: ADU law still allows a unit if
  // *objective* design standards are met; unlike SB 9 this is not a CUP or ban.
  if (overlays.historicDistrict) {
    status = "warning";
    reasons.push(
      "Parcel is in a historic district. ADU remains allowed under § 65852.2 if objective design standards are met; a conditional use permit is not required for the ADU itself.",
    );
  }

  // 5. Coastal zone: warning. Why: the Coastal Act / CDP may apply in
  // addition to ministerial ADU processing — extra review, not a statewide ban.
  if (overlays.coastalZone) {
    status = "warning";
    reasons.push(
      "Parcel is in the Coastal Zone. Coastal Development Permit or Coastal Act review may apply in addition to ministerial ADU processing under § 65852.2.",
    );
  }

  // 6. Default: qualifying residential zone, no blocking facts → standard ADU path.
  if (reasons.length === 0) {
    reasons.push(
      "Qualifying residential zoning with no blocking overlays. Standard single-family ADU path under Gov. Code § 65852.2.",
    );
  }

  return { status, reasons };
}
