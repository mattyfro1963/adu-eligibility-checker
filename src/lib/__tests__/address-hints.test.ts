import { describe, expect, it } from "vitest";
import {
  isAddressHintError,
  parseAddressHints,
  synthesizeParcelFromHints,
} from "@/lib/mock/address-hints";

describe("parseAddressHints", () => {
  it("detects historic and commercial keywords", () => {
    expect(parseAddressHints("123 Historic Elm")).toMatchObject({
      isHistoric: true,
      isCommercial: false,
    });
    expect(parseAddressHints("100 Commercial Market")).toMatchObject({
      isCommercial: true,
    });
  });

  it("detects coastal, small lot, and error keywords", () => {
    expect(parseAddressHints("555 coastal beach")).toMatchObject({
      isCoastal: true,
    });
    expect(parseAddressHints("950 small lot")).toMatchObject({
      isSmallLot: true,
    });
    expect(isAddressHintError("trigger error boundary")).toBe(true);
  });
});

describe("synthesizeParcelFromHints", () => {
  it("builds parcel facts without embedding eligibility status", () => {
    const parcel = synthesizeParcelFromHints("321 historic elm", {
      lat: 36.7,
      lng: -119.7,
    });
    expect(parcel.overlays.historicDistrict).toBe(true);
    expect(parcel.zoning).toBe("R-1");
    expect(parcel).not.toHaveProperty("overall");
    expect(parcel).not.toHaveProperty("sb9");
  });

  it("sets small lot area from keyword", () => {
    const parcel = synthesizeParcelFromHints("950 small lot", {
      lat: 36.7,
      lng: -119.7,
    });
    expect(parcel.lotSizeSqFt).toBe(950);
  });
});
