import type { Parcel, ZoningReport } from "@/lib/types/zoning";
import { evaluateAduStandard } from "@/lib/rules/adu-standard";
import { computeOverall } from "@/lib/rules/compute-overall";
import { evaluateSb9Eligibility } from "@/lib/rules/sb9-eligibility";
import { computeUnitCapacity } from "@/lib/rules/unit-capacity";

export { computeOverall } from "@/lib/rules/compute-overall";
export {
  evaluateJurisdictionContext,
  inferAduPostureFromNote,
} from "@/lib/rules/jurisdiction-context";
export {
  computeUnitCapacity,
  SB9_FOUR_UNIT_MIN_SQFT,
  SB9_LOT_SPLIT_MIN_SQFT,
} from "@/lib/rules/unit-capacity";

/** Orchestrator: evaluates ADU and SB 9 independently, then builds ZoningReport. */
export function evaluateEligibility(parcel: Parcel): ZoningReport {
  const adu = evaluateAduStandard(parcel);
  const sb9 = evaluateSb9Eligibility(parcel);
  const unitCapacity = computeUnitCapacity(parcel, sb9.status);

  return {
    addressId: parcel.addressId,
    formattedAddress: parcel.formattedAddress,
    zoning: parcel.zoning,
    overlays: parcel.overlays,
    mapblklot: parcel.mapblklot ?? null,
    adu,
    sb9,
    overall: computeOverall(adu.status, sb9.status),
    analysisScope: "lot_zoning",
    unitCapacity,
    lotSizeSqFt: parcel.lotSizeSqFt ?? null,
  };
}

export type { JurisdictionContextInput } from "@/lib/rules/jurisdiction-context";
