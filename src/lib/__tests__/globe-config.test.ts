import { describe, expect, it } from "vitest";
import {
  CALIFORNIA_CENTROID,
  CALIFORNIA_TILE,
  isValidCoordinate,
  markerAtCoordinate,
  searchTileAtCoordinate,
} from "@/lib/globe/globe-config";

describe("isValidCoordinate", () => {
  it("accepts WGS84 California coordinates", () => {
    expect(isValidCoordinate(37.7749, -122.4194)).toBe(true);
  });

  it("rejects out-of-range latitude", () => {
    expect(isValidCoordinate(91, 0)).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidCoordinate(null, -122)).toBe(false);
  });
});

describe("markerAtCoordinate", () => {
  it("places marker at exact lat/lng", () => {
    const marker = markerAtCoordinate(37.7749, -122.4194);
    expect(marker.lat).toBe(37.7749);
    expect(marker.lng).toBe(-122.4194);
  });
});

describe("CALIFORNIA_CENTROID", () => {
  it("is a valid focus point for idle view", () => {
    expect(isValidCoordinate(CALIFORNIA_CENTROID.lat, CALIFORNIA_CENTROID.lng)).toBe(
      true,
    );
  });
});

describe("searchTileAtCoordinate", () => {
  it("centers tile on exact WGS84 coordinates", () => {
    const tile = searchTileAtCoordinate(37.7749, -122.4194);
    expect(tile.lat).toBe(37.7749);
    expect(tile.lng).toBe(-122.4194);
    expect(tile.width).toBeGreaterThan(0);
  });
});

describe("CALIFORNIA_TILE", () => {
  it("covers California with non-zero angular dimensions", () => {
    expect(CALIFORNIA_TILE.width).toBeGreaterThan(5);
    expect(CALIFORNIA_TILE.height).toBeGreaterThan(5);
  });
});
