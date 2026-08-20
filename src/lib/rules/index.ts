import type {
  EligibilityStatus,
  Parcel,
  ZoningReport,
} from "@/lib/types/zoning";
import { evaluateAduStandard } from "@/lib/rules/adu-standard";
import { evaluateSb9Eligibility } from "@/lib/rules/sb9-eligibility";

/**
 * Overall badge: restricted only when both programs are dead ends;
 * warning if either program warns or a single program is restricted;
 * otherwise eligible.
 */
function computeOverall(
  aduStatus: EligibilityStatus,
  sb9Status: EligibilityStatus,
): EligibilityStatus {
  if (aduStatus === "restricted" && sb9Status === "restricted") {
    return "restricted";
  }
  if (
    aduStatus === "warning" ||
    sb9Status === "warning" ||
    aduStatus === "restricted" ||
    sb9Status === "restricted"
  ) {
    return "warning";
  }
  return "eligible";
}

/** Orchestrator: evaluates ADU and SB 9 independently, then builds ZoningReport. */
export function evaluateEligibility(parcel: Parcel): ZoningReport {
  const adu = evaluateAduStandard(parcel);
  const sb9 = evaluateSb9Eligibility(parcel);

  return {
    addressId: parcel.addressId,
    formattedAddress: parcel.formattedAddress,
    zoning: parcel.zoning,
    overlays: parcel.overlays,
    mapblklot: parcel.mapblklot ?? null,
    adu,
    sb9,
    overall: computeOverall(adu.status, sb9.status),
  };
}
