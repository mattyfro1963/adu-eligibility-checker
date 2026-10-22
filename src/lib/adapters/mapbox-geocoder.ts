import { env } from "@/lib/env";
import { mapboxRequestHeaders } from "@/lib/adapters/mapbox-headers";
import type { GeocodeResult } from "@/lib/types/gis";

/**
 * Cascadia bounding box (CA / OR / WA): minLng, minLat, maxLng, maxLat.
 * Padded east through Imperial / Coachella (Indio, El Centro, Blythe).
 * Region short_code filter is the source of truth.
 */
export const CASCADIA_BBOX: [number, number, number, number] = [
  -124.9, 32.4, -114.0, 49.05,
];

export function isLngLatInCascadiaBbox(lng: number, lat: number): boolean {
  const [minLng, minLat, maxLng, maxLat] = CASCADIA_BBOX;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

const PUBLISHED_REGION_CODES = new Set(["US-CA", "US-OR", "US-WA"]);

/** Comma-delimited USPS codes that are not CA / OR / WA (and DC). */
const OUT_OF_CASCADIA_ABBREV =
  /,\s*(AL|AK|AZ|AR|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|PA|RI|SC|SD|TN|TX|UT|VA|VT|WI|WV|WY)\b/i;

const OUT_OF_CASCADIA_NAMES =
  /\b(Alabama|Alaska|Arizona|Arkansas|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|West Virginia|Wisconsin|Wyoming)\b/i;

/**
 * Typed submit that names a non-Cascadia state should skip the Cascadia bbox
 * so Mapbox does not snap “Austin, TX” onto a same-street CA/OR/WA lot.
 * Suggest stays Cascadia-only. Does not rewrite THOW scoring.
 */
export function queryImpliesOutOfCascadia(query: string): boolean {
  return (
    OUT_OF_CASCADIA_ABBREV.test(query) || OUT_OF_CASCADIA_NAMES.test(query)
  );
}

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
 * Cascadia (CA/OR/WA): bbox + country=US; no SF proximity bias.
 */
function buildForwardGeocodeUrl(
  query: string,
  accessToken: string,
  options: { restrictToCascadia: boolean },
): string {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("country", "US");
  url.searchParams.set("types", "address");
  if (options.restrictToCascadia) {
    url.searchParams.set("bbox", CASCADIA_BBOX.join(","));
  }
  url.searchParams.set("limit", "5");
  url.searchParams.set("autocomplete", "true");
  return url.toString();
}

/** Keep only features in published Cascadia states. */
function isCascadiaAddress(feature: MapboxAddressFeature): boolean {
  return (feature.context ?? []).some(
    (item) =>
      item.id.startsWith("region") &&
      typeof item.short_code === "string" &&
      PUBLISHED_REGION_CODES.has(item.short_code),
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
  options: { restrictToCascadia: boolean },
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
    response = await fetch(
      buildForwardGeocodeUrl(trimmed, accessToken, options),
      {
        headers: mapboxRequestHeaders({ Accept: "application/json" }),
        cache: "no-store",
      },
    );
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

  const features = body.features ?? [];
  const filtered = options.restrictToCascadia
    ? features.filter(isCascadiaAddress)
    : features;

  return filtered
    .map(toGeocodeResult)
    .filter((result): result is GeocodeResult => result !== null);
}

/**
 * CA / OR / WA address geocoding. Does not implement `getParcel` — zoning stays
 * on the zoning lookup facade.
 */
export const mapboxGeocoder = {
  async searchSuggestions(query: string): Promise<GeocodeResult[]> {
    return forwardGeocodeAddresses(query, { restrictToCascadia: true });
  },

  async geocode(query: string): Promise<GeocodeResult | null> {
    if (queryImpliesOutOfCascadia(query)) {
      const anywhere = await forwardGeocodeAddresses(query, {
        restrictToCascadia: false,
      });
      return anywhere[0] ?? null;
    }
    const cascadian = await forwardGeocodeAddresses(query, {
      restrictToCascadia: true,
    });
    if (cascadian[0]) {
      return cascadian[0];
    }
    // Unmatched Cascadia typed submit still resolves US-wide so zoning can
    // emit the locked unsupported-state report instead of a rose 404.
    const anywhere = await forwardGeocodeAddresses(query, {
      restrictToCascadia: false,
    });
    return anywhere[0] ?? null;
  },
};
