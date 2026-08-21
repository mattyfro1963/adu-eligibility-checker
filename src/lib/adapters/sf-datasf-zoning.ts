import { readFile } from "node:fs/promises";
import path from "node:path";
import { bbox, booleanPointInPolygon, destination, point } from "@turf/turf";
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

/** Street-centerline geocodes often land in the ROW; snap into the nearest district. */
const SNAP_METERS = [20, 40] as const;
const SNAP_BEARINGS = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const NEAR_PAD_DEG = 0.0008; // ~90 m

type ZoningProperties = {
  zoning?: unknown;
  districtna?: unknown;
  url?: unknown;
  gen?: unknown;
};

type ZoningPolygon = Feature<Polygon | MultiPolygon, ZoningProperties>;

type ZoningCollection = FeatureCollection<
  Polygon | MultiPolygon,
  ZoningProperties
>;

export type ZoningDistrictHit = {
  zoning: string;
  districtName: string | null;
  sourceUrl: string | null;
  gen: string | null;
};

let cachedCollection: ZoningCollection | null = null;

function isPolygonGeometry(
  geometry: Feature["geometry"] | null,
): geometry is Polygon | MultiPolygon {
  return (
    geometry !== null &&
    (geometry.type === "Polygon" || geometry.type === "MultiPolygon")
  );
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function hitFromFeature(feature: ZoningPolygon): ZoningDistrictHit | null {
  const zoning = asText(feature.properties?.zoning);
  if (!zoning) return null;
  const sourceUrl = asText(feature.properties?.url);
  return {
    zoning,
    districtName: asText(feature.properties?.districtna),
    sourceUrl: sourceUrl && /^https:\/\//i.test(sourceUrl) ? sourceUrl : null,
    gen: asText(feature.properties?.gen),
  };
}

function pointInBbox(
  lng: number,
  lat: number,
  feature: ZoningPolygon,
): boolean {
  const [minX, minY, maxX, maxY] = bbox(feature);
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY;
}

function pipHit(
  features: ZoningPolygon[],
  lat: number,
  lng: number,
): ZoningDistrictHit | null {
  const pt = point([lng, lat]);
  for (const poly of features) {
    if (!pointInBbox(lng, lat, poly)) continue;
    if (booleanPointInPolygon(pt, poly)) {
      return hitFromFeature(poly);
    }
  }
  return null;
}

function nearbyPolygons(
  collection: FeatureCollection,
  lat: number,
  lng: number,
): ZoningPolygon[] {
  const minX = lng - NEAR_PAD_DEG;
  const maxX = lng + NEAR_PAD_DEG;
  const minY = lat - NEAR_PAD_DEG;
  const maxY = lat + NEAR_PAD_DEG;
  const out: ZoningPolygon[] = [];
  for (const feature of collection.features) {
    if (!isPolygonGeometry(feature.geometry)) continue;
    const poly = feature as ZoningPolygon;
    const [a, b, c, d] = bbox(poly);
    if (c < minX || a > maxX || d < minY || b > maxY) continue;
    out.push(poly);
  }
  return out;
}

function allPolygons(collection: FeatureCollection): ZoningPolygon[] {
  const out: ZoningPolygon[] = [];
  for (const feature of collection.features) {
    if (!isPolygonGeometry(feature.geometry)) continue;
    out.push(feature as ZoningPolygon);
  }
  return out;
}

/**
 * Point-in-polygon against an in-memory FeatureCollection.
 * Snaps up to 40 m when the coordinate sits in a street / ROW gap.
 */
export function lookupZoningHitInCollection(
  collection: FeatureCollection,
  lat: number,
  lng: number,
): ZoningDistrictHit | null {
  const nearby = nearbyPolygons(collection, lat, lng);
  const search = nearby.length > 0 ? nearby : allPolygons(collection);

  const direct = pipHit(search, lat, lng);
  if (direct) return direct;

  const origin = point([lng, lat]);
  for (const meters of SNAP_METERS) {
    for (const bearing of SNAP_BEARINGS) {
      const moved = destination(origin, meters / 1000, bearing, {
        units: "kilometers",
      });
      const [mlng, mlat] = moved.geometry.coordinates;
      if (typeof mlng !== "number" || typeof mlat !== "number") continue;
      const snapped = pipHit(search, mlat, mlng);
      if (snapped) return snapped;
    }
  }

  return null;
}

/** Point-in-polygon against an in-memory FeatureCollection (tests / callers). */
export function lookupZoningInCollection(
  collection: FeatureCollection,
  lat: number,
  lng: number,
): string | null {
  return lookupZoningHitInCollection(collection, lat, lng)?.zoning ?? null;
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
  const hit = await lookupSfDatasfZoningHit(lat, lng);
  return hit?.zoning ?? null;
}

export async function lookupSfDatasfZoningHit(
  lat: number,
  lng: number,
): Promise<ZoningDistrictHit | null> {
  const collection = await loadSfDatasfZoning();
  return lookupZoningHitInCollection(collection, lat, lng);
}

/** Build a Parcel from SF DataSF zoning; overlays default empty until layers ship. */
export function buildSfDatasfParcel(
  lat: number,
  lng: number,
  zoning: string,
  formattedAddress = "",
  meta?: Pick<ZoningDistrictHit, "districtName" | "sourceUrl">,
): Parcel {
  return {
    addressId: `${lat},${lng}`,
    formattedAddress,
    lat,
    lng,
    zoning: normalizeVendorZoningCode(zoning, "sf-datasf"),
    overlays: emptyOverlays(),
    mapblklot: null,
    zoningDistrictName: meta?.districtName ?? null,
    zoningSourceUrl: meta?.sourceUrl ?? null,
  };
}

/** Lookup zoning and return a Parcel, or null when outside SF DataSF coverage. */
export async function getSfDatasfParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<Parcel | null> {
  const hit = await lookupSfDatasfZoningHit(lat, lng);
  if (!hit) {
    return null;
  }
  return buildSfDatasfParcel(lat, lng, hit.zoning, formattedAddress, {
    districtName: hit.districtName,
    sourceUrl: hit.sourceUrl,
  });
}

/** @deprecated Prefer getSfDatasfParcel — kept for call-site clarity during rename. */
export const getPilotParcel = getSfDatasfParcel;
/** @deprecated Prefer buildSfDatasfParcel */
export const buildPilotParcel = buildSfDatasfParcel;
/** @deprecated Prefer lookupSfDatasfZoning */
export const lookupZoning = lookupSfDatasfZoning;
