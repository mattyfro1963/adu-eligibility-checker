import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { FeatureCollection } from "geojson";
import { lookupAssessorParcelInCollection } from "@/lib/adapters/sf-assessor-parcels";
import { buildSfDatasfParcel } from "@/lib/adapters/sf-datasf-zoning";
import { evaluateEligibility } from "@/lib/rules";
import { SB9_FOUR_UNIT_MIN_SQFT } from "@/lib/rules/unit-capacity";

const SAMPLE_PATH = path.join(
  process.cwd(),
  "src/lib/__fixtures__/sf-assessor-parcels-sample.geojson",
);

function loadSample(): FeatureCollection {
  return JSON.parse(readFileSync(SAMPLE_PATH, "utf8")) as FeatureCollection;
}

/** Interior point of the first polygon feature (centroid of first ring). */
function interiorOfFirst(collection: FeatureCollection): {
  lat: number;
  lng: number;
  mapblklot: string | null;
} {
  const feature = collection.features[0]!;
  const geometry = feature.geometry;
  if (
    !geometry ||
    (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
  ) {
    throw new Error("Expected polygon feature");
  }
  const ring =
    geometry.type === "Polygon"
      ? geometry.coordinates[0]!
      : geometry.coordinates[0]![0]!;
  let sumLng = 0;
  let sumLat = 0;
  const n = ring.length - 1;
  for (let i = 0; i < n; i += 1) {
    sumLng += ring[i]![0];
    sumLat += ring[i]![1];
  }
  const mapblklot =
    typeof feature.properties?.mapblklot === "string"
      ? feature.properties.mapblklot
      : null;
  return { lng: sumLng / n, lat: sumLat / n, mapblklot };
}

describe("SF assessor parcels adapter", () => {
  it("resolves mapblklot, boundary, and GIS lotSizeSqFt via PIP", () => {
    const collection = loadSample();
    const { lat, lng, mapblklot } = interiorOfFirst(collection);
    const hit = lookupAssessorParcelInCollection(collection, lat, lng);

    expect(hit).not.toBeNull();
    expect(hit!.boundarySource).toBe("sf-assessor");
    expect(hit!.mapblklot).toBe(mapblklot);
    expect(hit!.lotSizeSqFt).toBeGreaterThan(100);
    expect(
      hit!.parcelBoundary.type === "Polygon" ||
        hit!.parcelBoundary.type === "MultiPolygon",
    ).toBe(true);
  });

  it("merges assessor facts into SF DataSF parcel and drives unit capacity", () => {
    const collection = loadSample();
    const { lat, lng } = interiorOfFirst(collection);
    const hit = lookupAssessorParcelInCollection(collection, lat, lng)!;

    const parcel = buildSfDatasfParcel(lat, lng, "RH-1", "2000 16th Ave", {
      districtName: "Residential House, One Family",
      sourceUrl: null,
      assessor: hit,
    });

    expect(parcel.mapblklot).toBe(hit.mapblklot);
    expect(parcel.lotSizeSqFt).toBe(hit.lotSizeSqFt);
    expect(parcel.parcelBoundary).toEqual(hit.parcelBoundary);
    expect(parcel.boundarySource).toBe("sf-assessor");

    const report = evaluateEligibility(parcel);
    expect(report.parcelBoundary).toEqual(hit.parcelBoundary);
    expect(report.boundarySource).toBe("sf-assessor");
    expect(report.lotSizeSqFt).toBe(hit.lotSizeSqFt);
    expect(report.unitCapacity).not.toBeNull();
    expect(report.unitCapacity!.maxAllowableUnits).toBeGreaterThanOrEqual(2);
  });

  it("marks SB 9 / unit capacity with GIS area above four-unit minimum", () => {
    const collection = loadSample();
    const { lat, lng } = interiorOfFirst(collection);
    const hit = lookupAssessorParcelInCollection(collection, lat, lng)!;

    const parcel = buildSfDatasfParcel(lat, lng, "RH-1", "GIS area lot", {
      districtName: null,
      sourceUrl: null,
      assessor: {
        ...hit,
        lotSizeSqFt: Math.max(hit.lotSizeSqFt, SB9_FOUR_UNIT_MIN_SQFT + 100),
      },
    });

    const report = evaluateEligibility(parcel);
    expect(report.sb9?.status).not.toBe("restricted");
    expect(report.unitCapacity?.maxAllowableUnits).toBe(4);
  });
});
