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
 * Returns empty overlays today; Turf PIP against local snapshots will land here.
 */
export async function lookupOverlays(
  _lat: number,
  _lng: number,
): Promise<Overlays> {
  void _lat;
  void _lng;
  return emptyOverlays();
}
