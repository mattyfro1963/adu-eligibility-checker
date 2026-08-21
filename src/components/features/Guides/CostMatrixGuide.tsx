import { GuideLayout } from "@/components/features/Guides/GuideLayout";
import { ExpandableSection } from "@/components/ui/expandable-section";
import {
  COST_COLUMNS,
  COST_LINE_ITEMS,
  COST_METHODOLOGY_DISCLAIMER,
  SF_COST_INTRO,
  SF_COST_META,
} from "@/lib/content/guides/sf-cost-matrix";

export function CostMatrixGuide() {
  return (
    <GuideLayout
      meta={SF_COST_META}
      lead={SF_COST_INTRO.lead}
      disclaimer={COST_METHODOLOGY_DISCLAIMER}
    >
      <section aria-labelledby="cost-columns-heading" className="space-y-4">
        <h2
          id="cost-columns-heading"
          className="text-xl font-normal tracking-tight text-foreground"
        >
          Build paths compared
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COST_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rounded-[10px] border border-border bg-card p-4 sm:p-5"
            >
              <p className="font-normal text-foreground">{col.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {col.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="cost-matrix-heading">
        <ExpandableSection
          id="cost-matrix-heading"
          title="Line-item cost matrix"
          description="Crane, trenching, permits, and path-specific totals"
          defaultOpen={false}
        >
          <div className="overflow-x-auto rounded-[10px] border border-border bg-card shadow-editorial">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th
                    scope="col"
                    className="px-4 py-3 font-normal text-foreground"
                  >
                    Line item
                  </th>
                  {COST_COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className="px-4 py-3 font-normal text-foreground"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COST_LINE_ITEMS.map((line) => (
                  <tr
                    key={line.id}
                    className="border-b border-border align-top last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-foreground"
                    >
                      <span>{line.label}</span>
                      {line.note ? (
                        <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                          {line.note}
                        </span>
                      ) : null}
                    </th>
                    {COST_COLUMNS.map((col) => (
                      <td
                        key={col.id}
                        className="px-4 py-3 font-mono text-xs text-foreground sm:text-sm"
                      >
                        {line.amounts[col.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExpandableSection>
      </section>
    </GuideLayout>
  );
}
