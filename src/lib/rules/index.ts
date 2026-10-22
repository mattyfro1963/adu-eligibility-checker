import type { Parcel, ZoningReport } from "@/lib/types/zoning";
import { evaluateAduStandard } from "@/lib/rules/adu-standard";
import { evaluateSb9Eligibility } from "@/lib/rules/sb9-eligibility";
import { thowSummaryForStatus } from "@/lib/rules/thow-summary";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
import { computeUnitCapacity } from "@/lib/rules/unit-capacity";
import type { ThowModelProfile } from "@/lib/rules/thow-models";
import {
  evaluateFeaturedPlansForLot,
  PREFERRED_FEATURED_PLAN_ID,
  worstThowOverall,
} from "@/lib/thow/plans";

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
  /**
   * Optional single-model override for transitional callers.
   * Featured CAMBRIA plans are always evaluated; when set, dimensions prefer
   * the matching featured plan if present.
   */
  model?: ThowModelProfile;
};

/**
 * Orchestrator: evaluate CAMBRIA 1 + 2; THOW dimensions drive overall;
 * ADU is an optional pathway; SB 9 remains computed but does not set overall.
 */
export function evaluateEligibility(
  parcel: Parcel,
  options: EvaluateEligibilityOptions = {},
): ZoningReport {
  const region = options.region ?? "CA";

  const placementContext = {
    expressLocalPath:
      parcel.overlaysVerified === true && parcel.overlays.tinyHomeFriendly,
  };

  const { evaluations, featuredPlans, planRecommendation } =
    evaluateFeaturedPlansForLot({
      parcel,
      region,
      placementContext,
      lotReadinessContext: {},
    });

  const recommendedId =
    planRecommendation.recommendedPlanId ?? PREFERRED_FEATURED_PLAN_ID;
  const recommendedEval =
    evaluations.find((e) => e.plan.id === recommendedId) ?? evaluations[0]!;
  const cambria1 = evaluations.find((e) => e.plan.id === "cambria-1")!;
  const cambria2 = evaluations.find((e) => e.plan.id === "cambria-2")!;

  // When recommendation is null (both yellow or both red), use worst-of-two
  // overall and CAMBRIA 1 dimensions for the legacy single-panel breakdown.
  const useRecommended = planRecommendation.recommendedPlanId != null;
  const primary = useRecommended ? recommendedEval : cambria1;
  const thowOverall = useRecommended
    ? primary.thowOverall
    : worstThowOverall(cambria1.thowOverall, cambria2.thowOverall);

  // Transitional model override: prefer matching featured plan dimensions.
  let dimensions = primary.dimensions;
  if (options.model) {
    const match = evaluations.find((e) => e.model.id === options.model?.id);
    if (match) {
      dimensions = match.dimensions;
    }
  }

  const adu = evaluateAduStandard(parcel);
  const sb9 = evaluateSb9Eligibility(parcel);
  const unitCapacity = computeUnitCapacity(parcel, sb9.status);

  const report: ZoningReport = {
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
    featuredPlans,
    planRecommendation,
    adu,
    sb9,
    analysisScope: "lot_zoning",
    coverage: "lot",
    unitCapacity,
    lotSizeSqFt: parcel.lotSizeSqFt ?? null,
    parcelBoundary: parcel.parcelBoundary ?? null,
    boundarySource: parcel.boundarySource ?? null,
    zoningDistrictName: parcel.zoningDistrictName ?? null,
    zoningSourceUrl: parcel.zoningSourceUrl ?? null,
    region,
  };
  report.statutoryEvaluations = buildStatutoryEvaluations(parcel, report);
  return report;
}

export type { JurisdictionContextInput } from "@/lib/rules/jurisdiction-context";
