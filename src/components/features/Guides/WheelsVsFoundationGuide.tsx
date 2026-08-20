import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { GuideLayout } from "@/components/features/Guides/GuideLayout";
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
      <section aria-labelledby="decision-tree-heading" className="space-y-6">
        <h2
          id="decision-tree-heading"
          className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
        >
          Decision tree
        </h2>
        <ol className="space-y-5">
          {DECISION_NODES.map((node, index) => (
            <li
              key={node.id}
              id={node.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6"
            >
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {node.question}
              </h3>
              <div className="mt-3">
                {isCitedClaim(node.guidance) ? (
                  <CitedText claim={node.guidance} as="div" />
                ) : (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {node.guidance.text}
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-3">
                {node.outcomes.map((outcome) => (
                  <li
                    key={outcome.label}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {outcome.label}
                      {outcome.nextId ? (
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          → continue at #{outcome.nextId}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {outcome.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="comparison-heading" className="space-y-4">
        <h2
          id="comparison-heading"
          className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
        >
          Side-by-side trade-offs
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  Dimension
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  Wheels / THOW
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  Foundation ADU
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 align-top last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-slate-900"
                  >
                    {row.dimension}
                  </th>
                  <td className="px-4 py-3 leading-relaxed text-slate-600">
                    {row.wheels}
                  </td>
                  <td className="px-4 py-3 leading-relaxed text-slate-600">
                    {row.foundation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </GuideLayout>
  );
}
