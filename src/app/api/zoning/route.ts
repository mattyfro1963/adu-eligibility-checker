import { NextRequest, NextResponse } from "next/server";
import { getPilotParcel } from "@/lib/adapters/pilot-zoning";
import { evaluateEligibility } from "@/lib/rules";
import { zoningQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const LOOKUP_LATENCY_MS = 400;

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const parsed = zoningQuerySchema.safeParse({
    ...(lat ? { lat } : {}),
    ...(lng ? { lng } : {}),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid zoning query" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, LOOKUP_LATENCY_MS));

  const { lat: latitude, lng: longitude } = parsed.data;
  const parcel = await getPilotParcel(latitude, longitude);

  if (!parcel) {
    return NextResponse.json(
      {
        error:
          "Location is outside San Francisco pilot zoning coverage. Try an SF address.",
      },
      { status: 404 },
    );
  }

  const report = evaluateEligibility(parcel);
  return NextResponse.json(report);
}
