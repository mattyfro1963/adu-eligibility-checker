import { describe, expect, it } from "vitest";
import {
  buildBasemapRasterUrl,
  lonLatToTile,
} from "@/lib/adapters/basemap-static";
import {
  BASEMAP_ATTRIBUTION,
  BASEMAP_RASTER_URL_TEMPLATE,
  BASEMAP_SOURCE_HREF,
  BASEMAP_SOURCE_LABEL,
  BASEMAP_STYLE,
} from "@/lib/map/basemap";
import { SRC } from "@/lib/regulations/sources";

describe("shared satellite basemap", () => {
  it("uses Esri World Imagery tiles for MapLibre and the static twin", () => {
    expect(BASEMAP_RASTER_URL_TEMPLATE).toContain("arcgisonline.com");
    expect(BASEMAP_RASTER_URL_TEMPLATE).toContain("World_Imagery");
    expect(BASEMAP_RASTER_URL_TEMPLATE).toContain("/tile/{z}/{y}/{x}");
    expect(BASEMAP_STYLE.sources.satellite.tiles).toEqual([
      BASEMAP_RASTER_URL_TEMPLATE,
    ]);
    expect(BASEMAP_STYLE.layers[0]?.source).toBe("satellite");
  });

  it("cites Esri and Maxar with an official Living Atlas catalog link", () => {
    expect(BASEMAP_ATTRIBUTION).toContain("Esri");
    expect(BASEMAP_ATTRIBUTION).toContain("Maxar");
    expect(BASEMAP_STYLE.sources.satellite.attribution).toBe(
      BASEMAP_ATTRIBUTION,
    );
    expect(BASEMAP_SOURCE_HREF).toMatch(
      /^https:\/\/www\.arcgis\.com\/home\/item\.html/,
    );
    expect(SRC.esriWorldImagery.href).toBe(BASEMAP_SOURCE_HREF);
    expect(SRC.esriWorldImagery.label).toBe(BASEMAP_SOURCE_LABEL);
    expect(SRC.mapboxGeocoding.href).toMatch(/^https:\/\/www\.mapbox\.com\//);
  });
});

describe("buildBasemapRasterUrl", () => {
  it("builds an Esri World Imagery tile URL for a San Francisco coordinate", () => {
    const url = buildBasemapRasterUrl(37.7626413, -122.396878, 18);
    expect(url).toMatch(
      /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\/18\/\d+\/\d+$/,
    );
    expect(url).not.toContain("mapbox");
    expect(url).not.toContain("access_token");
    expect(url).not.toContain("cartocdn");
  });

  it("uses slippy-map tile math with Esri {z}/{y}/{x} order", () => {
    const tile = lonLatToTile(-122.396878, 37.7626413, 18);
    expect(tile.z).toBe(18);
    expect(tile.x).toBeGreaterThan(0);
    expect(tile.y).toBeGreaterThan(0);
    const url = buildBasemapRasterUrl(37.7626413, -122.396878, 18);
    expect(url.endsWith(`/18/${tile.y}/${tile.x}`)).toBe(true);
  });
});
