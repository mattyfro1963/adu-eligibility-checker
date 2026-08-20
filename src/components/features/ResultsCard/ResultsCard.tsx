import type { ZoningReport } from "@/lib/types/zoning";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RuleDetail } from "@/components/features/ResultsCard/RuleDetail";

export function ResultsCard({ report }: { report: ZoningReport }) {
  return (
    <Card className="w-full max-w-2xl">
      <header className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Eligibility Results
        </h2>
        <p className="mt-1 text-sm text-slate-600">{report.formattedAddress}</p>
        <p className="mt-1 text-sm text-slate-500">Zoning: {report.zoning}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Overall:</span>
          <Badge status={report.overall} />
        </div>
      </header>

      <div className="space-y-6">
        <RuleDetail result={report.adu} title="ADU (Gov. Code § 65852.2)" />
        <RuleDetail result={report.sb9} title="SB 9 (Gov. Code § 65852.21)" />
      </div>
    </Card>
  );
}
