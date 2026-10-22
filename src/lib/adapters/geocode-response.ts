import type { GeocodeResult } from "@/lib/types/gis";

export type GeocodeMode = "suggest" | "geocode";

export function parseGeocodeMode(raw: string | null): GeocodeMode {
  return raw === "suggest" ? "suggest" : "geocode";
}

/**
 * Autocomplete must never 404 an empty list — the field stays usable.
 * Exact geocode still 404s when no feature can be resolved.
 */
export function geocodeHttpResult(
  mode: GeocodeMode,
  results: GeocodeResult[],
): {
  status: 200 | 404;
  body: { results: GeocodeResult[] } | { error: string };
} {
  if (mode === "suggest") {
    return { status: 200, body: { results } };
  }
  if (results.length === 0) {
    return { status: 404, body: { error: "Address not found" } };
  }
  return { status: 200, body: { results } };
}
