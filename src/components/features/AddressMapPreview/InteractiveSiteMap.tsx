"use client";

import { useEffect, useMemo, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Minus, Plus } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FeaturePin } from "@/components/features/AddressMapPreview/FeaturePin";
import { BASEMAP_STYLE, PARCEL_MAP_ZOOM } from "@/lib/map/basemap";
import {
  boundsFromParcelBoundary,
  buildApproximateSiteGeoJSON,
  type ApproximateSiteGeoJSON,
  type ParcelBoundaryGeometry,
} from "@/lib/map/approximate-site";
import { ensureMapLibreWorker } from "@/lib/map/maplibre-worker";
import {
  mapZoneColor,
  readMapPaintTokens,
  type MapPaintTokens,
} from "@/lib/map/map-tokens";
import {
  siteLayerPaint,
  type SiteLayerPaint,
} from "@/lib/map/site-layer-paint";
import type {
  EligibilityStatus,
  ZoningAnalysisScope,
} from "@/lib/types/zoning";

const MIN_ZOOM = 13;
const MAX_ZOOM = 20;

function zonePaintColor(
  tokens: MapPaintTokens,
  _status: EligibilityStatus | null,
  _analysisVerified: boolean,
): string {
  // Schematic envelopes stay neutral — eligibility color lives on the pin/badge.
  void _status;
  void _analysisVerified;
  return mapZoneColor(tokens, "unverified");
}

function paintExistingSiteLayers(
  map: maplibregl.Map,
  paint: SiteLayerPaint,
  color: string,
) {
  map.setPaintProperty("site-zoning-fill", "fill-color", color);
  map.setPaintProperty(
    "site-zoning-fill",
    "fill-opacity",
    paint.zoneFillOpacity,
  );
  if (map.getLayer("site-zoning-halo")) {
    map.setPaintProperty("site-zoning-halo", "line-color", paint.zoneHaloColor);
    map.setPaintProperty("site-zoning-halo", "line-width", paint.zoneHaloWidth);
    map.setPaintProperty("site-zoning-halo", "line-dasharray", paint.zoneDash);
  }
  map.setPaintProperty("site-zoning-line", "line-color", paint.zoneLineColor);
  map.setPaintProperty("site-zoning-line", "line-width", paint.zoneLineWidth);
  map.setPaintProperty("site-zoning-line", "line-dasharray", paint.zoneDash);
  map.setPaintProperty("site-lot-fill", "fill-color", paint.lotFillColor);
  map.setPaintProperty("site-lot-fill", "fill-opacity", paint.lotFillOpacity);
  if (map.getLayer("site-lot-halo")) {
    map.setPaintProperty("site-lot-halo", "line-color", paint.lotHaloColor);
    map.setPaintProperty("site-lot-halo", "line-width", paint.lotHaloWidth);
    map.setPaintProperty("site-lot-halo", "line-dasharray", paint.lotDash);
  }
  map.setPaintProperty("site-lot-line", "line-color", paint.lotLineColor);
  map.setPaintProperty("site-lot-line", "line-width", paint.lotLineWidth);
  map.setPaintProperty("site-lot-line", "line-dasharray", paint.lotDash);
}

function applySiteLayers(
  map: maplibregl.Map,
  site: ApproximateSiteGeoJSON,
  color: string,
  tokens: MapPaintTokens,
  /**
   * Solid ink lot stroke when a GIS parcel outline is present; dashed when
   * the lot ring is schematic (even if area was verified).
   */
  boundaryVerified: boolean,
) {
  const paint = siteLayerPaint(tokens, boundaryVerified);
  const zoningSource = map.getSource("site-zoning") as
    { setData: (data: ApproximateSiteGeoJSON["zoning"]) => void } | undefined;
  const lotSource = map.getSource("site-lot") as
    { setData: (data: ApproximateSiteGeoJSON["lot"]) => void } | undefined;

  if (zoningSource) {
    zoningSource.setData(site.zoning);
    lotSource?.setData(site.lot);
    paintExistingSiteLayers(map, paint, color);
    return;
  }

  map.addSource("site-zoning", {
    type: "geojson",
    data: site.zoning,
  });
  map.addSource("site-lot", {
    type: "geojson",
    data: site.lot,
  });

  map.addLayer({
    id: "site-zoning-fill",
    type: "fill",
    source: "site-zoning",
    paint: {
      "fill-color": color,
      "fill-opacity": paint.zoneFillOpacity,
    },
  });
  map.addLayer({
    id: "site-zoning-halo",
    type: "line",
    source: "site-zoning",
    paint: {
      "line-color": paint.zoneHaloColor,
      "line-width": paint.zoneHaloWidth,
      "line-opacity": 0.85,
      "line-dasharray": paint.zoneDash,
    },
  });
  map.addLayer({
    id: "site-zoning-line",
    type: "line",
    source: "site-zoning",
    paint: {
      "line-color": paint.zoneLineColor,
      "line-width": paint.zoneLineWidth,
      "line-dasharray": paint.zoneDash,
    },
  });
  map.addLayer({
    id: "site-lot-fill",
    type: "fill",
    source: "site-lot",
    paint: {
      "fill-color": paint.lotFillColor,
      "fill-opacity": paint.lotFillOpacity,
    },
  });
  map.addLayer({
    id: "site-lot-halo",
    type: "line",
    source: "site-lot",
    paint: {
      "line-color": paint.lotHaloColor,
      "line-width": paint.lotHaloWidth,
      "line-opacity": 0.9,
      "line-dasharray": paint.lotDash,
    },
  });
  map.addLayer({
    id: "site-lot-line",
    type: "line",
    source: "site-lot",
    paint: {
      "line-color": paint.lotLineColor,
      "line-width": paint.lotLineWidth,
      "line-dasharray": paint.lotDash,
    },
  });
}

