import { env } from "@/lib/env";
import { mapboxRequestHeaders } from "@/lib/adapters/mapbox-headers";
import type { GeocodeResult } from "@/lib/types/gis";

/** California bounding box: minLng, minLat, maxLng, maxLat. */
const CALIFORNIA_BBOX: [number, number, number, number] = [
  -124.482003, 32.528832, -114.131211, 42.009518,
];

interface MapboxContextItem {
  id: string;
  text?: string;
  short_code?: string;
}

interface MapboxAddressFeature {
  /** Mapbox feature id (e.g. `address.123…`); unique per suggestion. */
  id?: string;
  place_name: string;
  /** House number when `place_type` includes address. */
  address?: string;
  /** Street / place name text. */
  text?: string;
  center: number[];
  context?: MapboxContextItem[];
}

/** Stable unique id for list keys — never the six-item mock parcel catalog. */
export function addressIdFromMapboxFeature(
  feature: Pick<MapboxAddressFeature, "id" | "place_name">,
  lat: number,
  lng: number,
): string {
  if (typeof feature.id === "string" && feature.id.length > 0) {
    return feature.id;
  }
  return `${feature.place_name}|${lat},${lng}`;
}

function contextText(
  context: MapboxContextItem[] | undefined,
  prefix: string,
): string {
  const item = (context ?? []).find((c) => c.id.startsWith(prefix));
  return item?.text?.trim() ?? "";
}

function contextRegion(context: MapboxContextItem[] | undefined): string {
  const item = (context ?? []).find((c) => c.id.startsWith("region"));
  if (!item) return "";
  // Prefer US-CA → CA for compact two-line secondary text.
  const code = item.short_code?.trim();
  if (code?.startsWith("US-") && code.length > 3) {
    return code.slice(3);
  }
  return item.text?.trim() ?? "";
}

/**
 * Split Mapbox address feature into two-line suggestion fields.
 * Exported for unit tests.
 */
export function addressPartsFromMapboxFeature(
  feature: Pick<
    MapboxAddressFeature,
    "address" | "text" | "place_name" | "context"
  >,
): Pick<
  GeocodeResult,
  "streetLine" | "place" | "county" | "region" | "postcode"
> {
  const house = feature.address?.trim() ?? "";
  const street = feature.text?.trim() ?? "";
  const streetLine =
    house && street
      ? `${house} ${street}`
      : street || house || feature.place_name.split(",")[0]?.trim() || "";

  return {
    streetLine,
    place: contextText(feature.context, "place"),
    county: contextText(feature.context, "district"),
    region: contextRegion(feature.context),
    postcode: contextText(feature.context, "postcode"),
  };
}

export class MapboxConfigError extends Error {
  constructor(message = "Geocoding is not configured") {
    super(message);
    this.name = "MapboxConfigError";
  }
}

export class MapboxUpstreamError extends Error {
  readonly status: 502 | 503;

  constructor(status: 502 | 503, message = "Geocoding service unavailable") {
    super(message);
    this.name = "MapboxUpstreamError";
    this.status = status;
  }
}

/**
 * Build the Geocoding v5 forward-geocode URL. Direct fetch (not the Mapbox
 * SDK) so we can send a Referer header — URL-restricted public tokens are
 * rejected with 403 on referer-less server-side requests otherwise.
 *
 * Statewide CA only: bbox + country=US; no SF proximity bias.
 */
function buildForwardGeocodeUrl(query: string, accessToken: string): string {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("country", "US");
  url.searchParams.set("types", "address");
  url.searchParams.set("bbox", CALIFORNIA_BBOX.join(","));
  url.searchParams.set("limit", "5");
  url.searchParams.set("autocomplete", "true");
  return url.toString();
}

/** Bbox can leak into NV/OR/AZ; keep only features whose region is California. */
function isCaliforniaAddress(feature: MapboxAddressFeature): boolean {
  return (feature.context ?? []).some(
    (item) => item.id.startsWith("region") && item.short_code === "US-CA",
  );
}

function toGeocodeResult(feature: MapboxAddressFeature): GeocodeResult | null {
  const lng = feature.center[0];
  const lat = feature.center[1];
  if (typeof lng !== "number" || typeof lat !== "number") {
    return null;
  }
  const parts = addressPartsFromMapboxFeature(feature);
  return {
    addressId: addressIdFromMapboxFeature(feature, lat, lng),
    formattedAddress: feature.place_name,
    ...parts,
    lat,
    lng,
  };
}

async function forwardGeocodeAddresses(
  query: string,
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const accessToken = env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new MapboxConfigError();
  }

  let response: Response;
  try {
    response = await fetch(buildForwardGeocodeUrl(trimmed, accessToken), {
      headers: mapboxRequestHeaders({ Accept: "application/json" }),
      cache: "no-store",
    });
  } catch {
    throw new MapboxUpstreamError(503);
  }

  if (!response.ok) {
    throw new MapboxUpstreamError(response.status >= 500 ? 503 : 502);
  }

  let body: { features?: MapboxAddressFeature[] };
  try {
    body = (await response.json()) as { features?: MapboxAddressFeature[] };
  } catch {
    throw new MapboxUpstreamError(502);
  }

  return (body.features ?? [])
    .filter(isCaliforniaAddress)
    .map(toGeocodeResult)
    .filter((result): result is GeocodeResult => result !== null);
}

/**
 * CA-only address geocoding. Does not implement `getParcel` — zoning stays
 * on the zoning lookup facade.
 */
export const mapboxGeocoder = {
  async searchSuggestions(query: string): Promise<GeocodeResult[]> {
    return forwardGeocodeAddresses(query);
  },

  async geocode(query: string): Promise<GeocodeResult | null> {
    const results = await forwardGeocodeAddresses(query);
    return results[0] ?? null;
  },
};
