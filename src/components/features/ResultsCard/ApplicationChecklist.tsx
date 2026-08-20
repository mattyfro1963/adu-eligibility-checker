import { ListChecks } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import type { ChecklistItem } from "@/lib/regulations/types";

/** California application checklist from compose-briefing. */
export function ApplicationChecklist({
  items,
  title = "California application checklist",
}: {
  items: ChecklistItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="application-checklist-heading"
      className="rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:rounded-[1.5rem] sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
          <ListChecks size={18} className="text-slate-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="application-checklist-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            Brief steps before you apply — start with primary use, then zoning
          </p>
        </div>
      </div>
      <ol className="space-y-5">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-3 sm:gap-4">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#F5F5F7] font-mono text-xs font-semibold text-slate-700"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="font-medium text-slate-900">{item.title}</p>
              <CitedText claim={item.detail} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
