import { BookOpen } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { CitedClaim } from "@/lib/regulations/types";

/** Use-first why-this-lot summary from compose-briefing. */
export function ResultsBriefingSection({ summary }: { summary: CitedClaim[] }) {
  return (
    <section
      aria-labelledby="results-briefing-heading"
      className="rounded-card border border-border bg-card p-5 sm:p-6 md:p-8 shadow-elevated"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-border bg-muted p-2">
          <BookOpen size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="results-briefing-heading"
            className="text-lg font-normal tracking-tight text-foreground"
          >
            Parcel briefing
          </h3>
          <p className="text-xs text-muted-foreground">
            Why this address may or may not legally house a tiny home for your
            intended use
          </p>
          <RegulationsAuthorByline className="mt-1 text-xs text-muted-foreground" />
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
