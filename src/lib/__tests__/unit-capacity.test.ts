import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "@/lib/rules";
import {
  computeUnitCapacity,
  SB9_FOUR_UNIT_MIN_SQFT,
  SB9_LOT_SPLIT_MIN_SQFT,
} from "@/lib/rules/unit-capacity";
import { mockProperties } from "@/lib/mock/properties";
import type { Parcel } from "@/lib/types/zoning";

function parcel(id: keyof typeof mockProperties): Parcel {
  const value = mockProperties[id];
  if (!value) throw new Error(`Missing mock parcel: ${String(id)}`);
  return value;
}

describe("computeUnitCapacity", () => {
  it("returns null when lot size is unknown", () => {
    const base = parcel("addr-r1-clean");
    const unknownLot: Parcel = { ...base, lotSizeSqFt: null };
    expect(computeUnitCapacity(unknownLot, "eligible")).toBeNull();
  });

  it("returns baseline 2 units for eligible SB9 on standard lots below four-unit threshold", () => {
    const base = parcel("addr-r1-clean");
    const mediumLot: Parcel = { ...base, lotSizeSqFt: 2000 };
    const capacity = computeUnitCapacity(mediumLot, "eligible");
    expect(capacity?.maxAllowableUnits).toBe(2);
  });

  it("returns 4 units when SB9 eligible and lot meets four-unit threshold", () => {
    const base = parcel("addr-r1-clean");
    const largeLot: Parcel = {
      ...base,
      lotSizeSqFt: SB9_FOUR_UNIT_MIN_SQFT,
    };
    const capacity = computeUnitCapacity(largeLot, "eligible");
    expect(capacity?.maxAllowableUnits).toBe(4);
  });

  it("caps at 2 units when SB9 is restricted even on large lots", () => {
    const base = parcel("addr-r1-clean");
    const largeLot: Parcel = {
      ...base,
      lotSizeSqFt: SB9_FOUR_UNIT_MIN_SQFT + 500,
    };
    const capacity = computeUnitCapacity(largeLot, "restricted");
    expect(capacity?.maxAllowableUnits).toBe(2);
  });
});

describe("SB9 lot-size rule", () => {
  it(`restricts SB9 when lot is below ${SB9_LOT_SPLIT_MIN_SQFT} sq ft`, () => {
    const base = parcel("addr-r1-clean");
    const smallLot: Parcel = { ...base, lotSizeSqFt: 950 };
    const report = evaluateEligibility(smallLot);
    expect(report.sb9?.status).toBe("restricted");
    expect(report.unitCapacity?.maxAllowableUnits).toBe(2);
  });
});
