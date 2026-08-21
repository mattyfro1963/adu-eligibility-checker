"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { MapPinOverlay } from "@/components/features/AddressMapPreview/MapPinOverlay";
import { ParcelSiteOverlay } from "@/components/features/AddressMapPreview/ParcelSiteOverlay";
import {
  PARCEL_MAP_ZOOM,
  STATIC_MAP_DEFAULTS,
} from "@/lib/adapters/mapbox-static";
import { buildApproximateSiteOverlay } from "@/lib/map/approximate-site";
import { cn } from "@/lib/utils";
import type {
  EligibilityStatus,
  ZoningAnalysisScope,
} from "@/lib/types/zoning";

const InteractiveSiteMap = dynamic(
  () =>
    import("@/components/features/AddressMapPreview/InteractiveSiteMap").then(
      (mod) => mod.InteractiveSiteMap,
    ),
  { ssr: false },
);

interface AddressMapPreviewProps {
  lat: number | null;
  lng: number | null;
  className?: string;
  /** When false, hide callout chrome (analysis backdrop). */
  chrome?: boolean;
  /** Primary line in the map pin popover (e.g. street address). */
  label?: string | null;
  /** Secondary line — reserved for future pin popover detail. */
  sublabel?: string | null;
  /** Engine overall status for pin coloring. */
  status?: EligibilityStatus | null;
  lotSizeSqFt?: number | null;
  zoning?: string | null;
  analysisScope?: ZoningAnalysisScope | null;
  /** Draw schematic lot + zoning layers (results map). */
  showSiteLayers?: boolean;
}

function mapPreviewSrc(
  lat: number,
  lng: number,
  zoom: number,
  width: number,
  height: number,
): string {
  const url = new URL("/api/map-preview", window.location.origin);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("zoom", String(zoom));
  return url.toString();
}

function isMapboxConfiguredClient(): boolean {
  return document.body.dataset.mapboxConfigured === "1";
}

/**
 * Results: interactive Mapbox GL (token proxied server-side) with schematic
 * lot/zoning layers. Interstitial / fallback: static image or mock grid.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
  chrome = true,
  label = null,
  status = null,
  lotSizeSqFt = null,
  zoning = null,
  analysisScope = null,
  showSiteLayers = false,
}: AddressMapPreviewProps) {
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  const width = STATIC_MAP_DEFAULTS.width;
  const height = STATIC_MAP_DEFAULTS.height;
  const zoom = showSiteLayers ? PARCEL_MAP_ZOOM : STATIC_MAP_DEFAULTS.zoom;

  const [mapboxConfigured] = useState<boolean | null>(() =>
    typeof document !== "undefined" ? isMapboxConfiguredClient() : null,
  );

  const wantsInteractive = chrome && hasCoords && showSiteLayers;
  const showInteractiveMap = wantsInteractive && mapboxConfigured === true;
  const useStaticFallback =
    hasCoords && (mapboxConfigured === false || !wantsInteractive);

  const src = useMemo(
    () =>
      useStaticFallback ? mapPreviewSrc(lat!, lng!, zoom, width, height) : null,
    [useStaticFallback, lat, lng, zoom, width, height],
  );

  const lotVerified =
    analysisScope === "lot_zoning" && lotSizeSqFt != null && lotSizeSqFt > 0;
  const analysisVerified = analysisScope === "lot_zoning";

  const site = useMemo(() => {
    if (!hasCoords || !showSiteLayers || showInteractiveMap) {
      return null;
    }
    return buildApproximateSiteOverlay({
      lat: lat!,
      lng: lng!,
      width,
      height,
      zoom,
      lotSizeSqFt,
      lotVerified,
      zoning,
    });
  }, [
    hasCoords,
    showSiteLayers,
    showInteractiveMap,
    lat,
    lng,
    width,
    height,
    zoom,
    lotSizeSqFt,
    lotVerified,
    zoning,
  ]);

  const [image, setImage] = useState<{
    src: string;
    objectUrl: string;
  } | null>(null);
  const [failed, setFailed] = useState<{
    src: string;
    reason: "unconfigured" | "error";
  } | null>(null);
  const imageRef = useRef(image);

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  useEffect(() => {
    return () => {
      if (imageRef.current) {
        URL.revokeObjectURL(imageRef.current.objectUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!src) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(src);
        if (cancelled) {
          return;
        }
        if (res.status === 204 || !res.ok) {
          setFailed({
            src,
            reason: res.status === 204 ? "unconfigured" : "error",
          });
          return;
        }
        const blob = await res.blob();
        const nextUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        setFailed((prev) => (prev?.src === src ? null : prev));
        setImage((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev.objectUrl);
          }
          return { src, objectUrl: nextUrl };
        });
      } catch {
        if (!cancelled) {
          setFailed({ src, reason: "error" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const objectUrl = src && image?.src === src ? image.objectUrl : null;
  const failedReason = src && failed?.src === src ? failed.reason : null;
  const showMapboxImage = Boolean(objectUrl);
  const showMockLayer = Boolean(
    useStaticFallback && hasCoords && !showMapboxImage && failedReason,
  );
  const showPin =
    hasCoords && !showInteractiveMap && (showMapboxImage || showMockLayer);
  const pinLabel = label && label.trim().length > 0 ? label.trim() : undefined;
  const pinStatus = status ?? undefined;
  const pinInteractive = chrome;

  const showAwaitingChrome = chrome && !hasCoords;
  const showLoadingChrome =
    chrome &&
    hasCoords &&
    !showInteractiveMap &&
    !showMapboxImage &&
    !showMockLayer;
  const showLayers = Boolean(
    showSiteLayers && site && (showMapboxImage || showMockLayer),
  );

  return (
    <div
      className={cn(
        "group relative h-full min-h-[240px] overflow-hidden bg-muted sm:min-h-[320px] lg:min-h-[350px]",
        className,
      )}
    >
      {showInteractiveMap ? (
        <InteractiveSiteMap
          lat={lat!}
          lng={lng!}
          status={status}
          label={label}
          lotSizeSqFt={lotSizeSqFt}
          zoning={zoning}
          analysisScope={analysisScope}
          interactive
        />
      ) : showMapboxImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL from proxied Mapbox PNG
        <img
          src={objectUrl!}
          alt={
            hasCoords
              ? `Map preview centered on ${lat!.toFixed(5)}, ${lng!.toFixed(5)}`
              : "Map preview"
          }
          className="absolute inset-0 z-0 h-full w-full border-0 object-cover"
        />
      ) : showMockLayer ? (
        <div
          className="absolute inset-0 z-0 bg-muted"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(230 232 235 / 0.8) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(230 232 235 / 0.8) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" aria-hidden="true" />
      )}

      {showLayers && site ? (
        <ParcelSiteOverlay
          site={site}
          status={status}
          analysisVerified={analysisVerified}
        />
      ) : null}

      {showPin ? (
        <MapPinOverlay
          lat={lat!}
          lng={lng!}
          mode={showMapboxImage ? "center" : "projected"}
          status={pinStatus}
          label={pinLabel}
          interactive={pinInteractive}
        />
      ) : null}

      {showAwaitingChrome ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 font-label text-[10px] text-muted-foreground shadow-elevated">
            <MapPin size={14} className="text-foreground" aria-hidden="true" />
            Enter an address to preview the map
          </span>
        </div>
      ) : null}

      {showLoadingChrome && !showInteractiveMap ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
          <span className="rounded-xl border border-border bg-card px-4 py-2 font-label text-[10px] text-muted-foreground shadow-elevated backdrop-blur-sm">
            Loading site map
          </span>
        </div>
      ) : null}
    </div>
  );
}
