/**
 * Multi-provider ZoningLookup facade.
 * Order: SF DataSF open data → optional open-data packs → Regrid (opt-in paid) → null.
 * Default statewide path: Mapbox geocode + evaluateJurisdictionContext (no Regrid).
 * Rules engine unchanged — consumes Parcel facts only.
 */

import { getOpenDataParcel } from "@/lib/adapters/open-data-zoning";
import { getRegridParcel } from "@/lib/adapters/regrid-zoning";
import { getSfDatasfParcel } from "@/lib/adapters/sf-datasf-zoning";
import { getSynthesizedParcelAt } from "@/lib/adapters/mock-geocoder";
import {
  lookupOverlays,
  overlaysAreVerifiedByLookup,
} from "@/lib/adapters/zoning-overlays";
import type { Parcel } from "@/lib/types/zoning";

export type ZoningCoverage = "lot" | "none";

export type ZoningProviderId = "sf-datasf" | "open-data" | "regrid";

export type ZoningLookupResult = {
  parcel: Parcel | null;
  coverage: ZoningCoverage;
  provider: ZoningProviderId | null;
};

/**
 * Resolve a Parcel for WGS84 coordinates via the provider chain.
 */
export async function lookupParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<ZoningLookupResult> {
  const synthesized = getSynthesizedParcelAt(lat, lng);
  if (synthesized) {
    return {
      parcel: {
        ...synthesized,
        overlaysVerified: synthesized.overlaysVerified ?? true,
      },
      coverage: "lot",
      provider: "open-data",
    };
  }

  const sf = await getSfDatasfParcel(lat, lng, formattedAddress);
  if (sf) {
    const overlays = await lookupOverlays(lat, lng);
    return {
      parcel: {
        ...sf,
        overlays,
        overlaysVerified: overlaysAreVerifiedByLookup(),
      },
      coverage: "lot",
      provider: "sf-datasf",
    };
  }

  const openData = await getOpenDataParcel(lat, lng, formattedAddress);
  if (openData) {
    const overlays = await lookupOverlays(lat, lng);
    return {
      parcel: {
        ...openData,
        overlays,
        overlaysVerified: overlaysAreVerifiedByLookup(),
      },
      coverage: "lot",
      provider: "open-data",
    };
  }

  const regrid = await getRegridParcel(lat, lng, formattedAddress);
  if (regrid) {
    return {
      parcel: {
        ...regrid,
        overlaysVerified:
          regrid.overlaysVerified ?? overlaysAreVerifiedByLookup(),
      },
      coverage: "lot",
      provider: "regrid",
    };
  }

  return {
    parcel: null,
    coverage: "none",
    provider: null,
  };
}
