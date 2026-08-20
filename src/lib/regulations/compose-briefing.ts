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

function lotSummary(report: ZoningReport | null): CitedClaim {
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
  const { geocode, report } = input;
  // zoningError is accepted for API compatibility; lot copy uses a fixed
  // jurisdiction-context claim when report is null (avoids dumping raw API text).
  void input.zoningError;
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const profile = getStateProfile(geocode.region);
  const isCalifornia = profile.code === "CA" && profile.published;
  const sfPlace = isSanFranciscoPlace(geocode.place);
  const analysisScope =
    report !== null
      ? ("lot_zoning" as const)
      : ("jurisdiction_context" as const);

  const unpublishedSummary: CitedClaim = {
    text: "Regulations for this state are not published in this checker yet. Do not assume California ADU or THOW rules apply outside California.",
    sources: [SRC.hcdAdu],
  };

  // Unpublished states: only the not-published notice — never CA lot / SF agency claims.
  const summary: CitedClaim[] =
    isCalifornia && profile.published
      ? [
          ...profile.useDoctrine.slice(0, 2),
          lotSummary(report),
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
    checklist,
    outline,
    guideLinks,
    receipt,
  };
}
