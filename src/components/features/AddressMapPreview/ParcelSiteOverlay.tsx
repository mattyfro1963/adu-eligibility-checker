import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ApproximateSiteOverlay } from "@/lib/map/approximate-site";
import type { EligibilityStatus } from "@/lib/types/zoning";

type ParcelSiteOverlayProps = {
  site: ApproximateSiteOverlay;
  status?: EligibilityStatus | null;
  analysisVerified: boolean;
};

export function ParcelSiteOverlay({
  site,
  status = null,
  analysisVerified,
}: ParcelSiteOverlayProps) {
  const patternId = useId();
  const lotMaskId = useId();
  // Neutral stroke — do not paint schematic envelopes with eligibility colors.
  void status;
  const { width, height } = site.viewBox;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(38)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="var(--map-zone-unverified)"
            strokeWidth="1.25"
            opacity="0.28"
          />
        </pattern>
        <mask id={lotMaskId}>
          <rect width={width} height={height} fill="white" />
          <path d={site.lot.path} fill="black" />
        </mask>
      </defs>

      <path
        d={site.zoning.path}
        fill={`url(#${patternId})`}
        fillOpacity={0.35}
        stroke="var(--map-zone-unverified)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        mask={`url(#${lotMaskId})`}
        className={cn(!analysisVerified && "opacity-70")}
      />
      <path
        d={site.zoning.path}
        fill="none"
        stroke="var(--map-zone-unverified)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        opacity={0.85}
      />

      <path
        d={site.lot.path}
        fill="color-mix(in srgb, var(--map-lot-fill) 12%, transparent)"
        stroke="var(--map-lot-stroke)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeDasharray="6 4"
      />
      <path
        d={site.lot.path}
        fill="none"
        stroke="var(--map-lot-fill)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        opacity="0.9"
        strokeDasharray="6 4"
      />

      <circle
        cx={width / 2}
        cy={height / 2}
        r="3.2"
        fill="var(--map-lot-stroke)"
        stroke="var(--map-lot-fill)"
        strokeWidth="1.4"
      />
    </svg>
  );
}
