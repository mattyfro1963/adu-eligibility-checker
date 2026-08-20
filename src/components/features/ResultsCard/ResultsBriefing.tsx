import { BookOpen } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import type { CitedClaim } from "@/lib/regulations/types";

/** Use-first tiny-home why-this-lot summary from compose-briefing. */
export function ResultsBriefingSection({ summary }: { summary: CitedClaim[] }) {
  return (
    <section
      aria-labelledby="results-briefing-heading"
      className="rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:rounded-[1.5rem] sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
          <BookOpen size={18} className="text-slate-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="results-briefing-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Tiny-home briefing
          </h3>
          <p className="text-xs text-slate-500">
            Why this address may or may not legally house a tiny home for your
            intended use
          </p>
        </div>
      </div>
      <ul className="space-y-4">
        {summary.map((claim) => (
          <li key={claim.text.slice(0, 48)}>
            <CitedText claim={claim} as="div" />
          </li>
        ))}
      </ul>
    </section>
  );
}
