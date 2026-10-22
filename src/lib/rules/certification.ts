/**
 * Certification fit for a THOW / park-model / RVIA-class unit.
 * Model profile drives size and seal class — unknown cert → Yellow.
 * Industry seals (NOAH / ANSI / RVIA) are not placement permits.
 */

import { SRC } from "@/lib/regulations/sources";
import type { SourceRef } from "@/lib/regulations/types";
import type { EligibilityResult } from "@/lib/types/zoning";
import {
  ACTIVE_THOW_MODEL,
  type ThowModelProfile,
} from "@/lib/rules/thow-models";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";

const MAX_PARK_MODEL_SQ_FT = 400;

export type CertificationInput = {
  model?: ThowModelProfile;
  /** USPS region — selects HCD vs WA L&I park-trailer cites. */
  region?: string | null;
};

function certSources(region?: string | null): SourceRef[] {
  const regionCode = normalizeRegionCode(region ?? "");
  if (regionCode === "WA") {
    return [
      SRC.waWacParkTrailer,
      SRC.waLniFasLaws,
      SRC.waLniModularPortal,
      SRC.noahDwelling,
      SRC.rvia,
    ];
  }
  return [SRC.hcdTinyHomesIb, SRC.noahDwelling, SRC.rvia, SRC.waWacParkTrailer];
}

/**
 * Evaluates certification / size / data-plate expectations for the active model.
 * Does not green-light placement — that is `evaluatePlacement`.
 */
export function evaluateCertification(
  input: CertificationInput = {},
): EligibilityResult {
  const model = input.model ?? ACTIVE_THOW_MODEL;
  const sources = certSources(input.region);
  const reasons: EligibilityResult["reasons"] = [];

  if (model.sqFt > MAX_PARK_MODEL_SQ_FT) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Model floor area (${model.sqFt} sq ft) exceeds the typical ≤${MAX_PARK_MODEL_SQ_FT} sq ft park-model / THOW envelope (e.g. WA recreational park trailer ≤400 sq ft set-up under WAC 296-150P). Units above this size usually need a special transport and occupancy plan — confirm classification with the manufacturer and local Building before delivery.`,
          sources,
        },
      ],
    };
  }

  reasons.push({
    text: `${model.label}: ${model.sqFt} sq ft floor area is within the ≤${MAX_PARK_MODEL_SQ_FT} sq ft park-model / THOW size envelope commonly used for wheeled units (ANSI A119.5 / NOAH target). Confirm the data plate, VIN, and certification seal match the unit delivered.`,
    sources,
  });

  switch (model.certification) {
    case "noah":
      reasons.push({
        text: "NOAH dwelling / ANSI A119.5 park-trailer certification targets support residential or recreational classification claims as a product seal — not a state occupancy or placement permit. Confirm the jurisdiction accepts the seal class for the intended use before delivery.",
        sources:
          normalizeRegionCode(input.region ?? "") === "WA"
            ? [SRC.waWacParkTrailer, SRC.waLniFasLaws, SRC.noahDwelling]
            : [SRC.hcdTinyHomesIb, SRC.noahDwelling, SRC.waWacParkTrailer],
      });
      return { status: "eligible", reasons };

    case "ansi_a119_5":
      reasons.push({
        text: "ANSI A119.5 (park trailer) certification is commonly recreational / seasonal. Do not assume year-round residential occupancy from A119.5 alone — confirm local occupancy and utility rules before treating this as a dwelling path. The seal is not a placement permit.",
        sources,
      });
      return { status: "warning", reasons };

    case "rvia":
      reasons.push({
        text: "RVIA certification supports RV / recreational classification. Permanent residential occupancy still depends on local zoning and park / RV occupancy rules — not automatic from the seal.",
        sources: [SRC.rvia, SRC.hcdTinyHomesIb],
      });
      return { status: "warning", reasons };

    case "unknown":
    default:
      reasons.push({
        text: "Certification class is unverified for this model profile. Expect NOAH, ANSI A119.5, or RVIA documentation (data plate / VIN / seal) before delivery. Unknown certification is not a delivery-ready Green for certification fit.",
        sources,
      });
      return { status: "warning", reasons };
  }
}
