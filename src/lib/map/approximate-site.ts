/**
 * Schematic site geometry for the static map overlay.
 * Not a survey and not GIS — lot polygons are approximate from area + a
 * coordinate seed. Zoning is a separate district envelope for applicability.
 * Zero React; no Turf.
 */

export type MapPoint = { x: number; y: number };

export type ApproximateSiteInput = {
  lat: number;
  lng: number;
  /** CSS pixel size of the Mapbox static request (not @2x). */
  width: number;
  height: number;
  zoom: number;
  lotSizeSqFt?: number | null;
  zoning?: string | null;
  /** False when lot GIS did not verify area. */
  lotVerified?: boolean;
};

export type LngLat = [number, number];

export type ApproximateSiteGeoJSON = {
  lot: {
    type: "Feature";
    properties: { kind: "lot"; verified: boolean };
    geometry: { type: "Polygon"; coordinates: LngLat[][] };
  };
  zoning: {
    type: "Feature";
    properties: { kind: "zoning"; label: string };
    geometry: { type: "Polygon"; coordinates: LngLat[][] };
  };
  areaSqFt: number;
  verified: boolean;
  zoningLabel: string;
};

export type ApproximateSiteOverlay = {
  viewBox: { width: number; height: number };
  lot: {
    points: MapPoint[];
    path: string;
    areaSqFt: number;
    verified: boolean;
  };
  zoning: {
    points: MapPoint[];
    path: string;
    label: string;
  };
  scale: {
    label: string;
    pixels: number;
  };
};

/** Typical urban CA lot when area is unknown — schematic only. */
export const DEFAULT_SCHEMATIC_LOT_SQFT = 5000;

const FT_PER_METER = 3.280839895;
const EARTH_CIRCUMFERENCE_M = 40_075_016.686;

export function metersPerPixel(lat: number, zoom: number): number {
  return (
    (Math.cos((lat * Math.PI) / 180) * EARTH_CIRCUMFERENCE_M) /
    (256 * 2 ** zoom)
  );
}

