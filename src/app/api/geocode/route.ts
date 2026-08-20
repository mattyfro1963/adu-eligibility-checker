import { NextRequest, NextResponse } from "next/server";
import {
  MapboxConfigError,
  MapboxUpstreamError,
  mapboxGeocoder,
} from "@/lib/adapters/mapbox-geocoder";
import { env } from "@/lib/env";
import { geocodeQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

function geocodingUnavailable(status: 502 | 503) {
  return NextResponse.json(
    { error: "Geocoding service unavailable" },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const parsed = geocodeQuerySchema.safeParse({ q });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  // CA-only Mapbox; zoning still mock.
  if (!env.MAPBOX_ACCESS_TOKEN?.trim()) {
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
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ results: [exact] });
    }

    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof MapboxConfigError) {
      return NextResponse.json(
        { error: "Geocoding is not configured" },
        { status: 500 },
      );
    }
    if (err instanceof MapboxUpstreamError) {
      return geocodingUnavailable(err.status);
    }
    return geocodingUnavailable(502);
  }
}
