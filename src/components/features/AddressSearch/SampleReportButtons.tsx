"use client";

import { useState } from "react";
import {
  SAMPLE_REPORTS,
  type SampleReportTone,
} from "@/lib/content/sample-reports";
import { cn } from "@/lib/utils";

type SampleFilter = "all" | SampleReportTone;

/** Live eligibility colors — status-* tokens, not editorial taupe/cream. */
const TONE_CLASS: Record<SampleReportTone, string> = {
  eligible:
    "border-status-eligible-border bg-status-eligible-muted text-status-eligible-fg hover:border-status-eligible/50",
  warning:
    "border-status-warning-border bg-status-warning-muted text-status-warning-fg hover:border-status-warning/50",
  restricted:
    "border-status-restricted-border bg-status-restricted-muted text-status-restricted-fg hover:border-status-restricted/50",
};

const TONE_VOCABULARY: Record<SampleReportTone, string> = {
  eligible: "Eligible",
  warning: "Warning",
  restricted: "Restricted",
};

const FILTER_OPTIONS: ReadonlyArray<{
  id: SampleFilter;
  label: string;
  note: string;
  descriptionId: string;
}> = [
  {
    id: "all",
    label: "All",
    note: "Every sample address",
    descriptionId: "sample-filter-all-desc",
  },
  {
    id: "eligible",
    label: "Eligible",
    note: "Published express wheeled path — still confirm permits and utilities",
    descriptionId: "sample-filter-eligible-desc",
  },
  {
    id: "warning",
    label: "Warning",
    note: "Mixed outcome or unverified lot — live engine decides",
    descriptionId: "sample-filter-warning-desc",
  },
  {
    id: "restricted",
    label: "Restricted",
    note: "Hard stop on at least one THOW dimension",
    descriptionId: "sample-filter-restricted-desc",
  },
];

const FILTER_TOGGLE_BASE =
  "rounded-full border px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.14em] backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

const FILTER_TOGGLE_IDLE =
  "border-border-luxury/70 bg-surface-luxury/45 text-muted-foreground hover:border-brand-taupe/55 hover:bg-surface-luxury/65 hover:text-text-luxury";

const FILTER_TOGGLE_SELECTED: Record<SampleFilter, string> = {
  all: "border-brand-taupe/60 bg-luxury-charcoal/90 text-luxury-cream shadow-sm",
  eligible:
    "border-status-eligible-border bg-status-eligible-muted text-status-eligible-fg shadow-sm",
  warning:
    "border-status-warning-border bg-status-warning-muted text-status-warning-fg shadow-sm",
  restricted:
    "border-status-restricted-border bg-status-restricted-muted text-status-restricted-fg shadow-sm",
};

interface SampleReportButtonsProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SampleReportButtons({
  onSelectQuery,
  disabled = false,
  className,
}: SampleReportButtonsProps) {
  const [filter, setFilter] = useState<SampleFilter>("all");

  const filtered =
    filter === "all"
      ? SAMPLE_REPORTS
      : SAMPLE_REPORTS.filter((sample) => sample.tone === filter);

  const activeOption = FILTER_OPTIONS.find((o) => o.id === filter)!;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-5">
        <div className="space-y-3">
          <p
            id="sample-reports-label"
            className="font-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Try an address
          </p>
          <div className="h-px w-12 bg-border-luxury" aria-hidden="true" />
          <p
            id="sample-reports-hint"
            className="max-w-xl text-[15px] leading-relaxed text-muted-foreground"
          >
            Click a sample location to run the same live search as typing an
            address. Filter by outcome tone when you want a specific example.
          </p>
        </div>
        <div
          role="group"
          aria-labelledby="sample-reports-label"
          aria-describedby="sample-reports-hint"
          className="flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const selected = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-describedby={option.descriptionId}
                onClick={() => setFilter(option.id)}
                className={cn(
                  FILTER_TOGGLE_BASE,
                  selected
                    ? FILTER_TOGGLE_SELECTED[option.id]
                    : FILTER_TOGGLE_IDLE,
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p
          id={activeOption.descriptionId}
          className="max-w-xl text-xs leading-snug text-muted-foreground"
        >
          {activeOption.note}
        </p>
        {/* Off-screen descriptions for non-active filters (aria-describedby). */}
        {FILTER_OPTIONS.filter((o) => o.id !== filter).map((option) => (
          <p key={option.id} id={option.descriptionId} className="sr-only">
            {option.note}
          </p>
        ))}
      </div>
      <div
        className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-2.5"
        role="group"
        aria-labelledby="sample-reports-label"
        aria-describedby="sample-reports-hint"
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sample addresses for this filter yet.
          </p>
        ) : (
          filtered.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuery(sample.query)}
              className={cn(
                "min-h-[44px] w-full rounded-lg border px-3.5 py-2.5 text-left text-[13px] leading-snug tracking-tight break-words transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2",
                TONE_CLASS[sample.tone],
              )}
              aria-label={`Search ${sample.label} (${TONE_VOCABULARY[sample.tone]} example): ${sample.query}`}
            >
              {sample.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
