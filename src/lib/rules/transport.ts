/**
 * Transport / delivery logistics for Cascadia THOW envelopes.
 * Route-qualified language only — never blanket “no pilot car.”
 */

import { SRC } from "@/lib/regulations/sources";
import type { EligibilityResult } from "@/lib/types/zoning";
import {
  ACTIVE_THOW_MODEL,
  type ThowModelProfile,
} from "@/lib/rules/thow-models";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";

const TRANSPORT_SOURCES = [
  SRC.caDotOversize,
  SRC.orDotOversize,
  SRC.waDotOversize,
  SRC.hcdTinyHomesIb,
] as const;

/** WA escort risk threshold (feet). */
export const WA_ESCORT_WIDTH_FT = 11;

export type TransportInput = {
  region?: string | null;
  model?: ThowModelProfile;
};

function stateTransportSources(regionCode: string) {
  if (regionCode === "WA") return [SRC.waDotOversize, SRC.hcdTinyHomesIb];
  if (regionCode === "OR") return [SRC.orDotOversize, SRC.hcdTinyHomesIb];
  if (regionCode === "CA") return [SRC.caDotOversize, SRC.hcdTinyHomesIb];
  return [...TRANSPORT_SOURCES];
}

/**
 * Transport gate. Default Yellow until hauler route review is acknowledged in copy.
 * WA width >11 ft → escort risk Yellow with route-qualified logistics language.
 */
export function evaluateTransport(input: TransportInput = {}): EligibilityResult {
  const model = input.model ?? ACTIVE_THOW_MODEL;
  const regionCode = normalizeRegionCode(input.region ?? "");
  const sources = stateTransportSources(regionCode);
  const reasons: EligibilityResult["reasons"] = [];

  reasons.push({
    text: "Designed to reduce escort requirements; pilot-car need confirmed by state permit route. Complete a hauler route review (width, height, turns, and driveway access) before relying on this lot for delivery.",
    sources,
  });

  if (model.widthFt > WA_ESCORT_WIDTH_FT) {
    reasons.push({
      text: `Model width ${model.widthFt} ft exceeds the ≤${WA_ESCORT_WIDTH_FT} ft preferred envelope. In Washington, widths over ${WA_ESCORT_WIDTH_FT} ft commonly trigger escort risk on many routes. No pilot car on qualifying routes; route and permit confirmation required before delivery.`,
      sources,
    });
    return { status: "warning", reasons };
  }

  reasons.push({
    text: `Model width ${model.widthFt} ft is within the ≤${WA_ESCORT_WIDTH_FT} ft preferred transport story. Designed to reduce escort requirements; pilot-car need confirmed by state permit route. No pilot car on qualifying routes; route and permit confirmation required before delivery.`,
    sources,
  });

  return { status: "eligible", reasons };
}
