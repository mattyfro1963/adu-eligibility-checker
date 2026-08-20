import { Scale } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { OutlineSection } from "@/lib/regulations/types";

function OutlineSectionDetails({
  section,
  defaultOpen,
}: {
  section: OutlineSection;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setOpen(event.currentTarget.open);
  }

  return (
    <details
      className="group rounded-[10px] border border-border bg-muted/40 open:bg-card "
      open={open}
      onToggle={handleToggle}
    >
      <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>{section.title}</span>
          <span className="text-xs font-normal tracking-wide text-muted-foreground uppercase group-open:hidden">
            Expand
          </span>
          <span className="hidden text-xs font-normal tracking-wide text-muted-foreground uppercase group-open:inline">
            Collapse
          </span>
        </span>
      </summary>
      <ul className="space-y-4 border-t border-border px-4 py-4">
        {section.claims.map((claim) => (
          <li key={claim.text.slice(0, 40)}>
            <CitedText claim={claim} />
          </li>
        ))}
      </ul>
    </details>
  );
}

/** California building-path outline (use, ADU, park model, cabin, modular). */
export function CaliforniaOutline({
  sections,
  embedded = false,
}: {
  sections: OutlineSection[];
  embedded?: boolean;
}) {
  if (sections.length === 0) return null;

  const outline = (
    <div className="space-y-3">
        {sections.map((section) => (
          <OutlineSectionDetails
            key={section.id}
            section={section}
            defaultOpen={section.id === "use-of-land"}
          />
        ))}
      </div>
  );

  if (embedded) {
    return outline;
  }

  return (
    <section
      aria-labelledby="ca-outline-heading"
      className="rounded-card border border-border bg-card p-5 sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-border bg-muted p-2">
          <Scale size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="ca-outline-heading"
            className="text-lg font-normal tracking-tight text-foreground"
          >
            California building paths
          </h3>
          <p className="text-xs text-muted-foreground">
            Statewide context — state floor first, then local code
          </p>
          <RegulationsAuthorByline className="mt-1 text-xs text-muted-foreground" />
        </div>
      </div>
      {outline}
    </section>
  );
}
