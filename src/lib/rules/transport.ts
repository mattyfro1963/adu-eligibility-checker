/**
 * Transport / delivery logistics for Cascadia THOW envelopes.
 * Route-qualified language only — never blanket “no pilot car.”
 *
 * Overall Green (option b): a transport `warning` that is only standard
 * oversize / route review may be non-blocking for `computeThowOverall` when
 * the state is published and width ≤ 11.4 ft. WA width > 11 ft (WAC
 * 468-38-100(1)(a) two-escort trigger on two-lane highways) remains blocking.
 */

import { SRC } from "@/lib/regulations/sources";
import type { SourceRef } from "@/lib/regulations/types";
import type { EligibilityResult, EligibilityStatus } from "@/lib/types/zoning";
import {
  ACTIVE_THOW_MODEL,
  type ThowModelProfile,
} from "@/lib/rules/thow-models";
import { isPublishedThowState } from "@/lib/rules/published-states";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";
import { UNSUPPORTED_STATE_THOW_COPY } from "@/lib/rules/thow-summary";

/** Legal max width without oversize permit (feet) — 8′6″ / 102″. */
export const LEGAL_WIDTH_FT = 8.5;

/** WA WAC 468-38-100(1)(a) two-escort threshold on two-lane highways (feet). */
export const WA_ESCORT_WIDTH_FT = 11;

/** Practical CAMBRIA envelope — option (b) overall Green ceiling (feet). */
export const PRACTICAL_ENVELOPE_WIDTH_FT = 11.4;

const SHARED_PILOT_COPY =
  "CAMBRIA plans are designed to reduce pilot-car requirements. Final pilot-car requirements depend on state permit rules and the delivery route.";

const CAMBRIA_1_WA_ADDON =
  "CAMBRIA 1 (or any load wider than 11 ft) — Washington two-lane highways are a known escort risk if loaded width exceeds 11 ft.";

const CAMBRIA_2_ADDON =
  "CAMBRIA 2 (≤11 ft) is better aligned with a reduced-escort transport strategy, but oversize permits and route review are still required when width exceeds 8 ft 6 in.";

export type TransportInput = {
  region?: string | null;
  model?: ThowModelProfile;
};

function caSources(): SourceRef[] {
  return [
    SRC.caCvc35100,
    SRC.caDotVehicleWidths,
    SRC.caDotOversize,
    SRC.caDotPilotCarMaps,
    SRC.caDotTpmCh5,
  ];
}

function orSources(): SourceRef[] {
  return [
    SRC.orDotLegalDims,
    SRC.orDotOverDimOps,
    SRC.orDotOversize,
    SRC.orDotPermittableTables,
    SRC.orOarPilotVehicles,
    SRC.orDotPilotGuide,
  ];
}

function waSources(): SourceRef[] {
  return [SRC.waDotOversize, SRC.waWacPilotEscort, SRC.waDotPermitForm560002];
}

function stateTransportSources(regionCode: string): SourceRef[] {
  if (regionCode === "WA") return waSources();
  if (regionCode === "OR") return orSources();
  if (regionCode === "CA") return caSources();
  return [...caSources(), ...orSources(), ...waSources()];
}

/**
 * Option (b): transport warning is non-blocking for overall Green only when
 * published Cascadia + width ≤ 11.4 ft + issue is standard oversize/route
 * review — not WA WAC 468-38-100(1)(a) escort trigger (width > 11 ft).
 */
export function isTransportWarningNonBlockingForOverall(input: {
  region?: string | null;
  widthFt: number;
  transportStatus: EligibilityStatus;
}): boolean {
  if (input.transportStatus !== "warning") return false;
  if (!isPublishedThowState(input.region)) return false;
  if (input.widthFt > PRACTICAL_ENVELOPE_WIDTH_FT) return false;
  const regionCode = normalizeRegionCode(input.region ?? "");
  // WAC 468-38-100(1)(a): >11 ft → two escorts on two-lane highways — blocks overall Green.
  if (regionCode === "WA" && input.widthFt > WA_ESCORT_WIDTH_FT) {
    return false;
  }
  return true;
}

/**
 * Transport gate. CA/OR: Yellow (permit + route-specific pilot). WA ≤11 ft:
 * Green only as “no automatic two-lane 11 ft escort trigger.” WA >11 ft: Yellow
 * with WAC escort cite. Never claim blanket no-pilot clearance.
 */
