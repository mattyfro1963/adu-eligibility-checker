"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Home, Landmark, ShieldAlert, Trees } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { MapSiteLegend } from "@/components/features/AddressMapPreview/MapSiteLegend";
import { ApplicationChecklist } from "@/components/features/ResultsCard/ApplicationChecklist";
import { BuyerGuideLinks } from "@/components/features/ResultsCard/BuyerGuideLinks";
import { CaliforniaOutline } from "@/components/features/ResultsCard/CaliforniaOutline";
import { CambriaPlanComparison } from "@/components/features/ResultsCard/CambriaPlanComparison";
import { JurisdictionRequirements } from "@/components/features/ResultsCard/JurisdictionRequirements";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { ResultsBriefingSection } from "@/components/features/ResultsCard/ResultsBriefing";
import { RuleDetail } from "@/components/features/ResultsCard/RuleDetail";
import { StatutoryComplianceChecklist } from "@/components/features/ResultsCard/StatutoryComplianceChecklist";
import { TinyHomeSizeStructure } from "@/components/features/ResultsCard/TinyHomeSizeStructure";
import { SearchReceiptCard } from "@/components/features/ResultsCard/SearchReceipt";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { Button } from "@/components/ui/button";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { formatParcelAddress } from "@/lib/address/format-parcel-address";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel, ZoningReport } from "@/lib/types/zoning";

function formatJurisdiction(geocode: GeocodeResult | null): string | null {
  if (!geocode) return null;
  const place = geocode.place.trim();
  const county = geocode.county.trim();
  if (!place && !county) return null;
  const countyLabel = !county
    ? ""
    : /\bcounty\b/i.test(county) || county.toLowerCase() === place.toLowerCase()
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
  /** Retry zoning fetch after transport failure. */
  onRetry?: () => void;
}

