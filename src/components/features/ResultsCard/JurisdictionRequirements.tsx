import { ListChecks } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import type { LocationRequirement } from "@/lib/regulations/location-requirements";

const APPLIES_LABEL: Record<LocationRequirement["applies"], string> = {
  always: "Always",
  likely: "Likely",
  jurisdiction_specific: "Local",
  if_overlay: "If overlay",
};

/**
 * One job: list jurisdiction requirements with tiny-home explanations + citations.
 * Copy comes from composeLocationRequirements — no statute invention here.
 */
export function JurisdictionRequirements({
  requirements,
  embedded = false,
}: {
  requirements: LocationRequirement[];
  /** Omit outer section chrome when nested in ExpandableSection. */
  embedded?: boolean;
}) {
  if (requirements.length === 0) return null;

  const list = (
    <ul className="space-y-5">
      {requirements.map((req) => (
        <li
          key={req.id}
          className="border-b border-border pb-5 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 className="text-sm font-normal text-foreground">{req.title}</h4>
            <span className="font-label text-caption text-muted-foreground">
              {req.jurisdictionLabel} · {APPLIES_LABEL[req.applies]}
            </span>
          </div>
          <div className="mt-2">
            <CitedText claim={req.tinyHomeExplanation} as="div" />
          </div>
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return list;
  }

  return (
    <section
      aria-labelledby="jurisdiction-requirements-heading"
      className="rounded-xl border border-border bg-card p-5 sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-thumb border border-border bg-muted p-2">
          <ListChecks
            size={18}
            className="text-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h3
            id="jurisdiction-requirements-heading"
            className="font-display text-subheading text-foreground"
          >
            Location requirements
          </h3>
          <p className="text-xs text-muted-foreground">
            Statewide floor, then county/city notes — how each item affects a
            tiny home path
          </p>
        </div>
      </div>
      {list}
    </section>
  );
}
