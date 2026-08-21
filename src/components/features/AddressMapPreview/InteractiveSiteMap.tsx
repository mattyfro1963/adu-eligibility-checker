"use client";

import { useEffect, useMemo, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Minus, Plus } from "lucide-react";
import mapboxgl, { type GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeaturePin } from "@/components/features/AddressMapPreview/FeaturePin";
import { PARCEL_MAP_ZOOM } from "@/lib/adapters/mapbox-static";
import {
  buildApproximateSiteGeoJSON,
  type ApproximateSiteGeoJSON,
} from "@/lib/map/approximate-site";
import type {
  EligibilityStatus,
  ZoningAnalysisScope,
} from "@/lib/types/zoning";

const MIN_ZOOM = 13;
const MAX_ZOOM = 20;

const ZONE_COLOR: Record<EligibilityStatus | "unverified", string> = {
  eligible: "#059669",
  warning: "#d97706",
  restricted: "#e11d48",
  unverified: "#6b7280",
};

if (typeof window !== "undefined") {
  // GL JS requires a pk.* client token, but session auth XHR bypasses
  // transformRequest. Point the API host at our proxy so the real
  // MAPBOX_ACCESS_TOKEN stays server-side. EVENTS_URL is a getter derived
  // from API_URL — do not assign it (throws in mapbox-gl 3.29).
  mapboxgl.accessToken = "pk.proxy";
  mapboxgl.baseApiUrl = `${window.location.origin}/api/mapbox`;
}

function proxyMapboxRequest(
  url: string,
  resourceType?: string,
): { url: string } {
  try {
    const parsed = new URL(url, window.location.origin);
    const isTelemetry =
      resourceType === "Event" || parsed.hostname.includes("events.mapbox");
    if (isTelemetry) {
      return { url: "data:application/json,[]" };
    }
    const isMapboxHost = parsed.hostname === "api.mapbox.com";
    const isLocalProxy = parsed.pathname.startsWith("/api/mapbox/");
    if (!isMapboxHost && !isLocalProxy) {
      return { url };
    }
    const path = isMapboxHost
      ? parsed.pathname.replace(/^\//, "")
      : parsed.pathname.replace(/^\/api\/mapbox\//, "");
    const proxied = new URL(`/api/mapbox/${path}`, window.location.origin);
    parsed.searchParams.forEach((value, key) => {
      if (key !== "access_token") {
        proxied.searchParams.set(key, value);
      }
    });
    return { url: proxied.toString() };
  } catch {
    return { url };
  }
}

function zonePaintColor(
  status: EligibilityStatus | null,
  analysisVerified: boolean,
): string {
  if (!analysisVerified || !status) {
    return ZONE_COLOR.unverified;
  }
  return ZONE_COLOR[status];
}

function applySiteLayers(
  map: mapboxgl.Map,
  site: ApproximateSiteGeoJSON,
  color: string,
) {
  const zoningSource = map.getSource("site-zoning") as
    | GeoJSONSource
    | undefined;
  const lotSource = map.getSource("site-lot") as GeoJSONSource | undefined;

  if (zoningSource) {
    zoningSource.setData(site.zoning);
    lotSource?.setData(site.lot);
    map.setPaintProperty("site-zoning-fill", "fill-color", color);
    map.setPaintProperty("site-zoning-line", "line-color", color);
    map.setPaintProperty(
      "site-lot-line",
      "line-dasharray",
      site.verified ? [1, 0] : [2, 1.5],
    );
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
      "fill-opacity": 0.16,
    },
  });
  map.addLayer({
    id: "site-zoning-line",
    type: "line",
    source: "site-zoning",
    paint: {
      "line-color": color,
      "line-width": 1.5,
      "line-dasharray": [2, 1.5],
    },
  });
  map.addLayer({
    id: "site-lot-fill",
    type: "fill",
    source: "site-lot",
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": 0.18,
    },
  });
  map.addLayer({
    id: "site-lot-line",
    type: "line",
    source: "site-lot",
    paint: {
      "line-color": "#111827",
      "line-width": 2,
      ...(site.verified ? {} : { "line-dasharray": [2, 1.5] }),
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
  zoning?: string | null;
  analysisScope?: ZoningAnalysisScope | null;
  interactive?: boolean;
};

export function InteractiveSiteMap({
  lat,
  lng,
  status = null,
  label = null,
  lotSizeSqFt = null,
  zoning = null,
  analysisScope = null,
  interactive = true,
}: InteractiveSiteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markerRootRef = useRef<Root | null>(null);

  const lotVerified =
    analysisScope === "lot_zoning" && lotSizeSqFt != null && lotSizeSqFt > 0;
  const analysisVerified = analysisScope === "lot_zoning";
  const color = zonePaintColor(status, analysisVerified);
  const site = useMemo(
    () =>
      buildApproximateSiteGeoJSON({
        lat,
        lng,
        lotSizeSqFt,
        lotVerified,
        zoning,
      }),
    [lat, lng, lotSizeSqFt, lotVerified, zoning],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: PARCEL_MAP_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: true,
      interactive,
      transformRequest: (url, resourceType) =>
        proxyMapboxRequest(url, resourceType),
    });
    mapRef.current = map;

    const markerNode = document.createElement("div");
    const root = createRoot(markerNode);
    markerRootRef.current = root;
    renderFeaturePin(root, status, label, interactive);
    const marker = new mapboxgl.Marker({
      element: markerNode,
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current = marker;

    const onLoad = () => {
      map.resize();
      applySiteLayers(map, site, color);
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
  }, [lat, lng, interactive]);

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
    applySiteLayers(map, site, color);
  }, [site, color]);

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
        className="h-full w-full [&_.mapboxgl-ctrl-attrib]:text-[10px]"
        aria-label="Interactive site map"
      />
      {interactive ? (
        <div className="absolute top-3 right-3 z-20 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          <button
            type="button"
            onClick={() => zoomBy(1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground transition-colors hover:bg-muted"
            aria-label="Zoom in"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <span className="h-px bg-border" aria-hidden="true" />
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground transition-colors hover:bg-muted"
            aria-label="Zoom out"
          >
            <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
