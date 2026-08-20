"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Landmark,
  ShieldAlert,
  Trees,
} from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { ApplicationChecklist } from "@/components/features/ResultsCard/ApplicationChecklist";
import { BuyerGuideLinks } from "@/components/features/ResultsCard/BuyerGuideLinks";
import { CaliforniaOutline } from "@/components/features/ResultsCard/CaliforniaOutline";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { ResultsBriefingSection } from "@/components/features/ResultsCard/ResultsBriefing";
import { RuleDetail } from "@/components/features/ResultsCard/RuleDetail";
import { SearchReceiptCard } from "@/components/features/ResultsCard/SearchReceipt";
import { Button } from "@/components/ui/button";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

type ProgramTab = "adu" | "sb9";

interface ResultsCardProps {
  report: ZoningReport | null;
  geocodeResult: GeocodeResult | null;
  isLoading?: boolean;
  /** Zoning API error (e.g. outside SF) — still show CA briefing. */
  zoningError?: string | null;
  /** Prefill link to `/connect` builder match. */
  connectHref?: string;
  /** Opens the Get Quotes modal (project lead → contractor matches). */
  onGetQuotes?: () => void;
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
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon size={16} className="text-muted-foreground" aria-hidden="true" />
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${detected ? detectedClassName : "text-foreground"}`}
      >
        {detected ? "Detected" : "Clear"}
      </span>
    </div>
  );
}

function ProgramToggle({
  value,
  onChange,
}: {
  value: ProgramTab;
  onChange: (next: ProgramTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Program detail"
      className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-[#F5F5F7] p-1"
    >
      {(
        [
          { id: "adu", label: "ADU" },
          { id: "sb9", label: "SB 9" },
        ] as const
      ).map((tab) => {
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={
              tab.id === "adu" ? "program-detail-adu" : "program-detail-sb9"
            }
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-[40px] items-center justify-center rounded-lg px-2 text-xs font-semibold tracking-wide uppercase transition-colors",
              selected
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Evaluation dashboard: 60/40 map + scrollable data panel, plus briefing.
 * Statute copy comes from lib/regulations + rules — no invented overlays.
 */
export function ResultsCard({
  report,
  geocodeResult,
  isLoading = false,
  zoningError = null,
  connectHref = "/connect",
  onGetQuotes,
}: ResultsCardProps) {
  const [program, setProgram] = useState<ProgramTab>("adu");
  const lat = geocodeResult?.lat ?? null;
  const lng = geocodeResult?.lng ?? null;
  const address =
    report?.formattedAddress ?? geocodeResult?.formattedAddress ?? "—";
  const mapblklot = report?.mapblklot ?? null;

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
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5 lg:items-stretch">
        <div className="h-[280px] rounded-xl border border-border bg-white p-2 shadow-registry sm:h-[360px] lg:col-span-3 lg:h-[min(720px,calc(100vh-8rem))]">
          <AddressMapPreview lat={lat} lng={lng} />
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-registry lg:col-span-2 lg:max-h-[min(720px,calc(100vh-8rem))]">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Parcel evaluation
                </p>
                <h3 className="mt-1 text-xl leading-tight font-semibold break-words text-foreground">
                  {address}
                </h3>
                {mapblklot ? (
                  <p className="mt-1 font-mono text-xs tracking-wide text-muted-foreground">
                    APN / mapblklot {mapblklot}
                  </p>
                ) : null}
              </div>
              {report ? (
                <EligibilityBadge status={report.overall} size="lg" />
              ) : null}
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 py-3.5">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                Base Zoning
              </span>
              <span className="rounded-md border border-border bg-[#F5F5F7] px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
                {report?.zoning ?? "—"}
              </span>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Overlay facts
              </p>
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

            {report ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Programs
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    ADU <EligibilityBadge status={report.adu.status} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    SB 9 <EligibilityBadge status={report.sb9.status} />
                  </span>
                </div>
                <ProgramToggle value={program} onChange={setProgram} />
                {program === "adu" ? (
                  <div role="tabpanel" id="program-detail-adu">
                    <RuleDetail
                      result={report.adu}
                      category="ADU"
                      title="ADU Eligibility"
                    />
                  </div>
                ) : (
                  <div role="tabpanel" id="program-detail-sb9">
                    <RuleDetail
                      result={report.sb9}
                      category="SB 9"
                      title="SB 9 Lot Split / Duplex"
                    />
                  </div>
                )}
                <RegulationsAuthorByline className="text-xs text-muted-foreground" />
              </div>
            ) : null}
          </div>

          {geocodeResult ? (
            <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border bg-white p-4 sm:flex-row sm:items-center">
              {onGetQuotes ? (
                <Button
                  type="button"
                  onClick={onGetQuotes}
                  className="h-11 min-h-[44px] flex-1 rounded-xl"
                >
                  Get Quotes
                </Button>
              ) : null}
              <Link
                href={connectHref}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-[#F5F5F7]"
              >
                Open Connect
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {briefing && !isLoading ? (
        <>
          <ResultsBriefingSection summary={briefing.summary} />
          <BuyerGuideLinks links={briefing.guideLinks} />
          <ApplicationChecklist
            items={briefing.checklist}
            title="California application checklist"
          />
        </>
      ) : null}

      {briefing && !isLoading && briefing.isCalifornia ? (
        <CaliforniaOutline sections={briefing.outline} />
      ) : null}

      {briefing && !isLoading ? (
        <SearchReceiptCard receipt={briefing.receipt} />
      ) : null}
    </div>
  );
}
