import { env } from "@/lib/env";
import { mapboxRequestHeaders } from "@/lib/adapters/mapbox-headers";

/** Standard streets basemap — keep unfiltered so roads and labels stay readable. */
const MAPBOX_STYLE = "mapbox/streets-v12";

export const STATIC_MAP_DEFAULTS = {
  width: 640,
  height: 480,
  zoom: 15,
} as const;

/** Tight zoom so an urban lot reads as a site, not a city pin. */
export const PARCEL_MAP_ZOOM = 18;

export interface StaticMapParams {
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  zoom?: number;
  accessToken: string;
}

/**
 * Build a Mapbox Static Images URL (streets-v12, no baked pin).
 * Client draws the datum, lot, and zoning layers so they stay aligned.
 * Pure — no fetch; safe for unit tests.
 */
export function buildMapboxStaticUrl(params: StaticMapParams): string {
  const width = params.width ?? STATIC_MAP_DEFAULTS.width;
  const height = params.height ?? STATIC_MAP_DEFAULTS.height;
  const zoom = params.zoom ?? STATIC_MAP_DEFAULTS.zoom;
  const { lat, lng, accessToken } = params;

  const path = `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE}/static/${lng},${lat},${zoom},0/${width}x${height}@2x`;

  const url = new URL(path);
  url.searchParams.set("access_token", accessToken);
  return url.toString();
}

export class MapboxStaticConfigError extends Error {
  constructor(message = "Map preview is not configured") {
    super(message);
    this.name = "MapboxStaticConfigError";
  }
}

export class MapboxStaticUpstreamError extends Error {
  readonly status: 502 | 503;

  constructor(status: 502 | 503, message = "Map preview unavailable") {
    super(message);
    this.name = "MapboxStaticUpstreamError";
    this.status = status;
  }
}

/**
 * Server-fetch a static map PNG. Throws config/upstream errors for the route.
 */
export async function fetchMapboxStaticPng(
  params: Omit<StaticMapParams, "accessToken"> & {
    accessToken?: string;
  },
): Promise<Uint8Array> {
  const accessToken =
    params.accessToken?.trim() || env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new MapboxStaticConfigError();
  }

  const url = buildMapboxStaticUrl({ ...params, accessToken });

  let response: Response;
  try {
    response = await fetch(url, {
      headers: mapboxRequestHeaders({ Accept: "image/png" }),
      // Static tiles are immutable for a given URL.
      cache: "force-cache",
    });
  } catch {
    throw new MapboxStaticUpstreamError(503);
  }

  if (!response.ok) {
    throw new MapboxStaticUpstreamError(response.status >= 500 ? 503 : 502);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new MapboxStaticUpstreamError(502);
  }
  return buffer;
}
