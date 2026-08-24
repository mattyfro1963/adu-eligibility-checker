import type { Parcel, ZoningReport } from "@/lib/types/zoning";
import { evaluateAduStandard } from "@/lib/rules/adu-standard";
import { evaluateCertification } from "@/lib/rules/certification";
import { computeThowOverall } from "@/lib/rules/compute-thow-overall";
import { evaluateLotReadiness } from "@/lib/rules/lot-readiness";
import { evaluatePlacement } from "@/lib/rules/placement";
import { evaluateSb9Eligibility } from "@/lib/rules/sb9-eligibility";
import { thowSummaryForStatus } from "@/lib/rules/thow-summary";
import { evaluateTransport } from "@/lib/rules/transport";
import { computeUnitCapacity } from "@/lib/rules/unit-capacity";
import type { ThowModelProfile } from "@/lib/rules/thow-models";

export { computeThowOverall } from "@/lib/rules/compute-thow-overall";
/** @deprecated Prefer computeThowOverall — kept for transitional imports. */
export { computeOverall } from "@/lib/rules/compute-overall";
export {
  evaluateJurisdictionContext,
  inferAduPostureFromNote,
  inferPlacementPostureFromNote,
} from "@/lib/rules/jurisdiction-context";
export {
  computeUnitCapacity,
  SB9_FOUR_UNIT_MIN_SQFT,
  SB9_LOT_SPLIT_MIN_SQFT,
} from "@/lib/rules/unit-capacity";
export {
  isPublishedThowState,
  PUBLISHED_THOW_STATES,
} from "@/lib/rules/published-states";
export {
  UNSUPPORTED_STATE_THOW_COPY,
  thowSummaryForStatus,
} from "@/lib/rules/thow-summary";

export type EvaluateEligibilityOptions = {
  /** USPS region (CA / OR / WA published). Defaults to CA for legacy lot GIS. */
  region?: string | null;
  model?: ThowModelProfile;
};

/**
 * Orchestrator: THOW dimensions drive overall; ADU is an optional pathway;
 * SB 9 remains computed but does not set overall.
 */
export function evaluateEligibility(
  parcel: Parcel,
  options: EvaluateEligibilityOptions = {},
): ZoningReport {
  const region = options.region ?? "CA";
  const model = options.model;

  const placement = evaluatePlacement(parcel, {
    expressLocalPath:
      parcel.overlaysVerified === true && parcel.overlays.tinyHomeFriendly,
  });
  const certification = evaluateCertification({ model });
  const transport = evaluateTransport({ region, model });
  const lotReadiness = evaluateLotReadiness(parcel, {});

  const dimensions = {
    placement,
    certification,
    transport,
    lotReadiness,
  };

  const thowOverall = computeThowOverall(dimensions);
  const adu = evaluateAduStandard(parcel);
  const sb9 = evaluateSb9Eligibility(parcel);
  const unitCapacity = computeUnitCapacity(parcel, sb9.status);

  return {
    addressId: parcel.addressId,
    formattedAddress: parcel.formattedAddress,
    zoning: parcel.zoning,
    overlays: parcel.overlays,
    overlaysVerified: parcel.overlaysVerified === true,
    mapblklot: parcel.mapblklot ?? null,
    overall: thowOverall,
    thowOverall,
    thowSummary: thowSummaryForStatus(thowOverall),
    dimensions,
    adu,
    sb9,
    analysisScope: "lot_zoning",
    coverage: "lot",
    unitCapacity,
    lotSizeSqFt: parcel.lotSizeSqFt ?? null,
    zoningDistrictName: parcel.zoningDistrictName ?? null,
    zoningSourceUrl: parcel.zoningSourceUrl ?? null,
    region,
  };
}

export type { JurisdictionContextInput } from "@/lib/rules/jurisdiction-context";
