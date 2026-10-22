"use client";

import type {
  FeaturedPlanEligibility,
  FeaturedPlanRecommendation,
  LotRating,
} from "@/lib/thow/plans";
import { lotRatingToStatus } from "@/lib/thow/plans";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import type { EligibilityStatus } from "@/lib/types/zoning";

function transportFitLabel(status: EligibilityStatus): string {
  switch (status) {
    case "eligible":
      return "Lower escort trigger risk";
    case "warning":
      return "Route-specific";
    case "restricted":
      return "Not screened";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function placementFitLabel(plan: FeaturedPlanEligibility): string {
  switch (plan.placementStatus) {
    case "eligible":
      return "Express local path signals";
    case "warning":
      return "Needs local THOW/PMRV confirmation";
    case "restricted":
      return "No clear placement path";
    default: {
      const _exhaustive: never = plan.placementStatus;
      return _exhaustive;
    }
  }
}

function ratingBadge(rating: LotRating) {
  return <EligibilityBadge status={lotRatingToStatus(rating)} size="sm" />;
}

export function CambriaPlanComparison({
  plans,
  recommendation,
}: {
  plans: FeaturedPlanEligibility[];
  recommendation?: FeaturedPlanRecommendation | null;
}) {
  if (plans.length === 0) return null;

  return (
    <section
      aria-labelledby="cambria-plan-comparison-heading"
      className="space-y-3"
    >
      <div>
        <h3
          id="cambria-plan-comparison-heading"
          className="font-label text-muted-foreground"
        >
          CAMBRIA 1 vs CAMBRIA 2
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Side-by-side lot fit for featured Tiny Home on Wheels plans. Every
          transport and placement claim links to an official source.
        </p>
      </div>

      {recommendation ? (
        <p
          role="status"
          className="rounded-input border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-foreground"
        >
          <span className="font-medium">Plan recommendation: </span>
          {recommendation.rationale}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                scope="col"
                className="px-3 py-2.5 font-label text-[10px] text-muted-foreground"
              >
                Plan
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 font-label text-[10px] text-muted-foreground"
              >
                Lot fit
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 font-label text-[10px] text-muted-foreground"
              >
                Transport fit
              </th>
              <th
                scope="col"
                className="px-3 py-2.5 font-label text-[10px] text-muted-foreground"
              >
                Placement path
              </th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const recommended =
                recommendation?.recommendedPlanId === plan.planId;
              return (
                <tr
                  key={plan.planId}
                  className={
                    recommended
                      ? "border-b border-border bg-emerald-500/5 last:border-b-0"
                      : "border-b border-border last:border-b-0"
                  }
                >
                  <th
                    scope="row"
                    className="px-3 py-3 align-top font-medium text-foreground"
                  >
                    {plan.planName}
                    {recommended ? (
                      <span className="mt-1 block text-[10px] font-normal tracking-wide text-emerald-700 uppercase">
                        Recommended
                      </span>
                    ) : null}
                  </th>
                  <td className="px-3 py-3 align-top">
                    {ratingBadge(plan.lotRating)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="space-y-1.5">
                      <EligibilityBadge
                        status={plan.transportStatus}
                        size="sm"
                      />
                      <p className="text-xs leading-snug text-muted-foreground">
                        {transportFitLabel(plan.transportStatus)}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-xs leading-snug text-muted-foreground">
                    {placementFitLabel(plan)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3">
        {plans.map((plan) => (
          <li
            key={`${plan.planId}-detail`}
            className="rounded-xl border border-border/80 bg-card px-3 py-2.5"
          >
            <p className="text-xs font-medium text-foreground">
              {plan.planName}
            </p>
            <CitedText
              claim={{
                text: plan.transportSummary,
                sources: plan.transportSources,
              }}
              className="mt-1 text-xs leading-relaxed text-muted-foreground"
            />
            <CitedText
              claim={{
                text: plan.placementSummary,
                sources: plan.placementSources,
              }}
              className="mt-2 text-xs leading-relaxed text-muted-foreground"
            />
            {plan.nextSteps[0] ? (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Next: {plan.nextSteps[0]}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
