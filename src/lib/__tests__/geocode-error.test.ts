import { describe, expect, it } from "vitest";
import {
  geocodeErrorNextStep,
  isGeocodeServiceFailure,
} from "@/lib/search/geocode-error";

describe("geocodeErrorNextStep", () => {
  it("adds a next step for unmatched addresses", () => {
    expect(geocodeErrorNextStep("Address not found")).toMatch(/CA, OR, or WA/);
  });

  it("flags service failures for retry plus an in-alert next step", () => {
    expect(isGeocodeServiceFailure("Geocoding service unavailable")).toBe(true);
    expect(geocodeErrorNextStep("Failed to geocode address")).toMatch(/Retry/i);
  });
});
