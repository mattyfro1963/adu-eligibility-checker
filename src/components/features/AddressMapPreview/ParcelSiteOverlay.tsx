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
  // Neutral stroke — do not paint schematic envelopes with eligibility colors.
  void status;
  void analysisVerified;
  const { width, height } = site.viewBox;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      aria-hidden="true"
    >
      <path
        d={site.lot.path}
        fill="color-mix(in srgb, var(--map-lot-fill) 10%, transparent)"
        stroke="var(--map-lot-glow)"
        strokeWidth="8"
        strokeLinejoin="round"
        opacity="0.35"
        strokeDasharray={site.lot.boundaryVerified ? undefined : "6 4"}
        className="parcel-glow"
      />
      <path
        d={site.lot.path}
        fill="none"
        stroke="var(--map-lot-stroke)"
        strokeWidth="3.25"
        strokeLinejoin="round"
        strokeDasharray={site.lot.boundaryVerified ? undefined : "6 4"}
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
