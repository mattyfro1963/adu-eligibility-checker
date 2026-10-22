import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parcelFromRegridPointResponse,
  pickRegridGeometry,
  pickRegridLotSizeSqFt,
} from "@/lib/adapters/regrid-zoning";
import { emptyOverlays } from "@/lib/adapters/zoning-overlays";
import { evaluateEligibility } from "@/lib/rules";

const FIXTURE_PATH = path.join(
  process.cwd(),
  "src/lib/__fixtures__/regrid-point-with-geometry.json",
);

describe("Regrid zoning adapter geometry", () => {
  it("parses polygon + ll_gissqft from a point payload", () => {
    const body = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));
    const record = body.parcels.parcels[0];
    expect(pickRegridLotSizeSqFt(record.fields)).toBe(6850);
    expect(pickRegridGeometry(record)?.type).toBe("Polygon");

    const parcel = parcelFromRegridPointResponse(
      body,
      34.0733,
      -118.3418,
      "400 S June St",
      emptyOverlays(),
    );

    expect(parcel).not.toBeNull();
    expect(parcel!.zoning).toBeTruthy();
    expect(parcel!.mapblklot).toBe("123-456-789");
    expect(parcel!.lotSizeSqFt).toBe(6850);
    expect(parcel!.boundarySource).toBe("regrid");
    expect(parcel!.parcelBoundary?.type).toBe("Polygon");

    const report = evaluateEligibility(parcel!);
    expect(report.parcelBoundary).toEqual(parcel!.parcelBoundary);
    expect(report.lotSizeSqFt).toBe(6850);
    expect(report.unitCapacity?.maxAllowableUnits).toBe(4);
  });

  it("keeps zoning-only hits without inventing a polygon", () => {
    const body = {
      results: [
        {
          fields: {
            zoning: "RS",
            parcelnumb: "APN-1",
            ll_gissqft: 4200,
          },
        },
      ],
    };
    const parcel = parcelFromRegridPointResponse(
      body,
      37.77,
      -122.42,
      "",
      emptyOverlays(),
    );
    expect(parcel).not.toBeNull();
    expect(parcel!.lotSizeSqFt).toBe(4200);
    expect(parcel!.parcelBoundary).toBeNull();
    expect(parcel!.boundarySource).toBeNull();
  });
});
