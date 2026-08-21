import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ApproximateSiteOverlay } from "@/lib/map/approximate-site";
import type { EligibilityStatus } from "@/lib/types/zoning";

const ZONE_STROKE: Record<EligibilityStatus | "unverified", string> = {
  eligible: "#059669",
  warning: "#d97706",
  restricted: "#e11d48",
  unverified: "#6b7280",
};

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
  const zoneKey = analysisVerified && status ? status : "unverified";
  const stroke = ZONE_STROKE[zoneKey];
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
            stroke={stroke}
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
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        mask={`url(#${lotMaskId})`}
        className={cn(!analysisVerified && "opacity-70")}
      />
      <path
        d={site.zoning.path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        opacity={0.85}
      />

      <path
        d={site.lot.path}
        fill="rgb(255 255 255 / 0.12)"
        stroke="#111827"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeDasharray={site.lot.verified ? undefined : "6 4"}
      />
      <path
        d={site.lot.path}
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.6"
        strokeLinejoin="round"
        opacity="0.9"
      />

      <circle
        cx={width / 2}
        cy={height / 2}
        r="3.2"
        fill="#111827"
        stroke="#ffffff"
        strokeWidth="1.4"
      />
    </svg>
  );
}
