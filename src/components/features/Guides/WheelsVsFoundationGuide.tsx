import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { GuideLayout } from "@/components/features/Guides/GuideLayout";
import { ExpandableSection } from "@/components/ui/expandable-section";
import {
  COMPARISON_ROWS,
  DECISION_NODES,
  WHEELS_VS_FOUNDATION_INTRO,
  WHEELS_VS_FOUNDATION_META,
} from "@/lib/content/guides/wheels-vs-foundation";
import type { CitedClaim } from "@/lib/regulations/types";

function isCitedClaim(
  guidance: CitedClaim | { text: string; sources?: never[] },
): guidance is CitedClaim {
  return Array.isArray(guidance.sources) && guidance.sources.length > 0;
}

export function WheelsVsFoundationGuide() {
  return (
    <GuideLayout
      meta={WHEELS_VS_FOUNDATION_META}
      lead={WHEELS_VS_FOUNDATION_INTRO.lead}
    >
      <section aria-labelledby="decision-tree-heading" className="space-y-4">
        <h2
          id="decision-tree-heading"
          className="text-xl font-normal tracking-tight text-foreground"
        >
          Decision tree
        </h2>
        <div className="space-y-3">
          {DECISION_NODES.map((node, index) => (
            <ExpandableSection
              key={node.id}
              id={node.id}
              title={`Step ${index + 1}: ${node.question}`}
              defaultOpen={index === 0}
              variant="muted"
            >
              {isCitedClaim(node.guidance) ? (
                <CitedText claim={node.guidance} as="div" />
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {node.guidance.text}
                </p>
              )}
              <ul className="mt-4 space-y-3">
                {node.outcomes.map((outcome) => (
                  <li
                    key={outcome.label}
                    className="rounded-lg border border-border bg-muted px-3 py-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {outcome.label}
                      {outcome.nextId ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          → continue at #{outcome.nextId}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {outcome.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          ))}
        </div>
      </section>

      <ExpandableSection
        id="comparison-heading"
        title="Side-by-side trade-offs"
        description="Wheels / THOW versus foundation ADU across key dimensions"
        defaultOpen={false}
      >
        <div className="overflow-x-auto rounded-[10px] border border-border bg-card shadow-editorial">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th
                  scope="col"
                  className="px-4 py-3 font-normal text-foreground"
                >
                  Dimension
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-normal text-foreground"
                >
                  Wheels / THOW
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-normal text-foreground"
                >
                  Foundation ADU
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border align-top last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-foreground"
                  >
                    {row.dimension}
                  </th>
                  <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                    {row.wheels}
                  </td>
                  <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                    {row.foundation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>
    </GuideLayout>
  );
}
