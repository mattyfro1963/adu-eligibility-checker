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

/** Demo scenarios whose parcel facts are pinned at catalog coordinates for zoning lookup. */
const DEMO_FACT_ADDRESS_IDS = [
  "addr-r1-historic",
  "addr-r1-coastal",
  "addr-r1-small-lot",
  "addr-c2",
] as const satisfies readonly (keyof typeof mockProperties)[];

const synthesizedParcels = new Map<string, Parcel>();

function rememberSynthesizedParcel(parcel: Parcel): Parcel {
  synthesizedParcels.set(parcel.addressId, parcel);
  return parcel;
}

function registerDemoFactParcels(): void {
  for (const id of DEMO_FACT_ADDRESS_IDS) {
    const parcel = mockProperties[id];
    if (parcel) {
      rememberSynthesizedParcel(parcel);
    }
  }
}

registerDemoFactParcels();

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

export function parcelToGeocodeResult(parcel: Parcel): GeocodeResult {
  return {
    addressId: parcel.addressId,
    formattedAddress: parcel.formattedAddress,
    ...addressPartsFromFormattedAddress(parcel.formattedAddress),
    lat: parcel.lat,
    lng: parcel.lng,
  };
}

function findCatalogParcel(query: string): Parcel | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  return mockPropertyList.find(
    (p) =>
      p.formattedAddress.toLowerCase() === normalized ||
      p.formattedAddress.toLowerCase().includes(normalized) ||
      p.addressId.toLowerCase() === normalized,
  );
}

export const mockGeocoder: Geocoder = {
  async geocode(query: string): Promise<GeocodeResult | null> {
    if (isAddressHintError(query)) {
      return null;
    }

    const match = findCatalogParcel(query);
    if (match) {
      return parcelToGeocodeResult(match);
    }

    const hinted = rememberSynthesizedParcel(
      synthesizeParcelFromHints(query, HINT_FALLBACK),
    );
    return parcelToGeocodeResult(hinted);
  },

  async searchSuggestions(query: string): Promise<GeocodeResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return mockPropertyList
      .filter(
        (p) =>
          p.formattedAddress.toLowerCase().includes(normalized) ||
          p.addressId.toLowerCase().includes(normalized),
      )
      .map(parcelToGeocodeResult)
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
    const synthesized = getSynthesizedParcelAt(lat, lng);
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
