import { BASEMAP_RASTER_URL_TEMPLATE } from "@/lib/map/basemap";

export class BasemapStaticUpstreamError extends Error {
  readonly status: 502 | 503;

  constructor(status: 502 | 503, message = "Map preview unavailable") {
    super(message);
    this.name = "BasemapStaticUpstreamError";
    this.status = status;
  }
}

export type BasemapRasterImage = {
  bytes: Uint8Array;
  contentType: string;
};

/**
 * Web Mercator tile index for a lon/lat (slippy map).
 * Pure — safe for unit tests.
 */
export function lonLatToTile(
  lng: number,
  lat: number,
  zoom: number,
): { x: number; y: number; z: number } {
  const z = Math.round(zoom);
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y, z };
}

/** Satellite tile covering this coordinate — same XYZ as the MapLibre style. */
export function buildBasemapRasterUrl(
  lat: number,
  lng: number,
  zoom: number,
): string {
  const { x, y, z } = lonLatToTile(lng, lat, zoom);
  return BASEMAP_RASTER_URL_TEMPLATE.replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

export async function fetchBasemapRaster(params: {
  lat: number;
  lng: number;
  zoom?: number;
}): Promise<BasemapRasterImage> {
  const zoom = params.zoom ?? 15;
  const url = buildBasemapRasterUrl(params.lat, params.lng, zoom);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "image/jpeg,image/png,*/*" },
      cache: "force-cache",
    });
  } catch {
    throw new BasemapStaticUpstreamError(503);
  }

  if (!response.ok) {
    throw new BasemapStaticUpstreamError(response.status >= 500 ? 503 : 502);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new BasemapStaticUpstreamError(502);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  return { bytes: buffer, contentType };
}