export function siteSeed(lat: number, lng: number): number {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function rotate(x: number, y: number, angleRad: number): MapPoint {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function jitter(seed: number, index: number): number {
  const mixed = Math.imul(seed ^ ((index + 1) * 0x9e3779b9), 0x85ebca6b);
  return ((mixed >>> 0) % 1000) / 1000;
}

function polygonPath(points: MapPoint[]): string {
  if (points.length === 0) {
    return "";
  }
  const [first, ...rest] = points;
  const commands = [`M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`];
  for (const point of rest) {
    commands.push(`L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }
  commands.push("Z");
  return commands.join(" ");
}

function translate(points: MapPoint[], origin: MapPoint): MapPoint[] {
  return points.map((point) => ({
    x: origin.x + point.x,
    y: origin.y + point.y,
  }));
}

function resolveSiteArea(input: {
  lotSizeSqFt?: number | null;
  lotVerified?: boolean;
}): { areaSqFt: number; verified: boolean } {
  const verified =
    Boolean(input.lotVerified) &&
    input.lotSizeSqFt != null &&
    input.lotSizeSqFt > 0;
  const areaSqFt =
    verified && input.lotSizeSqFt != null
      ? input.lotSizeSqFt
      : DEFAULT_SCHEMATIC_LOT_SQFT;
  return { areaSqFt, verified };
}

function zoningLabelOf(zoning?: string | null): string {
  if (zoning && zoning.trim().length > 0) {
    return zoning.trim();
  }
  return "Unverified";
}

/** Local meters: +x east, +y south (screen-like), origin at geocode. */
function buildSiteLocalMeters(
  lat: number,
  lng: number,
  areaSqFt: number,
): { lot: MapPoint[]; zoning: MapPoint[] } {
  const seed = siteSeed(lat, lng);
  const aspect = 2.15 + jitter(seed, 0) * 1.05;
  const widthFt = Math.sqrt(areaSqFt / aspect);
  const depthFt = widthFt * aspect;
  const halfW = widthFt / FT_PER_METER / 2;
  const halfD = depthFt / FT_PER_METER / 2;
  const angle = (jitter(seed, 1) - 0.5) * 0.55;
  const cornerNoise = Math.min(halfW, halfD) * 0.08;

  const lot: MapPoint[] = [
    { x: -halfW, y: -halfD },
    { x: halfW, y: -halfD },
    { x: halfW, y: halfD },
    { x: -halfW, y: halfD },
  ].map((point, index) => {
    const n = jitter(seed, index + 2);
    const offset = rotate(
      (n - 0.5) * 2 * cornerNoise,
      (jitter(seed, index + 6) - 0.5) * 2 * cornerNoise,
      angle,
    );
    const rotated = rotate(point.x, point.y, angle);
    return { x: rotated.x + offset.x, y: rotated.y + offset.y };
  });

  const zoneScale = 3.15 + jitter(seed, 10) * 0.45;
  const zoneAngle = angle + 0.18;
  const zoning: MapPoint[] = [];
  for (let i = 0; i < 8; i += 1) {
    const t = (i / 8) * Math.PI * 2;
    const radiusX = halfW * zoneScale * (1.05 + jitter(seed, 20 + i) * 0.18);
    const radiusY = halfD * zoneScale * (0.92 + jitter(seed, 30 + i) * 0.2);
    zoning.push(
      rotate(Math.cos(t) * radiusX, Math.sin(t) * radiusY, zoneAngle),
    );
  }

  return { lot, zoning };
}

export function offsetMetersToLngLat(
  lat: number,
  lng: number,
  eastMeters: number,
  northMeters: number,
): LngLat {
  const dLat = northMeters / 111_320;
  const dLng =
    eastMeters / (111_320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
  return [lng + dLng, lat + dLat];
}

function closeRing(ring: LngLat[]): LngLat[] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!first || !last) {
    return ring;
  }
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }
  return [...ring, first];
}

function metersToLngLatRing(
  lat: number,
  lng: number,
  points: MapPoint[],
): LngLat[] {
  return closeRing(
    points.map((point) => offsetMetersToLngLat(lat, lng, point.x, -point.y)),
  );
}

/**
 * Schematic lot + zoning polygons in WGS84 for the interactive map.
 */
export function buildApproximateSiteGeoJSON(input: {
  lat: number;
  lng: number;
  lotSizeSqFt?: number | null;
  lotVerified?: boolean;
  zoning?: string | null;
}): ApproximateSiteGeoJSON {
  const { areaSqFt, verified } = resolveSiteArea(input);
  const local = buildSiteLocalMeters(input.lat, input.lng, areaSqFt);
  const zoningLabel = zoningLabelOf(input.zoning);

  return {
    lot: {
      type: "Feature",
      properties: { kind: "lot", verified },
      geometry: {
        type: "Polygon",
        coordinates: [metersToLngLatRing(input.lat, input.lng, local.lot)],
      },
    },
    zoning: {
      type: "Feature",
      properties: { kind: "zoning", label: zoningLabel },
      geometry: {
        type: "Polygon",
        coordinates: [metersToLngLatRing(input.lat, input.lng, local.zoning)],
      },
    },
    areaSqFt,
    verified,
    zoningLabel,
  };
}

/**
 * Build a schematic lot polygon and a larger zoning-district envelope
 * in the static-image viewBox, centered on the geocode.
 */
export function buildApproximateSiteOverlay(
  input: ApproximateSiteInput,
): ApproximateSiteOverlay {
  const { lat, width, height, zoom } = input;
  const { areaSqFt, verified } = resolveSiteArea(input);
  const mpp = metersPerPixel(lat, zoom);
  const local = buildSiteLocalMeters(lat, input.lng, areaSqFt);
  const origin = { x: width / 2, y: height / 2 };

  const toPixels = (points: MapPoint[]) =>
    translate(
      points.map((point) => ({ x: point.x / mpp, y: point.y / mpp })),
      origin,
    );

  const lotPoints = toPixels(local.lot);
  const zoningPoints = toPixels(local.zoning);
  const scaleFt = areaSqFt < 2000 ? 25 : 50;
  const scalePixels = Math.max(
    24,
    Math.min(width * 0.28, scaleFt / FT_PER_METER / mpp),
  );

  return {
    viewBox: { width, height },
    lot: {
      points: lotPoints,
      path: polygonPath(lotPoints),
      areaSqFt,
      verified,
    },
    zoning: {
      points: zoningPoints,
      path: polygonPath(zoningPoints),
      label: zoningLabelOf(input.zoning),
    },
    scale: {
      label: `${scaleFt} ft`,
      pixels: scalePixels,
    },
  };
}
