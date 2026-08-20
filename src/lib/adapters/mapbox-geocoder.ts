import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { env } from "@/lib/env";
import { mockParcelIdFromCoordinates } from "@/lib/mock/properties";
import type { GeocodeResult } from "@/lib/types/gis";

/** California bounding box: minLng, minLat, maxLng, maxLat. */
const CALIFORNIA_BBOX: [number, number, number, number] = [
  -124.482003, 32.528832, -114.131211, 42.009518,
];

/** Bias autocomplete toward the Bay Area so SF-area typing stays useful. */
const SF_PROXIMITY: [number, number] = [-122.4194, 37.7749];

interface MapboxContextItem {
  id: string;
  short_code?: string;
}

interface MapboxAddressFeature {
  place_name: string;
  center: number[];
  context?: MapboxContextItem[];
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

let geocodingClient: ReturnType<typeof mbxGeocoding> | null = null;

function getGeocodingClient(): ReturnType<typeof mbxGeocoding> {
  const accessToken = env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new MapboxConfigError();
  }
  if (!geocodingClient) {
    geocodingClient = mbxGeocoding({ accessToken });
  }
  return geocodingClient;
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
  return {
    addressId: mockParcelIdFromCoordinates(lat, lng),
    formattedAddress: feature.place_name,
    lat,
    lng,
  };
}

function toUpstreamError(err: unknown): MapboxUpstreamError {
  if (err instanceof MapboxConfigError) {
    throw err;
  }
  const statusCode =
    err && typeof err === "object" && "statusCode" in err
      ? Number((err as { statusCode?: number }).statusCode)
      : undefined;
  if (
    typeof statusCode === "number" &&
    Number.isFinite(statusCode) &&
    statusCode >= 400
  ) {
    return new MapboxUpstreamError(502);
  }
  return new MapboxUpstreamError(503);
}

async function forwardGeocodeAddresses(
  query: string,
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const response = await getGeocodingClient()
      .forwardGeocode({
        query: trimmed,
        countries: ["US"],
        types: ["address"],
        bbox: CALIFORNIA_BBOX,
        limit: 5,
        autocomplete: true,
        proximity: SF_PROXIMITY,
      })
      .send();

    return (response.body.features as MapboxAddressFeature[])
      .filter(isCaliforniaAddress)
      .map(toGeocodeResult)
      .filter((result): result is GeocodeResult => result !== null);
  } catch (err) {
    throw toUpstreamError(err);
  }
}

/**
 * CA-only address geocoding. Does not implement `getParcel` — zoning stays
 * on the mock geocoder.
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
