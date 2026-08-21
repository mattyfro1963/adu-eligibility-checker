import type { EligibilityResult } from "@/lib/types/zoning";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { CitedText } from "@/components/features/ResultsCard/CitedText";

export function RuleDetail({
  result,
  title,
  category,
}: {
  result: EligibilityResult;
  title: string;
  category: string;
}) {
  const rationaleSources = result.reasons.flatMap((reason) => reason.sources);

  return (
    <article className="group border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="border border-border bg-muted px-2.5 py-1 font-mono text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
          {category}
        </span>
        <EligibilityBadge status={result.status} />
      </div>

      <h4 className="mb-2 text-lg font-medium tracking-[-0.02em] text-foreground">
        {title}
      </h4>

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
        className="border-border/80"
      >
        <div className="flex items-start gap-3 border-0 bg-muted p-3.5 sm:p-4">
          <div
            className="mt-0.5 w-1 shrink-0 self-stretch rounded-full bg-border"
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
