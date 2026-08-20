import { NextRequest, NextResponse } from "next/server";
import { mockGeocoder } from "@/lib/adapters/mock-geocoder";
import { evaluateEligibility } from "@/lib/rules";
import { zoningQuerySchema } from "@/lib/validations/api-schemas";
import type { Parcel } from "@/lib/types/zoning";

export const dynamic = "force-dynamic";

const MOCK_LATENCY_MS = 600;
const MOCK_ERROR_RATE = 0.08;

export async function GET(request: NextRequest) {
  const addressId = request.nextUrl.searchParams.get("addressId");
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const parsed = zoningQuerySchema.safeParse({
    ...(addressId ? { addressId } : {}),
    ...(lat ? { lat } : {}),
    ...(lng ? { lng } : {}),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid zoning query" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  if (Math.random() < MOCK_ERROR_RATE) {
    return NextResponse.json(
      { error: "Simulated zoning lookup timeout. Please try again." },
      { status: 503 },
    );
  }

  let parcel: Parcel | null = null;
  if (parsed.data.addressId) {
    parcel = await mockGeocoder.getParcel(parsed.data.addressId);
  } else if (parsed.data.lat !== undefined && parsed.data.lng !== undefined) {
    parcel = await mockGeocoder.getParcelByCoordinates(
      parsed.data.lat,
      parsed.data.lng,
    );
  }

  if (!parcel) {
    return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
  }

  const report = evaluateEligibility(parcel);
  return NextResponse.json(report);
}
