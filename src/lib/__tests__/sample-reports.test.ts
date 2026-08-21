import { describe, expect, it } from "vitest";
import { getSynthesizedParcelAt } from "@/lib/adapters/mock-geocoder";
import { SAMPLE_REPORTS } from "@/lib/content/sample-reports";
import { evaluateEligibility } from "@/lib/rules";
import { mockProperties } from "@/lib/mock/properties";

describe("SAMPLE_REPORTS catalog", () => {
  it("has unique ids and formatted addresses", () => {
    const ids = SAMPLE_REPORTS.map((s) => s.id);
    const addresses = SAMPLE_REPORTS.map(
      (s) => s.geocodeResult.formattedAddress,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it("includes coordinate-driven geocode results tied to mock parcels", () => {
    for (const sample of SAMPLE_REPORTS) {
      const { geocodeResult } = sample;
      expect(Number.isFinite(geocodeResult.lat)).toBe(true);
      expect(Number.isFinite(geocodeResult.lng)).toBe(true);
      expect(geocodeResult.formattedAddress).toMatch(/, CA(?:\s+\d{5})?$/);
      expect(geocodeResult.streetLine.length).toBeGreaterThan(0);
      expect(geocodeResult.place).toBe("San Francisco");
      expect(geocodeResult.region).toBe("CA");
      expect(mockProperties[geocodeResult.addressId]).toBeDefined();
      expect(geocodeResult.formattedAddress).toBe(
        mockProperties[geocodeResult.addressId]!.formattedAddress,
      );
      expect(geocodeResult.lat).toBe(
        mockProperties[geocodeResult.addressId]!.lat,
      );
      expect(geocodeResult.lng).toBe(
        mockProperties[geocodeResult.addressId]!.lng,
      );
    }
  });

  it("covers eligible, warning, and restricted demo outcomes", () => {
    const outcomes = new Map(
      SAMPLE_REPORTS.map((sample) => {
        const parcel = mockProperties[sample.geocodeResult.addressId]!;
        return [sample.id, evaluateEligibility(parcel).overall] as const;
      }),
    );

    expect(outcomes.get("clean-r1")).toBe("eligible");
    expect(outcomes.get("historic")).toBe("warning");
    expect(outcomes.get("coastal")).toBe("warning");
    expect(outcomes.get("small-lot")).toBe("warning");
    expect(outcomes.get("commercial")).toBe("restricted");
  });

  it("pins overlay demo facts at catalog coordinates for zoning lookup", () => {
    for (const sample of SAMPLE_REPORTS) {
      if (sample.id === "clean-r1") continue;
      const { lat, lng, addressId } = sample.geocodeResult;
      const pinned = getSynthesizedParcelAt(lat, lng);
      expect(pinned?.addressId).toBe(addressId);
    }
  });
});
