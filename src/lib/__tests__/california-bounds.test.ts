import { describe, expect, it } from "vitest";
import {
  CALIFORNIA_CENTROID,
  CALIFORNIA_TILE,
} from "@/lib/map/california-bounds";

describe("CALIFORNIA_CENTROID", () => {
  it("is a valid WGS84 point inside California", () => {
    expect(CALIFORNIA_CENTROID.lat).toBeGreaterThan(32);
    expect(CALIFORNIA_CENTROID.lat).toBeLessThan(42);
    expect(CALIFORNIA_CENTROID.lng).toBeLessThan(-114);
    expect(CALIFORNIA_CENTROID.lng).toBeGreaterThan(-125);
  });
});

describe("CALIFORNIA_TILE", () => {
  it("covers California with non-zero angular dimensions", () => {
    expect(CALIFORNIA_TILE.width).toBeGreaterThan(5);
    expect(CALIFORNIA_TILE.height).toBeGreaterThan(5);
  });
});
