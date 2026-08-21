import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { mapboxRequestHeaders } from "@/lib/adapters/mapbox-headers";
import { isAllowedMapboxProxyPath } from "@/lib/adapters/mapbox-proxy";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ route: "mapbox-proxy" });

/**
 * Proxy Mapbox styles/tiles/fonts so GL can run without a NEXT_PUBLIC token.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const joined = path.join("/");

  if (!isAllowedMapboxProxyPath(joined)) {
    log.warn({ path: joined, status: 404 }, "Blocked Mapbox proxy path");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!token) {
    return new NextResponse(null, { status: 204 });
  }

  const upstream = new URL(`https://api.mapbox.com/${joined}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "access_token") {
      upstream.searchParams.set(key, value);
    }
  });
  upstream.searchParams.set("access_token", token);

  try {
    const response = await fetch(upstream, {
      // URL-restricted pk tokens require a Referer; same helper as
      // geocode + static map so the dashboard allowlist keeps working.
      headers: mapboxRequestHeaders({
        Accept: request.headers.get("Accept") ?? "*/*",
      }),
      // Do not cache upstream 403s (restricted token, missing Referer).
      cache: "no-store",
    });

    const contentType =
      response.headers.get("Content-Type") ?? "application/octet-stream";

    if (!response.ok) {
      log.warn(
        { path: joined, status: response.status },
        "Mapbox proxy upstream rejected",
      );
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    }

    const cacheControl =
      response.headers.get("Cache-Control") ??
      "public, max-age=3600, stale-while-revalidate=86400";

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "mapbox-proxy" } });
    log.error({ err, status: 502 }, "Mapbox proxy upstream failed");
    return NextResponse.json({ error: "Map unavailable" }, { status: 502 });
  }
}
