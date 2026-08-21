/** WGS84 California reference points for mock GIS and map overlays. */

export const CALIFORNIA_CENTROID = {
  lat: 36.7783,
  lng: -119.4179,
} as const;

/** Approximate California bounding box for mock map overlays. */
export const CALIFORNIA_TILE = {
  id: "ca-state",
  lat: 37.27,
  lng: -119.27,
  width: 10.5,
  height: 9.8,
} as const;
