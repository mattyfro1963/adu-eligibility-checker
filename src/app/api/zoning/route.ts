import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getPilotParcel } from "@/lib/adapters/pilot-zoning";
import { logger } from "@/lib/logger";
import { evaluateEligibility } from "@/lib/rules";
import { zoningQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const LOOKUP_LATENCY_MS = 400;
const log = logger.child({ route: "zoning" });

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  log.info({ lat, lng }, "Incoming zoning request");

  const parsed = zoningQuerySchema.safeParse({
    ...(lat ? { lat } : {}),
    ...(lng ? { lng } : {}),
  });

  if (!parsed.success) {
    log.warn(
      {
        issues: parsed.error.issues,
        message: parsed.error.issues[0]?.message ?? "Invalid zoning query",
        status: 400,
      },
      "Zoning validation failed",
    );
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid zoning query" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, LOOKUP_LATENCY_MS));

  const { lat: latitude, lng: longitude } = parsed.data;

  try {
    const parcel = await getPilotParcel(latitude, longitude);

    if (!parcel) {
      log.warn(
        { lat: latitude, lng: longitude, status: 404 },
        "Parcel outside California pilot coverage",
      );
      return NextResponse.json(
        {
          error:
            "Location is outside current California pilot zoning coverage. Try an address within pilot coverage (e.g., San Francisco).",
        },
        { status: 404 },
      );
    }

    const report = evaluateEligibility(parcel);
    log.info(
      {
        addressId: report.addressId,
        zoning: report.zoning,
        overall: report.overall,
        aduStatus: report.adu.status,
        sb9Status: report.sb9.status,
      },
      "Zoning lookup succeeded",
    );
    return NextResponse.json(report);
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "zoning" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(
      { err: message, lat: latitude, lng: longitude, status: 500 },
      "Zoning lookup failed",
    );
    return NextResponse.json(
      { error: "Zoning lookup failed" },
      { status: 500 },
    );
  }
}
