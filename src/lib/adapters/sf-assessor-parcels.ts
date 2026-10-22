/**
 * SF assessor parcels (DataSF acdm-wktn).
 * Supplies parcelBoundary, mapblklot, and GIS lotSizeSqFt (Turf area when no
 * area attribute). Zoning district codes still come from sf-datasf-zoning.
 * Catalog: https://data.sfgov.org/d/acdm-wktn (PDDL).
 *
 * Lookup order:
 * 1. Local snapshot (gitignored full city, else committed SAMPLE_REPORTS extract)
 * 2. One DataSF point query when the snapshot misses — the local file is often
 *    a neighborhood chip (~4k lots), not the ~228k-parcel city extract.
 * Approximate site polygons still must not feed eligibility; this adapter is
 * the only path that binds APN / area / outline to the searched coordinate.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  area as turfArea,
  bbox,
  booleanPointInPolygon,
  destination,
  point,
} from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

/**
 * Prefer a full/filtered local snapshot (gitignored). Fall back to the
 * committed sample-chip extract so SAMPLE_REPORTS SF addresses still fill
 * mapblklot / lotSizeSqFt / parcelBoundary without a city-wide download.
 * Full city: `node scripts/fetch-sf-assessor-parcels.mjs`
 */
export const SF_ASSESSOR_PARCELS_PATH = path.join(
  process.cwd(),
  "public/data/sf-assessor-parcels.geojson",
);

/** Committed extract covering SAMPLE_REPORTS SF coordinates only. */
export const SF_ASSESSOR_PARCELS_SAMPLES_PATH = path.join(
  process.cwd(),
  "public/data/sf-assessor-parcels.samples.geojson",
);

/** Street-centerline geocodes often land in the ROW; snap into the nearest lot. */
const SNAP_METERS = [20, 40] as const;
const SNAP_BEARINGS = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const NEAR_PAD_DEG = 0.0008; // ~90 m
const SQ_M_TO_SQ_FT = 10.76391041671;

/** Current Socrata host (data.sfgov.org redirects here). */
export const DATASF_ASSESSOR_GEOJSON_URL =
  "https://data.sf.gov/resource/acdm-wktn.geojson";
const DATASF_POINT_TIMEOUT_MS = 5000;
const DATASF_POINT_LIMIT = 8;
const DATASF_CIRCLE_METERS = 40;
/** Full city is ~228k active parcels; below this we warn once. */
const FULL_CITY_PARCEL_HINT = 50_000;

/** Skip DataSF for Oakland / non-SF coordinates. */
const SF_CITY_BBOX = {
  minLng: -122.52,
  minLat: 37.7,
  maxLng: -122.35,
  maxLat: 37.84,
} as const;

type AssessorProperties = {
  mapblklot?: unknown;
  blklot?: unknown;
  active?: unknown;
  /** Rare; prefer when present, else Turf area on geometry. */
  shape_area?: unknown;
  shape_starea?: unknown;
  lot_area?: unknown;
  sqft?: unknown;
};

export type AssessorParcelHit = {
  mapblklot: string | null;
  parcelBoundary: Polygon | MultiPolygon;
  lotSizeSqFt: number;
  boundarySource: "sf-assessor";
};

type AssessorPolygon = Feature<Polygon | MultiPolygon, AssessorProperties>;

type AssessorCollection = FeatureCollection<
  Polygon | MultiPolygon,
  AssessorProperties
>;

let cachedCollection: AssessorCollection | null | undefined;
let loadAttempted = false;
let warnedIncompleteSnapshot = false;

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

function asPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function isActiveParcel(props: AssessorProperties | null | undefined): boolean {
  if (!props) return true;
  const active = props.active;
  if (active === undefined || active === null) return true;
  if (typeof active === "boolean") return active;
  if (typeof active === "string") {
    const normalized = active.trim().toLowerCase();
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return true;
}

function lotAreaFromFeature(feature: AssessorPolygon): number {
  const props = feature.properties;
  const attributed =
    asPositiveNumber(props?.shape_area) ??
    asPositiveNumber(props?.shape_starea) ??
    asPositiveNumber(props?.lot_area) ??
    asPositiveNumber(props?.sqft);
  if (attributed != null) {
    // DataSF shape_area is typically square feet when present; if value looks
    // like square meters for a city lot (< ~50), convert. Prefer Turf otherwise.
    if (attributed >= 50) return Math.round(attributed);
  }

  // Turf area is square meters (WGS84 geodesic). Adapter-only — never in rules.
  const sqMeters = turfArea(feature);
  return Math.max(1, Math.round(sqMeters * SQ_M_TO_SQ_FT));
}

function hitFromFeature(feature: AssessorPolygon): AssessorParcelHit | null {
  if (!isPolygonGeometry(feature.geometry)) return null;
  if (!isActiveParcel(feature.properties)) return null;

  const mapblklot =
    asText(feature.properties?.mapblklot) ?? asText(feature.properties?.blklot);

  return {
    mapblklot,
    parcelBoundary: feature.geometry,
    lotSizeSqFt: lotAreaFromFeature(feature),
    boundarySource: "sf-assessor",
  };
}

function pointInBbox(
  lng: number,
  lat: number,
  feature: AssessorPolygon,
): boolean {
  const [minX, minY, maxX, maxY] = bbox(feature);
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY;
}

function pipHit(
  features: AssessorPolygon[],
  lat: number,
  lng: number,
): AssessorParcelHit | null {
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
): AssessorPolygon[] {
  const minX = lng - NEAR_PAD_DEG;
  const maxX = lng + NEAR_PAD_DEG;
  const minY = lat - NEAR_PAD_DEG;
  const maxY = lat + NEAR_PAD_DEG;
  const out: AssessorPolygon[] = [];
  for (const feature of collection.features) {
    if (!isPolygonGeometry(feature.geometry)) continue;
    const poly = feature as AssessorPolygon;
    if (!isActiveParcel(poly.properties)) continue;
    const [a, b, c, d] = bbox(poly);
    if (c < minX || a > maxX || d < minY || b > maxY) continue;
    out.push(poly);
  }
  return out;
}

function allPolygons(collection: FeatureCollection): AssessorPolygon[] {
  const out: AssessorPolygon[] = [];
  for (const feature of collection.features) {
    if (!isPolygonGeometry(feature.geometry)) continue;
    const poly = feature as AssessorPolygon;
    if (!isActiveParcel(poly.properties)) continue;
    out.push(poly);
  }
  return out;
}

/**
 * Point-in-polygon against an in-memory FeatureCollection.
 * Snaps up to 40 m when the coordinate sits in a street / ROW gap.
 */
export function lookupAssessorParcelInCollection(
  collection: FeatureCollection,
  lat: number,
  lng: number,
): AssessorParcelHit | null {
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

function parseAssessorCollection(
  raw: string,
  label: string,
): AssessorCollection {
  const parsed = JSON.parse(raw) as FeatureCollection;
  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error(
      `Invalid SF assessor parcels GeoJSON (${label}): expected FeatureCollection`,
    );
  }
  return parsed as AssessorCollection;
}

async function readAssessorPath(
  filePath: string,
): Promise<AssessorCollection | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return parseAssessorCollection(raw, filePath);
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    if (code === "ENOENT") return null;
    console.warn(
      "[sf-assessor-parcels] Failed to load snapshot:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

async function loadSfAssessorParcels(): Promise<AssessorCollection | null> {
  if (loadAttempted) {
    return cachedCollection ?? null;
  }
  loadAttempted = true;

  const collection =
    (await readAssessorPath(SF_ASSESSOR_PARCELS_PATH)) ??
    (await readAssessorPath(SF_ASSESSOR_PARCELS_SAMPLES_PATH));
  cachedCollection = collection;
  if (collection && collection.features.length < FULL_CITY_PARCEL_HINT) {
    warnIncompleteSnapshot(collection.features.length);
  }
  return cachedCollection;
}

function warnIncompleteSnapshot(featureCount: number): void {
  if (warnedIncompleteSnapshot) return;
  warnedIncompleteSnapshot = true;
  console.warn(
    `[sf-assessor-parcels] Local snapshot has ${featureCount} parcels (full city is ~228k). Coordinates outside the extract use a DataSF point query so APN / area / outline stay bound to the searched lot.`,
  );
}

export function isLngLatInSanFrancisco(lng: number, lat: number): boolean {
  return (
    lng >= SF_CITY_BBOX.minLng &&
    lng <= SF_CITY_BBOX.maxLng &&
    lat >= SF_CITY_BBOX.minLat &&
    lat <= SF_CITY_BBOX.maxLat
  );
}

function datasfWhereIntersects(lat: number, lng: number): string {
  return `intersects(shape,'POINT(${lng} ${lat})') AND active='true'`;
}

function datasfWhereCircle(lat: number, lng: number): string {
  return `within_circle(shape,${lat},${lng},${DATASF_CIRCLE_METERS}) AND active='true'`;
}

async function fetchDatasfAssessorCollection(
  where: string,
): Promise<AssessorCollection | null> {
  const url = new URL(DATASF_ASSESSOR_GEOJSON_URL);
  url.searchParams.set("$where", where);
  url.searchParams.set("$limit", String(DATASF_POINT_LIMIT));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DATASF_POINT_TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const parsed = (await response.json()) as FeatureCollection;
    if (
      parsed.type !== "FeatureCollection" ||
      !Array.isArray(parsed.features)
    ) {
      return null;
    }
    if (parsed.features.length === 0) return null;
    return parsed as AssessorCollection;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Point query against live DataSF when the local snapshot does not cover
 * this coordinate. Fail-soft: network errors return null (district PIP still
 * runs). Adapter-only — never called from rules.
 */
export async function fetchAssessorParcelFromDatasf(
  lat: number,
  lng: number,
): Promise<AssessorParcelHit | null> {
  if (!isLngLatInSanFrancisco(lng, lat)) return null;

  const collection =
    (await fetchDatasfAssessorCollection(datasfWhereIntersects(lat, lng))) ??
    (await fetchDatasfAssessorCollection(datasfWhereCircle(lat, lng)));
  if (!collection) return null;
  return lookupAssessorParcelInCollection(collection, lat, lng);
}

/** Test helper — reset module cache between fixture-driven cases. */
export function resetSfAssessorParcelsCacheForTests(): void {
  cachedCollection = undefined;
  loadAttempted = false;
  warnedIncompleteSnapshot = false;
}

/** Resolve assessor parcel facts for WGS84 coordinates, or null when uncovered. */
export async function lookupSfAssessorParcel(
  lat: number,
  lng: number,
): Promise<AssessorParcelHit | null> {
  const collection = await loadSfAssessorParcels();
  if (collection) {
    const local = lookupAssessorParcelInCollection(collection, lat, lng);
    if (local) return local;
  }
  return fetchAssessorParcelFromDatasf(lat, lng);
}
