import { Scale } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import type { OutlineSection } from "@/lib/regulations/types";

/** California building-path outline (use, ADU, park model, cabin, modular). */
export function CaliforniaOutline({
  sections,
}: {
  sections: OutlineSection[];
}) {
  if (sections.length === 0) return null;

  return (
    <section
      aria-labelledby="ca-outline-heading"
      className="rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:rounded-[1.5rem] sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
          <Scale size={18} className="text-slate-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="ca-outline-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            California building paths
          </h3>
          <p className="text-xs text-slate-500">
            Statewide context — state floor first, then local code
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {sections.map((section) => (
          <details
            key={section.id}
            className="group rounded-xl border border-slate-200/80 bg-[#F5F5F7]/40 open:bg-white open:shadow-sm"
            open={section.id === "use-of-land"}
          >
            <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>{section.title}</span>
                <span className="text-xs font-normal tracking-wide text-slate-400 uppercase group-open:hidden">
                  Expand
                </span>
                <span className="hidden text-xs font-normal tracking-wide text-slate-400 uppercase group-open:inline">
                  Collapse
                </span>
              </span>
            </summary>
            <ul className="space-y-4 border-t border-slate-100 px-4 py-4">
              {section.claims.map((claim) => (
                <li key={claim.text.slice(0, 40)}>
                  <CitedText claim={claim} />
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
