"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractorMatch } from "@/lib/types/leads";

interface ContractorMatchGridProps {
  matches: ContractorMatch[];
  onRequestQuote: (contractor: ContractorMatch) => Promise<void>;
  layout?: "page" | "modal";
}

function specialtyLabel(specialty: string): string {
  switch (specialty) {
    case "permanent_adu":
      return "Permanent ADU";
    case "thow":
      return "THOW";
    case "tiny_home":
      return "Tiny home";
    default:
      return specialty;
  }
}

export function ContractorMatchGrid({
  matches,
  onRequestQuote,
  layout = "page",
}: ContractorMatchGridProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [quotedIds, setQuotedIds] = useState<Set<string>>(new Set());

  async function handleQuote(contractor: ContractorMatch) {
    setPendingId(contractor.id);
    try {
      await onRequestQuote(contractor);
      setQuotedIds((prev) => new Set(prev).add(contractor.id));
    } finally {
      setPendingId(null);
    }
  }

  if (matches.length === 0) {
    return (
      <section className="border border-border bg-card p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">
          No mock contractors matched this structure nearby. Try a different
          structure choice or address.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Matched contractors">
      <div>
        <p className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
          Local directory
        </p>
        <h2 className="mt-1 text-lg font-normal tracking-tight text-foreground">
          {matches.length} contractor{matches.length === 1 ? "" : "s"} near your
          address
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mock Bay Area directory for lead routing — confirm licensing and scope
          directly with each builder.
        </p>
      </div>

      <ul
        className={
          layout === "modal"
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-4 md:grid-cols-3"
        }
      >
        {matches.map((contractor) => {
          const quoted = quotedIds.has(contractor.id);
          const pending = pendingId === contractor.id;
          return (
            <li
              key={contractor.id}
              className="flex flex-col border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-base font-normal tracking-tight text-foreground">
                  {contractor.name}
                </h3>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-normal tracking-wide text-muted-foreground uppercase">
                  {contractor.distanceMiles.toFixed(1)} mi
                </span>
              </div>
              <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {contractor.blurb}
              </p>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin size={12} aria-hidden="true" />
                {contractor.serviceCities.slice(0, 3).join(" · ")}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {contractor.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {specialtyLabel(s)}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  type="button"
                  disabled={pending || quoted}
                  onClick={() => void handleQuote(contractor)}
                  className="h-10 w-full rounded-[10px]"
                  aria-label={`Request direct quote from ${contractor.name}`}
                >
                  {quoted ? (
                    <>
                      <CheckCircle2 aria-hidden="true" />
                      Quote requested
                    </>
                  ) : (
                    <>
                      <Quote aria-hidden="true" />
                      {pending ? "Sending…" : "Request Direct Quote"}
                    </>
                  )}
                </Button>
                {contractor.website ? (
                  <a
                    href={contractor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Website
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
