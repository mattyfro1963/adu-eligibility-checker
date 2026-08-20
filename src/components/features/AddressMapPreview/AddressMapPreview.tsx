"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface AddressMapPreviewProps {
  lat: number | null;
  lng: number | null;
  className?: string;
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
 * Mapbox Static Images proxy with guide chrome: greyscale treatment,
 * CAD reticle, and calm “Awaiting Target Coordinates” empty state.
 * Treats HTTP 204 (token unset) as awaiting — never exposes the Mapbox token.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
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
        // 204 = Mapbox unset; other non-OK = upstream failure — both stay calm.
        if (res.status === 204 || !res.ok) {
          setFailedSrc(src);
          return;
        }
        const blob = await res.blob();
        const nextUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        setFailedSrc((prev) => (prev === src ? null : prev));
        setImage((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev.objectUrl);
          }
          return { src, objectUrl: nextUrl };
        });
      } catch {
        if (!cancelled) {
          setFailedSrc(src);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const objectUrl = src && image?.src === src ? image.objectUrl : null;
  const showAwaiting =
    !hasCoords || !src || failedSrc === src || objectUrl === null;

  return (
    <div
      className={`group relative h-full min-h-[350px] overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-[#EAECEF] shadow-inner ${className}`}
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
          className="absolute inset-0 z-0 h-full w-full border-0 object-cover mix-blend-multiply transition-all duration-1000 ease-in-out"
          style={{
            filter: "grayscale(100%) contrast(115%) opacity(70%)",
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-70 transition-opacity duration-700">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-slate-400">
          <div className="absolute h-px w-full bg-slate-400" />
          <div className="absolute h-full w-px bg-slate-400" />
          <div className="z-20 h-1.5 w-1.5 rounded-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)] ring-4 ring-white/80" />
        </div>
      </div>

      {showAwaiting ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-md">
          <span className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/95 px-5 py-2.5 text-[11px] font-semibold tracking-widest text-slate-600 uppercase shadow-xl">
            <MapPin
              size={14}
              className="animate-bounce text-black"
              aria-hidden="true"
            />
            Awaiting Target Coordinates
          </span>
        </div>
      ) : null}
    </div>
  );
}
