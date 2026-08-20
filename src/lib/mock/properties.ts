import type { Parcel } from "@/lib/types/zoning";

/**
 * Mock parcel FACTS only. Do not add `status`, `overall`, `adu`, or `sb9`.
 * Eligibility is derived by `src/lib/rules` from zoning + overlays.
 */
export const mockProperties: Record<string, Parcel> = {
  "addr-r1-clean": {
    addressId: "addr-r1-clean",
    formattedAddress: "123 Main St, San Francisco, CA",
    // Point inside DataSF RH-1(D) so mock geocode → pilot PIP succeeds.
    lat: 37.74373286174355,
    lng: -122.45874441336278,
    zoning: "R-1",
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
  },
  "addr-r1-tiny": {
    addressId: "addr-r1-tiny",
    formattedAddress: "456 Oak Ave, San Francisco, CA",
    lat: 37.775,
    lng: -122.42,
    zoning: "R-1",
    overlays: {
      tinyHomeFriendly: true,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
  },
  "addr-r1-fire": {
    addressId: "addr-r1-fire",
    formattedAddress: "789 Pine Rd, San Francisco, CA",
    lat: 37.776,
    lng: -122.421,
    zoning: "R-1",
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: true,
      vhfhsz: true,
      historicDistrict: false,
      coastalZone: false,
    },
  },
  "addr-r1-historic": {
    addressId: "addr-r1-historic",
    formattedAddress: "321 Elm St, San Francisco, CA",
    lat: 37.777,
    lng: -122.422,
    zoning: "R-1",
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: true,
      coastalZone: false,
    },
  },
  "addr-c2": {
    addressId: "addr-c2",
    formattedAddress: "100 Market St, San Francisco, CA",
    lat: 37.778,
    lng: -122.423,
    zoning: "C-2",
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
  },
  "addr-r1-coastal": {
    addressId: "addr-r1-coastal",
    formattedAddress: "555 Beach Blvd, San Francisco, CA",
    lat: 37.779,
    lng: -122.424,
    zoning: "R-1",
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: true,
    },
  },
};

export const mockPropertyList = Object.values(mockProperties);
