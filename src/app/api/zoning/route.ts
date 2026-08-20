import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { lookupParcel } from "@/lib/adapters/zoning-lookup";
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
  const address = request.nextUrl.searchParams.get("address")?.trim() ?? "";

  try {
    const { parcel, coverage, provider } = await lookupParcel(
      latitude,
      longitude,
      address,
    );

    if (!parcel || coverage === "none") {
      log.info(
        { lat: latitude, lng: longitude, coverage: "none", status: 200 },
        "No lot zoning provider matched — jurisdiction context only",
      );
      return NextResponse.json({
        report: null,
        coverage: "none" as const,
        provider: null,
      });
    }

    const report = evaluateEligibility(parcel);
    log.info(
      {
        addressId: report.addressId,
        zoning: report.zoning,
        overall: report.overall,
        aduStatus: report.adu.status,
        sb9Status: report.sb9.status,
        coverage: "lot",
        provider,
      },
      "Zoning lookup succeeded",
    );
    return NextResponse.json({
      report,
      coverage: "lot" as const,
      provider,
    });
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
