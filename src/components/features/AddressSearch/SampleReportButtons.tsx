"use client";

import { useMemo, useState } from "react";
import {
  FEATURED_SAMPLE_IDS,
  SAMPLE_REPORTS,
  type SampleReportTone,
} from "@/lib/content/sample-reports";
import { cn } from "@/lib/utils";

type SampleFilter = "featured" | "all" | SampleReportTone;

/** White SaaS chips — live Green/Yellow/Red is reserved for the results badge. */
const CHIP_CLASS =
  "border-chip-editorial-border bg-chip-editorial-fill text-slate-800 shadow-sm hover:border-slate-300";

const TONE_VOCABULARY: Record<SampleReportTone, string> = {
  eligible: "Eligible",
  warning: "Warning",
  restricted: "Restricted",
};

const FILTER_OPTIONS: ReadonlyArray<{
  id: Exclude<SampleFilter, "featured">;
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
  "min-h-[44px] rounded-md border px-3.5 py-1.5 font-label text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

const FILTER_TOGGLE_IDLE =
  "border-slate-200 bg-white text-muted-foreground hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

const FILTER_TOGGLE_SELECTED = "border-slate-900 bg-slate-900 text-white";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<SampleFilter>("featured");

  const featured = useMemo(
    () =>
      FEATURED_SAMPLE_IDS.map((id) =>
        SAMPLE_REPORTS.find((sample) => sample.id === id),
      ).filter((sample): sample is (typeof SAMPLE_REPORTS)[number] =>
        Boolean(sample),
      ),
    [],
  );

  const filtered =
    filter === "featured"
      ? featured
      : filter === "all"
        ? SAMPLE_REPORTS
        : SAMPLE_REPORTS.filter((sample) => sample.tone === filter);

  const activeOption = FILTER_OPTIONS.find((o) => o.id === filter);

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
            address.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={filtersOpen}
          aria-controls="sample-outcome-filters"
          onClick={() => {
            setFiltersOpen((open) => {
              const next = !open;
              if (!next) setFilter("featured");
              return next;
            });
          }}
          className={cn(FILTER_TOGGLE_BASE, FILTER_TOGGLE_IDLE)}
        >
          Filter by outcome
        </button>
        {filtersOpen ? (
          <div id="sample-outcome-filters" className="space-y-3">
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
                      selected ? FILTER_TOGGLE_SELECTED : FILTER_TOGGLE_IDLE,
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {activeOption ? (
              <p
                id={activeOption.descriptionId}
                className="max-w-xl text-xs leading-snug text-muted-foreground"
              >
                {activeOption.note}
              </p>
            ) : null}
            {FILTER_OPTIONS.filter((o) => o.id !== filter).map((option) => (
              <p key={option.id} id={option.descriptionId} className="sr-only">
                {option.note}
              </p>
            ))}
          </div>
        ) : null}
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
                CHIP_CLASS,
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
