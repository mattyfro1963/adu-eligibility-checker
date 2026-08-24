import {
  SAMPLE_REPORTS,
  type SampleReportTone,
} from "@/lib/content/sample-reports";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<SampleReportTone, string> = {
  eligible:
    "border-status-eligible-border bg-status-eligible-muted text-text-luxury hover:border-status-eligible hover:bg-status-eligible-muted",
  warning:
    "border-status-warning-border bg-status-warning-muted text-text-luxury hover:border-status-warning hover:bg-status-warning-muted",
  restricted:
    "border-status-restricted-border bg-status-restricted-muted text-text-luxury hover:border-status-restricted hover:bg-status-restricted-muted",
};

const TONE_BAR: Record<SampleReportTone, string> = {
  eligible: "bg-status-eligible",
  warning: "bg-status-warning",
  restricted: "bg-status-restricted",
};

const TONE_LEGEND: ReadonlyArray<{
  tone: SampleReportTone;
  label: string;
  note: string;
}> = [
  {
    tone: "warning",
    label: "Warning",
    note: "Mixed outcome or unverified lot — live engine decides",
  },
  {
    tone: "restricted",
    label: "Restricted",
    note: "Hard stop on at least one program",
  },
];

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
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p
            id="sample-reports-label"
            className="font-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Try an address
          </p>
          <p
            id="sample-reports-hint"
            className="text-[15px] leading-relaxed text-muted-foreground"
          >
            Click a sample location to run the same live search as typing an
            address.
          </p>
        </div>
        <ul
          className="grid gap-2 sm:grid-cols-3"
          aria-describedby="sample-reports-hint"
        >
          {TONE_LEGEND.map((item) => (
            <li
              key={item.tone}
              className="flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
            >
              <span
                className={cn(
                  "mt-0.5 h-8 w-1 shrink-0 rounded-full",
                  TONE_BAR[item.tone],
                )}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium tracking-tight text-foreground">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {item.note}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap"
        role="group"
        aria-labelledby="sample-reports-label"
        aria-describedby="sample-reports-hint"
      >
        {SAMPLE_REPORTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuery(sample.query)}
            className={cn(
              "min-h-[44px] w-full rounded-xl border px-3.5 py-2.5 text-left text-[13px] leading-snug tracking-tight break-words transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2",
              TONE_CLASS[sample.tone],
            )}
            aria-label={`Search ${sample.label}: ${sample.query}`}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
