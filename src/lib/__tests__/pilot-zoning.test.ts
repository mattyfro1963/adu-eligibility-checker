import { describe, expect, it } from "vitest";
import type { FeatureCollection } from "geojson";
import {
  buildPilotParcel,
  lookupZoningInCollection,
} from "@/lib/adapters/pilot-zoning";
import { evaluateEligibility } from "@/lib/rules";

/** Tiny fixture — not the full city GeoJSON. Square polygons in WGS84. */
const FIXTURE: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { zoning: "RH-1" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.42, 37.76],
            [-122.41, 37.76],
            [-122.41, 37.77],
            [-122.42, 37.77],
            [-122.42, 37.76],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { zoning: "C-2" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.4, 37.76],
            [-122.39, 37.76],
            [-122.39, 37.77],
            [-122.4, 37.77],
            [-122.4, 37.76],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { zoning: "NC-3" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.38, 37.76],
            [-122.37, 37.76],
            [-122.37, 37.77],
            [-122.38, 37.77],
            [-122.38, 37.76],
          ],
        ],
      },
    },
  ],
};

describe("pilot zoning PIP", () => {
  it("returns RH-1 for a point inside the residential polygon", () => {
    expect(lookupZoningInCollection(FIXTURE, 37.765, -122.415)).toBe("RH-1");
  });

  it("returns C-2 for a point inside the commercial polygon", () => {
    expect(lookupZoningInCollection(FIXTURE, 37.765, -122.395)).toBe("C-2");
  });

  it("returns null outside all polygons", () => {
    expect(lookupZoningInCollection(FIXTURE, 37.5, -122.0)).toBeNull();
  });

  it("RH-1 PIP without lot area / overlay verify → ADU and SB 9 warning; THOW Yellow", () => {
    const zoning = lookupZoningInCollection(FIXTURE, 37.765, -122.415);
    expect(zoning).toBe("RH-1");
    const parcel = buildPilotParcel(37.765, -122.415, zoning!);
    expect(parcel.overlays.fireHazard).toBe(false);
    expect(parcel.overlaysVerified).toBe(false);
    const report = evaluateEligibility(parcel);
    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe("warning");
  });

  it("RH-1 PIP with verified lot + overlays → ADU/SB9 eligible; THOW Yellow without express path", () => {
    const zoning = lookupZoningInCollection(FIXTURE, 37.765, -122.415);
    expect(zoning).toBe("RH-1");
    const parcel = {
      ...buildPilotParcel(37.765, -122.415, zoning!),
      lotSizeSqFt: 5000,
      overlaysVerified: true,
    };
    const report = evaluateEligibility(parcel);
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("eligible");
    // Default model: unknown cert + 11.4 ft transport → Yellow
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe("warning");
  });

  it("C-2 PIP → ADU/placement restricted → THOW Red", () => {
    const zoning = lookupZoningInCollection(FIXTURE, 37.765, -122.395);
    expect(zoning).toBe("C-2");
    const report = evaluateEligibility(
      buildPilotParcel(37.765, -122.395, zoning!),
    );
    expect(report.adu.status).toBe("restricted");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.dimensions.placement.status).toBe("restricted");
    expect(report.thowOverall).toBe("restricted");
    expect(report.overall).toBe("restricted");
  });

  it("NC-3 PIP → ADU warning when overlays unchecked, SB 9 restricted; THOW Yellow", () => {
    const zoning = lookupZoningInCollection(FIXTURE, 37.765, -122.375);
    expect(zoning).toBe("NC-3");
    const report = evaluateEligibility(
      buildPilotParcel(37.765, -122.375, zoning!),
    );
    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe("warning");
  });

  it("NC-3 PIP with verified overlays → ADU eligible, SB 9 restricted; THOW Yellow", () => {
    const zoning = lookupZoningInCollection(FIXTURE, 37.765, -122.375);
    expect(zoning).toBe("NC-3");
    const report = evaluateEligibility({
      ...buildPilotParcel(37.765, -122.375, zoning!),
      overlaysVerified: true,
      lotSizeSqFt: 5000,
    });
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe("warning");
  });
});
