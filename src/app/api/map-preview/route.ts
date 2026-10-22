import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  BasemapStaticUpstreamError,
  fetchBasemapRaster,
} from "@/lib/adapters/basemap-static";
import { logger } from "@/lib/logger";
import { mapPreviewQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const log = logger.child({ route: "map-preview" });

/**
 * Esri World Imagery tile (same mosaic as the MapLibre satellite style).
 * Interactive UI uses the GL raster style; this route is the static twin.
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

  try {
    const image = await fetchBasemapRaster(parsed.data);
    log.info(
      {
        bytes: image.bytes.byteLength,
        contentType: image.contentType,
        width: parsed.data.width,
        height: parsed.data.height,
      },
      "Map preview succeeded",
    );
    return new NextResponse(Buffer.from(image.bytes), {
      status: 200,
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "map-preview" } });

    if (err instanceof BasemapStaticUpstreamError) {
      log.error(
        { err: err.message, status: err.status },
        "Satellite raster upstream error",
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
