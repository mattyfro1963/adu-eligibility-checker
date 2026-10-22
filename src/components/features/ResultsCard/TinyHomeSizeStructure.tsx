"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { cn } from "@/lib/utils";
import type { SizeStructureBriefing } from "@/lib/regulations/types";

type SizePathway = "thow" | "adu" | "jadu";

/**
 * Size and structure limits for California search results.
 * Leads with THOW / park-trailer range; ADU and JADU are optional pathways.
 */
export function TinyHomeSizeStructure({
  briefing,
}: {
  briefing: SizeStructureBriefing;
}) {
  const { stats } = briefing;
  const [pathway, setPathway] = useState<SizePathway>("thow");

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
            THOW / park-trailer range first. ADU and JADU are optional pathways,
            not automatic from wheeled placement.
          </p>
          <RegulationsAuthorByline className="mt-1 text-xs text-muted-foreground" />
        </div>
      </div>

      <div
        role="group"
        aria-label="Size pathway"
        className="mb-4 flex flex-wrap gap-2"
      >
        {(
          [
            ["thow", "THOW / park-trailer"],
            ["adu", "ADU pathway"],
            ["jadu", "JADU pathway"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={pathway === id}
            onClick={() => setPathway(id)}
            className={cn(
              "min-h-[44px] rounded-md border px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              pathway === id
                ? "border-brand-taupe/60 bg-luxury-charcoal/90 text-luxury-cream"
                : "border-border-luxury/70 bg-surface-luxury/45 text-muted-foreground hover:border-brand-taupe/55 hover:text-text-luxury",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 p-4 sm:col-span-2">
          <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
            Park trailer / THOW range
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {stats.parkTrailerTypicalSqFtRange} sq ft typical
          </dd>
        </div>
        {pathway === "thow" ? (
          <>
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
          </>
        ) : null}
        {pathway === "adu" ? (
          <>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
                ADU ministerial floor
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                ≥ {stats.aduMinisterialSqFt.toLocaleString()} sq ft
              </dd>
              <dd className="mt-0.5 text-xs text-muted-foreground">
                ({stats.aduMinisterialMultiBedSqFt.toLocaleString()} sq ft if
                more than one bedroom) — a floor on local restrictiveness, not a
                THOW size rule.
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
          </>
        ) : null}
        {pathway === "jadu" ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
              JADU maximum
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              ≤ {stats.jaduMaxSqFt} sq ft
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 space-y-4 border-t border-border pt-5">
        {pathway === "thow" ? (
          <CitedText claim={briefing.structurePathClaim} as="div" />
        ) : null}
        {pathway === "adu" ? (
          <CitedText claim={briefing.chapter13Claim} as="div" />
        ) : null}
        {pathway === "jadu" ? (
          <CitedText claim={briefing.jaduFeeClaim} as="div" />
        ) : null}
      </div>
    </section>
  );
}
