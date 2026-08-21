import { describe, expect, it } from "vitest";
import {
  formatParcelAddress,
  formatZoningDistrictName,
} from "@/lib/address/format-parcel-address";

describe("formatParcelAddress", () => {
  it("compacts Mapbox parts into street, city, ST ZIP", () => {
    expect(
      formatParcelAddress({
        streetLine: "2000 16th Avenue",
        place: "San Francisco",
        region: "California",
        postcode: "94116",
        formattedAddress:
          "2000 16th Avenue, San Francisco, California 94116, United States",
      }),
    ).toBe("2000 16th Avenue, San Francisco, CA 94116");
  });

  it("strips United States from a formatted fallback", () => {
    expect(
      formatParcelAddress({
        streetLine: "",
        place: "",
        region: "",
        postcode: "",
        formattedAddress:
          "3800 Piedmont Avenue, Oakland, California 94611, United States",
      }),
    ).toBe("3800 Piedmont Avenue, Oakland, CA 94611");
  });

  it("title-cases GIS district names without changing district codes", () => {
    expect(
      formatZoningDistrictName("RESIDENTIAL- HOUSE, ONE FAMILY- DETACHED"),
    ).toBe("Residential House, One Family Detached");
  });
});
