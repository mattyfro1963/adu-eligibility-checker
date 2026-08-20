"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressMapPreviewProps {
  lat: number | null;
  lng: number | null;
  className?: string;
  /** When false, hide callout chrome (analysis backdrop). */
  chrome?: boolean;
  /** Primary line in the map callout (e.g. street address). */
  label?: string | null;
  /** Secondary line in the callout header (e.g. city / APN). */
  sublabel?: string | null;
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
 * full-bleed grayscale basemap, black pin, optional black/white callout.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
  chrome = true,
  label = null,
  sublabel = null,
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
  const showAwaiting = !hasCoords || !src || failedReason || !objectUrl;
  const awaitingLabel = !hasCoords
    ? "Awaiting Target Coordinates"
    : failedReason === "unconfigured"
      ? "Map Preview Not Configured"
      : failedReason === "error"
        ? "Map Preview Unavailable"
        : "Loading Map Preview";

  const showCallout =
    chrome && label && objectUrl && !showAwaiting && label.trim().length > 0;

  return (
    <div
      className={cn(
        "group relative h-full min-h-[240px] overflow-hidden bg-[#e4e4e4] sm:min-h-[320px] lg:min-h-[350px]",
        className,
      )}
    >
      {objectUrl && !showAwaiting ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL from proxied Mapbox PNG
        <img
          src={objectUrl}
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
      ) : (
        <div className="absolute inset-0 bg-[#ececec]" />
      )}

      {showCallout ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="absolute top-[38%] left-1/2 w-[min(18rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-full">
            <div className="overflow-hidden shadow-[0_8px_30px_rgb(0_0_0_/_0.12)]">
              <div className="bg-black px-4 py-3 text-white">
                <p className="truncate text-sm leading-snug font-medium">
                  {label}
                </p>
                {sublabel ? (
                  <p className="mt-1 truncate text-xs text-white/75">
                    {sublabel}
                  </p>
                ) : null}
              </div>
            </div>
            <div
              className="mx-auto h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-black"
              aria-hidden="true"
            />
          </div>
        </div>
      ) : null}

      {chrome && showAwaiting ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <span className="flex items-center gap-2 border border-neutral-300 bg-white px-5 py-2.5 text-[11px] font-normal tracking-widest text-neutral-600 uppercase shadow-sm">
            <MapPin size={14} className="text-black" aria-hidden="true" />
            {awaitingLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
