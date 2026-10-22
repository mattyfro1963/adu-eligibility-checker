/**
 * Featured CAMBRIA 1 / CAMBRIA 2 product catalog + per-plan evaluation.
 * Zero React. Gate logic stays in src/lib/rules/; this file brands and compares.
 */

import { evaluateCertification } from "@/lib/rules/certification";
import { computeThowOverall } from "@/lib/rules/compute-thow-overall";
import {
  evaluateLotReadiness,
  type LotReadinessContext,
} from "@/lib/rules/lot-readiness";
import {
  evaluatePlacement,
  type PlacementContext,
} from "@/lib/rules/placement";
import { isPublishedThowState } from "@/lib/rules/published-states";
import { UNSUPPORTED_STATE_THOW_COPY } from "@/lib/rules/thow-summary";
import {
  CAMBRIA_1_MODEL,
  CAMBRIA_2_MODEL,
  type ThowModelProfile,
} from "@/lib/rules/thow-models";
import { evaluateTransport } from "@/lib/rules/transport";
import { SRC, uniqueSourceRefs } from "@/lib/regulations/sources";
import type { SourceRef } from "@/lib/regulations/types";
import type {
  EligibilityStatus,
  Parcel,
  ThowDimensions,
} from "@/lib/types/zoning";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";

export type FeaturedPlanId = "cambria-1" | "cambria-2";

export type LotRating = "green" | "yellow" | "red";

export type FeaturedThowPlan = {
  id: FeaturedPlanId;
  name: "CAMBRIA 1" | "CAMBRIA 2";
  widthFt: number;
  roadHeightFt: number;
  squareFeet: number;
  certificationTarget: string;
  /** Product positioning — not a legal clearance claim. */
  transportPositioning: string;
};

export const CAMBRIA_1: FeaturedThowPlan = {
  id: "cambria-1",
  name: "CAMBRIA 1",
  widthFt: 11.4,
  roadHeightFt: 14,
  squareFeet: 400,
  certificationTarget: "ANSI A119.5 / NOAH",
  transportPositioning: "Route-qualified no-pilot delivery only",
};

export const CAMBRIA_2: FeaturedThowPlan = {
  id: "cambria-2",
  name: "CAMBRIA 2",
  widthFt: 11.0,
  roadHeightFt: 14,
  squareFeet: 400,
  certificationTarget: "ANSI A119.5 / NOAH",
  transportPositioning: "Designed to minimize pilot-car requirements",
};

export const FEATURED_PLANS: readonly FeaturedThowPlan[] = [
  CAMBRIA_1,
  CAMBRIA_2,
];

export const PREFERRED_FEATURED_PLAN_ID: FeaturedPlanId = "cambria-1";

export type FeaturedPlanEligibility = {
  planId: FeaturedPlanId;
  planName: "CAMBRIA 1" | "CAMBRIA 2";
  lotRating: LotRating;
  placementSummary: string;
  transportSummary: string;
  certificationSummary: string;
  nextSteps: string[];
  /** Dimension statuses for UI badges (transport fit column). */
  transportStatus: EligibilityStatus;
  placementStatus: EligibilityStatus;
  /** Official cites for transport / placement summaries (UI outbound links). */
  transportSources: SourceRef[];
  placementSources: SourceRef[];
  certificationSources: SourceRef[];
};

export type FeaturedPlanRecommendation = {
  recommendedPlanId: FeaturedPlanId | null;
  rationale: string;
};

export type ThowPlanEvaluation = {
  plan: FeaturedThowPlan;
  eligibility: FeaturedPlanEligibility;
  dimensions: ThowDimensions;
  thowOverall: EligibilityStatus;
  model: ThowModelProfile;
};

const UNSUPPORTED_SOURCES = [
  SRC.hcdTinyHomesIb,
  SRC.noahDwelling,
  SRC.waWacParkTrailer,
] as const;

export function toThowModelProfile(plan: FeaturedThowPlan): ThowModelProfile {
  if (plan.id === "cambria-1") return { ...CAMBRIA_1_MODEL };
  return { ...CAMBRIA_2_MODEL };
}

