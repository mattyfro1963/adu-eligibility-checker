import { NextRequest, NextResponse } from "next/server";
import {
  MapboxConfigError,
  MapboxUpstreamError,
  mapboxGeocoder,
} from "@/lib/adapters/mapbox-geocoder";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { geocodeQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const log = logger.child({ route: "geocode" });

function geocodingUnavailable(status: 502 | 503) {
  return NextResponse.json(
    { error: "Geocoding service unavailable" },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  log.info({ q }, "Incoming geocode request");

  const parsed = geocodeQuerySchema.safeParse({ q });

  if (!parsed.success) {
    log.warn(
      {
        message: parsed.error.issues[0]?.message ?? "Invalid query",
        status: 400,
      },
      "Geocode validation failed",
    );
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  // CA-only Mapbox geocode; zoning uses local DataSF GeoJSON + Turf PIP.
  if (!env.MAPBOX_ACCESS_TOKEN?.trim()) {
    log.error({ status: 500 }, "Missing Mapbox access token");
    return NextResponse.json(
      { error: "Geocoding is not configured" },
      { status: 500 },
    );
  }

  try {
    const results = await mapboxGeocoder.searchSuggestions(parsed.data.q);

    if (results.length === 0) {
      const exact = await mapboxGeocoder.geocode(parsed.data.q);
      if (!exact) {
        log.warn({ q: parsed.data.q, status: 404 }, "Address not found");
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 },
        );
      }
      log.info({ resultCount: 1, mode: "exact" }, "Geocode succeeded");
      return NextResponse.json({ results: [exact] });
    }

    log.info(
      { resultCount: results.length, mode: "suggestions" },
      "Geocode succeeded",
    );
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof MapboxConfigError) {
      log.error({ err: err.message, status: 500 }, "Mapbox config error");
      return NextResponse.json(
        { error: "Geocoding is not configured" },
        { status: 500 },
      );
    }
    if (err instanceof MapboxUpstreamError) {
      log.error(
        { err: err.message, status: err.status },
        "Mapbox upstream error",
      );
      return geocodingUnavailable(err.status);
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ err: message, status: 502 }, "Geocode unexpected error");
    return geocodingUnavailable(502);
  }
}
