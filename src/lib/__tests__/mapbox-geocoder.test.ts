import { describe, expect, it } from "vitest";
import { addressIdFromMapboxFeature } from "@/lib/adapters/mapbox-geocoder";

describe("addressIdFromMapboxFeature", () => {
  it("prefers the Mapbox feature id when present", () => {
    expect(
      addressIdFromMapboxFeature(
        { id: "address.123", place_name: "1 Market St, San Francisco, CA" },
        37.79,
        -122.39,
      ),
    ).toBe("address.123");
  });

  it("falls back to place name + coordinates when id is missing", () => {
    expect(
      addressIdFromMapboxFeature(
        { place_name: "1 Market St, San Francisco, CA" },
        37.79,
        -122.39,
      ),
    ).toBe("1 Market St, San Francisco, CA|37.79,-122.39");
  });

  it("keeps distinct features unique even without Mapbox ids", () => {
    const a = addressIdFromMapboxFeature(
      { place_name: "100 Main St, San Francisco, CA" },
      37.77,
      -122.41,
    );
    const b = addressIdFromMapboxFeature(
      { place_name: "200 Main St, San Francisco, CA" },
      37.78,
      -122.42,
    );
    expect(a).not.toBe(b);
  });
});
