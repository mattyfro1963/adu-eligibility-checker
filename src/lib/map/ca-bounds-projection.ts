import { CALIFORNIA_TILE } from "@/lib/map/california-bounds";

/** WGS84 bounds aligned with {@link CALIFORNIA_TILE} angular dimensions. */
export const CA_BOUNDS = {
  latMin: CALIFORNIA_TILE.lat - CALIFORNIA_TILE.height / 2,
  latMax: CALIFORNIA_TILE.lat + CALIFORNIA_TILE.height / 2,
  lngMin: CALIFORNIA_TILE.lng - CALIFORNIA_TILE.width / 2,
  lngMax: CALIFORNIA_TILE.lng + CALIFORNIA_TILE.width / 2,
} as const;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/**
 * Project WGS84 coordinates onto a 0–100% CA bounding box for mock map overlays.
 * Origin is top-left; y increases southward (screen coordinates).
 */
export function latLngToCaPercent(
  lat: number,
  lng: number,
): { x: number; y: number } {
  const lngSpan = CA_BOUNDS.lngMax - CA_BOUNDS.lngMin;
  const latSpan = CA_BOUNDS.latMax - CA_BOUNDS.latMin;

  const x = ((lng - CA_BOUNDS.lngMin) / lngSpan) * 100;
  const y = ((CA_BOUNDS.latMax - lat) / latSpan) * 100;

  return {
    x: clampPercent(x),
    y: clampPercent(y),
  };
}
