/**
 * Lot readiness: utilities, setbacks, fire access, pad, long-term occupancy.
 * Unverified → Yellow; legal connect ban → Red.
 */

import { SRC } from "@/lib/regulations/sources";
import type { EligibilityResult, Parcel } from "@/lib/types/zoning";

const READY_SOURCES = [
  SRC.hcdTinyHomesIb,
  SRC.hcdAdu,
  SRC.govChapter13,
] as const;

export type LotReadinessContext = {
  /** Explicit corpus signal that utilities cannot legally connect. */
  utilityConnectBanned?: boolean;
  /** Explicit corpus signal that only temporary / camping occupancy is allowed. */
  temporaryOnly?: boolean;
  /** Jurisdiction fallback (no lot GIS). */
  jurisdictionFallback?: boolean;
};

/**
 * Lot readiness for long-term wheeled occupancy + utility hookups.
 */
export function evaluateLotReadiness(
  parcel: Parcel | null,
  context: LotReadinessContext = {},
): EligibilityResult {
  const reasons: EligibilityResult["reasons"] = [];

  if (context.utilityConnectBanned) {
    return {
      status: "restricted",
      reasons: [
        {
          text: "Published guidance indicates utilities cannot legally connect for this placement class. Without lawful water, sewer/septic, and electric hookups, treat long-term THOW occupancy as unsuitable.",
          sources: [...READY_SOURCES],
        },
      ],
    };
  }

  if (context.temporaryOnly) {
    return {
      status: "restricted",
      reasons: [
        {
          text: "Local rules appear to allow only temporary RV / camping / storage occupancy — not permanent dwelling use. Weak path for long-term THOW living unless Planning confirms a written permanent-occupancy approval.",
          sources: [...READY_SOURCES],
        },
      ],
    };
  }

  const overlaysChecked = parcel?.overlaysVerified === true;

  if (context.jurisdictionFallback || !parcel) {
    reasons.push({
      text: "Water, sewer/septic, electric, fire access, setbacks, and pad readiness were not verified at lot level. Confirm utility hookups and long-term occupancy rules with the city or county before delivery.",
      sources: [...READY_SOURCES],
    });
    return { status: "warning", reasons };
  }

  if (!overlaysChecked) {
    reasons.push({
      text: "Utility and overlay readiness were not verified for this parcel. Confirm water, sewer/septic, electric, fire access, and setbacks with Planning/Building and the utility providers before treating the lot as delivery-ready.",
      sources: [...READY_SOURCES],
    });
    return { status: "warning", reasons };
  }

  if (parcel.overlays.vhfhsz || parcel.overlays.fireHazard) {
    reasons.push({
      text: "Fire hazard / VHFHSZ overlay requires fire-access and defensible-space confirmation. Utility and pad plans must satisfy local wildfire standards before long-term occupancy.",
      sources: [...READY_SOURCES, SRC.hcdFactSheets2026],
    });
    return { status: "warning", reasons };
  }

  reasons.push({
    text: "No mapped fire overlay blocked utility/access screening on verified facts, but water, sewer/septic, electric, driveway/pad, and long-term occupancy still need city/county and utility confirmation — this checker does not inspect hookups.",
    sources: [...READY_SOURCES],
  });

  // Conservative: even verified clear overlays leave utility hookups un-inspected → Yellow
  // unless we have an express tiny-home path AND no fire issues — still Yellow for honesty
  // on utilities. Plan: "utilities appear feasible" can support Green overall only when
  // placement is express; lot readiness itself stays warning unless we have stronger signals.
  // For lot GIS with clear overlays + tinyHomeFriendly, allow eligible readiness.
  if (parcel.overlays.tinyHomeFriendly) {
    reasons.push({
      text: "Local tiny-home friendly overlay supports compact placement standards; still obtain written utility and occupancy approval before delivery.",
      sources: [...READY_SOURCES],
    });
    return { status: "eligible", reasons };
  }

  return { status: "warning", reasons };
}
