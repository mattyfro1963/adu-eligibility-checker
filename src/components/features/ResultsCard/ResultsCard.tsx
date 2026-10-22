"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Home,
  Landmark,
  Layers,
  Plug,
  Ruler,
  ShieldAlert,
  Split,
  Square,
  Trees,
  Truck,
} from "lucide-react";
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
import {
  buildKeyFindings,
  providerDisplayName,
  type KeyFindingId,
} from "@/lib/results/key-findings";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
import type { GeocodeResult } from "@/lib/types/gis";
import type { Parcel, ZoningReport } from "@/lib/types/zoning";

const KEY_FINDING_ICONS: Record<KeyFindingId, typeof Home> = {
  zoning: Home,
  mapblklot: Landmark,
  "lot-area": Ruler,
  "parcel-boundary": Square,
  overlays: ShieldAlert,
  "unit-capacity": Layers,
  placement: Home,
  certification: BadgeCheck,
  transport: Truck,
  "lot-readiness": Plug,
  adu: Home,
  sb9: Split,
};

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
  /** Inline “reading the lot” slot while zoning resolves. */
  reading?: ReactNode;
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
    <div className="flex items-center justify-between py-3.5">
      <span className="flex items-center gap-2 text-sm font-medium text-luxury-taupe">
        <Icon
          size={16}
          strokeWidth={1.5}
          className="text-luxury-taupe"
          aria-hidden="true"
        />
        {label}
      </span>
      <span
        className={`text-sm font-normal ${detected ? detectedClassName : undetermined ? "text-amber-700" : "text-text-luxury"}`}
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
  reading = null,
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

  const keyFindings = useMemo(() => buildKeyFindings(report), [report]);
  const lotReadinessOpen = report?.dimensions.lotReadiness.status === "warning";
  const showReading = Boolean(reading) && !report && !zoningError;
  const showOutcome = Boolean(report) && !showReading;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch lg:gap-8">
        <div
          className="order-1 flex flex-col overflow-hidden rounded-xl border border-luxury-taupe/30 bg-luxury-charcoal lg:order-2 lg:col-span-3 lg:h-[min(640px,calc(100dvh-13rem))]"
          role="region"
          aria-label={`Map of ${address}. Site reading legend describes assessor parcel boundary and zoning district code.`}
        >
          <AddressMapPreview
            lat={lat}
            lng={lng}
            status={overall}
            label={address}
            sublabel={mapCalloutSublabel}
            lotSizeSqFt={report?.lotSizeSqFt ?? null}
            parcelBoundary={report?.parcelBoundary ?? null}
            zoning={isJurisdictionContext ? null : (report?.zoning ?? null)}
            analysisScope={report?.analysisScope ?? null}
            showSiteLayers
            className="min-h-[280px] flex-1 rounded-none border-0 bg-luxury-charcoal sm:min-h-[360px] lg:min-h-0"
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
            boundaryVerified={
              !isJurisdictionContext && report?.parcelBoundary != null
            }
            analysisVerified={!isJurisdictionContext && Boolean(report)}
            lotSizeSqFt={report?.lotSizeSqFt ?? null}
            mapInteractive
          />
        </div>

        <div className="relative order-2 flex flex-col overflow-hidden rounded-xl border border-luxury-taupe/30 bg-card lg:order-1 lg:col-span-2 lg:max-h-[min(640px,calc(100dvh-13rem))]">
          <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8">
            <div className="min-w-0">
              <p className="font-label text-[11px] font-bold tracking-[0.18em] text-luxury-taupe">
                Lot readiness report
              </p>
              <h2 className="mt-3 font-sans text-[1.75rem] leading-tight font-bold break-words text-text-luxury">
                {address}
              </h2>
              {mapblklot ? (
                <p className="mt-2 font-mono text-xs tracking-wide text-luxury-taupe">
                  APN / mapblklot {mapblklot}
                </p>
              ) : null}
              {jurisdictionLabel ? (
                <p className="mt-1 text-xs text-luxury-taupe">
                  {jurisdictionLabel}
                </p>
              ) : null}
            </div>

            {showReading ? reading : null}

            {zoningError && !report ? (
              <div className="space-y-3">
                <p
                  role="alert"
                  className="text-sm leading-relaxed text-rose-700"
                >
                  {zoningError}
                </p>
                {onRetry ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] w-full border-luxury-taupe/30 hover:bg-surface-luxury/60"
                    onClick={onRetry}
                  >
                    Retry parcel check
                  </Button>
                ) : null}
              </div>
            ) : null}

            {showOutcome && overall ? (
              <EligibilityBadge
                status={overall}
                size="lg"
                className="badge-ease"
              />
            ) : null}

            {showOutcome && report?.thowSummary ? (
              <>
                <hr className="border-luxury-taupe/22" />
                <p className="text-[15px] leading-relaxed text-text-luxury">
                  {report.thowSummary.text}
                </p>
              </>
            ) : null}

            {showOutcome && isJurisdictionContext ? (
              <p className="text-xs leading-relaxed text-luxury-taupe">
                Lot zoning was not verified for this coordinate. Candidacy
                reflects published county/city guidance plus state profiles —
                confirm base district, utilities, and occupancy locally.
              </p>
            ) : showOutcome && report ? (
              <p className="text-xs leading-relaxed text-luxury-taupe">
                Analysis scope: lot zoning
                {providerLabel
                  ? ` · ${providerDisplayName(providerLabel)}`
                  : ""}
                {overlaysUnchecked ? " · overlays not verified" : ""}.
              </p>
            ) : null}

            {showOutcome && report ? (
              <div>
                <RuleDetail
                  result={report.dimensions.placement}
                  category="Placement"
                  title="Local THOW / park-model path"
                  compact
                  index={0}
                />
                <RuleDetail
                  result={report.dimensions.certification}
                  category="Certification"
                  title="Certification & size fit"
                  compact
                  index={1}
                />
                <RuleDetail
                  result={report.dimensions.transport}
                  category="Transport"
                  title="Delivery & route logistics"
                  compact
                  index={2}
                />
                <RuleDetail
                  result={report.dimensions.lotReadiness}
                  category="Lot readiness"
                  title="Utilities & occupancy readiness"
                  compact
                  index={3}
                  inviteNextStep={lotReadinessOpen}
                />
              </div>
            ) : null}

            {showOutcome ? (
              <div className="space-y-4">
                <p className="text-[13px] leading-relaxed text-luxury-wood">
                  ADU is an optional pathway, not automatic.
                </p>
                <p className="font-label text-[11px] tracking-[0.22em] text-luxury-taupe">
                  CA · OR · WA
                </p>
                {geocodeResult && overall ? (
                  <div className="pt-1">
                    {overall === "eligible" ? (
                      <Button
                        asChild
                        className="min-h-[44px] w-full bg-action-primary text-action-primary-fg hover:bg-action-primary/90"
                      >
                        <Link href={connectHref}>
                          Outfit the lot
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : null}
                    {overall === "warning" ? (
                      <Button
                        asChild
                        variant="warning"
                        className="min-h-[44px] w-full"
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
                        className="min-h-[44px] w-full"
                      >
                        <Link href={connectHref}>
                          Request compliance review
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showOutcome && report ? (
        <>
          <ExpandableSection
            title="Key findings & overlay facts"
            description="Engine notes, overlays, and coverage — deferred from the first reading"
            defaultOpen={false}
            headingLevel={3}
          >
            <div className="space-y-8 p-1">
              <ul className="space-y-4 text-sm">
                {keyFindings.map((finding) => {
                  const Icon = KEY_FINDING_ICONS[finding.id];
                  return (
                    <li key={finding.id} className="flex items-start gap-3">
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-luxury-taupe"
                        aria-hidden="true"
                      />
                      <span>{finding.text}</span>
                    </li>
                  );
                })}
              </ul>
              <div>
                <p className="font-label mb-1 text-[11px] font-bold tracking-[0.18em] text-luxury-taupe">
                  Overlay facts
                </p>
                <div className="divide-y divide-luxury-taupe/15">
                  <OverlayRow
                    label="Coastal Zone"
                    icon={Trees}
                    detected={Boolean(report.overlays.coastalZone)}
                    detectedClassName="text-amber-600"
                    undetermined={isJurisdictionContext || overlaysUnchecked}
                  />
                  <OverlayRow
                    label="Fire Hazard"
                    icon={ShieldAlert}
                    detected={Boolean(
                      report.overlays.fireHazard || report.overlays.vhfhsz,
                    )}
                    detectedClassName="text-rose-600"
                    undetermined={isJurisdictionContext || overlaysUnchecked}
                  />
                  <OverlayRow
                    label="Historic District"
                    icon={Landmark}
                    detected={Boolean(report.overlays.historicDistrict)}
                    detectedClassName="text-amber-600"
                    undetermined={isJurisdictionContext || overlaysUnchecked}
                  />
                  <OverlayRow
                    label="Tiny-home overlay"
                    icon={Home}
                    detected={Boolean(report.overlays.tinyHomeFriendly)}
                    detectedClassName="text-emerald-600"
                    undetermined={isJurisdictionContext || overlaysUnchecked}
                  />
                </div>
              </div>
            </div>
          </ExpandableSection>

          {report.featuredPlans && report.featuredPlans.length > 0 ? (
            <ExpandableSection
              title="Featured plans"
              description="Cambria panel comparison — secondary to lot reading"
              defaultOpen={false}
              headingLevel={3}
            >
              <CambriaPlanComparison
                plans={report.featuredPlans}
                recommendation={report.planRecommendation}
              />
            </ExpandableSection>
          ) : null}

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
                Possible if local THOW-as-ADU or foundation conversion — not
                automatic. ADU status does not alone set THOW Green/Yellow/Red.
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
        </>
      ) : null}

      {briefing && !isLoading && showOutcome ? (
        <>
          <ResultsBriefingSection summary={briefing.summary} />
          {briefing.sizeStructure ? (
            <TinyHomeSizeStructure briefing={briefing.sizeStructure} />
          ) : null}
          <ExpandableSection
            title="Requirements & application steps"
            description="Application checklist, county/city notes, and local guides"
            defaultOpen={false}
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
