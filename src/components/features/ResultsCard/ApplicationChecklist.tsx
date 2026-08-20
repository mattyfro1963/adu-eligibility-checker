import { ListChecks } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { ChecklistItem } from "@/lib/regulations/types";

/** California application checklist from compose-briefing. */
export function ApplicationChecklist({
  items,
  title = "California application checklist",
  embedded = false,
}: {
  items: ChecklistItem[];
  title?: string;
  embedded?: boolean;
}) {
  if (items.length === 0) return null;

  const checklist = (
    <ol className="space-y-5">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-3 sm:gap-4">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-xs font-normal text-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="font-medium text-foreground">{item.title}</p>
              <CitedText claim={item.detail} />
            </div>
          </li>
        ))}
      </ol>
  );

  if (embedded) {
    return checklist;
  }

  return (
    <section
      aria-labelledby="application-checklist-heading"
      className="rounded-card border border-border bg-card p-5 sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-border bg-muted p-2">
          <ListChecks
            size={18}
            className="text-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h3
            id="application-checklist-heading"
            className="text-lg font-normal tracking-tight text-foreground"
          >
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Brief steps before you apply — start with primary use, then zoning
          </p>
          <RegulationsAuthorByline className="mt-1 text-xs text-muted-foreground" />
        </div>
      </div>
      {checklist}
    </section>
  );
}
