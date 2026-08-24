/**
 * Certification fit for a THOW / park-model / RVIA-class unit.
 * Model profile drives size and seal class — unknown cert → Yellow.
 */

import { SRC } from "@/lib/regulations/sources";
import type { EligibilityResult } from "@/lib/types/zoning";
import {
  ACTIVE_THOW_MODEL,
  type ThowModelProfile,
} from "@/lib/rules/thow-models";

const CERT_SOURCES = [
  SRC.noahDwelling,
  SRC.hcdTinyHomesIb,
  SRC.rvia,
] as const;

const MAX_PARK_MODEL_SQ_FT = 400;

export type CertificationInput = {
  model?: ThowModelProfile;
};

/**
 * Evaluates certification / size / data-plate expectations for the active model.
 * Does not green-light placement — that is `evaluatePlacement`.
 */
export function evaluateCertification(
  input: CertificationInput = {},
): EligibilityResult {
  const model = input.model ?? ACTIVE_THOW_MODEL;
  const reasons: EligibilityResult["reasons"] = [];

  if (model.sqFt > MAX_PARK_MODEL_SQ_FT) {
    return {
      status: "restricted",
      reasons: [
        {
          text: `Model floor area (${model.sqFt} sq ft) exceeds the typical ≤${MAX_PARK_MODEL_SQ_FT} sq ft park-model / THOW envelope. Units above this size usually need a special transport and occupancy plan — confirm classification with the manufacturer and local Building before delivery.`,
          sources: [...CERT_SOURCES],
        },
      ],
    };
  }

  reasons.push({
    text: `${model.label}: ${model.sqFt} sq ft floor area is within the ≤${MAX_PARK_MODEL_SQ_FT} sq ft park-model / THOW size envelope commonly used for wheeled units. Confirm the data plate, VIN, and certification seal match the unit delivered.`,
    sources: [...CERT_SOURCES],
  });

  switch (model.certification) {
    case "noah":
      reasons.push({
        text: "NOAH dwelling certification supports residential occupancy expectations (data plate / seal file). Still confirm the jurisdiction accepts NOAH-certified THOWs for the intended use — certification alone is not a placement permit.",
        sources: [SRC.noahDwelling, SRC.hcdTinyHomesIb],
      });
      return { status: "eligible", reasons };

    case "ansi_a119_5":
      reasons.push({
        text: "ANSI A119.5 (park trailer) certification is commonly recreational / seasonal. Do not assume year-round residential occupancy from A119.5 alone — confirm local occupancy and utility rules before treating this as a dwelling path.",
        sources: [...CERT_SOURCES],
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
        sources: [...CERT_SOURCES],
      });
      return { status: "warning", reasons };
  }
}
