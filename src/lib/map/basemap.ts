/**
 * Shared basemap — current high-resolution satellite / aerial mosaic.
 *
 * Source: Esri World Imagery (Living Atlas). Urban tiles are Maxar Vivid
 * (WorldView Legion in 2025 releases) plus community aerial. Esri publishes
 * mosaic updates about monthly. That is the most current lot-scale imagery
 * available without a paid live-tasking feed — not a minute-by-minute
 * satellite stream, and not a street map.
 *
 * Interactive MapLibre and the static preview use the same XYZ tiles.
 * Geocoding can stay Mapbox. Basemap tiles must not.
 */

/** Esri World Imagery — XYZ is {z}/{y}/{x} (row before column). */
export const BASEMAP_RASTER_URL_TEMPLATE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export const BASEMAP_ATTRIBUTION =
  "Esri, Maxar, Earthstar Geographics, and the GIS User Community";

/** Official Living Atlas item — catalog page, not a tile endpoint. */
export const BASEMAP_SOURCE_LABEL = "Esri World Imagery (Maxar)";
export const BASEMAP_SOURCE_HREF =
  "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9";

/**
 * MapLibre style for the shared satellite mosaic. Raster-only — no glyphs.
 * Keep this object in sync with the motion demo copies.
 */
export const BASEMAP_STYLE = {
  version: 8 as const,
  name: "Esri World Imagery",
  sources: {
    satellite: {
      type: "raster" as const,
      tiles: [BASEMAP_RASTER_URL_TEMPLATE],
      tileSize: 256,
      maxzoom: 19,
      attribution: BASEMAP_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster" as const,
      source: "satellite",
    },
  ],
};

export const STATIC_MAP_DEFAULTS = {
  width: 640,
  height: 480,
  zoom: 15,
} as const;

/** Tight zoom so an urban lot reads as a site, not a city pin. */
export const PARCEL_MAP_ZOOM = 18;
