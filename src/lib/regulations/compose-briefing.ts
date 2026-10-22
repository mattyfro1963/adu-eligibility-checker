/**
 * Owns all visitor-facing search result copy for the regulations expert agent.
 * Selects pre-written CitedClaims — never generates statute prose and never fetches gov hosts.
 */

import {
  formatParcelAddress,
  formatZoningDistrictName,
} from "@/lib/address/format-parcel-address";
import { isSanFranciscoPlace } from "@/lib/content/resolve-jurisdiction";
import { GUIDE_LINKS } from "@/lib/content/guides/catalog";
import { REGULATIONS_AGENT } from "@/lib/regulations/agent";
import {
  CORPUS_VERSION,
  LAST_REVIEWED,
  RECEIPT_DISCLAIMER,
} from "@/lib/regulations/corpus";
import {
  composeLocationRequirements,
  jurisdictionSourceRefs,
  type LocationRequirement,
} from "@/lib/regulations/location-requirements";
import {
  caStatewideReceiptSources,
  sfPilotReceiptSources,
} from "@/lib/regulations/sf-source-catalog";
import {
  SRC,
  searchInfrastructureSources,
  uniqueSourceRefs,
} from "@/lib/regulations/sources";
import {
  buildSizeStructureBriefing,
  CA_CHAPTER13_SIZE_CLAIM,
  CA_CRC_SIZE_CLAIM,
} from "@/lib/regulations/size-structure";
import { getStateProfile } from "@/lib/regulations/states/registry";
import type {
  CitedClaim,
  GuideLinkRef,
  ResultsBriefing,
  SearchReceipt,
  SourceRef,
} from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";
import type { EligibilityStatus, ZoningReport } from "@/lib/types/zoning";
import { UNSUPPORTED_STATE_THOW_COPY } from "@/lib/rules/thow-summary";

export { isSanFranciscoPlace } from "@/lib/content/resolve-jurisdiction";

