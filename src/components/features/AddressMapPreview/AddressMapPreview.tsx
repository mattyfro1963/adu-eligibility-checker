"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressMapPreviewProps {
  lat: number | null;
  lng: number | null;
  className?: string;
  /** When false, hide CAD reticle / awaiting chrome (analysis backdrop). */
  chrome?: boolean;
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
 * Mapbox Static Images proxy with cinematic presentation:
 * full-bleed crop, near-black Bone editorial chrome.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
  chrome = true,
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

  return (
    <div
      className={cn(
        "group relative h-full min-h-[240px] overflow-hidden rounded-card border border-border bg-muted sm:min-h-[320px] lg:min-h-[350px]",
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
          className="absolute inset-0 z-0 h-full w-full border-0 object-cover transition-all duration-1000 ease-in-out"
          style={{
            filter: "grayscale(100%) contrast(115%) opacity(70%)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {chrome ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-80 transition-opacity duration-700">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border">
            <div className="absolute h-px w-full bg-border" />
            <div className="absolute h-full w-px bg-border" />
            <div className="z-20 h-1.5 w-1.5 rounded-full bg-foreground ring-4 ring-background/80" />
          </div>
        </div>
      ) : null}

      {chrome && showAwaiting ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/40 backdrop-blur-md">
          <span className="flex items-center gap-2 rounded-pill border border-border bg-card px-5 py-2.5 text-[11px] font-normal tracking-widest text-muted-foreground uppercase shadow-editorial">
            <MapPin
              size={14}
              className="animate-bounce text-foreground"
              aria-hidden="true"
            />
            {awaitingLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
