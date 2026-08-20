"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  XCircle,
} from "lucide-react";
import type { StatutoryEvaluation } from "@/lib/types/statutory-evaluation";
import type { ZoningReport } from "@/lib/types/zoning";

type StatutoryComplianceChecklistProps = {
  report: ZoningReport;
  evaluations: StatutoryEvaluation[];
  program?: "adu" | "sb9" | "all";
};

function RuleIcon({ evaluation }: { evaluation: StatutoryEvaluation }) {
  if (evaluation.passed) {
    return (
      <CheckCircle2
        className="mt-0.5 shrink-0 text-emerald-600"
        size={18}
        aria-hidden="true"
      />
    );
  }
  if (evaluation.severity === "caution") {
    return (
      <AlertTriangle
        className="mt-0.5 shrink-0 text-amber-500"
        size={18}
        aria-hidden="true"
      />
    );
  }
  return (
    <XCircle
      className="mt-0.5 shrink-0 text-rose-600"
      size={18}
      aria-hidden="true"
    />
  );
}

export function StatutoryComplianceChecklist({
  report,
  evaluations,
  program = "all",
}: StatutoryComplianceChecklistProps) {
  const visible =
    program === "all"
      ? evaluations
      : evaluations.filter((item) => item.program === program);

  if (visible.length === 0) return null;

  const lotSizeSqFt = report.lotSizeSqFt;
  const maxUnits = report.unitCapacity?.maxAllowableUnits;

  return (
    <section
      aria-labelledby="statutory-checklist-heading"
      className="space-y-4 border border-brand-taupe/30 bg-brand-cream/30 p-5 sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 border-b border-brand-cream pb-4 text-center sm:grid-cols-3">
        <div>
          <span className="block text-xs uppercase tracking-wider text-brand-taupe">
            Zoning Code
          </span>
          <span className="font-quote text-lg font-semibold text-brand-charcoal">
            {report.zoning}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider text-brand-taupe">
            Lot Area
          </span>
          <span className="font-quote text-lg font-semibold text-brand-charcoal">
            {lotSizeSqFt != null && lotSizeSqFt > 0
              ? `${lotSizeSqFt.toLocaleString()} sq ft`
              : "Not verified"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider text-brand-taupe">
            Max Units
          </span>
          <span className="font-quote text-lg font-semibold text-brand-charcoal">
            {maxUnits != null ? `${maxUnits} allowed` : "Confirm locally"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3
          id="statutory-checklist-heading"
          className="text-sm font-semibold tracking-wider text-brand-charcoal uppercase"
        >
          Statutory Compliance Checklist
        </h3>
        <ul className="divide-y divide-brand-cream">
          {visible.map((rule) => (
            <li key={rule.ruleId} className="flex items-start gap-3 py-3">
              <RuleIcon evaluation={rule} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-brand-charcoal">
                    {rule.title}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-brand-taupe">
                    <FileText size={12} aria-hidden="true" />
                    {rule.citation}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-brand-charcoal/70">
                  {rule.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