function statusWord(status: EligibilityStatus): string {
  switch (status) {
    case "eligible":
      return "Green";
    case "warning":
      return "Yellow";
    case "restricted":
      return "Red";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function lotRatingWord(rating: "green" | "yellow" | "red"): string {
  switch (rating) {
    case "green":
      return "Green";
    case "yellow":
      return "Yellow";
    case "red":
      return "Red";
    default: {
      const _exhaustive: never = rating;
      return _exhaustive;
    }
  }
}

function transportSourcesForRegion(
  region: string | null | undefined,
): SourceRef[] {
  const code = (region ?? "").trim().toUpperCase();
  if (code === "WA") {
    return [SRC.waDotOversize, SRC.waWacPilotEscort, SRC.waDotPermitForm560002];
  }
  if (code === "OR") {
    return [
      SRC.orDotLegalDims,
      SRC.orDotOverDimOps,
      SRC.orOarPilotVehicles,
      SRC.orDotPilotGuide,
    ];
  }
  return [
    SRC.caCvc35100,
    SRC.caDotVehicleWidths,
    SRC.caDotOversize,
    SRC.caDotPilotCarMaps,
    SRC.caDotTpmCh5,
  ];
}

function cambriaComparisonClaim(report: ZoningReport): CitedClaim | null {
  const plans = report.featuredPlans;
  if (!plans || plans.length < 2) return null;
  const c1 = plans.find((p) => p.planId === "cambria-1");
  const c2 = plans.find((p) => p.planId === "cambria-2");
  if (!c1 || !c2) return null;
  const rec = report.planRecommendation;
  const recBit = rec
    ? rec.recommendedPlanId
      ? ` Recommendation: ${rec.recommendedPlanId === "cambria-1" ? "CAMBRIA 1" : "CAMBRIA 2"} — ${rec.rationale}`
      : ` Recommendation: ${rec.rationale}`
    : "";
  return {
    text: `CAMBRIA 1 lot fit ${lotRatingWord(c1.lotRating)} (transport ${statusWord(c1.transportStatus)}); CAMBRIA 2 lot fit ${lotRatingWord(c2.lotRating)} (transport ${statusWord(c2.transportStatus)}).${recBit}`,
    sources: uniqueSourceRefs([
      ...transportSourcesForRegion(report.region),
      SRC.hcdTinyHomesIb,
      SRC.noahDwelling,
    ]),
  };
}

function placeLabel(geocode: GeocodeResult): string {
  const place = geocode.place.trim() || geocode.county.trim();
  if (place) return place;
  const region = geocode.region.trim() || "Cascadia";
  return `this ${region}`;
}

function districtSources(report: ZoningReport, sfPlace: boolean): SourceRef[] {
  const sources: SourceRef[] = [];
  if (sfPlace) {
    sources.push(SRC.datasfZoning);
  }
  if (report.zoningSourceUrl && /^https:\/\//i.test(report.zoningSourceUrl)) {
    const district =
      report.zoningDistrictName?.trim() || report.zoning || "district";
    sources.push({
      label: `Planning Code — ${report.zoning || formatZoningDistrictName(district)}`,
      href: report.zoningSourceUrl,
    });
  }
  return sources;
}

function lotSummary(
  report: ZoningReport | null,
  geocode: GeocodeResult,
  zoningError?: string | null,
): CitedClaim {
  const place = placeLabel(geocode);
  const local = jurisdictionSourceRefs(geocode);
  const sfPlace = isSanFranciscoPlace(geocode.place);
  const thowSources = [SRC.hcdTinyHomesIb, SRC.noahDwelling, SRC.hcdAdu];

  if (zoningError) {
    return {
      text: `The parcel report could not be loaded for this search (${zoningError}). County and city requirements below may still apply, but rerun the check or confirm with local Planning/Building before relying on THOW candidacy badges.`,
      sources: [...thowSources],
    };
  }

  if (report?.analysisScope === "jurisdiction_context") {
    const dims = report.dimensions;
    const cambria = cambriaComparisonClaim(report);
    return {
      text: `For this ${place} address, lot zoning was not verified. THOW lot candidacy is ${statusWord(report.thowOverall ?? report.overall)} — placement ${statusWord(dims.placement.status)}, certification ${statusWord(dims.certification.status)}, transport ${statusWord(dims.transport.status)}, lot readiness ${statusWord(dims.lotReadiness.status)}.${cambria ? ` ${cambria.text}` : ""} ADU pathway is ${statusWord(report.adu.status)} (optional — not automatic from wheeled placement). Confirm base district, utility hookups, and permits with local Planning/Building.`,
      sources: uniqueSourceRefs([
        ...local,
        ...thowSources,
        ...(cambria?.sources ?? []),
      ]),
    };
  }

  if (report) {
    const readable = report.zoningDistrictName?.trim()
      ? formatZoningDistrictName(report.zoningDistrictName)
      : null;
    const zoneBit =
      readable && readable.toLowerCase() !== report.zoning.trim().toLowerCase()
        ? `${report.zoning} — ${readable}`
        : report.zoning;
    const overlayBit =
      report.overlaysVerified === true
        ? "Overlay facts were checked for this lot."
        : "Overlay layers were not verified for this lot — treat Clear/absent flags as unchecked.";
    const cambria = cambriaComparisonClaim(report);
    return {
      text: `On this ${place} lot (${zoneBit}), THOW candidacy is ${statusWord(report.thowOverall ?? report.overall)}. ${overlayBit}${cambria ? ` ${cambria.text}` : ""} ADU pathway is ${statusWord(report.adu.status)} — possible if local THOW-as-ADU or foundation conversion, not automatic. Confirm primary use, district standards, utilities, and delivery route with Planning/Building before you place or occupy a unit.`,
      sources: uniqueSourceRefs([
        ...districtSources(report, sfPlace),
        ...thowSources,
        ...(cambria?.sources ?? []),
        ...(sfPlace ? [SRC.sfPlanningAdu] : local),
      ]),
    };
  }

  return {
    text: `Lot-level zoning is not available for this coordinate (${place}) in the current coverage set. County and city tiny-home requirements below still apply — confirm this address with your city or county planning department before buying or placing a unit.`,
    sources: uniqueSourceRefs([...local, ...thowSources]),
  };
}

export type ComposeBriefingInput = {
  geocode: GeocodeResult;
  report: ZoningReport | null;
  /** Present when /api/zoning failed (network/5xx) — not for uncovered counties. */
  zoningError?: string | null;
  /** ISO timestamp; defaults to now. */
  issuedAt?: string;
};

/**
 * Compose the full ResultsCard briefing for a search.
 * Components render only — they must not invent claim text.
 */
export function composeResultsBriefing(
  input: ComposeBriefingInput,
): ResultsBriefing {
  const { geocode, report, zoningError } = input;
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const profile = getStateProfile(geocode.region);
  const isCalifornia = profile.code === "CA" && profile.published;
  const isPublished = profile.published;
  const sfPlace = isSanFranciscoPlace(geocode.place);
  const local = jurisdictionSourceRefs(geocode);
  const analysisScope =
    report?.analysisScope ??
    (report !== null
      ? ("lot_zoning" as const)
      : ("jurisdiction_context" as const));

  const unpublishedSummary: CitedClaim = {
    text: UNSUPPORTED_STATE_THOW_COPY,
    sources: [SRC.hcdTinyHomesIb, SRC.noahDwelling],
  };

  const permitClaim: CitedClaim = {
    text: isCalifornia
      ? "Do not skip the land-use and building permit process. Unpermitted placement can lead to fines and code enforcement. For site-specific advice, consult local Planning / Building or a California-licensed land-use attorney."
      : "Do not skip the land-use and building permit process. Unpermitted placement can lead to fines and code enforcement. For site-specific advice, consult local Planning / Building or a licensed land-use professional in this state.",
    sources: uniqueSourceRefs(
      sfPlace
        ? [SRC.hcdAdu, SRC.sfPlanning, SRC.sfDbi]
        : isCalifornia
          ? [SRC.hcdTinyHomesIb, SRC.noahDwelling, ...local]
          : [SRC.noahDwelling, SRC.rvia, ...local],
    ),
  };

  const thowSummaryClaim: CitedClaim | null = report?.thowSummary ?? null;

  const summary: CitedClaim[] = !isPublished
    ? [unpublishedSummary]
    : [
        ...(thowSummaryClaim ? [thowSummaryClaim] : []),
        lotSummary(report, geocode, zoningError),
        ...profile.useDoctrine.slice(0, 2),
        ...(isCalifornia ? [CA_CRC_SIZE_CLAIM, CA_CHAPTER13_SIZE_CLAIM] : []),
        permitClaim,
      ];

  const checklist = isPublished ? profile.caChecklist : [];
  const outline = isPublished ? profile.outline : [];

  const guideLinks: GuideLinkRef[] =
    isCalifornia && sfPlace
      ? GUIDE_LINKS.map((link) => ({
          slug: link.slug,
          title: link.title,
          href: link.href,
        }))
      : [];

  const districtUrl: SourceRef[] =
    report?.zoningSourceUrl && /^https:\/\//i.test(report.zoningSourceUrl)
      ? [
          {
            label: `Planning Code — ${report.zoning}`,
            href: report.zoningSourceUrl,
          },
        ]
      : [];

  const sourcesUsed = uniqueSourceRefs([
    ...searchInfrastructureSources(),
    ...(sfPlace && analysisScope === "lot_zoning"
      ? sfPilotReceiptSources()
      : isCalifornia
        ? caStatewideReceiptSources()
        : [SRC.noahDwelling, SRC.rvia]),
    ...local,
    ...districtUrl,
    SRC.noahDwelling,
  ]);

  const requirements: LocationRequirement[] = isPublished
    ? composeLocationRequirements({ geocode, report })
    : [];

  const sizeStructure = isCalifornia ? buildSizeStructureBriefing() : null;

  const receipt: SearchReceipt = {
    issuedAt,
    formattedAddress: formatParcelAddress(geocode),
    place: geocode.place,
    region: profile.code || geocode.region || "CA",
    mapblklot: report?.mapblklot ?? null,
    analysisScope,
    corpusVersion: CORPUS_VERSION,
    lastReviewed: LAST_REVIEWED,
    author: REGULATIONS_AGENT,
    sourcesUsed,
    disclaimer: RECEIPT_DISCLAIMER,
  };

  return {
    region: receipt.region,
    isCalifornia,
    author: REGULATIONS_AGENT,
    summary,
    requirements,
    sizeStructure,
    checklist,
    outline,
    guideLinks,
    receipt,
  };
}
