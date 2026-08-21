import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCHEMATIC_LOT_SQFT,
  buildApproximateSiteGeoJSON,
  buildApproximateSiteOverlay,
  metersPerPixel,
  siteSeed,
} from "@/lib/map/approximate-site";
import { isAllowedMapboxProxyPath } from "@/lib/adapters/mapbox-proxy";

describe("approximate site overlay", () => {
  it("is deterministic for the same coordinate", () => {
    expect(siteSeed(37.75307, -122.4066)).toBe(siteSeed(37.75307, -122.4066));
    expect(siteSeed(37.75307, -122.4066)).not.toBe(siteSeed(37.75, -122.4));
  });

  it("shrinks meters-per-pixel as zoom increases", () => {
    const z15 = metersPerPixel(37.75, 15);
    const z18 = metersPerPixel(37.75, 18);
    expect(z18).toBeLessThan(z15 / 4);
    expect(z18).toBeGreaterThan(0.3);
    expect(z18).toBeLessThan(0.7);
  });

  it("uses schematic area when lot GIS is unverified", () => {
    const site = buildApproximateSiteOverlay({
      lat: 37.75307,
      lng: -122.4066,
      width: 640,
      height: 480,
      zoom: 18,
      lotSizeSqFt: 6850,
      lotVerified: false,
      zoning: "RH-1",
    });

    expect(site.lot.verified).toBe(false);
    expect(site.lot.areaSqFt).toBe(DEFAULT_SCHEMATIC_LOT_SQFT);
    expect(site.lot.points).toHaveLength(4);
    expect(site.zoning.points).toHaveLength(8);
    expect(site.zoning.label).toBe("RH-1");
    expect(site.lot.path.startsWith("M ")).toBe(true);
    expect(site.zoning.path.endsWith("Z")).toBe(true);
  });

  it("uses measured lot area when verified and keeps polygons on-canvas", () => {
    const site = buildApproximateSiteOverlay({
      lat: 37.7749,
      lng: -122.4194,
      width: 640,
      height: 480,
      zoom: 18,
      lotSizeSqFt: 2500,
      lotVerified: true,
      zoning: "RH-1",
    });

    expect(site.lot.verified).toBe(true);
    expect(site.lot.areaSqFt).toBe(2500);

    for (const point of [...site.lot.points, ...site.zoning.points]) {
      expect(point.x).toBeGreaterThan(40);
      expect(point.x).toBeLessThan(600);
      expect(point.y).toBeGreaterThan(40);
      expect(point.y).toBeLessThan(440);
    }

    const lotXs = site.lot.points.map((p) => p.x);
    const zoneXs = site.zoning.points.map((p) => p.x);
    expect(Math.max(...zoneXs) - Math.min(...zoneXs)).toBeGreaterThan(
      Math.max(...lotXs) - Math.min(...lotXs),
    );
  });

  it("builds WGS84 polygons that enclose the geocode", () => {
    const site = buildApproximateSiteGeoJSON({
      lat: 33.68635,
      lng: -117.82658,
      lotSizeSqFt: 5000,
      lotVerified: true,
      zoning: "R-1",
    });
    const ring = site.lot.geometry.coordinates[0];
    const lngs = ring.map((point) => point[0]);
    const lats = ring.map((point) => point[1]);

    expect(site.verified).toBe(true);
    expect(site.zoningLabel).toBe("R-1");
    expect(Math.min(...lngs)).toBeLessThan(-117.82658);
    expect(Math.max(...lngs)).toBeGreaterThan(-117.82658);
    expect(Math.min(...lats)).toBeLessThan(33.68635);
    expect(Math.max(...lats)).toBeGreaterThan(33.68635);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });
});

describe("Mapbox GL proxy allowlist", () => {
  it("allows style, font, tile, and session paths", () => {
    expect(isAllowedMapboxProxyPath("styles/v1/mapbox/streets-v12")).toBe(true);
    expect(
      isAllowedMapboxProxyPath("fonts/v1/mapbox/Arial%20Unicode/0-255.pbf"),
    ).toBe(true);
    expect(
      isAllowedMapboxProxyPath("v4/mapbox.mapbox-streets-v8/12/0/0.vector.pbf"),
    ).toBe(true);
    expect(isAllowedMapboxProxyPath("map-sessions/v1")).toBe(true);
  });

  it("rejects traversal and unrelated APIs", () => {
    expect(isAllowedMapboxProxyPath("../secrets")).toBe(false);
    expect(isAllowedMapboxProxyPath("geocoding/v5/mapbox.places/1.json")).toBe(
      false,
    );
  });
});
