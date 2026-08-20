import { GuideLayout } from "@/components/features/Guides/GuideLayout";
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
          className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
        >
          Build paths compared
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COST_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5"
            >
              <p className="font-semibold text-slate-900">{col.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {col.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="cost-matrix-heading" className="space-y-4">
        <h2
          id="cost-matrix-heading"
          className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
        >
          Line-item cost matrix
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  Line item
                </th>
                {COST_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className="px-4 py-3 font-semibold text-slate-700"
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
                  className="border-b border-slate-100 align-top last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-slate-900"
                  >
                    <span>{line.label}</span>
                    {line.note ? (
                      <span className="mt-1 block text-xs font-normal leading-relaxed text-slate-500">
                        {line.note}
                      </span>
                    ) : null}
                  </th>
                  {COST_COLUMNS.map((col) => (
                    <td
                      key={col.id}
                      className="px-4 py-3 font-mono text-xs text-slate-700 sm:text-sm"
                    >
                      {line.amounts[col.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </GuideLayout>
  );
}
