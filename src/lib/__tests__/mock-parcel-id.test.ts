import { describe, expect, it } from "vitest";
import {
  mockParcelIdFromCoordinates,
  mockProperties,
  mockPropertyList,
} from "@/lib/mock/properties";

describe("mockParcelIdFromCoordinates", () => {
  it("same coordinates always map to the same mock parcel id", () => {
    const a = mockParcelIdFromCoordinates(37.7749, -122.4194);
    const b = mockParcelIdFromCoordinates(37.7749, -122.4194);
    expect(a).toBe(b);
    expect(a in mockProperties).toBe(true);
  });

  it("different mock-set coordinates can map to different parcel ids", () => {
    const ids = new Set(
      mockPropertyList.map((p) => mockParcelIdFromCoordinates(p.lat, p.lng)),
    );
    expect(ids.size).toBeGreaterThan(1);
  });
});
