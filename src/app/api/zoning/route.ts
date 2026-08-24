import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { lookupParcel } from "@/lib/adapters/zoning-lookup";
import { logger } from "@/lib/logger";
import { evaluateEligibility, evaluateJurisdictionContext } from "@/lib/rules";
import { zoningQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const LOOKUP_LATENCY_MS = 400;
const log = logger.child({ route: "zoning" });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = params.get("lat");
  const lng = params.get("lng");
  log.info({ lat, lng }, "Incoming zoning request");

  const parsed = zoningQuerySchema.safeParse({
    ...(lat ? { lat } : {}),
    ...(lng ? { lng } : {}),
    ...(params.get("address")
      ? { address: params.get("address") ?? undefined }
      : {}),
    ...(params.get("addressId")
      ? { addressId: params.get("addressId") ?? undefined }
      : {}),
    ...(params.get("place") ? { place: params.get("place") ?? undefined } : {}),
    ...(params.get("county")
      ? { county: params.get("county") ?? undefined }
      : {}),
    ...(params.get("region")
      ? { region: params.get("region") ?? undefined }
      : {}),
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
  const address = parsed.data.address?.trim() ?? "";
  const place = parsed.data.place?.trim() ?? "";
  const county = parsed.data.county?.trim() ?? "";
  const region = parsed.data.region?.trim() ?? "CA";
  const addressId =
    parsed.data.addressId?.trim() ||
    `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

  try {
    const { parcel, coverage, provider } = await lookupParcel(
      latitude,
      longitude,
      address,
    );

    if (parcel && coverage === "lot") {
      const report = {
        ...evaluateEligibility(parcel, { region }),
        zoningProvider: provider,
        coverage: "lot" as const,
      };
      log.info(
        {
          addressId: report.addressId,
          zoning: report.zoning,
          overall: report.overall,
          thowOverall: report.thowOverall,
          aduStatus: report.adu.status,
          placementStatus: report.dimensions.placement.status,
          coverage: "lot",
          provider,
          analysisScope: report.analysisScope,
          overlaysVerified: report.overlaysVerified,
          region,
        },
        "Zoning lookup succeeded",
      );
      return NextResponse.json({
        report,
        coverage: "lot" as const,
        provider,
      });
    }

    const report = evaluateJurisdictionContext({
      addressId,
      formattedAddress: address || `${latitude}, ${longitude}`,
      place,
      county,
      region,
      lat: latitude,
      lng: longitude,
    });

    log.info(
      {
        lat: latitude,
        lng: longitude,
        place,
        county,
        region,
        coverage: "jurisdiction",
        overall: report.overall,
        thowOverall: report.thowOverall,
        aduStatus: report.adu.status,
        placementStatus: report.dimensions.placement.status,
        analysisScope: report.analysisScope,
        status: 200,
      },
      "No lot GIS — jurisdiction-context decision",
    );

    return NextResponse.json({
      report,
      coverage: "jurisdiction" as const,
      provider: null,
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
