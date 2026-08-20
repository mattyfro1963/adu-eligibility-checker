import { describe, expect, it } from "vitest";
import {
  STATIC_MAP_DEFAULTS,
  buildMapboxStaticUrl,
} from "@/lib/adapters/mapbox-static";

describe("buildMapboxStaticUrl", () => {
  it("builds a light-v11 static URL with pin overlay and token", () => {
    const url = buildMapboxStaticUrl({
      lat: 37.7749,
      lng: -122.4194,
      accessToken: "pk.test-token",
    });

    expect(url).toContain(
      "https://api.mapbox.com/styles/v1/mapbox/light-v11/static/",
    );
    expect(url).toContain("pin-s+333333(-122.4194,37.7749)");
    expect(url).toContain(
      `/-122.4194,37.7749,${STATIC_MAP_DEFAULTS.zoom},0/${STATIC_MAP_DEFAULTS.width}x${STATIC_MAP_DEFAULTS.height}@2x`,
    );
    expect(url).toContain("access_token=pk.test-token");
  });

  it("respects custom width, height, and zoom", () => {
    const url = buildMapboxStaticUrl({
      lat: 37.7,
      lng: -122.4,
      width: 800,
      height: 450,
      zoom: 16,
      accessToken: "pk.x",
    });

    expect(url).toContain("/-122.4,37.7,16,0/800x450@2x");
  });
});
