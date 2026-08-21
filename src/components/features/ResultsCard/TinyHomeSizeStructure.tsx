import { Ruler } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { SizeStructureBriefing } from "@/lib/regulations/types";

/**
 * Always-visible size and structure limits for California search results.
 * All copy comes from compose-briefing — no statute invention here.
 */
export function TinyHomeSizeStructure({
  briefing,
}: {
  briefing: SizeStructureBriefing;
}) {
  const { stats } = briefing;

  return (
    <section
      aria-labelledby="tiny-home-size-structure-heading"
      className="rounded-xl border border-border bg-card p-5 sm:p-6 md:p-8 shadow-elevated"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-border bg-muted p-2">
          <Ruler size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="tiny-home-size-structure-heading"
            className="text-lg font-normal tracking-tight text-foreground"
          >
            Size and structure limits
          </h3>
          <p className="text-xs text-muted-foreground">
            CRC habitable-room minima, ADU ministerial floors, and structure
            paths — statewide context before local ordinances
          </p>
          <RegulationsAuthorByline className="mt-1 text-xs text-muted-foreground" />
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Ceiling height
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {stats.ceilingHeight}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Primary room
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            ≥ {stats.primaryRoomSqFt} sq ft
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Additional rooms
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            ≥ {stats.additionalRoomSqFt} sq ft each
          </dd>
        </div>
      </dl>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            ADU ministerial floor
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            ≥ {stats.aduMinisterialSqFt.toLocaleString()} sq ft
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            ({stats.aduMinisterialMultiBedSqFt.toLocaleString()} sq ft if more
            than one bedroom)
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            JADU maximum
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            ≤ {stats.jaduMaxSqFt} sq ft
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Impact fee exempt
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            &lt; {stats.impactFeeExemptSqFt} sq ft
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Park trailer / THOW range
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {stats.parkTrailerTypicalSqFtRange} sq ft typical
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-4 border-t border-border pt-5">
        <CitedText claim={briefing.chapter13Claim} as="div" />
        <CitedText claim={briefing.jaduFeeClaim} as="div" />
        <CitedText claim={briefing.structurePathClaim} as="div" />
      </div>
    </section>
  );
}
