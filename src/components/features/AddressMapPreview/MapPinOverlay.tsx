import { latLngToCaPercent } from "@/lib/map/ca-bounds-projection";
import type { EligibilityStatus } from "@/lib/types/zoning";
import { FeaturePin } from "@/components/features/AddressMapPreview/FeaturePin";

type MapPinOverlayProps = {
  lat: number;
  lng: number;
  mode: "center" | "projected";
  status?: EligibilityStatus;
  label?: string;
  interactive?: boolean;
};

export function MapPinOverlay({
  lat,
  lng,
  mode,
  status,
  label,
  interactive = true,
}: MapPinOverlayProps) {
  const projected = mode === "projected" ? latLngToCaPercent(lat, lng) : null;

  return (
    <div
      className="pointer-events-auto absolute z-20"
      style={
        mode === "center"
          ? {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -100%)",
            }
          : {
              left: `${projected!.x}%`,
              top: `${projected!.y}%`,
              transform: "translate(-50%, -100%)",
            }
      }
    >
      <FeaturePin status={status} label={label} interactive={interactive} />
    </div>
  );
}
