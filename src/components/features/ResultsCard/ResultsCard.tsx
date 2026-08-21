"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Home,
  Landmark,
  MapPin,
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
import { StatutoryComplianceChecklist } from "@/components/features/ResultsCard/StatutoryComplianceChecklist";
import { TinyHomeSizeStructure } from "@/components/features/ResultsCard/TinyHomeSizeStructure";
import { SearchReceiptCard } from "@/components/features/ResultsCard/SearchReceipt";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel, ZoningReport } from "@/lib/types/zoning";

type ProgramTab = "adu" | "sb9";

function formatJurisdiction(geocode: GeocodeResult | null): string | null {
  if (!geocode) return null;
  const place = geocode.place.trim();
  const county = geocode.county.trim();
  if (!place && !county) return null;
  const countyLabel = !county
    ? ""
    : /\bcounty\b/i.test(county) ||
        county.toLowerCase() === place.toLowerCase()
      ? county
      : `${county} County`;
  if (
    place &&
    countyLabel &&
    place.toLowerCase() !== countyLabel.toLowerCase()
  ) {
    return `${place}, ${countyLabel}`;
  }
  return place || countyLabel || null;
}

interface ResultsCardProps {
  report: ZoningReport | null;
  geocodeResult: GeocodeResult | null;
  isLoading?: boolean;
  /** Zoning API transport/5xx error — uncovered counties are not errors. */
  zoningError?: string | null;
  /** In-page anchor to builder intro on `/`. */
  connectHref?: string;
}

