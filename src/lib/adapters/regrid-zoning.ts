/**
 * Regrid parcel point lookup — statewide completeness path when REGRID_API_KEY
 * is set. Server-only; never expose the key to the client.
 * When the payload includes geometry / GIS sqft, those facts populate Parcel.
 */

import { env, isRegridEnabled } from "@/lib/env";
import { lookupOverlays } from "@/lib/adapters/zoning-overlays";
import { normalizeVendorZoningCode } from "@/lib/adapters/zoning-normalize";
import type { Parcel } from "@/lib/types/zoning";
import type { MultiPolygon, Polygon } from "geojson";

type RegridParcelFields = {
  zoning?: unknown;
  zoning_description?: unknown;
  zoning_type?: unknown;
  land_use?: unknown;
  usedesc?: unknown;
  parcelnumb?: unknown;
  path?: unknown;
  /** Common Regrid GIS area fields (sq ft). */
  ll_gissqft?: unknown;
  gis_sqft?: unknown;
  sqft?: unknown;
  area_sqft?: unknown;
  ll_gisacre?: unknown;
};

type RegridParcelRecord = {
  fields?: RegridParcelFields;
  properties?: RegridParcelFields;
  geometry?: unknown;
};

type RegridPointResponse = {
  parcels?: {
    parcels?: RegridParcelRecord[];
  };
  results?: RegridParcelRecord[];
};

function pickZoning(fields: RegridParcelFields | undefined): string | null {
  if (!fields) return null;
  for (const key of [
    "zoning",
    "zoning_description",
    "zoning_type",
    "land_use",
    "usedesc",
  ] as const) {
    const raw = fields[key];
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  }
  return null;
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

/** Prefer GIS sqft fields; convert acres only when sqft is absent. */
export function pickRegridLotSizeSqFt(
  fields: RegridParcelFields | undefined,
): number | null {
  if (!fields) return null;
  const sqft =
    asPositiveNumber(fields.ll_gissqft) ??
    asPositiveNumber(fields.gis_sqft) ??
    asPositiveNumber(fields.sqft) ??
    asPositiveNumber(fields.area_sqft);
  if (sqft != null) return Math.round(sqft);

  const acres = asPositiveNumber(fields.ll_gisacre);
  if (acres != null) return Math.round(acres * 43_560);
  return null;
}

function isParcelPolygon(
  geometry: unknown,
): geometry is Polygon | MultiPolygon {
  if (!geometry || typeof geometry !== "object") return false;
  const type = (geometry as { type?: unknown }).type;
  const coordinates = (geometry as { coordinates?: unknown }).coordinates;
  return (
    (type === "Polygon" || type === "MultiPolygon") &&
    Array.isArray(coordinates)
  );
}

export function pickRegridGeometry(
  record: RegridParcelRecord | null | undefined,
): Polygon | MultiPolygon | null {
  if (!record) return null;
  if (isParcelPolygon(record.geometry)) return record.geometry;
  return null;
}

function extractRecord(body: RegridPointResponse): RegridParcelRecord | null {
  const nested = body.parcels?.parcels?.[0];
  if (nested) return nested;
  const flat = body.results?.[0];
  return flat ?? null;
}

/**
 * Build a Parcel from a parsed Regrid point payload (tests / callers).
 * Returns null when zoning cannot be read — geometry alone is not a lot hit.
 */
export function parcelFromRegridPointResponse(
  body: RegridPointResponse,
  lat: number,
  lng: number,
  formattedAddress = "",
  overlays: Parcel["overlays"],
): Parcel | null {
  const record = extractRecord(body);
  const fields = record?.fields ?? record?.properties ?? null;
  const rawZoning = pickZoning(fields ?? undefined);
  if (!rawZoning) {
    return null;
  }

  const apn = typeof fields?.parcelnumb === "string" ? fields.parcelnumb : null;
  const geometry = pickRegridGeometry(record);
  const lotSizeSqFt = pickRegridLotSizeSqFt(fields ?? undefined);

  return {
    addressId:
      (typeof fields?.path === "string" && fields.path) || `${lat},${lng}`,
    formattedAddress,
    lat,
    lng,
    zoning: normalizeVendorZoningCode(rawZoning, "regrid"),
    overlays,
    mapblklot: apn,
    lotSizeSqFt,
    parcelBoundary: geometry,
    boundarySource: geometry ? "regrid" : null,
  };
}

/**
 * Point lookup against Regrid. Returns null when the key is unset, the
 * upstream misses, or zoning cannot be read from the payload.
 */
export async function getRegridParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<Parcel | null> {
  if (!isRegridEnabled()) {
    return null;
  }

  const token = env.REGRID_API_KEY?.trim();
  if (!token) {
    return null;
  }

  const url = new URL("https://app.regrid.com/api/v2/parcels/point");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("token", token);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  let body: RegridPointResponse;
  try {
    body = (await response.json()) as RegridPointResponse;
  } catch {
    return null;
  }

  const overlays = await lookupOverlays(lat, lng);
  return parcelFromRegridPointResponse(
    body,
    lat,
    lng,
    formattedAddress,
    overlays,
  );
}
