import { BASEMAP_ATTRIBUTION } from "@/lib/map/basemap";
import { SRC } from "@/lib/regulations/sources";
import { cn } from "@/lib/utils";

export function MapSiteLegend({
  zoningLabel,
  lotVerified,
  boundaryVerified = false,
  analysisVerified,
  mapInteractive = false,
  lotSizeSqFt = null,
}: {
  zoningLabel: string;
  /** True when GIS supplied lot area. */
  lotVerified: boolean;
  /** True when GIS supplied a parcel outline polygon. */
  boundaryVerified?: boolean;
  analysisVerified: boolean;
  /** When false, omit pan/zoom affordance (static preview). */
  mapInteractive?: boolean;
  lotSizeSqFt?: number | null;
}) {
  const areaLabel =
    lotVerified && lotSizeSqFt != null && lotSizeSqFt > 0
      ? `${lotSizeSqFt.toLocaleString()} sq ft (GIS)`
      : "Area not verified";

  const lotLine = boundaryVerified
    ? `Assessor parcel boundary · ${areaLabel}`
    : lotVerified
      ? `Schematic lot (GIS area) · ${areaLabel}`
      : `Schematic lot (typical area) · ${areaLabel}`;

  return (
    <div
      className="border-t border-border-luxury bg-surface-luxury/50 px-4 py-3.5 sm:px-5"
      role="region"
      aria-label="Site reading legend"
    >
      <p className="font-label text-luxury-taupe">Site reading</p>
      <ul className="mt-2.5 space-y-1.5">
        <li className="flex items-center gap-2 text-[12px] leading-snug text-text-luxury">
          <span
            className={cn(
              "h-2.5 w-3.5 shrink-0 border border-text-luxury/70",
              boundaryVerified
                ? "bg-text-luxury/5"
                : "border-dashed bg-map-lot-fill/80",
            )}
            aria-hidden="true"
          />
          {lotLine}
        </li>
        <li className="flex items-center gap-2 text-[12px] leading-snug text-text-luxury">
          <span
            className="map-hatch-swatch h-2.5 w-3.5 shrink-0 border border-dashed border-foreground/45"
            aria-hidden="true"
          />
          District · {zoningLabel}
        </li>
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-text-tertiary">
        {boundaryVerified
          ? "Outline is the assessor/vendor parcel polygon — not a recorded survey. No entitlement is claimed."
          : analysisVerified
            ? "Lot outline is schematic for orientation — not a recorded survey. No entitlement is claimed."
            : "Lot GIS not verified. Layers are illustrative only. No entitlement is claimed."}
        {mapInteractive ? " Pan and zoom to inspect." : null}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-text-tertiary">
        Imagery:{" "}
        <a
          href={SRC.esriWorldImagery.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-text-luxury underline-offset-2 hover:underline"
        >
          {SRC.esriWorldImagery.label}
        </a>
        . {BASEMAP_ATTRIBUTION}. Current mosaic, not a live satellite feed.
        Address located with{" "}
        <a
          href={SRC.mapboxGeocoding.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-text-luxury underline-offset-2 hover:underline"
        >
          {SRC.mapboxGeocoding.label}
        </a>
        .
      </p>
    </div>
  );
}
