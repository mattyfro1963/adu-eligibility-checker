import { NextResponse } from "next/server";
import {
  isAddressHintError,
  synthesizeParcelFromHints,
} from "@/lib/mock/address-hints";
import { evaluateEligibility } from "@/lib/rules";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
import { CALIFORNIA_CENTROID } from "@/lib/globe/globe-config";

const MOCK_GIS_LATENCY_MS = 1500;

type AddressSearchPayload = {
  address?: string;
};

/**
 * Dev/test harness: mock GIS latency + address-hint parcel synthesis.
 * Not used by production page.tsx (geocode → /api/zoning).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddressSearchPayload;

    if (!body.address || body.address.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid California street address is required." },
        { status: 400 },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, MOCK_GIS_LATENCY_MS));

    if (isAddressHintError(body.address)) {
      return NextResponse.json(
        { error: "GIS spatial engine failed to resolve parcel coordinates." },
        { status: 500 },
      );
    }

    const parcel = synthesizeParcelFromHints(body.address, {
      lat: CALIFORNIA_CENTROID.lat,
      lng: CALIFORNIA_CENTROID.lng,
    });

    const report = evaluateEligibility(parcel);
    const evaluations = buildStatutoryEvaluations(parcel, report);

    return NextResponse.json(
      {
        report,
        evaluations,
        coverage: "lot" as const,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "An unexpected internal error occurred processing parcel GIS boundaries.",
      },
      { status: 500 },
    );
  }
}
