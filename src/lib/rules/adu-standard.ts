import type { EligibilityResult } from "@/lib/types/zoning";
import type { Parcel } from "@/lib/types/zoning";
import { SRC } from "@/lib/regulations/sources";
import {
  isMixedUseZoning,
  isResidentialZoning,
} from "@/lib/rules/zoning-class";

const ADU_SOURCES = [SRC.gov66314, SRC.govChapter13, SRC.hcdAdu] as const;

/**
 * ADU eligibility under Gov. Code Chapter 13 (§§ 66310–66342).
 * Branches on parcel facts only — never reads a canned status from mock data.
 * Overlay warnings accumulate; zoning hard-stops return immediately.
 */
export function evaluateAduStandard(parcel: Parcel): EligibilityResult {
  const reasons: EligibilityResult["reasons"] = [];
  const { zoning, overlays } = parcel;

  // 1. Hard stop: § 66314 ministerial ADU applies to lots zoned for
  // residential dwellings, including mixed-use. Commercial-only sites
  // (e.g. C-2, C-3, PDR) have no statewide ADU right.
  if (!isResidentialZoning(zoning)) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Zoning ${zoning} is not a residential or mixed-use district. Gov. Code § 66314 ministerial ADU rights apply to lots zoned to allow residential dwellings, including mixed-use zones — not commercial- or industrial-only sites.`,
          sources: [...ADU_SOURCES],
        },
      ],
    };
  }

  if (isMixedUseZoning(zoning)) {
    reasons.push({
      text: `Zoning ${zoning} is a mixed-use district. Statewide ADU rights under Chapter 13 attach where residential dwellings are allowed, including mixed-use zones — still confirm primary use, local development standards, and permits.`,
      sources: [...ADU_SOURCES],
    });
  }

  let status: "eligible" | "warning" = "eligible";
  const overlaysChecked = parcel.overlaysVerified === true;

  // 2–5. Overlay reasons only when layers were actually checked.
  if (overlaysChecked) {
    // Fire / VHFHSZ: warning, not denial. Why: State ADU Law does not
    // authorize denying an ADU solely because of a fire overlay; objective
    // Ch. 7A / defensible-space standards still apply.
    if (overlays.vhfhsz || overlays.fireHazard) {
      status = "warning";
      reasons.push({
        text: "Parcel is in a Very High Fire Hazard Severity Zone or mapped fire hazard overlay. Objective fire-safety and Chapter 7A / defensible-space standards apply, but State ADU Law (Chapter 13) does not authorize denying the ADU solely for this overlay.",
        sources: [...ADU_SOURCES, SRC.hcdFactSheets2026],
      });
    }

    // Tiny Home friendly overlay: affirmative local policy, not a restriction.
    if (overlays.tinyHomeFriendly) {
      reasons.push({
        text: "Local Tiny Home friendly overlay supports compact and THOW-style ADUs where the local ordinance allows them, still subject to Chapter 13 size, utility, and setback requirements — and THOWs are an ADU path only when local rules expressly authorize moveable tiny houses.",
        sources: [...ADU_SOURCES, SRC.hcdTinyHomesIb],
      });
    }

    // Historic district: warning. Why: ADU law still allows a unit if
    // objective design standards are met; unlike SB 9 this is not a hard ban.
    if (overlays.historicDistrict) {
      status = "warning";
      reasons.push({
        text: "Parcel is in a historic district. An ADU remains allowed under Chapter 13 if objective design standards are met; a conditional use permit is not required for the ADU itself.",
        sources: [...ADU_SOURCES],
      });
    }

    // Coastal zone: warning. Why: Coastal Act / CDP may apply in addition
    // to ministerial ADU processing — extra review, not a statewide ban.
    if (overlays.coastalZone) {
      status = "warning";
      reasons.push({
        text: "Parcel is in the Coastal Zone. Coastal Development Permit or Coastal Act review may apply in addition to ministerial ADU processing under Chapter 13 (including coastal timing rules summarized in HCD’s 2026 fact sheets).",
        sources: [...ADU_SOURCES, SRC.hcdFactSheets2026],
      });
    }
  } else {
    // Stub / unchecked overlays — do not claim “no blocking overlays.”
    status = "warning";
    reasons.push({
      text: "Fire, historic, coastal, and tiny-home overlay layers were not verified for this parcel. Statewide ADU rights under Chapter 13 may still apply — confirm overlays with local Planning before relying on a clear path.",
      sources: [...ADU_SOURCES],
    });
  }

  // 6. Default: qualifying residential zone, verified clear overlays → standard path.
  if (reasons.length === 0) {
    reasons.push({
      text: "Qualifying residential or mixed-use zoning with no blocking overlays. Standard foundation / modular ADU path under Gov. Code Chapter 13 (§§ 66310–66342). A THOW is an ADU only where local ordinance expressly allows moveable tiny houses — not automatic from this floor alone.",
      sources: [...ADU_SOURCES, SRC.hcdTinyHomesIb],
    });
  } else if (status === "eligible" || status === "warning") {
    reasons.push({
      text: "ADU pathway note: Possible if local THOW-as-ADU ordinance or foundation/modular conversion — not automatic. This pathway does not alone set THOW lot candidacy (Green/Yellow/Red).",
      sources: [...ADU_SOURCES, SRC.hcdTinyHomesIb],
    });
  }

  return { status, reasons };
}
