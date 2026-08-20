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
  const [primary, ...rest] = result.reasons;
  const rationaleSources = primary?.sources ?? [];

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

      {primary ? (
        <CitedText
          claim={primary}
          className="mb-3 text-sm leading-relaxed font-light text-muted-foreground"
        />
      ) : (
        <p className="mb-3 text-sm leading-relaxed font-light text-muted-foreground">
          No additional detail from the rules engine.
        </p>
      )}

      {rest.length > 0 ? (
        <ExpandableSection
          title="Additional engine reasons"
          description={`${rest.length} more cited factor${rest.length === 1 ? "" : "s"} from the rules engine`}
          defaultOpen={false}
          variant="muted"
          contentClassName="px-0 py-0 sm:px-0 sm:py-0"
          className="mb-5 border-0 bg-transparent shadow-none"
        >
          <ul className="list-none space-y-3 px-4 py-4 sm:px-5">
            {rest.map((reason) => (
              <li key={reason.text}>
                <CitedText claim={reason} />
              </li>
            ))}
          </ul>
        </ExpandableSection>
      ) : (
        <div className="mb-5" />
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
