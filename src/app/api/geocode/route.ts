import { NextRequest, NextResponse } from "next/server";
import { mockGeocoder } from "@/lib/adapters/mock-geocoder";
import { geocodeQuerySchema } from "@/lib/validations/api-schemas";

export const dynamic = "force-dynamic";

const MOCK_LATENCY_MS = 400;
const MOCK_ERROR_RATE = 0.08;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const parsed = geocodeQuerySchema.safeParse({ q });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  if (Math.random() < MOCK_ERROR_RATE) {
    return NextResponse.json(
      { error: "Simulated geocoding timeout. Please try again." },
      { status: 503 },
    );
  }

  const results = await mockGeocoder.searchSuggestions(parsed.data.q);

  if (results.length === 0) {
    const exact = await mockGeocoder.geocode(parsed.data.q);
    if (!exact) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    return NextResponse.json({ results: [exact] });
  }

  return NextResponse.json({ results });
}
