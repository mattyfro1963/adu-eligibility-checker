/**
 * MapLibre paint for lot + district overlays.
 * Schematic envelopes stay status-neutral (eligibility lives on the pin/badge).
 * Parcel stroke is neon cyan on aerial — never a cream wash.
 */

import type { MapPaintTokens } from "@/lib/map/map-tokens";

/** Long dash ≈ solid; MapLibre has no reliable "clear dasharray" across updates. */
export const SOLID_LINE_DASH: [number, number] = [1000, 0];
export const SCHEMATIC_LINE_DASH: [number, number] = [2, 1.5];

export type SiteLayerPaint = {
  lotFillColor: string;
  lotFillOpacity: number;
  lotLineColor: string;
  lotLineWidth: number;
  lotLineBlur: number;
  lotHaloColor: string;
  lotHaloWidth: number;
  lotHaloBlur: number;
  lotHaloOpacity: number;
  lotDash: [number, number];
  zoneFillColor: string;
  zoneFillOpacity: number;
  zoneLineColor: string;
  zoneLineWidth: number;
  zoneHaloColor: string;
  zoneHaloWidth: number;
  zoneDash: [number, number];
};

export function siteLayerPaint(
  tokens: MapPaintTokens,
  boundaryVerified: boolean,
): SiteLayerPaint {
  const neon = tokens.lotStroke || tokens.lotGlow;
  return {
    lotFillColor: neon,
    lotFillOpacity: boundaryVerified ? 0.1 : 0.12,
    lotLineColor: neon,
    lotLineWidth: 3.75,
    lotLineBlur: 0,
    lotHaloColor: tokens.lotGlow || neon,
    lotHaloWidth: 10,
    lotHaloBlur: 6,
    lotHaloOpacity: 0.55,
    lotDash: boundaryVerified ? SOLID_LINE_DASH : SCHEMATIC_LINE_DASH,
    zoneFillColor: tokens.zoneUnverified,
    zoneFillOpacity: tokens.zoneFillOpacity,
    zoneLineColor: tokens.zoneUnverified,
    zoneLineWidth: 1.75,
    zoneHaloColor: tokens.lotFill,
    zoneHaloWidth: 2.5,
    zoneDash: SCHEMATIC_LINE_DASH,
  };
}