function renderFeaturePin(
  root: Root,
  status: EligibilityStatus | null,
  label: string | null,
  interactive: boolean,
) {
  root.render(
    <FeaturePin
      status={status ?? undefined}
      label={label ?? undefined}
      interactive={interactive && Boolean(label?.trim())}
    />,
  );
}

type InteractiveSiteMapProps = {
  lat: number;
  lng: number;
  status?: EligibilityStatus | null;
  label?: string | null;
  lotSizeSqFt?: number | null;
  parcelBoundary?: ParcelBoundaryGeometry | null;
  zoning?: string | null;
  analysisScope?: ZoningAnalysisScope | null;
  interactive?: boolean;
  /** Draw lot + zoning GeoJSON. Off for interstitial backdrops. */
  showSiteLayers?: boolean;
};

export function InteractiveSiteMap({
  lat,
  lng,
  status = null,
  label = null,
  lotSizeSqFt = null,
  parcelBoundary = null,
  zoning = null,
  analysisScope = null,
  interactive = true,
  showSiteLayers = true,
}: InteractiveSiteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const markerRootRef = useRef<Root | null>(null);

  const lotVerified =
    analysisScope === "lot_zoning" && lotSizeSqFt != null && lotSizeSqFt > 0;
  const boundaryVerified = parcelBoundary != null;
  const analysisVerified = analysisScope === "lot_zoning";
  const site = useMemo(
    () =>
      buildApproximateSiteGeoJSON({
        lat,
        lng,
        lotSizeSqFt,
        lotVerified,
        zoning,
        parcelBoundary,
      }),
    [lat, lng, lotSizeSqFt, lotVerified, zoning, parcelBoundary],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const tokens = readMapPaintTokens(container);
    const color = zonePaintColor(tokens, status, analysisVerified);
    ensureMapLibreWorker();

    const map = new maplibregl.Map({
      container,
      style: BASEMAP_STYLE,
      center: [lng, lat],
      zoom: PARCEL_MAP_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      interactive,
      attributionControl: {
        compact: false,
        customAttribution:
          '<a href="https://www.mapbox.com/about/maps/">© Mapbox</a>',
      },
    });
    mapRef.current = map;

    const markerNode = document.createElement("div");
    const root = createRoot(markerNode);
    markerRootRef.current = root;
    renderFeaturePin(root, status, label, interactive);
    const marker = new maplibregl.Marker({
      element: markerNode,
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current = marker;

    const onLoad = () => {
      map.resize();
      if (showSiteLayers) {
        applySiteLayers(map, site, color, tokens, boundaryVerified);
      }
      if (parcelBoundary) {
        const bounds = boundsFromParcelBoundary(parcelBoundary);
        if (bounds) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 19, duration: 0 });
        }
      }
    };
    map.on("load", onLoad);

    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.off("load", onLoad);
      marker.remove();
      markerRef.current = null;
      markerRootRef.current = null;
      map.remove();
      mapRef.current = null;
      // Nested createRoot cannot unmount while React is still rendering
      // (Strict Mode remount / parent commit). Defer to the next task.
      setTimeout(() => {
        root.unmount();
      }, 0);
    };
    // Pin copy and site layers update in sibling effects so status/lot
    // changes do not tear down the GL map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, interactive, showSiteLayers]);

  useEffect(() => {
    const root = markerRootRef.current;
    if (!root) {
      return;
    }
    renderFeaturePin(root, status, label, interactive);
  }, [status, label, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) {
      return;
    }
    if (!showSiteLayers) {
      return;
    }
    const tokens = readMapPaintTokens(containerRef.current);
    const color = zonePaintColor(tokens, status, analysisVerified);
    applySiteLayers(map, site, color, tokens, boundaryVerified);
    if (parcelBoundary) {
      const bounds = boundsFromParcelBoundary(parcelBoundary);
      if (bounds) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 19, duration: 280 });
      }
    }
  }, [
    site,
    status,
    analysisVerified,
    boundaryVerified,
    parcelBoundary,
    showSiteLayers,
  ]);

  function zoomBy(delta: number) {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    map.zoomTo(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, map.getZoom() + delta)), {
      duration: 220,
    });
  }

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="h-full w-full transform-none [filter:none] [&_.maplibregl-canvas]:[filter:none] [&_.maplibregl-ctrl-attrib]:max-w-[min(100%,22rem)] [&_.maplibregl-ctrl-attrib]:bg-card/90 [&_.maplibregl-ctrl-attrib]:px-2 [&_.maplibregl-ctrl-attrib]:text-[10px] [&_.maplibregl-ctrl-attrib]:leading-snug"
        aria-label={
          label && label.trim().length > 0
            ? `Interactive map of ${label.trim()}`
            : "Interactive site map"
        }
      />
      {interactive ? (
        <div className="absolute top-3 right-3 z-20 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          <button
            type="button"
            onClick={() => zoomBy(1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label="Zoom in"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <span className="h-px bg-border" aria-hidden="true" />
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label="Zoom out"
          >
            <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
