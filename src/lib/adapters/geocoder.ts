import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel } from "@/lib/types/zoning";

/**
 * Geocoder port. Routes depend on this interface, never on mock parcels.
 * Phase 2: add `regrid-geocoder.ts` (or Mapbox) implementing the same
 * contract — rules and UI stay unchanged.
 */
export interface Geocoder {
  geocode(query: string): Promise<GeocodeResult | null>;
  searchSuggestions(query: string): Promise<GeocodeResult[]>;
  getParcel(addressId: string): Promise<Parcel | null>;
  getParcelByCoordinates(lat: number, lng: number): Promise<Parcel | null>;
}