function OverlayRow({
  label,
  icon: Icon,
  detected,
  detectedClassName,
  undetermined = false,
}: {
  label: string;
  icon: typeof Trees;
  detected: boolean;
  detectedClassName: string;
  /** When lot GIS did not run — do not imply overlays were verified clear. */
  undetermined?: boolean;
}) {
  const statusLabel = detected
    ? "Detected"
    : undetermined
      ? "Not verified"
      : "Clear";
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5">
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon size={16} className="text-muted-foreground" aria-hidden="true" />
        {label}
      </span>
      <span
        className={`text-sm font-normal ${detected ? detectedClassName : undetermined ? "text-amber-700" : "text-foreground"}`}
      >
        {statusLabel}
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
  connectHref = "#connect",
}: ResultsCardProps) {
  const [program, setProgram] = useState<ProgramTab>("adu");
  const lat = geocodeResult?.lat ?? null;
  const lng = geocodeResult?.lng ?? null;
  const address =
    report?.formattedAddress ?? geocodeResult?.formattedAddress ?? "—";
  const mapblklot = report?.mapblklot ?? null;
  const isJurisdictionContext =
    report?.analysisScope === "jurisdiction_context";
  const jurisdictionLabel = formatJurisdiction(geocodeResult);

  const briefing = useMemo(() => {
    if (!geocodeResult) return null;
    return composeResultsBriefing({
      geocode: geocodeResult,
      report,
      zoningError,
    });
  }, [geocodeResult, report, zoningError]);

  const statutoryEvaluations = useMemo(() => {
    if (!report || !geocodeResult) return [];
    const parcel: Parcel = {
      addressId: geocodeResult.addressId,
      formattedAddress: report.formattedAddress,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      zoning: report.zoning,
      overlays: report.overlays,
      lotSizeSqFt: report.lotSizeSqFt ?? null,
      mapblklot: report.mapblklot ?? null,
    };
    return buildStatutoryEvaluations(parcel, report);
  }, [geocodeResult, report]);

  const mapCalloutSublabel = useMemo(() => {
    if (mapblklot) return `APN / mapblklot ${mapblklot}`;
    const parts = [
      geocodeResult?.place,
      geocodeResult?.county,
      geocodeResult?.region,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [geocodeResult, mapblklot]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 fill-mode-both sm:space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch lg:gap-8">
        <div className="relative flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-elevated lg:col-span-2 lg:max-h-[min(720px,calc(100vh-8rem))] lg:border-r-0">
          <div className="flex-1 space-y-6 overflow-y-auto p-8 pb-28">
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
                {jurisdictionLabel ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {jurisdictionLabel}
                  </p>
                ) : null}
              </div>
              {report ? (
                <EligibilityBadge status={report.overall} size="lg" />
              ) : null}
            </div>

            {zoningError && !report ? (
              <p
                role="alert"
                className="rounded-input border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-700"
              >
                {zoningError}
              </p>
            ) : null}

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
                <MapPin
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                Jurisdiction
              </span>
              <span className="text-right text-sm font-normal text-foreground">
                {jurisdictionLabel ?? "—"}
              </span>
            </div>

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
                {isJurisdictionContext
                  ? "Not verified"
                  : (report?.zoning ?? "—")}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3.5">
              <span className="text-sm font-medium text-muted-foreground">
                Lot area
              </span>
              <span className="text-sm font-normal text-foreground">
                {report?.lotSizeSqFt != null && report.lotSizeSqFt > 0
                  ? `${report.lotSizeSqFt.toLocaleString()} sq ft`
                  : "Not verified"}
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
                undetermined={isJurisdictionContext}
              />
              <OverlayRow
                label="Fire Hazard"
                icon={ShieldAlert}
                detected={Boolean(
                  report?.overlays.fireHazard || report?.overlays.vhfhsz,
                )}
                detectedClassName="text-rose-600"
                undetermined={isJurisdictionContext}
              />
              <OverlayRow
                label="Historic District"
                icon={Landmark}
                detected={Boolean(report?.overlays.historicDistrict)}
                detectedClassName="text-amber-600"
                undetermined={isJurisdictionContext}
              />
              <OverlayRow
                label="Tiny-home overlay"
                icon={Home}
                detected={Boolean(report?.overlays.tinyHomeFriendly)}
                detectedClassName="text-emerald-600"
                undetermined={isJurisdictionContext}
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
                {statutoryEvaluations.length > 0 ? (
                  <ExpandableSection
                    title="Statutory compliance checklist"
                    description="Lot facts cross-checked against cited code sections"
                    defaultOpen
                    variant="muted"
                    contentClassName="p-0 sm:p-0"
                  >
                    <StatutoryComplianceChecklist
                      report={report}
                      evaluations={statutoryEvaluations}
                      program={program}
                    />
                  </ExpandableSection>
                ) : null}
                <RegulationsAuthorByline className="text-xs text-muted-foreground" />
              </div>
            ) : null}
          </div>

          {geocodeResult ? (
            <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card p-6 sm:flex-row sm:items-center">
              <Link
                href={connectHref}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-button border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Request builder intro
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden lg:col-span-3 lg:h-[min(720px,calc(100vh-8rem))]">
          <AddressMapPreview
            lat={lat}
            lng={lng}
            status={report?.overall ?? null}
            label={address}
            sublabel={mapCalloutSublabel}
            className="min-h-[280px] rounded-none border-0 sm:min-h-[360px] lg:min-h-full"
          />
        </div>
      </div>

      {briefing && !isLoading ? (
        <>
          <ResultsBriefingSection summary={briefing.summary} />
          {briefing.sizeStructure ? (
            <TinyHomeSizeStructure briefing={briefing.sizeStructure} />
          ) : null}
          <ExpandableSection
            title="Requirements & application steps"
            description="California application checklist, county/city notes, and SF buyer guides"
            defaultOpen
          >
            <div className="space-y-6">
              <JurisdictionRequirements
                requirements={briefing.requirements}
                embedded
              />
              <ApplicationChecklist items={briefing.checklist} embedded />
              <BuyerGuideLinks links={briefing.guideLinks} />
            </div>
          </ExpandableSection>
        </>
      ) : null}

      {briefing && !isLoading && briefing.isCalifornia ? (
        <ExpandableSection
          title="California building paths"
          description="Statewide context — state floor first, then local code"
          defaultOpen={false}
        >
          <CaliforniaOutline sections={briefing.outline} embedded />
        </ExpandableSection>
      ) : null}

      {briefing && !isLoading ? (
        <ExpandableSection
          title="Search receipt & sources"
          description="Provenance, corpus version, and official links for this visit"
          defaultOpen={false}
          variant="muted"
        >
          <SearchReceiptCard receipt={briefing.receipt} embedded />
        </ExpandableSection>
      ) : null}
    </div>
  );
}
