import { readFile } from "node:fs/promises";
import path from "node:path";
import { bbox, booleanPointInPolygon, point } from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import { emptyOverlays } from "@/lib/adapters/zoning-overlays";
import { normalizeVendorZoningCode } from "@/lib/adapters/zoning-normalize";
import type { Parcel } from "@/lib/types/zoning";

/**
 * SF Zoning Districts (DataSF 3i4a-hu95) — one ZoningLookup provider.
 * Catalog: https://data.sfgov.org/d/3i4a-hu95 (PDDL).
 * Served only from the committed local snapshot — never fetch DataSF at runtime.
 */
const SF_DATASF_ZONING_PATH = path.join(
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

async function loadSfDatasfZoning(): Promise<ZoningCollection> {
  if (cachedCollection) {
    return cachedCollection;
  }

  const raw = await readFile(SF_DATASF_ZONING_PATH, "utf8");
  const parsed = JSON.parse(raw) as FeatureCollection;
  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error(
      "Invalid SF DataSF zoning GeoJSON: expected FeatureCollection",
    );
  }

  cachedCollection = parsed as ZoningCollection;
  return cachedCollection;
}

/** Resolve zoning district for WGS84 coordinates using the SF DataSF GeoJSON. */
export async function lookupSfDatasfZoning(
  lat: number,
  lng: number,
): Promise<string | null> {
  const collection = await loadSfDatasfZoning();
  return lookupZoningInCollection(collection, lat, lng);
}

/** Build a Parcel from SF DataSF zoning; overlays default empty until layers ship. */
export function buildSfDatasfParcel(
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
    zoning: normalizeVendorZoningCode(zoning, "sf-datasf"),
    overlays: emptyOverlays(),
    mapblklot: null,
  };
}

/** Lookup zoning and return a Parcel, or null when outside SF DataSF coverage. */
export async function getSfDatasfParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<Parcel | null> {
  const zoning = await lookupSfDatasfZoning(lat, lng);
  if (!zoning) {
    return null;
  }
  return buildSfDatasfParcel(lat, lng, zoning, formattedAddress);
}

/** @deprecated Prefer getSfDatasfParcel — kept for call-site clarity during rename. */
export const getPilotParcel = getSfDatasfParcel;
/** @deprecated Prefer buildSfDatasfParcel */
export const buildPilotParcel = buildSfDatasfParcel;
/** @deprecated Prefer lookupSfDatasfZoning */
export const lookupZoning = lookupSfDatasfZoning;
