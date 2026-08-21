import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

export function MapSiteLegend({
  zoningLabel,
  lotVerified,
  analysisVerified,
  status,
}: {
  zoningLabel: string;
  lotVerified: boolean;
  analysisVerified: boolean;
  status?: EligibilityStatus | null;
}) {
  const hatchClass =
    status === "restricted"
      ? "border-rose-600 bg-[repeating-linear-gradient(-48deg,transparent,transparent_2px,rgb(225_29_72_/_0.4)_2px,rgb(225_29_72_/_0.4)_3px)]"
      : status === "warning"
        ? "border-amber-600 bg-[repeating-linear-gradient(-48deg,transparent,transparent_2px,rgb(217_119_6_/_0.4)_2px,rgb(217_119_6_/_0.4)_3px)]"
        : "border-emerald-700 bg-[repeating-linear-gradient(-48deg,transparent,transparent_2px,rgb(5_150_105_/_0.4)_2px,rgb(5_150_105_/_0.4)_3px)]";

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <p className="font-label text-[10px] tracking-[0.14em] text-brand">
        Site reading
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        <li className="flex items-center gap-2 text-[12px] leading-snug text-foreground">
          <span
            className={cn(
              "h-2.5 w-3.5 shrink-0 border border-foreground/80 bg-white",
              !lotVerified && "border-dashed",
            )}
            aria-hidden="true"
          />
          {lotVerified ? "Lot boundary" : "Approximate lot"}
        </li>
        <li className="flex items-center gap-2 text-[12px] leading-snug text-foreground">
          <span
            className={cn(
              "h-2.5 w-3.5 shrink-0 border border-dashed",
              hatchClass,
            )}
            aria-hidden="true"
          />
          Zoning · {zoningLabel}
        </li>
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
        {analysisVerified
          ? "Schematic overlay — not a survey. Pan and zoom the map to inspect the site."
          : "Lot GIS not verified. District shown for applicability only."}
      </p>
    </div>
  );
}
