/**
 * Owns all visitor-facing search result copy for the regulations expert agent.
 * Selects pre-written CitedClaims from the CA profile — never generates statute
 * prose and never fetches gov hosts.
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
import { SRC, uniqueSourceRefs } from "@/lib/regulations/sources";
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

export { isSanFranciscoPlace } from "@/lib/content/resolve-jurisdiction";

function statusWord(status: EligibilityStatus): string {
  switch (status) {
    case "eligible":
      return "Eligible";
    case "warning":
      return "Warning";
    case "restricted":
      return "Restricted";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function placeLabel(geocode: GeocodeResult): string {
  return geocode.place.trim() || geocode.county.trim() || "this California";
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

  if (zoningError) {
    return {
      text: `The parcel report could not be loaded for this search (${zoningError}). County and city requirements below may still apply, but rerun the check or confirm with local Planning/Building before relying on eligibility badges.`,
      sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.govChapter13],
    };
  }

  if (report?.analysisScope === "jurisdiction_context") {
    return {
      text: `For this ${place} address, lot zoning was not verified. Published city/county guidance plus the statewide ADU floor apply — ADU is ${statusWord(report.adu.status)}; SB 9 is ${statusWord(report.sb9.status)}. Confirm base district, THOW rules, and permits with local Planning/Building.`,
      sources: uniqueSourceRefs([
        ...local,
        SRC.hcdAdu,
        SRC.govChapter13,
        SRC.hcdTinyHomesIb,
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
    return {
      text: `On this ${place} lot (${zoneBit}), ADU is ${statusWord(report.adu.status)} and SB 9 is ${statusWord(report.sb9.status)}. Confirm primary use, local development standards, and permits with Planning/Building before you place or occupy a unit.`,
      sources: uniqueSourceRefs([
        ...districtSources(report, sfPlace),
        SRC.govChapter13,
        SRC.hcdAdu,
        ...(sfPlace ? [SRC.sfPlanningAdu] : local),
      ]),
    };
  }

  return {
    text: `Lot-level zoning is not available for this coordinate (${place}) in the current coverage set. County and city tiny-home requirements below still apply, plus the statewide ADU floor — confirm this address with your city or county planning department before buying or placing a unit.`,
    sources: uniqueSourceRefs([
      ...local,
      SRC.hcdAdu,
      SRC.hcdTinyHomesIb,
      SRC.govChapter13,
    ]),
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
  const sfPlace = isSanFranciscoPlace(geocode.place);
  const local = jurisdictionSourceRefs(geocode);
  const analysisScope =
    report?.analysisScope ??
    (report !== null
      ? ("lot_zoning" as const)
      : ("jurisdiction_context" as const));

  const unpublishedSummary: CitedClaim = {
    text: "Regulations for this state are not published in this checker yet. Do not assume California ADU or THOW rules apply outside California.",
    sources: [SRC.hcdAdu],
  };

  const permitClaim: CitedClaim = {
    text: "Do not skip the land-use and building permit process. Unpermitted placement can lead to fines and code enforcement. For site-specific advice, consult local Planning / Building or a California-licensed land-use attorney.",
    sources: uniqueSourceRefs(
      sfPlace
        ? [SRC.hcdAdu, SRC.sfPlanning, SRC.sfDbi]
        : [SRC.hcdAdu, SRC.hcdTinyHomesIb, ...local],
    ),
  };

  // Unpublished states: only the not-published notice — never CA lot / SF agency claims.
  const summary: CitedClaim[] =
    isCalifornia && profile.published
      ? [
          lotSummary(report, geocode, zoningError),
          ...profile.useDoctrine.slice(0, 2),
          CA_CRC_SIZE_CLAIM,
          CA_CHAPTER13_SIZE_CLAIM,
          permitClaim,
        ]
      : [unpublishedSummary];

  // One CA checklist for all California searches (SF PIM items remain in outline/guides).
  const checklist =
    isCalifornia && profile.published ? profile.caChecklist : [];

  const outline = isCalifornia && profile.published ? profile.outline : [];

  // SF buyer guides only for City of San Francisco place matches.
  const guideLinks: GuideLinkRef[] =
    isCalifornia && profile.published && sfPlace
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
    ...(sfPlace && analysisScope === "lot_zoning"
      ? sfPilotReceiptSources()
      : caStatewideReceiptSources()),
    ...local,
    ...districtUrl,
  ]);

  const requirements: LocationRequirement[] =
    isCalifornia && profile.published
      ? composeLocationRequirements({ geocode, report })
      : [];

  const sizeStructure =
    isCalifornia && profile.published ? buildSizeStructureBriefing() : null;

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
