import { SAMPLE_REPORTS } from "@/lib/content/sample-reports";
import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-3", className)}>
      <p
        id="sample-reports-label"
        className="font-label text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        Try an address
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby="sample-reports-label"
      >
        {SAMPLE_REPORTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuery(sample.query)}
            className="min-h-[44px] rounded-[10px] border border-border bg-card px-4 py-2 font-label text-[11px] tracking-[0.08em] text-foreground uppercase transition-colors hover:border-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Search ${sample.label}: ${sample.query}`}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
