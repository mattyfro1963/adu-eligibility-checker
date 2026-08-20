import type { EligibilityResult } from "@/lib/types/zoning";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
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
    <article className="group rounded-xl border border-border bg-white p-5 shadow-registry transition-colors hover:border-slate-300 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded border border-slate-200/80 bg-[#F5F5F7] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-slate-500 uppercase shadow-inner">
          {category}
        </span>
        <EligibilityBadge status={result.status} />
      </div>

      <h4 className="mb-2 text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-black">
        {title}
      </h4>

      {primary ? (
        <CitedText
          claim={primary}
          className="mb-3 text-sm leading-relaxed font-light text-slate-500"
        />
      ) : (
        <p className="mb-3 text-sm leading-relaxed font-light text-slate-500">
          No additional detail from the rules engine.
        </p>
      )}

      {rest.length > 0 ? (
        <ul className="mb-5 list-none space-y-3">
          {rest.map((reason) => (
            <li key={reason.text}>
              <CitedText claim={reason} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-5" />
      )}

      <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-[#F5F5F7] p-3.5 sm:p-4">
        <div
          className="mt-0.5 w-1 shrink-0 self-stretch rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1.5">
          <p className="font-mono text-xs leading-relaxed text-slate-600">
            <span className="mr-1 font-semibold text-slate-900">
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
              className="text-xs leading-relaxed text-slate-500"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
