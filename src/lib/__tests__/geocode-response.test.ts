import { describe, expect, it } from "vitest";
import {
  geocodeHttpResult,
  parseGeocodeMode,
} from "@/lib/adapters/geocode-response";
import type { GeocodeResult } from "@/lib/types/gis";

const sample: GeocodeResult = {
  addressId: "address.1",
  formattedAddress: "1 Main St, Austin, TX",
  streetLine: "1 Main St",
  place: "Austin",
  county: "Travis",
  region: "TX",
  postcode: "78701",
  lat: 30.27,
  lng: -97.74,
};

describe("geocodeHttpResult", () => {
  it("returns an empty list for unmatched suggest — never 404", () => {
    const payload = geocodeHttpResult("suggest", []);
    expect(payload.status).toBe(200);
    expect(payload.body).toEqual({ results: [] });
  });

  it("returns 200 with suggestions when present", () => {
    const payload = geocodeHttpResult("suggest", [sample]);
    expect(payload.status).toBe(200);
    expect(payload.body).toEqual({ results: [sample] });
  });

  it("404s unmatched exact geocode", () => {
    const payload = geocodeHttpResult("geocode", []);
    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ error: "Address not found" });
  });
});

describe("parseGeocodeMode", () => {
  it("treats missing mode as exact geocode", () => {
    expect(parseGeocodeMode(null)).toBe("geocode");
    expect(parseGeocodeMode("suggest")).toBe("suggest");
  });
});
