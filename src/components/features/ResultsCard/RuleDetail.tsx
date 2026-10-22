import type { EligibilityResult } from "@/lib/types/zoning";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { CitedText } from "@/components/features/ResultsCard/CitedText";

export function RuleDetail({
  result,
  title,
  category,
  headingLevel = 3,
  compact = false,
  index = 0,
  inviteNextStep = false,
}: {
  result: EligibilityResult;
  title: string;
  category: string;
  /** Under report `h2` use 3; under an expandable `h3` use 4. */
  headingLevel?: 3 | 4;
  /** First-chrome row: badge, title, one engine reason. */
  compact?: boolean;
  /** Stagger index for compact rows (0–3). */
  index?: number;
  /** Zeigarnik: unverified utilities as an open loop, not a failure. */
  inviteNextStep?: boolean;
}) {
  const rationaleSources = result.reasons.flatMap((reason) => reason.sources);
  const TitleTag = headingLevel === 4 ? "h4" : "h3";
  const leadReason = result.reasons[0] ?? null;

  if (compact) {
    return (
      <article
        className="dim-stagger border-b border-luxury-taupe/22 py-3.5 last:border-b-0 last:pb-0"
        style={{ animationDelay: `${index * 90}ms` }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-label text-[10px] tracking-[0.18em] text-luxury-taupe">
            {category}
          </span>
          <EligibilityBadge status={result.status} />
        </div>
        <TitleTag className="font-sans text-base font-medium tracking-[-0.02em] text-text-luxury">
          {title}
        </TitleTag>
        {leadReason ? (
          <CitedText
            claim={leadReason}
            showSources={false}
            className="mt-2 text-[13px] leading-relaxed font-light text-text-luxury/62"
          />
        ) : (
          <p className="mt-2 text-[13px] leading-relaxed font-light text-text-luxury/62">
            No additional detail from the rules engine.
          </p>
        )}
        {inviteNextStep ? (
          <p className="mt-2 text-[13px] leading-relaxed text-luxury-wood">
            This stays open until you confirm locally — or continue with
            specialist review.
          </p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="border-b border-border-luxury py-6 first:pt-0 last:border-b-0 last:pb-0 sm:py-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-label text-[10px] tracking-[0.14em] text-luxury-taupe">
          {category}
        </span>
        <EligibilityBadge status={result.status} />
      </div>

      <TitleTag className="mb-2 font-sans text-lg font-medium tracking-[-0.02em] text-text-luxury">
        {title}
      </TitleTag>

      {result.reasons.length > 0 ? (
        <ul className="mb-5 list-none space-y-3">
          {result.reasons.map((reason) => (
            <li key={reason.text}>
              <CitedText
                claim={reason}
                className="text-sm leading-relaxed font-light text-muted-foreground"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 text-sm leading-relaxed font-light text-muted-foreground">
          No additional detail from the rules engine.
        </p>
      )}

      <ExpandableSection
        title="Statute rationale & references"
        description="Program citations and official source links"
        defaultOpen={false}
        variant="muted"
        contentClassName="p-0 sm:p-0"
        className="border-border-luxury"
        headingLevel="none"
      >
        <div className="flex items-start gap-3 border-0 bg-surface-luxury/50 p-3.5 sm:p-4">
          <div
            className="mt-0.5 w-1 shrink-0 self-stretch rounded-full bg-border-luxury"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1.5">
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              <span className="mr-1 font-normal text-foreground">
                RATIONALE:
              </span>
              {category === "ADU"
                ? "Gov. Code Chapter 13 (§§ 66310–66342)"
                : "Gov. Code §§ 65852.21 & 66411.7 (2021 SB 9)"}
            </p>
            {rationaleSources.length > 0 ? (
              <CitedText
                claim={{
                  text: "Official references for this program card.",
                  sources: rationaleSources,
                }}
                className="text-xs leading-relaxed text-muted-foreground"
              />
            ) : null}
          </div>
        </div>
      </ExpandableSection>
    </article>
  );
}
