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
import { JurisdictionRequirements } from "@/components/features/ResultsCard/JurisdictionRequirements";
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
  /** Zoning API transport/5xx error — uncovered counties are not errors. */
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
    <div className="flex items-center justify-between border-b border-border py-3.5">
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon size={16} className="text-muted-foreground" aria-hidden="true" />
        {label}
      </span>
      <span
        className={`text-sm font-normal ${detected ? detectedClassName : "text-foreground"}`}
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
      className="grid grid-cols-2 gap-1 rounded-input border border-border bg-muted p-1"
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
              "inline-flex min-h-[40px] items-center justify-center rounded-pill px-2 text-caption font-medium transition-colors",
              selected
                ? "bg-card text-foreground shadow-editorial"
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
 * Evaluation dashboard: cinematic map + scrollable data panel, plus briefing.
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
  const isJurisdictionContext =
    report?.analysisScope === "jurisdiction_context";

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch lg:gap-8">
        <div className="overflow-hidden rounded-card shadow-editorial lg:col-span-3 lg:h-[min(720px,calc(100vh-8rem))]">
          <AddressMapPreview
            lat={lat}
            lng={lng}
            className="min-h-[280px] sm:min-h-[360px] lg:min-h-full"
          />
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-editorial lg:col-span-2 lg:max-h-[min(720px,calc(100vh-8rem))]">
          <div className="flex-1 space-y-6 overflow-y-auto p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label text-muted-foreground">
                  Parcel evaluation
                </p>
                <h3 className="font-heading mt-2 text-heading-sm leading-tight break-words text-foreground">
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

            {isJurisdictionContext ? (
              <p className="rounded-input border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                Lot zoning was not verified for this coordinate. Eligibility
                below reflects published county/city guidance plus the statewide
                ADU floor — confirm base district and overlays with local
                Planning/Building.
              </p>
            ) : null}

            <div className="flex items-center justify-between border-b border-border py-3.5">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                Base Zoning
              </span>
              <span className="rounded-input border border-border bg-muted px-2.5 py-1 font-mono text-xs font-normal text-foreground">
                {report?.zoning ?? "—"}
              </span>
            </div>

            {isJurisdictionContext ? (
              <div className="flex items-center justify-between border-b border-border py-3.5">
                <span className="text-sm font-medium text-muted-foreground">
                  Analysis scope
                </span>
                <span className="text-sm font-normal text-amber-700">
                  Jurisdiction context
                </span>
              </div>
            ) : null}

            <div>
              <p className="font-label mb-2 text-muted-foreground">
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
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label text-muted-foreground">
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
            <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border bg-card p-6 sm:flex-row sm:items-center">
              {onGetQuotes ? (
                <Button
                  type="button"
                  onClick={onGetQuotes}
                  className="h-11 min-h-[44px] flex-1"
                >
                  Get Quotes
                </Button>
              ) : null}
              <Link
                href={connectHref}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-button border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
          <JurisdictionRequirements requirements={briefing.requirements} />
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
