import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  MapboxStaticConfigError,
  MapboxStaticUpstreamError,
  fetchMapboxStaticPng,
} from "@/lib/adapters/mapbox-static";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { mapPreviewQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const log = logger.child({ route: "map-preview" });

/**
 * Proxy Mapbox Static Images so the access token stays server-side.
 * Missing token → 204 (UI shows calm empty / awaiting state).
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  log.info(
    { lat: params.lat, lng: params.lng },
    "Incoming map-preview request",
  );

  const parsed = mapPreviewQuerySchema.safeParse(params);

  if (!parsed.success) {
    log.warn(
      {
        message: parsed.error.issues[0]?.message ?? "Invalid map preview query",
        status: 400,
      },
      "Map-preview validation failed",
    );
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid map preview query",
      },
      { status: 400 },
    );
  }

  if (!env.MAPBOX_ACCESS_TOKEN?.trim()) {
    log.warn({ status: 204 }, "Mapbox unset — no map preview");
    return new NextResponse(null, { status: 204 });
  }

  try {
    const png = await fetchMapboxStaticPng(parsed.data);
    log.info(
      {
        bytes: png.byteLength,
        width: parsed.data.width,
        height: parsed.data.height,
      },
      "Map preview succeeded",
    );
    return new NextResponse(Buffer.from(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    if (err instanceof MapboxStaticConfigError) {
      log.warn({ status: 204 }, "Mapbox config missing at fetch");
      return new NextResponse(null, { status: 204 });
    }

    Sentry.captureException(err, { tags: { route: "map-preview" } });

    if (err instanceof MapboxStaticUpstreamError) {
      log.error(
        { err: err.message, status: err.status },
        "Mapbox static upstream error",
      );
      return NextResponse.json(
        { error: "Map preview unavailable" },
        { status: err.status },
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ err: message, status: 502 }, "Map-preview unexpected error");
    return NextResponse.json(
      { error: "Map preview unavailable" },
      { status: 502 },
    );
  }
}
