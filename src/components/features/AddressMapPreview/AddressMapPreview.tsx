"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParcelBoundaryGeometry } from "@/lib/map/approximate-site";
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
  /** Assessor / vendor outline when GIS returned one. */
  parcelBoundary?: ParcelBoundaryGeometry | null;
  zoning?: string | null;
  analysisScope?: ZoningAnalysisScope | null;
  /** Draw lot + zoning layers (results map). */
  showSiteLayers?: boolean;
}

/**
 * Results + interstitial: MapLibre on the shared Esri/Maxar satellite mosaic.
 * No Mapbox raster/GL tiles.
 */
export function AddressMapPreview({
  lat,
  lng,
  className = "",
  chrome = true,
  label = null,
  status = null,
  lotSizeSqFt = null,
  parcelBoundary = null,
  zoning = null,
  analysisScope = null,
  showSiteLayers = false,
}: AddressMapPreviewProps) {
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  const showAwaitingChrome = chrome && !hasCoords;

  return (
    <div
      className={cn(
        "group relative h-full min-h-[240px] overflow-hidden bg-muted sm:min-h-[320px] lg:min-h-[350px]",
        className,
      )}
    >
      {hasCoords ? (
        <InteractiveSiteMap
          lat={lat!}
          lng={lng!}
          status={status}
          label={label}
          lotSizeSqFt={lotSizeSqFt}
          parcelBoundary={parcelBoundary}
          zoning={zoning}
          analysisScope={analysisScope}
          interactive={chrome}
          showSiteLayers={showSiteLayers}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" aria-hidden="true" />
      )}

      {showAwaitingChrome ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 font-label text-[10px] text-muted-foreground shadow-elevated">
            <MapPin size={14} className="text-foreground" aria-hidden="true" />
            Enter an address to preview the map
          </span>
        </div>
      ) : null}
    </div>
  );
}
