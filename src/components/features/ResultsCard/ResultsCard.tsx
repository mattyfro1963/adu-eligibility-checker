"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Info,
  Landmark,
  ShieldAlert,
  Trees,
} from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { EligibleNextSteps } from "@/components/features/EligibleNextSteps/EligibleNextSteps";
import { ApplicationChecklist } from "@/components/features/ResultsCard/ApplicationChecklist";
import { BuyerGuideLinks } from "@/components/features/ResultsCard/BuyerGuideLinks";
import { CaliforniaOutline } from "@/components/features/ResultsCard/CaliforniaOutline";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { ResultsBriefingSection } from "@/components/features/ResultsCard/ResultsBriefing";
import { RuleDetail } from "@/components/features/ResultsCard/RuleDetail";
import { SearchReceiptCard } from "@/components/features/ResultsCard/SearchReceipt";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

interface ResultsCardProps {
  report: ZoningReport | null;
  geocodeResult: GeocodeResult | null;
  isLoading?: boolean;
  /** Zoning API error (e.g. outside SF) — still show CA briefing. */
  zoningError?: string | null;
  /** Prefill link to `/connect` builder match. */
  connectHref?: string;
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
 * Results bento + regulations expert briefing (use-first summary, checklist,
 * CA outline, receipt). Statute copy comes from lib/regulations + rules.
 */
export function ResultsCard({
  report,
  geocodeResult,
  isLoading = false,
  zoningError = null,
  connectHref = "/connect",
}: ResultsCardProps) {
  const lat = geocodeResult?.lat ?? null;
  const lng = geocodeResult?.lng ?? null;
  const address =
    report?.formattedAddress ?? geocodeResult?.formattedAddress ?? "—";

  const briefing = useMemo(() => {
    if (!geocodeResult) return null;
    return composeResultsBriefing({
      geocode: geocodeResult,
      report,
      zoningError,
    });
  }, [geocodeResult, report, zoningError]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 fill-mode-both sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="h-[280px] rounded-[1.5rem] border border-slate-200/80 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:h-[360px] sm:rounded-[2rem] lg:col-span-2 lg:h-[420px]">
          <AddressMapPreview lat={lat} lng={lng} />
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8 sm:rounded-[2rem] lg:col-span-1">
          <div className="relative z-10 flex-1">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
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
                <p className="mb-6 text-xl leading-tight font-semibold text-slate-900 break-words sm:mb-8 sm:text-2xl">
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

          <div className="relative z-10 mt-6 border-t border-slate-100 pt-5 sm:mt-8 sm:pt-6">
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

      {briefing && !isLoading ? (
        <>
          <ResultsBriefingSection summary={briefing.summary} />
          <BuyerGuideLinks links={briefing.guideLinks} />
          {report?.overall === "eligible" ? <EligibleNextSteps /> : null}
          <ApplicationChecklist
            items={briefing.checklist}
            title="California application checklist"
          />
        </>
      ) : null}

      <div className="pt-2 sm:pt-4">
        <div className="mb-4 flex items-center gap-3 px-2 sm:mb-6">
          <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
            <Info size={18} className="text-slate-700" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Regulatory Diagnostics
            </h3>
            <RegulationsAuthorByline className="mt-1 text-xs text-slate-400" />
          </div>
        </div>

        {isLoading && !report ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <Skeleton className="h-48 rounded-[1.25rem] sm:rounded-[1.5rem]" />
            <Skeleton className="h-48 rounded-[1.25rem] sm:rounded-[1.5rem]" />
          </div>
        ) : report ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <RuleDetail
              result={report.adu}
              category="ADU"
              title="ADU Eligibility"
            />
            <RuleDetail
              result={report.sb9}
              category="SB 9"
              title="SB 9 Lot Split / Duplex"
            />
          </div>
        ) : null}
      </div>

      {briefing && !isLoading && briefing.isCalifornia ? (
        <CaliforniaOutline sections={briefing.outline} />
      ) : null}

      {briefing && !isLoading ? (
        <SearchReceiptCard receipt={briefing.receipt} />
      ) : null}

      {!isLoading && geocodeResult ? (
        <aside className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[2rem] sm:p-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Builder match
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Match with ADU / tiny-home builders for quotes near this parcel.
            </p>
          </div>
          <Link
            href={connectHref}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Open Connect
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
