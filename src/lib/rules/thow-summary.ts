/**
 * Canned Green / Yellow / Red THOW lot-candidacy copy — locked product wording.
 */

import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim } from "@/lib/regulations/types";
import type { EligibilityStatus } from "@/lib/types/zoning";

const THOW_SUMMARY_SOURCES = [
  SRC.hcdTinyHomesIb,
  SRC.hcdAdu,
  SRC.noahDwelling,
] as const;

export const THOW_SUMMARY_BY_STATUS: Record<EligibilityStatus, CitedClaim> = {
  eligible: {
    text: "Strong THOW candidate. This lot appears to have a plausible local placement path, subject to final city/county confirmation, utility approval, and delivery route review.",
    sources: [...THOW_SUMMARY_SOURCES],
  },
  warning: {
    text: "Possible THOW candidate, but not delivery-ready. Confirm the local placement path with Planning/Building, verify utility hookups, and complete a hauler route review before relying on this lot.",
    sources: [...THOW_SUMMARY_SOURCES],
  },
  restricted: {
    text: "Weak THOW candidate. Current facts show no clear legal placement or occupancy path. Treat this as unsuitable unless the local jurisdiction provides a written approval path.",
    sources: [...THOW_SUMMARY_SOURCES],
  },
};

export function thowSummaryForStatus(status: EligibilityStatus): CitedClaim {
  return THOW_SUMMARY_BY_STATUS[status];
}

/** Exact unsupported-state copy from the product plan. */
export const UNSUPPORTED_STATE_THOW_COPY =
  "Tiny home on wheels lot screening is not published for this state yet. Do not assume California, Oregon, or Washington THOW rules apply here. Confirm local zoning, vehicle classification, utility hookups, and occupancy rules with the city or county before buying land or delivering a unit.";
