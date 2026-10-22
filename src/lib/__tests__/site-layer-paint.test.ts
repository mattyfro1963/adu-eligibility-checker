import { describe, expect, it } from "vitest";
import { MAP_PAINT_FALLBACKS } from "@/lib/map/map-tokens";
import { siteLayerPaint } from "@/lib/map/site-layer-paint";
import { MAPLIBRE_WORKER_PATH } from "@/lib/map/maplibre-worker";

const FILM_CREAM = "#f7f3ed";

describe("siteLayerPaint", () => {
  it("does not wash the parcel or district with film cream", () => {
    const verified = siteLayerPaint(MAP_PAINT_FALLBACKS, true);
    const schematic = siteLayerPaint(MAP_PAINT_FALLBACKS, false);

    expect(verified.lotLineColor.toLowerCase()).not.toBe(FILM_CREAM);
    expect(verified.lotFillColor.toLowerCase()).not.toBe(FILM_CREAM);
    expect(verified.zoneFillColor.toLowerCase()).not.toBe(FILM_CREAM);
    expect(verified.lotLineColor).toBe(MAP_PAINT_FALLBACKS.lotStroke);
    expect(verified.lotFillColor).toBe(MAP_PAINT_FALLBACKS.lotFill);
    expect(verified.zoneFillColor).toBe(MAP_PAINT_FALLBACKS.zoneUnverified);
    expect(verified.lotFillOpacity).toBeGreaterThanOrEqual(0.12);
    expect(schematic.lotFillOpacity).toBeGreaterThan(verified.lotFillOpacity);
    expect(verified.lotHaloWidth).toBeGreaterThan(verified.lotLineWidth);
    expect(verified.zoneFillOpacity).toBeGreaterThanOrEqual(0.2);
  });
});

describe("MapLibre worker pin", () => {
  it("serves the worker from a same-origin App Router path", () => {
    expect(MAPLIBRE_WORKER_PATH).toBe("/api/maplibre-worker");
  });
});
