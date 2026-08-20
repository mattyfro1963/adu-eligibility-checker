import type { Geocoder } from "@/lib/adapters/geocoder";
import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel } from "@/lib/types/zoning";
import {
  isAddressHintError,
  synthesizeParcelFromHints,
} from "@/lib/mock/address-hints";
import { mockPropertyList, mockProperties } from "@/lib/mock/properties";

const COORD_EPSILON = 0.0001;
const HINT_FALLBACK = { lat: 36.7378, lng: -119.7871 } as const;

const synthesizedParcels = new Map<string, Parcel>();

function rememberSynthesizedParcel(parcel: Parcel): Parcel {
  synthesizedParcels.set(parcel.addressId, parcel);
  return parcel;
}

/** Resolve adapter-synthesized demo parcels for zoning lookup. */
export function getSynthesizedParcelAt(
  lat: number,
  lng: number,
): Parcel | null {
  for (const parcel of synthesizedParcels.values()) {
    if (
      Math.abs(parcel.lat - lat) < COORD_EPSILON &&
      Math.abs(parcel.lng - lng) < COORD_EPSILON
    ) {
      return parcel;
    }
  }
  return null;
}

/**
 * Parse mock `formattedAddress` into two-line suggestion fields.
 * Expects `"Street, Place, CA"` or `"Street, Place, CA 94105"`.
 */
export function addressPartsFromFormattedAddress(
  formattedAddress: string,
): Pick<
  GeocodeResult,
  "streetLine" | "place" | "county" | "region" | "postcode"
> {
  const segments = formattedAddress.split(",").map((s) => s.trim());
  const streetLine = segments[0] ?? formattedAddress;
  const place = segments[1] ?? "";
  const regionSeg = segments[2] ?? "";
  const regionMatch = regionSeg.match(
    /^([A-Za-z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/,
  );
  // Demo catalog is SF-only; county follows place when it is San Francisco.
  const county =
    place.toLowerCase() === "san francisco" ? "San Francisco" : place;
  if (regionMatch) {
    return {
      streetLine,
      place,
      county,
      region: regionMatch[1] ?? "",
      postcode: regionMatch[2] ?? "",
    };
  }
  return {
    streetLine,
    place,
    county,
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
    if (isAddressHintError(query)) {
      return null;
    }

    const normalized = query.trim().toLowerCase();
    const match = mockPropertyList.find(
      (p) =>
        p.formattedAddress.toLowerCase().includes(normalized) ||
        p.addressId.toLowerCase() === normalized,
    );
    if (match) {
      return toGeocodeResult(match);
    }

    const hinted = rememberSynthesizedParcel(
      synthesizeParcelFromHints(query, HINT_FALLBACK),
    );
    return toGeocodeResult(hinted);
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
    if (mockProperties[addressId]) {
      return mockProperties[addressId];
    }
    return synthesizedParcels.get(addressId) ?? null;
  },

  async getParcelByCoordinates(
    lat: number,
    lng: number,
  ): Promise<Parcel | null> {
    const synthesized = [...synthesizedParcels.values()].find(
      (p) =>
        Math.abs(p.lat - lat) < COORD_EPSILON &&
        Math.abs(p.lng - lng) < COORD_EPSILON,
    );
    if (synthesized) return synthesized;

    return (
      mockPropertyList.find(
        (p) =>
          Math.abs(p.lat - lat) < COORD_EPSILON &&
          Math.abs(p.lng - lng) < COORD_EPSILON,
      ) ?? null
    );
  },
};
