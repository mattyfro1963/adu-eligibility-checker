"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractorMatch } from "@/lib/types/leads";

interface ContractorMatchGridProps {
  matches: ContractorMatch[];
  onRequestQuote: (contractor: ContractorMatch) => Promise<void>;
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
      <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-8">
        <p className="text-sm text-slate-600">
          No mock contractors matched this structure nearby. Try a different
          structure choice or address.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Matched contractors">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Local directory
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          {matches.length} contractor{matches.length === 1 ? "" : "s"} near your
          address
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Mock Bay Area directory for lead routing — confirm licensing and scope
          directly with each builder.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {matches.map((contractor) => {
          const quoted = quotedIds.has(contractor.id);
          const pending = pendingId === contractor.id;
          return (
            <li
              key={contractor.id}
              className="flex flex-col rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  {contractor.name}
                </h3>
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
                  {contractor.distanceMiles.toFixed(1)} mi
                </span>
              </div>
              <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
                {contractor.blurb}
              </p>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={12} aria-hidden="true" />
                {contractor.serviceCities.slice(0, 3).join(" · ")}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {contractor.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
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
                  className="h-10 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
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
                    className="inline-flex min-h-[40px] items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
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
