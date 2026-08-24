import type { Overlays } from "@/lib/types/zoning";

/** Default overlays until progressive GIS layers ship. */
export function emptyOverlays(): Overlays {
  return {
    tinyHomeFriendly: false,
    fireHazard: false,
    vhfhsz: false,
    historicDistrict: false,
    coastalZone: false,
  };
}

/**
 * Progressive overlay stub — CalFire VHFHSZ, coastal, historic layers.
 * Returns empty overlay booleans today; callers must set overlaysVerified: false
 * so UI/rules do not treat stub false as verified “Clear.”
 * Turf PIP against local snapshots will land here and flip verified to true.
 */
export async function lookupOverlays(
  _lat: number,
  _lng: number,
): Promise<Overlays> {
  void _lat;
  void _lng;
  return emptyOverlays();
}

/** Stub lookup has not checked real overlay layers. */
export function overlaysAreVerifiedByLookup(): boolean {
  return false;
}
