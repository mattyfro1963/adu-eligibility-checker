import type { EligibilityResult } from "@/lib/types/zoning";
import { Badge } from "@/components/ui/Badge";

export function RuleDetail({
  result,
  title,
}: {
  result: EligibilityResult;
  title: string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <Badge status={result.status} />
      </div>
      <ul className="list-disc space-y-1.5 pl-5">
        {result.reasons.map((reason) => (
          <li key={reason} className="text-sm leading-relaxed text-slate-600">
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
