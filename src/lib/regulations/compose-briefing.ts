/**
 * Owns all visitor-facing search result copy for the regulations expert agent.
 * Selects pre-written CitedClaims from the CA profile — never generates statute
 * prose and never fetches gov hosts.
 */

import { GUIDE_LINKS } from "@/lib/content/guides/catalog";
import { REGULATIONS_AGENT } from "@/lib/regulations/agent";
import {
  CORPUS_VERSION,
  LAST_REVIEWED,
  RECEIPT_DISCLAIMER,
} from "@/lib/regulations/corpus";
import {
  composeLocationRequirements,
  type LocationRequirement,
} from "@/lib/regulations/location-requirements";
import {
  caStatewideReceiptSources,
  sfPilotReceiptSources,
} from "@/lib/regulations/sf-source-catalog";
import { SRC } from "@/lib/regulations/sources";
import {
  buildSizeStructureBriefing,
  CA_SIZE_STRUCTURE_SUMMARY_CLAIM,
} from "@/lib/regulations/size-structure";
import { getStateProfile } from "@/lib/regulations/states/registry";
import type {
  CitedClaim,
  GuideLinkRef,
  ResultsBriefing,
  SearchReceipt,
} from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

/** City of San Francisco only — not South San Francisco or other substrings. */
export function isSanFranciscoPlace(place: string): boolean {
  const p = place.trim().toLowerCase();
  return p === "san francisco" || p === "city and county of san francisco";
}

function lotSummary(
  report: ZoningReport | null,
  zoningError?: string | null,
): CitedClaim {
  if (zoningError) {
    return {
      text: `The parcel report could not be loaded for this search (${zoningError}). County and city requirements below may still apply, but rerun the check or confirm with local Planning/Building before relying on eligibility badges.`,
      sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.govChapter13],
    };
  }

  if (report?.analysisScope === "jurisdiction_context") {
    switch (report.overall) {
      case "eligible":
        return {
          text: `For this California address (${report.formattedAddress.split(",").slice(-2).join(",").trim() || "jurisdiction context"}), lot zoning was not verified — the checker applied published county/city tiny-home guidance plus the statewide ADU floor. Local posture looks favorable for a residential ADU path, but confirm base zoning, THOW rules, and permits with Planning/Building before you place a unit.`,
          sources: [SRC.hcdAdu, SRC.govChapter13, SRC.hcdTinyHomesIb],
        };
      case "warning":
        return {
          text: `For this California address, lot zoning was not verified. The checker applied county/city guidance and the statewide ADU floor — expect extra confirmation steps (THOW limits, unclear park-model rules, or unverified SB 9 single-family zoning) before treating the site as ready for a dwelling-use tiny home.`,
          sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.govChapter13],
        };
      case "restricted":
        return {
          text: `For this California address, lot zoning was not verified. Published local guidance and the statewide floor did not surface a clear ministerial ADU or SB 9 path — treat this as a high-friction site until Planning/Building confirms use and district.`,
          sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.gov66314],
        };
      default: {
        const _exhaustive: never = report.overall;
        return _exhaustive;
      }
    }
  }

  if (report) {
    const zone = report.zoning;
    switch (report.overall) {
      case "eligible":
        return {
          text: `On this California lot (zoning ${zone}), local zoning coverage found a qualifying residential path for a residential tiny home treated as an ADU under State ADU Law — still confirm primary use, local development standards, and permits with local Planning and Building before you place or occupy a unit.`,
          sources: [SRC.datasfZoning, SRC.govChapter13, SRC.sfPlanningAdu],
        };
      case "warning":
        return {
          text: `On this California lot (zoning ${zone}), local zoning coverage found a possible residential ADU path with warnings (for example fire, historic, or coastal overlays). Extra objective standards or Coastal Act review may apply — resolve those before treating the lot as ready for a dwelling-use tiny home.`,
          sources: [
            SRC.datasfZoning,
            SRC.govChapter13,
            SRC.hcdFactSheets2026,
            SRC.sfPim,
          ],
        };
      case "restricted":
        return {
          text: `On this California lot (zoning ${zone}), the zoning check did not find a clear ministerial path for both ADU and SB 9 residential programs. A commercial-only district, for example, does not carry statewide ADU rights — and a jewelry shop or other retail use in a tiny house would still need a zone that allows that commercial use.`,
          sources: [SRC.datasfZoning, SRC.gov66314, SRC.hcdTinyHomesIb],
        };
      default: {
        const _exhaustive: never = report.overall;
        return _exhaustive;
      }
    }
  }

  return {
    text: "Lot-level zoning is not available for this coordinate in the current coverage set. County and city tiny-home requirements below still apply, plus the statewide ADU floor — confirm this address with your city or county planning department before buying or placing a unit.",
    sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.govChapter13],
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
  const analysisScope =
    report?.analysisScope ??
    (report !== null
      ? ("lot_zoning" as const)
      : ("jurisdiction_context" as const));

  const unpublishedSummary: CitedClaim = {
    text: "Regulations for this state are not published in this checker yet. Do not assume California ADU or THOW rules apply outside California.",
    sources: [SRC.hcdAdu],
  };

  // Unpublished states: only the not-published notice — never CA lot / SF agency claims.
  const summary: CitedClaim[] =
    isCalifornia && profile.published
      ? [
          lotSummary(report, zoningError),
          ...profile.useDoctrine.slice(0, 2),
          CA_SIZE_STRUCTURE_SUMMARY_CLAIM,
          {
            text: "Do not skip the land-use and building permit process. Unpermitted placement can lead to fines and code enforcement. For site-specific advice, consult local Planning / Building or a California-licensed land-use attorney.",
            sources: [SRC.hcdAdu, SRC.sfPlanning, SRC.sfDbi],
          },
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

  const sourcesUsed =
    analysisScope === "lot_zoning"
      ? sfPilotReceiptSources()
      : caStatewideReceiptSources();

  const requirements: LocationRequirement[] =
    isCalifornia && profile.published
      ? composeLocationRequirements({ geocode, report })
      : [];

  const sizeStructure =
    isCalifornia && profile.published ? buildSizeStructureBriefing() : null;

  const receipt: SearchReceipt = {
    issuedAt,
    formattedAddress: geocode.formattedAddress,
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
