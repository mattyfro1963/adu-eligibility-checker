"use client";

import { AlertTriangle, CheckCircle2, FileText, XCircle } from "lucide-react";
import type { StatutoryEvaluation } from "@/lib/types/statutory-evaluation";
import type { ZoningReport } from "@/lib/types/zoning";

type StatutoryComplianceChecklistProps = {
  report: ZoningReport;
  evaluations: StatutoryEvaluation[];
  program?: "adu" | "sb9" | "all";
  /** Omit duplicate section heading when nested under ExpandableSection. */
  embedded?: boolean;
};

function RuleGroup({
  heading,
  rules,
}: {
  heading?: string;
  rules: StatutoryEvaluation[];
}) {
  if (rules.length === 0) return null;
  return (
    <div>
      {heading ? (
        <p className="font-label mb-1 text-[11px] font-bold tracking-[0.18em] text-luxury-taupe">
          {heading}
        </p>
      ) : null}
      <ul className="divide-y divide-border">
        {rules.map((rule) => (
          <li key={rule.ruleId} className="flex items-start gap-3 py-3">
            <RuleIcon evaluation={rule} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {rule.title}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <FileText size={12} aria-hidden="true" />
                  {rule.citation}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rule.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RuleIcon({ evaluation }: { evaluation: StatutoryEvaluation }) {
  if (evaluation.outcome === "unverified") {
    return (
      <AlertTriangle
        className="mt-0.5 shrink-0 text-amber-500"
        size={18}
        aria-hidden="true"
      />
    );
  }
  if (evaluation.outcome === "pass") {
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
  embedded = false,
}: StatutoryComplianceChecklistProps) {
  const visible =
    program === "all"
      ? evaluations
      : evaluations.filter((item) => item.program === program);

  if (visible.length === 0) return null;

  const lotSizeSqFt = report.lotSizeSqFt;
  const maxUnits = report.unitCapacity?.maxAllowableUnits;

  const body = (
    <>
      <div className="grid grid-cols-1 gap-4 border-b border-border pb-4 text-center sm:grid-cols-3">
        <div>
          <span className="font-label text-[10px] text-muted-foreground">
            Zoning Code
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground">
            {report.analysisScope === "jurisdiction_context"
              ? "Not verified"
              : report.zoning}
          </span>
        </div>
        <div>
          <span className="font-label text-[10px] text-muted-foreground">
            Lot Area
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground">
            {lotSizeSqFt != null && lotSizeSqFt > 0
              ? `${lotSizeSqFt.toLocaleString()} sq ft`
              : "Not verified"}
          </span>
        </div>
        <div>
          <span className="font-label text-[10px] text-muted-foreground">
            Max Units
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground">
            {maxUnits != null ? `${maxUnits} allowed` : "Confirm locally"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {embedded ? null : (
          <h3
            id="statutory-checklist-heading"
            className="text-sm font-normal tracking-wide text-muted-foreground uppercase"
          >
            Statutory Compliance Checklist
          </h3>
        )}
        {program === "all" ? (
          <>
            <RuleGroup
              heading="SB 9 unit path"
              rules={visible.filter((rule) => rule.program === "sb9")}
            />
            <RuleGroup
              heading="ADU pathway"
              rules={visible.filter((rule) => rule.program === "adu")}
            />
          </>
        ) : (
          <RuleGroup rules={visible} />
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-4 p-5 sm:p-6">{body}</div>;
  }

  return (
    <section
      aria-labelledby="statutory-checklist-heading"
      className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {body}
    </section>
  );
}
