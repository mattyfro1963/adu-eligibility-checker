import type { EligibilityResult } from "@/lib/types/zoning";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";

export function RuleDetail({
  result,
  title,
  category,
  statute,
}: {
  result: EligibilityResult;
  title: string;
  category: string;
  statute: string;
}) {
  const [primary, ...rest] = result.reasons;
  const description = primary ?? "No additional detail from the rules engine.";

  return (
    <article className="group rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded border border-slate-200/80 bg-[#F5F5F7] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-slate-500 uppercase shadow-inner">
          {category}
        </span>
        <EligibilityBadge status={result.status} />
      </div>

      <h4 className="mb-2 text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-black">
        {title}
      </h4>
      <p className="mb-3 text-sm leading-relaxed font-light text-slate-500">
        {description}
      </p>

      {rest.length > 0 ? (
        <ul className="mb-5 list-disc space-y-1.5 pl-5">
          {rest.map((reason) => (
            <li key={reason} className="text-sm leading-relaxed text-slate-600">
              {reason}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-5" />
      )}

      <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-[#F5F5F7] p-4">
        <div
          className="mt-0.5 w-1 shrink-0 self-stretch rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <p className="font-mono text-xs leading-relaxed text-slate-600">
          <span className="mr-1 font-semibold text-slate-900">RATIONALE:</span>
          {statute}
        </p>
      </div>
    </article>
  );
}
