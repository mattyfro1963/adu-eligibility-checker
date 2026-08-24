import type { Parcel } from "@/lib/types/zoning";

/**
 * Mock parcel FACTS only. Do not add `status`, `overall`, `adu`, or `sb9`.
 * Eligibility is derived by `src/lib/rules` from zoning + overlays.
 *
 * Demo-catalog streets only. Sample-report queries must not match these
 * addresses, so `/api/zoning` uses live GIS or jurisdiction notes instead.
 */
export const mockProperties: Record<string, Parcel> = {
  "addr-r1-clean": {
    addressId: "addr-r1-clean",
    formattedAddress: "1515 18th Ave, San Francisco, CA 94122",
    // Point inside DataSF RH-1(D) — lot GIS when demo facts are not pinned.
    lat: 37.74373286174355,
    lng: -122.45874441336278,
    zoning: "R-1",
    lotSizeSqFt: 6850,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-r1-tiny": {
    addressId: "addr-r1-tiny",
    formattedAddress: "456 Oak Ave, San Francisco, CA 94110",
    lat: 37.775,
    lng: -122.42,
    zoning: "R-1",
    lotSizeSqFt: 6850,
    overlays: {
      tinyHomeFriendly: true,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-r1-fire": {
    addressId: "addr-r1-fire",
    formattedAddress: "789 Pine Rd, San Francisco, CA 94131",
    lat: 37.776,
    lng: -122.421,
    zoning: "R-1",
    lotSizeSqFt: 6850,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: true,
      vhfhsz: true,
      historicDistrict: false,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-r1-historic": {
    addressId: "addr-r1-historic",
    formattedAddress: "2840 Broadway, San Francisco, CA 94115",
    lat: 37.7929,
    lng: -122.4414,
    zoning: "R-1",
    lotSizeSqFt: 6850,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: true,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-r1-small-lot": {
    addressId: "addr-r1-small-lot",
    formattedAddress: "1226 Hampshire St, San Francisco, CA 94110",
    lat: 37.7512,
    lng: -122.4208,
    zoning: "R-1",
    lotSizeSqFt: 950,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-c2": {
    addressId: "addr-c2",
    formattedAddress: "101 Market St, San Francisco, CA 94105",
    lat: 37.7936,
    lng: -122.3957,
    zoning: "C-2",
    lotSizeSqFt: 4200,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: false,
    },
    overlaysVerified: true,
  },
  "addr-r1-coastal": {
    addressId: "addr-r1-coastal",
    formattedAddress: "850 Great Highway, San Francisco, CA 94121",
    lat: 37.7698,
    lng: -122.5112,
    zoning: "R-1",
    lotSizeSqFt: 6850,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: false,
      vhfhsz: false,
      historicDistrict: false,
      coastalZone: true,
    },
    overlaysVerified: true,
  },
};

export const mockPropertyList = Object.values(mockProperties);
