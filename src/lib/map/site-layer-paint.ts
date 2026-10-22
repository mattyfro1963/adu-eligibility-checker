/**
 * MapLibre paint for lot + district overlays.
 * Schematic envelopes stay status-neutral (eligibility lives on the pin/badge).
 * Contrast must still read on satellite — never the film cream wash.
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
  lotHaloColor: string;
  lotHaloWidth: number;
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
  return {
    lotFillColor: tokens.lotFill,
    lotFillOpacity: boundaryVerified ? 0.14 : 0.2,
    lotLineColor: tokens.lotStroke,
    lotLineWidth: 2,
    lotHaloColor: tokens.lotFill,
    lotHaloWidth: 4.5,
    lotDash: boundaryVerified ? SOLID_LINE_DASH : SCHEMATIC_LINE_DASH,
    zoneFillColor: tokens.zoneUnverified,
    zoneFillOpacity: tokens.zoneFillOpacity,
    zoneLineColor: tokens.zoneUnverified,
    zoneLineWidth: 2.25,
    zoneHaloColor: tokens.lotFill,
    zoneHaloWidth: 3.5,
    zoneDash: SCHEMATIC_LINE_DASH,
  };
}
