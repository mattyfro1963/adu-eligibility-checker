import type { Geocoder } from "@/lib/adapters/geocoder";
import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel } from "@/lib/types/zoning";
import { mockPropertyList, mockProperties } from "@/lib/mock/properties";

const COORD_EPSILON = 0.0001;

/**
 * Parse mock `formattedAddress` into two-line suggestion fields.
 * Expects `"Street, Place, CA"` or `"Street, Place, CA 94105"`.
 */
export function addressPartsFromFormattedAddress(
  formattedAddress: string,
): Pick<GeocodeResult, "streetLine" | "place" | "region" | "postcode"> {
  const segments = formattedAddress.split(",").map((s) => s.trim());
  const streetLine = segments[0] ?? formattedAddress;
  const place = segments[1] ?? "";
  const regionSeg = segments[2] ?? "";
  const regionMatch = regionSeg.match(
    /^([A-Za-z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/,
  );
  if (regionMatch) {
    return {
      streetLine,
      place,
      region: regionMatch[1] ?? "",
      postcode: regionMatch[2] ?? "",
    };
  }
  return {
    streetLine,
    place,
    region: regionSeg,
    postcode: "",
  };
}

function toGeocodeResult(parcel: Parcel): GeocodeResult {
  return {
    addressId: parcel.addressId,
    formattedAddress: parcel.formattedAddress,
    ...addressPartsFromFormattedAddress(parcel.formattedAddress),
    lat: parcel.lat,
    lng: parcel.lng,
  };
}

export const mockGeocoder: Geocoder = {
  async geocode(query: string): Promise<GeocodeResult | null> {
    const normalized = query.trim().toLowerCase();
    const match = mockPropertyList.find(
      (p) =>
        p.formattedAddress.toLowerCase().includes(normalized) ||
        p.addressId.toLowerCase() === normalized,
    );
    return match ? toGeocodeResult(match) : null;
  },

  async searchSuggestions(query: string): Promise<GeocodeResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return mockPropertyList
      .filter((p) => p.formattedAddress.toLowerCase().includes(normalized))
      .map(toGeocodeResult)
      .slice(0, 5);
  },

  async getParcel(addressId: string): Promise<Parcel | null> {
    return mockProperties[addressId] ?? null;
  },

  async getParcelByCoordinates(
    lat: number,
    lng: number,
  ): Promise<Parcel | null> {
    return (
      mockPropertyList.find(
        (p) =>
          Math.abs(p.lat - lat) < COORD_EPSILON &&
          Math.abs(p.lng - lng) < COORD_EPSILON,
      ) ?? null
    );
  },
};
