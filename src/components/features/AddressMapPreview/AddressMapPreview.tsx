"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { MapPinOverlay } from "@/components/features/AddressMapPreview/MapPinOverlay";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

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
}

function mapPreviewSrc(lat: number, lng: number): string {
  const url = new URL("/api/map-preview", window.location.origin);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("width", "640");
  url.searchParams.set("height", "400");
  return url.toString();
}

/**
 * Mapbox Static Images proxy — monochrome store-locator presentation:
 * full-bleed grayscale basemap with status-colored FeaturePin overlay.
 * Falls back to a projected pin on a mock CA layer when Mapbox is unset.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
  chrome = true,
  label = null,
  sublabel: _sublabel = null,
  status = null,
}: AddressMapPreviewProps) {
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  const src = useMemo(
    () => (hasCoords ? mapPreviewSrc(lat!, lng!) : null),
    [hasCoords, lat, lng],
  );

  /** Blob URL keyed by request src — stale keys are ignored (no sync reset in effect). */
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
        // 204 = Mapbox token unset; other non-OK = upstream failure.
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
  const showMockLayer = hasCoords && !showMapboxImage;
  const showPin = hasCoords && (showMapboxImage || showMockLayer);
  const pinLabel = label && label.trim().length > 0 ? label.trim() : undefined;
  const pinStatus = status ?? undefined;
  const pinInteractive = chrome;

  const showAwaitingChrome = chrome && !hasCoords;
  const showLoadingChrome =
    chrome && hasCoords && !showMapboxImage && !failedReason;

  return (
    <div
      className={cn(
        "group relative h-full min-h-[240px] overflow-hidden bg-muted sm:min-h-[320px] lg:min-h-[350px]",
        className,
      )}
    >
      {showMapboxImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL from proxied Mapbox PNG
        <img
          src={objectUrl!}
          alt={
            hasCoords
              ? `Map preview centered on ${lat!.toFixed(5)}, ${lng!.toFixed(5)}`
              : "Map preview"
          }
          className="absolute inset-0 z-0 h-full w-full border-0 object-cover"
          style={{
            filter: "grayscale(100%) contrast(108%) brightness(103%)",
          }}
        />
      ) : showMockLayer ? (
        <div
          className="absolute inset-0 z-0 bg-muted"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(230 232 235 / 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(230 232 235 / 0.45) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" aria-hidden="true" />
      )}

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
          <span className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-5 py-2.5 font-label text-[10px] text-muted-foreground shadow-elevated">
            <MapPin size={14} className="text-foreground" aria-hidden="true" />
            Awaiting Target Coordinates
          </span>
        </div>
      ) : null}

      {showLoadingChrome ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
          <span className="rounded-[10px] border border-border bg-card px-4 py-2 font-label text-[10px] text-muted-foreground shadow-elevated backdrop-blur-sm">
            Loading Map Preview
          </span>
        </div>
      ) : null}
    </div>
  );
}
