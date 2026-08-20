import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim } from "@/lib/regulations/types";
import type {
  EligibilityStatus,
  Parcel,
  UnitCapacity,
} from "@/lib/types/zoning";

export const SB9_LOT_SPLIT_MIN_SQFT = 1200;
export const SB9_FOUR_UNIT_MIN_SQFT = 2400;

const UNIT_CAPACITY_SOURCES = [
  SRC.gov65852_21,
  SRC.gov66411_7,
  SRC.gov66314,
  SRC.hcdAdu,
] as const;

/**
 * Derives max allowable dwelling units from parcel facts and SB 9 posture.
 * Returns null when lot area is unknown — callers must not invent capacity.
 */
export function computeUnitCapacity(
  parcel: Parcel,
  sb9Status: EligibilityStatus,
): UnitCapacity | null {
  const lotSizeSqFt = parcel.lotSizeSqFt;
  if (lotSizeSqFt == null || lotSizeSqFt <= 0) {
    return null;
  }

  let maxAllowableUnits = 2;
  let detail =
    "State ADU law supports a primary dwelling plus at least one ADU on qualifying residential lots (Gov. Code Chapter 13).";

  if (sb9Status !== "restricted" && lotSizeSqFt >= SB9_FOUR_UNIT_MIN_SQFT) {
    maxAllowableUnits = 4;
    detail =
      "Lot area supports the SB 9 two-unit / lot-split path with up to four units when local standards are met (Gov. Code §§ 65852.21 and 66411.7).";
  } else if (sb9Status !== "restricted") {
    detail =
      "Lot area supports the baseline ADU path; SB 9 four-unit scenarios typically require larger parcels under local subdivision standards.";
  }

  const note: CitedClaim = {
    text: detail,
    sources: [...UNIT_CAPACITY_SOURCES],
  };

  return { maxAllowableUnits, note };
}
