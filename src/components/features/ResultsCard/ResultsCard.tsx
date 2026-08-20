import { Building2, Info, Landmark, ShieldAlert, Trees } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { RuleDetail } from "@/components/features/ResultsCard/RuleDetail";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

interface ResultsCardProps {
  report: ZoningReport | null;
  geocodeResult: GeocodeResult | null;
  isLoading?: boolean;
}

function OverlayRow({
  label,
  icon: Icon,
  detected,
  detectedClassName,
}: {
  label: string;
  icon: typeof Trees;
  detected: boolean;
  detectedClassName: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3.5">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon size={16} className="text-slate-400" aria-hidden="true" />
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${detected ? detectedClassName : "text-slate-900"}`}
      >
        {detected ? "Detected" : "Clear"}
      </span>
    </div>
  );
}

/**
 * Results bento: 2/3 map + 1/3 Target Acquired, then Regulatory Diagnostics
 * from ADU (§ 65852.2) and SB 9 (§ 65852.21) — statute copy stays in rules.
 */
export function ResultsCard({
  report,
  geocodeResult,
  isLoading = false,
}: ResultsCardProps) {
  const lat = geocodeResult?.lat ?? null;
  const lng = geocodeResult?.lng ?? null;
  const address =
    report?.formattedAddress ?? geocodeResult?.formattedAddress ?? "—";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700 fill-mode-both">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[420px] rounded-[2rem] border border-slate-200/80 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
          <AddressMapPreview lat={lat} lng={lng} />
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-1">
          <div className="relative z-10 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Target Acquired
              </h3>
              <div className="h-px w-8 bg-slate-200" aria-hidden="true" />
            </div>

            {isLoading && !report ? (
              <div className="space-y-4" aria-busy="true">
                <Skeleton className="h-8 w-4/5" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <p className="mb-8 text-2xl leading-tight font-semibold text-slate-900">
                  {address}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 py-3.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Building2
                        size={16}
                        className="text-slate-400"
                        aria-hidden="true"
                      />
                      Base Zoning
                    </span>
                    <span className="rounded-md border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 font-mono text-xs font-semibold text-slate-900 shadow-sm">
                      {report?.zoning ?? "—"}
                    </span>
                  </div>
                  <OverlayRow
                    label="Coastal Zone"
                    icon={Trees}
                    detected={Boolean(report?.overlays.coastalZone)}
                    detectedClassName="text-amber-600"
                  />
                  <OverlayRow
                    label="Fire Hazard"
                    icon={ShieldAlert}
                    detected={Boolean(
                      report?.overlays.fireHazard || report?.overlays.vhfhsz,
                    )}
                    detectedClassName="text-rose-600"
                  />
                  <OverlayRow
                    label="Historic District"
                    icon={Landmark}
                    detected={Boolean(report?.overlays.historicDistrict)}
                    detectedClassName="text-amber-600"
                  />
                </div>
              </>
            )}
          </div>

          <div className="relative z-10 mt-8 border-t border-slate-100 pt-6">
            <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              System Verdict
            </p>
            {isLoading && !report ? (
              <Skeleton className="h-9 w-36 rounded-full" />
            ) : report ? (
              <EligibilityBadge status={report.overall} size="lg" />
            ) : (
              <span className="text-sm text-slate-400">Pending analysis</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
            <Info size={18} className="text-slate-700" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Regulatory Diagnostics
          </h3>
        </div>

        {isLoading && !report ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Skeleton className="h-48 rounded-[1.5rem]" />
            <Skeleton className="h-48 rounded-[1.5rem]" />
          </div>
        ) : report ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <RuleDetail
              result={report.adu}
              category="ADU"
              title="ADU Eligibility"
              statute="Gov. Code § 65852.2"
            />
            <RuleDetail
              result={report.sb9}
              category="SB 9"
              title="SB 9 Lot Split / Duplex"
              statute="Gov. Code § 65852.21"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