function providerDisplayName(provider: string | null | undefined): string {
  if (provider === "sf-datasf")
    return "San Francisco DataSF (California pilot)";
  if (provider === "open-data") return "open zoning data";
  if (provider === "regrid") return "Regrid";
  if (provider) return provider;
  return "lot GIS";
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
    <div className="flex items-center justify-between border-b border-border-luxury py-3.5 last:border-b-0">
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon
          size={16}
          strokeWidth={1.5}
          className="text-luxury-taupe"
          aria-hidden="true"
        />
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

/**
 * Lot readiness report: overall Green/Yellow/Red candidacy, dimension panels,
 * optional ADU pathway. Statute copy from lib/regulations + rules.
 */
export function ResultsCard({
  report,
  geocodeResult,
  isLoading = false,
  zoningError = null,
  connectHref = "#connect",
  onRetry,
}: ResultsCardProps) {
  const lat = geocodeResult?.lat ?? null;
  const lng = geocodeResult?.lng ?? null;
  const address = geocodeResult
    ? formatParcelAddress(geocodeResult)
    : (report?.formattedAddress ?? "—");
  const mapblklot = report?.mapblklot ?? null;
  const isJurisdictionContext =
    report?.analysisScope === "jurisdiction_context";
  const overlaysUnchecked = report?.overlaysVerified !== true;
  const jurisdictionLabel = formatJurisdiction(geocodeResult);
  const providerLabel = report?.zoningProvider?.trim() || null;
  const overall = report?.thowOverall ?? report?.overall ?? null;

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
      overlaysVerified: report.overlaysVerified === true,
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
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700 fill-mode-both sm:space-y-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch lg:gap-8">
        <div
          className="order-1 flex flex-col overflow-hidden rounded-xl border border-border-luxury bg-surface-luxury/40 lg:order-2 lg:col-span-3 lg:h-[min(720px,calc(100vh-8rem))]"
          role="region"
          aria-label={`Map of ${address}. Site reading legend describes schematic lot and zoning district code.`}
        >
          <AddressMapPreview
            lat={lat}
            lng={lng}
            status={overall}
            label={address}
            sublabel={mapCalloutSublabel}
            lotSizeSqFt={report?.lotSizeSqFt ?? null}
            zoning={isJurisdictionContext ? null : (report?.zoning ?? null)}
            analysisScope={report?.analysisScope ?? null}
            showSiteLayers
            className="min-h-[280px] flex-1 rounded-none border-0 sm:min-h-[360px] lg:min-h-0"
          />
          <MapSiteLegend
            zoningLabel={
              isJurisdictionContext
                ? "Unverified"
                : report?.zoning?.trim() || "Unverified"
            }
            lotVerified={
              !isJurisdictionContext &&
              report?.lotSizeSqFt != null &&
              report.lotSizeSqFt > 0
            }
            analysisVerified={!isJurisdictionContext && Boolean(report)}
            mapInteractive={
              typeof document !== "undefined" &&
              document.body.dataset.mapboxConfigured === "1"
            }
          />
        </div>

        <div className="relative order-2 flex flex-col overflow-hidden rounded-xl border border-border-luxury bg-card lg:order-1 lg:col-span-2 lg:max-h-[min(720px,calc(100vh-8rem))]">
          <div className="flex-1 space-y-7 overflow-y-auto p-5 pb-24 sm:space-y-8 sm:p-8 sm:pb-28">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-label text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
                  Lot readiness report
                </p>
                <h2 className="mt-2 font-sans text-heading-sm leading-tight break-words text-text-luxury">
                  {address}
                </h2>
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
              {overall ? <EligibilityBadge status={overall} size="lg" /> : null}
            </div>

            {zoningError && !report ? (
              <div className="space-y-3">
                <p
                  role="alert"
                  className="rounded-input border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-700"
                >
                  {zoningError}
                </p>
                {onRetry ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] w-full border-border-luxury hover:bg-surface-luxury/60"
                    onClick={onRetry}
                  >
                    Retry parcel check
                  </Button>
                ) : null}
              </div>
            ) : null}

            {report?.thowSummary ? (
              <p className="text-sm leading-relaxed text-foreground">
                {report.thowSummary.text}
              </p>
            ) : null}

            {report ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Informational engine result — not legal advice, not a permit. A
                THOW is not automatically an ADU. Confirm with local Planning
                and Building before design or delivery.
              </p>
            ) : null}

            {isJurisdictionContext ? (
              <p className="rounded-input border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                Lot zoning was not verified for this coordinate. THOW candidacy
                below reflects published county/city guidance plus state
                profiles — confirm base district, utilities, and occupancy with
                local Planning/Building.
              </p>
            ) : report ? (
              <p className="rounded-input border border-border-luxury bg-surface-luxury/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                Lot-level district from {providerDisplayName(providerLabel)}.
                Overlay layers{" "}
                {overlaysUnchecked
                  ? "were not verified for this parcel"
                  : "were checked against mapped facts"}
                . Statewide statute floors still require local confirmation.
              </p>
            ) : null}

            <dl className="grid grid-cols-1 divide-y divide-border-luxury border-y border-border-luxury sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="bg-surface-luxury/30 px-3 py-3.5 sm:px-4">
                <dt className="font-label text-[10px] tracking-[0.12em] text-luxury-taupe">
                  Jurisdiction
                </dt>
                <dd className="mt-1.5 text-sm leading-snug text-foreground">
                  {jurisdictionLabel ?? "—"}
                </dd>
              </div>
              <div className="bg-surface-luxury/30 px-3 py-3.5 sm:px-4">
                <dt className="font-label text-[10px] tracking-[0.12em] text-luxury-taupe">
                  Base zoning
                </dt>
                <dd className="mt-1.5 font-mono text-sm text-foreground">
                  {isJurisdictionContext
                    ? "Not verified"
                    : (report?.zoning ?? "—")}
                </dd>
              </div>
              <div className="bg-surface-luxury/30 px-3 py-3.5 sm:px-4">
                <dt className="font-label text-[10px] tracking-[0.12em] text-luxury-taupe">
                  Lot area
                </dt>
                <dd className="mt-1.5 text-sm text-foreground">
                  {report?.lotSizeSqFt != null && report.lotSizeSqFt > 0
                    ? `${report.lotSizeSqFt.toLocaleString()} sq ft`
                    : "Not verified"}
                </dd>
              </div>
            </dl>

            {isJurisdictionContext ? (
              <p className="text-xs text-amber-700">
                Analysis scope: jurisdiction context — lot GIS not verified.
              </p>
            ) : report ? (
              <p className="text-xs text-muted-foreground">
                Analysis scope: lot zoning
                {providerLabel
                  ? ` · ${providerDisplayName(providerLabel)}`
                  : ""}
                {overlaysUnchecked ? " · overlays not verified" : ""}.
              </p>
            ) : null}

            <div className="border-t border-border-luxury pt-6">
              <p className="font-label mb-3 text-[10px] tracking-[0.12em] text-luxury-taupe">
                Overlay facts
              </p>
              <OverlayRow
                label="Coastal Zone"
                icon={Trees}
                detected={Boolean(report?.overlays.coastalZone)}
                detectedClassName="text-amber-600"
                undetermined={isJurisdictionContext || overlaysUnchecked}
              />
              <OverlayRow
                label="Fire Hazard"
                icon={ShieldAlert}
                detected={Boolean(
                  report?.overlays.fireHazard || report?.overlays.vhfhsz,
                )}
                detectedClassName="text-rose-600"
                undetermined={isJurisdictionContext || overlaysUnchecked}
              />
              <OverlayRow
                label="Historic District"
                icon={Landmark}
                detected={Boolean(report?.overlays.historicDistrict)}
                detectedClassName="text-amber-600"
                undetermined={isJurisdictionContext || overlaysUnchecked}
              />
              <OverlayRow
                label="Tiny-home overlay"
                icon={Home}
                detected={Boolean(report?.overlays.tinyHomeFriendly)}
                detectedClassName="text-emerald-600"
                undetermined={isJurisdictionContext || overlaysUnchecked}
              />
            </div>

            {report ? (
              <div className="space-y-8 border-t border-border-luxury pt-7">
                {report.featuredPlans && report.featuredPlans.length > 0 ? (
                  <CambriaPlanComparison
                    plans={report.featuredPlans}
                    recommendation={report.planRecommendation}
                  />
                ) : null}

                <div>
                  <p className="font-label mb-5 text-[10px] tracking-[0.12em] text-luxury-taupe">
                    THOW dimensions
                    {report.planRecommendation?.recommendedPlanId
                      ? ` · ${report.planRecommendation.recommendedPlanId === "cambria-1" ? "CAMBRIA 1" : "CAMBRIA 2"}`
                      : " · CAMBRIA 1 panel"}
                  </p>
                  <div>
                    <RuleDetail
                      result={report.dimensions.placement}
                      category="Placement"
                      title="Local THOW / park-model path"
                    />
                    <RuleDetail
                      result={report.dimensions.certification}
                      category="Certification"
                      title="Certification & size fit"
                    />
                    <RuleDetail
                      result={report.dimensions.transport}
                      category="Transport"
                      title="Delivery & route logistics"
                    />
                    <RuleDetail
                      result={report.dimensions.lotReadiness}
                      category="Utilities"
                      title="Utilities & occupancy readiness"
                    />
                  </div>
                </div>

                <ExpandableSection
                  title="Other pathways (ADU & SB 9)"
                  description="Optional ADU conversion and California SB 9 — not primary THOW chrome"
                  defaultOpen={false}
                  variant="muted"
                  className="border-border-luxury"
                  headingLevel={3}
                >
                  <div className="space-y-1 p-1">
                    <RuleDetail
                      result={report.adu}
                      category="ADU pathway"
                      title="Optional ADU path — not automatic"
                      headingLevel={4}
                    />
                    <p className="px-1 pb-4 text-xs leading-relaxed text-muted-foreground">
                      Possible if local THOW-as-ADU or foundation conversion —
                      not automatic. ADU status does not alone set THOW
                      Green/Yellow/Red.
                    </p>
                    {report.sb9 ? (
                      <RuleDetail
                        result={report.sb9}
                        category="SB 9"
                        title="SB 9 Lot Split / Duplex"
                        headingLevel={4}
                      />
                    ) : null}
                  </div>
                </ExpandableSection>

                {statutoryEvaluations.length > 0 ? (
                  <ExpandableSection
                    title="Statutory compliance checklist"
                    description={
                      isJurisdictionContext || overlaysUnchecked
                        ? "Statute checks — verified where lot facts ran; otherwise marked unverified"
                        : "Lot facts checked against cited code sections where data was available"
                    }
                    defaultOpen={false}
                    variant="muted"
                    className="border-border-luxury"
                    contentClassName="p-0 sm:p-0"
                    headingLevel={3}
                  >
                    <StatutoryComplianceChecklist
                      report={report}
                      evaluations={statutoryEvaluations}
                      program="adu"
                      embedded
                    />
                  </ExpandableSection>
                ) : null}
                <RegulationsAuthorByline className="text-xs text-muted-foreground" />
              </div>
            ) : null}
          </div>

          {geocodeResult && report && overall ? (
            <div className="flex shrink-0 flex-col gap-2 border-t border-border-luxury bg-surface-luxury/40 p-4 sm:flex-row sm:items-center sm:p-6">
              {overall === "eligible" ? (
                <Button
                  asChild
                  variant="outline"
                  className="min-h-[44px] flex-1 border-border-luxury hover:bg-surface-luxury/60"
                >
                  <Link href={connectHref}>
                    Request builder intro
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {overall === "warning" ? (
                <Button
                  asChild
                  variant="warning"
                  className="min-h-[44px] flex-1"
                >
                  <Link href={connectHref}>
                    Request specialist review
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {overall === "restricted" ? (
                <Button
                  asChild
                  variant="restricted"
                  className="min-h-[44px] flex-1"
                >
                  <Link href={connectHref}>
                    Request specialist compliance review
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
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
            description="Application checklist, county/city notes, and local guides"
            defaultOpen
            headingLevel={3}
          >
            <div className="space-y-6">
              <JurisdictionRequirements
                requirements={briefing.requirements}
                embedded
              />
              <ApplicationChecklist items={briefing.checklist} embedded />
              <BuyerGuideLinks links={briefing.guideLinks} embedded />
            </div>
          </ExpandableSection>
        </>
      ) : null}

      {briefing && !isLoading && briefing.outline.length > 0 ? (
        <ExpandableSection
          title={
            briefing.isCalifornia
              ? "California building paths"
              : `${briefing.region} building paths`
          }
          description="Statewide context — confirm local code before delivery"
          defaultOpen={false}
          headingLevel={3}
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
          headingLevel={3}
        >
          <SearchReceiptCard receipt={briefing.receipt} embedded />
        </ExpandableSection>
      ) : null}
    </div>
  );
}