export function evaluateTransport(
  input: TransportInput = {},
): EligibilityResult {
  const model = input.model ?? ACTIVE_THOW_MODEL;
  const regionCode = normalizeRegionCode(input.region ?? "");
  const sources = stateTransportSources(regionCode);
  const reasons: EligibilityResult["reasons"] = [];

  if (!isPublishedThowState(regionCode)) {
    return {
      status: "restricted",
      reasons: [
        {
          text: UNSUPPORTED_STATE_THOW_COPY,
          sources: [...sources],
        },
      ],
    };
  }

  reasons.push({
    text: SHARED_PILOT_COPY,
    sources,
  });

  if (model.widthFt > LEGAL_WIDTH_FT) {
    if (regionCode === "CA") {
      reasons.push({
        text: `Loaded width ${model.widthFt} ft exceeds California’s legal 102 in (8 ft 6 in) under Vehicle Code § 35100. An oversize transportation permit is required; pilot-car count is route- and dimension-specific (pilot car maps / TPM), not a blanket clearance.`,
        sources: caSources(),
      });
    } else if (regionCode === "OR") {
      reasons.push({
        text: `Loaded width ${model.widthFt} ft exceeds Oregon’s legal 8 ft 6 in width. An ODOT over-dimension permit is required; pilot-vehicle needs are route- and attachment-specific (Attachments 70A/75A/82A), not universal no-pilot for ≤11 ft loads.`,
        sources: orSources(),
      });
    } else if (regionCode === "WA") {
      reasons.push({
        text: `Loaded width ${model.widthFt} ft exceeds Washington’s legal 8 ft 6 in. A WSDOT oversize/overweight permit is required; escort counts follow WAC 468-38-100 and permit conditions.`,
        sources: waSources(),
      });
    }
  }

  // WA — width > 11 ft: WAC 468-38-100(1)(a) two escorts on two-lane highways.
  if (regionCode === "WA" && model.widthFt > WA_ESCORT_WIDTH_FT) {
    reasons.push({
      text: `Width ${model.widthFt} ft exceeds 11 ft. Under WAC 468-38-100(1)(a), loads exceeding 11 ft width require two pilot/escort vehicles on two-lane highways (front and rear). ${CAMBRIA_1_WA_ADDON} Complete a hauler route review before delivery.`,
      sources: waSources(),
    });
    return { status: "warning", reasons };
  }

  // WA — width ≤ 11 ft: eligible only as “no automatic two-lane 11 ft escort trigger.”
  if (regionCode === "WA" && model.widthFt <= WA_ESCORT_WIDTH_FT) {
    reasons.push({
      text: `Width ${model.widthFt} ft does not automatically trigger WAC 468-38-100(1)(a)’s two-escort rule for loads exceeding 11 ft on two-lane highways. Other WAC triggers (height, length, overhang, department judgment) and permit conditions can still require escorts. ${CAMBRIA_2_ADDON}`,
      sources: waSources(),
    });
    return { status: "eligible", reasons };
  }

  // CA / OR — any CAMBRIA width: warning (permit + route-specific pilot).
  if (regionCode === "CA") {
    reasons.push({
      text: `California oversize moves need Caltrans transportation permits; pilot-car requirements are route- and dimension-specific. Never assume a blanket no-pilot clearance for ~11 ft loads. Complete a hauler route review before delivery.`,
      sources: caSources(),
    });
    if (model.widthFt <= WA_ESCORT_WIDTH_FT) {
      reasons.push({
        text: CAMBRIA_2_ADDON,
        sources: caSources(),
      });
    }
    return { status: "warning", reasons };
  }

  if (regionCode === "OR") {
    reasons.push({
      text: `Oregon over-dimension permits and pilot-vehicle rules are route-specific (OAR 734-078-0035 / Attachment 82A and route maps). Never assume a blanket no-pilot clearance. Complete a hauler route review before delivery.`,
      sources: orSources(),
    });
    if (model.widthFt <= WA_ESCORT_WIDTH_FT) {
      reasons.push({
        text: CAMBRIA_2_ADDON,
        sources: orSources(),
      });
    }
    return { status: "warning", reasons };
  }

  return { status: "warning", reasons };
}