export function statusToLotRating(status: EligibilityStatus): LotRating {
  switch (status) {
    case "eligible":
      return "green";
    case "warning":
      return "yellow";
    case "restricted":
      return "red";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function lotRatingToStatus(rating: LotRating): EligibilityStatus {
  switch (rating) {
    case "green":
      return "eligible";
    case "yellow":
      return "warning";
    case "red":
      return "restricted";
    default: {
      const _exhaustive: never = rating;
      return _exhaustive;
    }
  }
}

function sourcesFromReasons(reasons: { sources: SourceRef[] }[]): SourceRef[] {
  return uniqueSourceRefs(reasons.flatMap((r) => r.sources));
}

function firstReasonText(
  reasons: { text: string }[],
  fallback: string,
): string {
  const text = reasons[0]?.text?.trim();
  return text && text.length > 0 ? text : fallback;
}

function nextStepsFromDimensions(dimensions: ThowDimensions): string[] {
  const steps: string[] = [];
  for (const gate of [
    dimensions.placement,
    dimensions.certification,
    dimensions.transport,
    dimensions.lotReadiness,
  ]) {
    for (const reason of gate.reasons) {
      const text = reason.text.trim();
      if (text && !steps.includes(text)) {
        steps.push(text);
      }
    }
  }
  return steps.slice(0, 6);
}

export type EvaluateThowPlanInput = {
  parcel: Parcel | null;
  region?: string | null;
  plan: FeaturedThowPlan;
  placementContext?: PlacementContext;
  lotReadinessContext?: LotReadinessContext;
};

/**
 * Evaluate one featured plan against placement / cert / transport / lot readiness.
 * Summaries and nextSteps are taken only from cited dimension reasons.
 */
export function evaluateThowPlanForState(
  input: EvaluateThowPlanInput,
): ThowPlanEvaluation {
  const plan = input.plan;
  const model = toThowModelProfile(plan);
  const region = normalizeRegionCode(input.region ?? "");

  if (!isPublishedThowState(region)) {
    const restricted = {
      status: "restricted" as const,
      reasons: [
        {
          text: UNSUPPORTED_STATE_THOW_COPY,
          sources: [...UNSUPPORTED_SOURCES],
        },
      ],
    };
    const dimensions: ThowDimensions = {
      placement: restricted,
      certification: restricted,
      transport: restricted,
      lotReadiness: restricted,
    };
    return {
      plan,
      model,
      dimensions,
      thowOverall: "restricted",
      eligibility: {
        planId: plan.id,
        planName: plan.name,
        lotRating: "red",
        placementSummary: UNSUPPORTED_STATE_THOW_COPY,
        transportSummary: UNSUPPORTED_STATE_THOW_COPY,
        certificationSummary: UNSUPPORTED_STATE_THOW_COPY,
        nextSteps: [UNSUPPORTED_STATE_THOW_COPY],
        transportStatus: "restricted",
        placementStatus: "restricted",
        transportSources: [...UNSUPPORTED_SOURCES],
        placementSources: [...UNSUPPORTED_SOURCES],
        certificationSources: [...UNSUPPORTED_SOURCES],
      },
    };
  }

  const placement = evaluatePlacement(
    input.parcel,
    input.placementContext ?? {},
  );
  const certification = evaluateCertification({ model, region });
  const transport = evaluateTransport({ region, model });
  const lotReadiness = evaluateLotReadiness(
    input.parcel,
    input.lotReadinessContext ?? {},
  );

  const dimensions: ThowDimensions = {
    placement,
    certification,
    transport,
    lotReadiness,
  };

  const thowOverall = computeThowOverall(dimensions, {
    region,
    widthFt: model.widthFt,
  });

  return {
    plan,
    model,
    dimensions,
    thowOverall,
    eligibility: {
      planId: plan.id,
      planName: plan.name,
      lotRating: statusToLotRating(thowOverall),
      placementSummary: firstReasonText(
        placement.reasons,
        "Confirm local THOW / park-model placement with Planning/Building.",
      ),
      transportSummary: firstReasonText(
        transport.reasons,
        "Complete a hauler route review and confirm state oversize permits.",
      ),
      certificationSummary: firstReasonText(
        certification.reasons,
        "Confirm certification seal and data plate before delivery.",
      ),
      nextSteps: nextStepsFromDimensions(dimensions),
      transportStatus: transport.status,
      placementStatus: placement.status,
      transportSources: sourcesFromReasons(transport.reasons),
      placementSources: sourcesFromReasons(placement.reasons),
      certificationSources: sourcesFromReasons(certification.reasons),
    },
  };
}

/**
 * Business recommendation matrix from the CAMBRIA brief.
 * Preferred plan when both Green: CAMBRIA 1.
 */
export function recommendFeaturedPlan(
  plans: FeaturedPlanEligibility[],
): FeaturedPlanRecommendation {
  const c1 = plans.find((p) => p.planId === "cambria-1");
  const c2 = plans.find((p) => p.planId === "cambria-2");
  if (!c1 || !c2) {
    return {
      recommendedPlanId: null,
      rationale:
        "Both featured plans could not be evaluated. Confirm local placement and transport before relying on this lot.",
    };
  }

  if (c1.lotRating === "green" && c2.lotRating === "green") {
    return {
      recommendedPlanId: PREFERRED_FEATURED_PLAN_ID,
      rationale:
        "Both CAMBRIA 1 and CAMBRIA 2 rate Green for this lot. Leading with CAMBRIA 1 (preferred featured plan); CAMBRIA 2 remains a strong transport-optimized alternative.",
    };
  }

  if (c1.lotRating === "yellow" && c2.lotRating === "green") {
    return {
      recommendedPlanId: "cambria-2",
      rationale:
        "CAMBRIA 1 is Yellow while CAMBRIA 2 is Green — recommend CAMBRIA 2 for easier delivery alignment and a clearer lot fit on this address.",
    };
  }

  if (
    c1.lotRating === "red" &&
    (c2.lotRating === "yellow" || c2.lotRating === "green")
  ) {
    return {
      recommendedPlanId: "cambria-2",
      rationale:
        "CAMBRIA 1 is Red for this lot. Treat the address as a CAMBRIA 2 opportunity only — confirm local placement and transport before delivery.",
    };
  }

  if (c1.lotRating === "yellow" && c2.lotRating === "yellow") {
    return {
      recommendedPlanId: null,
      rationale:
        "Both CAMBRIA 1 and CAMBRIA 2 are Yellow. A paid feasibility review is the next step before committing to a plan or delivery date.",
    };
  }

  if (c1.lotRating === "red" && c2.lotRating === "red") {
    return {
      recommendedPlanId: null,
      rationale:
        "Both CAMBRIA 1 and CAMBRIA 2 are Red. This lot is a weak THOW candidate — consider a different property type or obtain a written local approval path before proceeding.",
    };
  }

  // Remaining mixed cases (e.g. C1 green + C2 yellow/red): prefer C1 when Green.
  if (c1.lotRating === "green") {
    return {
      recommendedPlanId: "cambria-1",
      rationale:
        "CAMBRIA 1 rates Green for this lot. Prefer CAMBRIA 1; review CAMBRIA 2 transport notes if a narrower envelope is required.",
    };
  }

  if (c2.lotRating === "green") {
    return {
      recommendedPlanId: "cambria-2",
      rationale:
        "CAMBRIA 2 rates Green for this lot. Prefer CAMBRIA 2 given the current CAMBRIA 1 rating.",
    };
  }

  return {
    recommendedPlanId: null,
    rationale:
      "Plan ratings need specialist review. Confirm local placement, utilities, and haul route before selecting CAMBRIA 1 or CAMBRIA 2.",
  };
}

/** Worst-of-two overall when recommendation is null (both yellow or both red). */
export function worstThowOverall(
  a: EligibilityStatus,
  b: EligibilityStatus,
): EligibilityStatus {
  const rank: Record<EligibilityStatus, number> = {
    eligible: 0,
    warning: 1,
    restricted: 2,
  };
  return rank[a] >= rank[b] ? a : b;
}

export function evaluateFeaturedPlansForLot(input: {
  parcel: Parcel | null;
  region?: string | null;
  placementContext?: PlacementContext;
  lotReadinessContext?: LotReadinessContext;
}): {
  evaluations: ThowPlanEvaluation[];
  featuredPlans: FeaturedPlanEligibility[];
  planRecommendation: FeaturedPlanRecommendation;
} {
  const evaluations = FEATURED_PLANS.map((plan) =>
    evaluateThowPlanForState({
      parcel: input.parcel,
      region: input.region,
      plan,
      placementContext: input.placementContext,
      lotReadinessContext: input.lotReadinessContext,
    }),
  );
  const featuredPlans = evaluations.map((e) => e.eligibility);
  const planRecommendation = recommendFeaturedPlan(featuredPlans);
  return { evaluations, featuredPlans, planRecommendation };
}
