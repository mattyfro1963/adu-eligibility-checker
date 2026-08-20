/**
 * Regrid parcel point lookup — statewide completeness path when REGRID_API_KEY
 * is set. Server-only; never expose the key to the client.
 */

import { env } from "@/lib/env";
import { lookupOverlays } from "@/lib/adapters/zoning-overlays";
import { normalizeVendorZoningCode } from "@/lib/adapters/zoning-normalize";
import type { Parcel } from "@/lib/types/zoning";

type RegridParcelFields = {
  zoning?: unknown;
  zoning_description?: unknown;
  zoning_type?: unknown;
  land_use?: unknown;
  usedesc?: unknown;
  parcelnumb?: unknown;
  path?: unknown;
};

type RegridPointResponse = {
  parcels?: {
    parcels?: Array<{
      fields?: RegridParcelFields;
      properties?: RegridParcelFields;
    }>;
  };
  results?: Array<{
    fields?: RegridParcelFields;
    properties?: RegridParcelFields;
  }>;
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

function extractFields(body: RegridPointResponse): RegridParcelFields | null {
  const nested =
    body.parcels?.parcels?.[0]?.fields ??
    body.parcels?.parcels?.[0]?.properties;
  if (nested) return nested;
  const flat = body.results?.[0]?.fields ?? body.results?.[0]?.properties;
  return flat ?? null;
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

  const fields = extractFields(body);
  const rawZoning = pickZoning(fields ?? undefined);
  if (!rawZoning) {
    return null;
  }

  const overlays = await lookupOverlays(lat, lng);
  const apn = typeof fields?.parcelnumb === "string" ? fields.parcelnumb : null;

  return {
    addressId:
      (typeof fields?.path === "string" && fields.path) || `${lat},${lng}`,
    formattedAddress,
    lat,
    lng,
    zoning: normalizeVendorZoningCode(rawZoning, "regrid"),
    overlays,
    mapblklot: apn,
  };
}
