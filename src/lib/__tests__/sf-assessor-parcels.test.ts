import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeatureCollection } from "geojson";
import {
  DATASF_ASSESSOR_GEOJSON_URL,
  isLngLatInSanFrancisco,
  lookupAssessorParcelInCollection,
  lookupSfAssessorParcel,
  resetSfAssessorParcelsCacheForTests,
} from "@/lib/adapters/sf-assessor-parcels";
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

const MISSION_LAT = 37.762383;
const MISSION_LNG = -122.4146;
const PARKSIDE_LAT = 37.750511;
const PARKSIDE_LNG = -122.47265;
const OAKLAND_LAT = 37.823903;
const OAKLAND_LNG = -122.255463;

function missionParcelCollection(): FeatureCollection {
  const ring: [number, number][] = [
    [-122.4149, 37.7621],
    [-122.4143, 37.7621],
    [-122.4143, 37.7626],
    [-122.4149, 37.7626],
    [-122.4149, 37.7621],
  ];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "MultiPolygon", coordinates: [[ring]] },
        properties: {
          mapblklot: "3573003",
          blklot: "3573003",
          active: true,
          from_address_num: "3180",
          to_address_num: "3198",
          street_name: "18TH",
          street_type: "ST",
        },
      },
    ],
  };
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

describe("SF city bbox", () => {
  it("includes Mission and Parkside, excludes Oakland", () => {
    expect(isLngLatInSanFrancisco(MISSION_LNG, MISSION_LAT)).toBe(true);
    expect(isLngLatInSanFrancisco(PARKSIDE_LNG, PARKSIDE_LAT)).toBe(true);
    expect(isLngLatInSanFrancisco(OAKLAND_LNG, OAKLAND_LAT)).toBe(false);
  });
});

describe("SF assessor DataSF point fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetSfAssessorParcelsCacheForTests();
  });

  it("does not fetch DataSF when the local snapshot already covers the lot", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    resetSfAssessorParcelsCacheForTests();

    const hit = await lookupSfAssessorParcel(PARKSIDE_LAT, PARKSIDE_LNG);
    expect(hit).not.toBeNull();
    expect(hit!.mapblklot).toBe("2135013");
    expect(hit!.parcelBoundary).toBeTruthy();
    expect(hit!.lotSizeSqFt).toBeGreaterThan(100);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("binds APN / area / outline from a DataSF point query when the snapshot misses", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const href = String(input);
      expect(href).toContain(DATASF_ASSESSOR_GEOJSON_URL);
      expect(href).toMatch(/intersects|within_circle/);
      return jsonResponse(missionParcelCollection());
    });
    vi.stubGlobal("fetch", fetchMock);
    resetSfAssessorParcelsCacheForTests();

    const hit = await lookupSfAssessorParcel(MISSION_LAT, MISSION_LNG);
    expect(fetchMock).toHaveBeenCalled();
    expect(hit).not.toBeNull();
    expect(hit!.mapblklot).toBe("3573003");
    expect(hit!.boundarySource).toBe("sf-assessor");
    expect(hit!.parcelBoundary.type).toMatch(/Polygon/);
    expect(hit!.lotSizeSqFt).toBeGreaterThan(100);

    const parcel = buildSfDatasfParcel(
      MISSION_LAT,
      MISSION_LNG,
      "PDR-1-G",
      "3180 18th Street, San Francisco, CA",
      { assessor: hit },
    );
    const report = evaluateEligibility(parcel);
    expect(report.mapblklot).toBe("3573003");
    expect(report.lotSizeSqFt).toBe(hit!.lotSizeSqFt);
    expect(report.parcelBoundary).toEqual(hit!.parcelBoundary);
    expect(report.unitCapacity).not.toBeNull();
  });

  it("does not query DataSF for Oakland coordinates", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    resetSfAssessorParcelsCacheForTests();

    const hit = await lookupSfAssessorParcel(OAKLAND_LAT, OAKLAND_LNG);
    expect(hit).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails soft when DataSF is unreachable — district PIP still owns zoning", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    });
    vi.stubGlobal("fetch", fetchMock);
    resetSfAssessorParcelsCacheForTests();

    const hit = await lookupSfAssessorParcel(MISSION_LAT, MISSION_LNG);
    expect(hit).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });
});
