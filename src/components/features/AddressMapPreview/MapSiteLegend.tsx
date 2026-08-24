import { cn } from "@/lib/utils";

/** Neutral hatch — eligibility colors stay on badges/pin, not schematic envelopes. */
const NEUTRAL_HATCH =
  "border-foreground/50 map-hatch-swatch";

export function MapSiteLegend({
  zoningLabel,
  lotVerified,
  analysisVerified,
  mapInteractive = false,
}: {
  zoningLabel: string;
  /** True when GIS supplied lot area — shape remains schematic. */
  lotVerified: boolean;
  analysisVerified: boolean;
  /** When false, omit pan/zoom affordance (static preview). */
  mapInteractive?: boolean;
}) {
  return (
    <div className="border-t border-border bg-surface-elevated px-4 py-3">
      <p className="font-label text-[10px] tracking-[0.14em] text-luxury-taupe">
        Site reading
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        <li className="flex items-center gap-2 text-[12px] leading-snug text-text-luxury">
          <span
            className={cn(
              "h-2.5 w-3.5 shrink-0 border border-dashed border-foreground/80 bg-map-lot-fill",
            )}
            aria-hidden="true"
          />
          {lotVerified
            ? "Schematic lot (area from GIS)"
            : "Schematic lot (typical area)"}
        </li>
        <li className="flex items-center gap-2 text-[12px] leading-snug text-text-luxury">
          <span
            className={cn(
              "h-2.5 w-3.5 shrink-0 border border-dashed",
              NEUTRAL_HATCH,
            )}
            aria-hidden="true"
          />
          District code (point lookup) · {zoningLabel}
        </li>
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-text-tertiary">
        {analysisVerified
          ? `Schematic illustration only — not a survey, not parcel boundary GIS, and not the zoning district map used for eligibility. District code and program status come from coordinate lookup; outlines are for orientation.${
              mapInteractive
                ? " Pan and zoom the basemap to inspect the site."
                : " Fixed preview — schematic overlay only."
            }`
          : "Lot GIS not verified. Schematic layers are illustrative only — not a parcel survey or spatial entitlement."}
      </p>
    </div>
  );
}
