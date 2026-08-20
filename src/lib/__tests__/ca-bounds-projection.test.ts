import { describe, expect, it } from "vitest";
import {
  CA_BOUNDS,
  latLngToCaPercent,
} from "@/lib/map/ca-bounds-projection";

describe("CA_BOUNDS", () => {
  it("aligns with CALIFORNIA_TILE angular dimensions", () => {
    expect(CA_BOUNDS.latMin).toBeCloseTo(32.37, 1);
    expect(CA_BOUNDS.latMax).toBeCloseTo(42.17, 1);
    expect(CA_BOUNDS.lngMin).toBeCloseTo(-124.52, 1);
    expect(CA_BOUNDS.lngMax).toBeCloseTo(-114.02, 1);
  });
});

describe("latLngToCaPercent", () => {
  it("projects San Francisco inside the CA box", () => {
    const { x, y } = latLngToCaPercent(37.7749, -122.4194);
    expect(x).toBeGreaterThan(10);
    expect(x).toBeLessThan(30);
    expect(y).toBeGreaterThan(35);
    expect(y).toBeLessThan(55);
  });

  it("projects Los Angeles south and east of San Francisco", () => {
    const sf = latLngToCaPercent(37.7749, -122.4194);
    const la = latLngToCaPercent(34.0522, -118.2437);
    expect(la.x).toBeGreaterThan(sf.x);
    expect(la.y).toBeGreaterThan(sf.y);
  });

  it("clamps out-of-bounds coordinates to 0–100%", () => {
    expect(latLngToCaPercent(50, -130)).toEqual({ x: 0, y: 0 });
    expect(latLngToCaPercent(30, -110)).toEqual({ x: 100, y: 100 });
  });
});
