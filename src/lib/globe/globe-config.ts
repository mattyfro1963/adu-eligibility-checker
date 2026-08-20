/** Shared react-globe.gl settings — WGS84 lat/lng only, no manual phi/theta. */

export const EARTH_DAY_TEXTURE =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg";

export const CALIFORNIA_CENTROID = {
  lat: 36.7783,
  lng: -119.4179,
} as const;

/** Camera altitude: lower = closer zoom. react-globe.gl uses real lat/lng. */
export const GLOBE_IDLE_ALTITUDE = 2.15;
export const GLOBE_FOCUS_ALTITUDE = 0.35;
export const GLOBE_FOCUS_TRANSITION_MS = 1400;
export const GLOBE_TILES_TRANSITION_MS = 1000;

export const MARKER_COLOR = "#fc4a2b";
export const CALIFORNIA_TILE_COLOR = "#6b5344";
export const SEARCH_TILE_COLOR = "#fc4a2b";

/** Approximate California bounding box for idle tiles layer highlight. */
export const CALIFORNIA_TILE = {
  id: "ca-state",
  lat: 37.27,
  lng: -119.27,
  width: 10.5,
  height: 9.8,
} as const;

export type GlobeTile = {
  id: string;
  lat: number;
  lng: number;
  width: number;
  height: number;
};

export type GlobeMarker = {
  lat: number;
  lng: number;
  size: number;
  color: string;
};

export function markerAtCoordinate(
  lat: number,
  lng: number,
): GlobeMarker {
  return {
    lat,
    lng,
    size: 0.45,
    color: MARKER_COLOR,
  };
}

/** Smaller spherical segment centered on a searched coordinate. */
export function searchTileAtCoordinate(lat: number, lng: number): GlobeTile {
  return {
    id: "search-focus",
    lat,
    lng,
    width: 0.85,
    height: 0.85,
  };
}

export function isValidCoordinate(
  lat: number | null | undefined,
  lng: number | null | undefined,
): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
