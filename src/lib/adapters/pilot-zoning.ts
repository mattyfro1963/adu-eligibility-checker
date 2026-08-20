import { readFile } from "node:fs/promises";
import path from "node:path";
import { bbox, booleanPointInPolygon, point } from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { Parcel } from "@/lib/types/zoning";

/**
 * SF Zoning Districts (DataSF 3i4a-hu95).
 * Catalog: https://data.sfgov.org/d/3i4a-hu95 (PDDL).
 * Served only from the committed local snapshot — never fetch DataSF at runtime.
 * License: PDDL. File is large (~tens of MB) — committed for the SF pilot demo.
 */
const PILOT_ZONING_PATH = path.join(
  process.cwd(),
  "public/data/pilot-zoning.geojson",
);

type ZoningPolygon = Feature<Polygon | MultiPolygon, { zoning?: unknown }>;

type ZoningCollection = FeatureCollection<
  Polygon | MultiPolygon,
  { zoning?: unknown }
>;

let cachedCollection: ZoningCollection | null = null;

function isPolygonGeometry(
  geometry: Feature["geometry"] | null,
): geometry is Polygon | MultiPolygon {
  return (
    geometry !== null &&
    (geometry.type === "Polygon" || geometry.type === "MultiPolygon")
  );
}

function normalizeZoning(
  properties: { zoning?: unknown } | null,
): string | null {
  const raw = properties?.zoning;
  if (typeof raw !== "string") {
    return null;
  }
  const zoning = raw.trim();
  return zoning.length > 0 ? zoning : null;
}

function pointInBbox(
  lng: number,
  lat: number,
  feature: ZoningPolygon,
): boolean {
  const [minX, minY, maxX, maxY] = bbox(feature);
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY;
}

/** Point-in-polygon against an in-memory FeatureCollection (tests / callers). */
export function lookupZoningInCollection(
  collection: FeatureCollection,
  lat: number,
  lng: number,
): string | null {
  const pt = point([lng, lat]);

  for (const feature of collection.features) {
    if (!isPolygonGeometry(feature.geometry)) {
      continue;
    }

    const poly = feature as ZoningPolygon;
    if (!pointInBbox(lng, lat, poly)) {
      continue;
    }

    if (booleanPointInPolygon(pt, poly)) {
      return normalizeZoning(
        (feature.properties ?? null) as { zoning?: unknown } | null,
      );
    }
  }

  return null;
}

async function loadPilotZoning(): Promise<ZoningCollection> {
  if (cachedCollection) {
    return cachedCollection;
  }

  const raw = await readFile(PILOT_ZONING_PATH, "utf8");
  const parsed = JSON.parse(raw) as FeatureCollection;
  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("Invalid pilot zoning GeoJSON: expected FeatureCollection");
  }

  cachedCollection = parsed as ZoningCollection;
  return cachedCollection;
}

/** Resolve zoning district for WGS84 coordinates using the SF pilot GeoJSON. */
export async function lookupZoning(
  lat: number,
  lng: number,
): Promise<string | null> {
  const collection = await loadPilotZoning();
  return lookupZoningInCollection(collection, lat, lng);
}

const EMPTY_OVERLAYS = {
  tinyHomeFriendly: false,
  fireHazard: false,
  vhfhsz: false,
  historicDistrict: false,
  coastalZone: false,
} as const;

/** Build a Parcel from pilot zoning; overlays default false (no overlay layers yet). */
export function buildPilotParcel(
  lat: number,
  lng: number,
  zoning: string,
  formattedAddress = "",
): Parcel {
  return {
    addressId: `${lat},${lng}`,
    formattedAddress,
    lat,
    lng,
    zoning,
    overlays: { ...EMPTY_OVERLAYS },
    mapblklot: null,
  };
}

/** Lookup zoning and return a Parcel, or null when outside pilot coverage. */
export async function getPilotParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<Parcel | null> {
  const zoning = await lookupZoning(lat, lng);
  if (!zoning) {
    return null;
  }
  return buildPilotParcel(lat, lng, zoning, formattedAddress);
}
