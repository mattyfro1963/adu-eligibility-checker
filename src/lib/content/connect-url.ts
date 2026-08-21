import type { GeocodeResult } from "@/lib/types/gis";
import type { EligibilityStatus } from "@/lib/types/zoning";

/** In-page anchor for builder match / lead routing on `/`. */
export const CONNECT_SECTION_ID = "connect";

/** Query keys preserved across `/connect` → `/` redirects and deep links. */
export const CONNECT_QUERY_KEYS = [
  "address",
  "lat",
  "lng",
  "place",
  "county",
  "region",
  "postcode",
  "status",
] as const;

export function parseConnectPrefill(
  searchParams: URLSearchParams,
): GeocodeResult | null {
  const address = searchParams.get("address")?.trim();
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  if (!address || latRaw == null || lngRaw == null) {
    return null;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return {
    addressId: `prefill-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    formattedAddress: address,
    streetLine: address,
    place: searchParams.get("place") ?? "",
    county: searchParams.get("county") ?? "",
    region: searchParams.get("region") ?? "CA",
    postcode: searchParams.get("postcode") ?? "",
    lat,
    lng,
  };
}

export function parseConnectOverallStatus(
  searchParams: URLSearchParams,
): EligibilityStatus | null {
  const status = searchParams.get("status");
  if (
    status === "eligible" ||
    status === "warning" ||
    status === "restricted"
  ) {
    return status;
  }
  return null;
}

export function buildConnectHref(
  result: GeocodeResult,
  overall?: EligibilityStatus | null,
): string {
  const url = new URL("/", "http://local.invalid");
  url.searchParams.set("address", result.formattedAddress);
  url.searchParams.set("lat", String(result.lat));
  url.searchParams.set("lng", String(result.lng));
  if (result.place) url.searchParams.set("place", result.place);
  if (result.county) url.searchParams.set("county", result.county);
  if (result.region) url.searchParams.set("region", result.region);
  if (result.postcode) url.searchParams.set("postcode", result.postcode);
  if (overall) url.searchParams.set("status", overall);
  const query = url.searchParams.toString();
  return query ? `/?${query}#${CONNECT_SECTION_ID}` : `/#${CONNECT_SECTION_ID}`;
}

export function buildConnectRedirectPath(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const url = new URL("/", "http://local.invalid");
  for (const key of CONNECT_QUERY_KEYS) {
    const value = searchParams[key];
    if (typeof value === "string" && value.length > 0) {
      url.searchParams.set(key, value);
    }
  }
  const query = url.searchParams.toString();
  return query ? `/?${query}#${CONNECT_SECTION_ID}` : `/#${CONNECT_SECTION_ID}`;
}
