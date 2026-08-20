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
function isSanFranciscoPlace(place: string): boolean {
  const p = place.trim().toLowerCase();
  return p === "san francisco" || p === "city and county of san francisco";
}

function lotSummary(report: ZoningReport | null): CitedClaim {
  if (report) {
    const zone = report.zoning;
    switch (report.overall) {
      case "eligible":
        return {
          text: `On this California lot (zoning ${zone}), the pilot check found a qualifying residential path for a residential tiny home treated as an ADU under State ADU Law — still confirm primary use, local development standards, and permits with local Planning and Building before you place or occupy a unit.`,
          sources: [SRC.datasfZoning, SRC.govChapter13, SRC.sfPlanningAdu],
        };
      case "warning":
        return {
          text: `On this California lot (zoning ${zone}), the pilot check found a possible residential ADU path with warnings (for example fire, historic, or coastal overlays). Extra objective standards or Coastal Act review may apply — resolve those before treating the lot as ready for a dwelling-use tiny home.`,
          sources: [
            SRC.datasfZoning,
            SRC.govChapter13,
            SRC.hcdFactSheets2026,
            SRC.sfPim,
          ],
        };
      case "restricted":
        return {
          text: `On this California lot (zoning ${zone}), the pilot check did not find a clear ministerial path for both ADU and SB 9 residential programs. A commercial-only district, for example, does not carry statewide ADU rights — and a jewelry shop or other retail use in a tiny house would still need a zone that allows that commercial use.`,
          sources: [SRC.datasfZoning, SRC.gov66314, SRC.hcdTinyHomesIb],
        };
      default: {
        const _exhaustive: never = report.overall;
        return _exhaustive;
      }
    }
  }

  return {
    text: "Lot-level zoning coverage in this tool is a California pilot (DataSF-backed for covered lots). Statewide ADU and tiny-home classification rules still apply, but confirm this address with your city or county planning department before buying or placing a unit.",
    sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb, SRC.govChapter13],
  };
}

export type ComposeBriefingInput = {
  geocode: GeocodeResult;
  report: ZoningReport | null;
  /** Present when /api/zoning failed (e.g. outside SF). */
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
  // statewide-context claim when report is null (avoids dumping raw API text).
  void input.zoningError;
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const profile = getStateProfile(geocode.region);
  const isCalifornia = profile.code === "CA" && profile.published;
  const sfPlace = isSanFranciscoPlace(geocode.place);
  const analysisScope =
    report !== null
      ? ("sf_pilot_lot" as const)
      : ("statewide_context_only" as const);

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
            text: "Do not skip the land-use and building permit process. Unpermitted placement can lead to fines and code enforcement. For site-specific advice, consult local Planning / Building (SF Planning and DBI remain linked sources for covered pilot lots) or a California-licensed land-use attorney.",
            sources: [SRC.sfPlanning, SRC.sfDbi, SRC.hcdAdu],
          },
        ]
      : [unpublishedSummary];

  const checklist =
    isCalifornia && profile.published
      ? sfPlace || report
        ? profile.sfChecklist
        : profile.caChecklist
      : [];

  const outline = isCalifornia && profile.published ? profile.outline : [];

  const guideLinks: GuideLinkRef[] =
    isCalifornia && profile.published
      ? GUIDE_LINKS.map((link) => ({
          slug: link.slug,
          title: link.title,
          href: link.href,
        }))
      : [];

  const sourcesUsed =
    analysisScope === "sf_pilot_lot"
      ? sfPilotReceiptSources()
      : caStatewideReceiptSources();

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
    checklist,
    outline,
    guideLinks,
    receipt,
  };
}
