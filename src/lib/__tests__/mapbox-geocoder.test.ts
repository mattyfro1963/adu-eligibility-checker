import { describe, expect, it } from "vitest";
import {
  addressIdFromMapboxFeature,
  addressPartsFromMapboxFeature,
  isLngLatInCascadiaBbox,
  queryImpliesOutOfCascadia,
} from "@/lib/adapters/mapbox-geocoder";
import { addressPartsFromFormattedAddress } from "@/lib/adapters/mock-geocoder";

describe("CASCADIA_BBOX", () => {
  it("includes eastern California lots (Indio, El Centro)", () => {
    expect(isLngLatInCascadiaBbox(-116.2156, 33.7206)).toBe(true); // Indio
    expect(isLngLatInCascadiaBbox(-115.5631, 32.792)).toBe(true); // El Centro
    expect(isLngLatInCascadiaBbox(-122.4194, 37.7749)).toBe(true); // SF
  });

  it("still excludes far out-of-Cascadia coordinates", () => {
    expect(isLngLatInCascadiaBbox(-97.7431, 30.2672)).toBe(false); // Austin
    expect(isLngLatInCascadiaBbox(-74.006, 40.7128)).toBe(false); // NYC
  });
});

describe("queryImpliesOutOfCascadia", () => {
  it("treats named non-Cascadia states as out of coverage", () => {
    expect(queryImpliesOutOfCascadia("100 Congress Avenue, Austin, TX")).toBe(
      true,
    );
    expect(
      queryImpliesOutOfCascadia("1600 Pennsylvania Avenue NW, Washington, DC"),
    ).toBe(true);
    expect(queryImpliesOutOfCascadia("350 Fifth Avenue, New York, NY")).toBe(
      true,
    );
  });

  it("does not treat CA / OR / WA queries as out of coverage", () => {
    expect(queryImpliesOutOfCascadia("3800 Piedmont Avenue, Oakland, CA")).toBe(
      false,
    );
    expect(
      queryImpliesOutOfCascadia("2326 NE Alberta Street, Portland, OR"),
    ).toBe(false);
    expect(queryImpliesOutOfCascadia("Seattle, Washington")).toBe(false);
    expect(queryImpliesOutOfCascadia("Main Street in Oakland, CA")).toBe(false);
  });
});

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

describe("addressPartsFromMapboxFeature", () => {
  it("builds streetLine and locality fields from Mapbox context", () => {
    expect(
      addressPartsFromMapboxFeature({
        address: "123",
        text: "Main St",
        place_name:
          "123 Main St, San Francisco, California 94105, United States",
        context: [
          { id: "postcode.1", text: "94105" },
          { id: "place.1", text: "San Francisco" },
          { id: "district.1", text: "San Francisco" },
          { id: "region.1", text: "California", short_code: "US-CA" },
        ],
      }),
    ).toEqual({
      streetLine: "123 Main St",
      place: "San Francisco",
      county: "San Francisco",
      region: "CA",
      postcode: "94105",
    });
  });

  it("falls back to place_name street segment when address/text missing", () => {
    expect(
      addressPartsFromMapboxFeature({
        place_name: "1 Market St, San Francisco, CA",
        context: [],
      }),
    ).toEqual({
      streetLine: "1 Market St",
      place: "",
      county: "",
      region: "",
      postcode: "",
    });
  });
});

describe("addressPartsFromFormattedAddress", () => {
  it("parses mock demo addresses into two-line fields", () => {
    expect(
      addressPartsFromFormattedAddress("123 Main St, San Francisco, CA"),
    ).toEqual({
      streetLine: "123 Main St",
      place: "San Francisco",
      county: "San Francisco",
      region: "CA",
      postcode: "",
    });
  });

  it("captures ZIP when present on the region segment", () => {
    expect(
      addressPartsFromFormattedAddress("123 Main St, San Francisco, CA 94105"),
    ).toEqual({
      streetLine: "123 Main St",
      place: "San Francisco",
      county: "San Francisco",
      region: "CA",
      postcode: "94105",
    });
  });
});
