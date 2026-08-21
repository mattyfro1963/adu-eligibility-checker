/**
 * Jurisdiction-aware eligibility when lot GIS is unavailable.
 * Uses pre-authored COUNTY_GUIDES corpus — never invents statute text.
 */

import {
  requirementsFromJurisdictionNote,
  resolveJurisdictionGuide,
  type ResolvedJurisdiction,
} from "@/lib/content/resolve-jurisdiction";
import type { JurisdictionNote } from "@/lib/content/ca-tiny-home-regulations";
import { computeOverall } from "@/lib/rules/compute-overall";
import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim, SourceRef } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";
import type {
  EligibilityResult,
  EligibilityStatus,
  ZoningReport,
} from "@/lib/types/zoning";

const BASE_ADU_SOURCES = [
  SRC.govChapter13,
  SRC.hcdAdu,
  SRC.hcdTinyHomesIb,
] as const;
const BASE_SB9_SOURCES = [SRC.gov65852_21, SRC.hcdSb9] as const;

const EMPTY_OVERLAYS = {
  tinyHomeFriendly: false,
  fireHazard: false,
  vhfhsz: false,
  historicDistrict: false,
  coastalZone: false,
} as const;

export type JurisdictionContextInput = Pick<
  GeocodeResult,
  | "addressId"
  | "formattedAddress"
  | "place"
  | "county"
  | "region"
  | "lat"
  | "lng"
>;

function noteSources(note: JurisdictionNote): SourceRef[] {
  return note.links.map((link) => ({ label: link.label, href: link.href }));
}

function collectNoteText(note: JurisdictionNote): string {
  const parts = [note.summary, note.parkModel ?? ""];
  for (const seed of requirementsFromJurisdictionNote(note)) {
    parts.push(seed.tinyHomeExplanation);
  }
  return parts.join(" ").toLowerCase();
}

/**
 * Infer ADU posture from authored jurisdiction notes when lot zoning is unknown.
 * City notes take precedence over county when both match.
 */
export function inferAduPostureFromNote(
  note: JurisdictionNote | null,
): EligibilityStatus {
  if (!note) return "warning";

  const text = collectNoteText(note);

  if (
    /\b(not permitted|prohibited entirely|ban tiny|does not allow tiny homes)\b/.test(
      text,
    )
  ) {
    return "restricted";
  }

  if (
    /\b(not allowed as permanent|prohibit thow|prohibits thow|ban thow)\b/.test(
      text,
    ) ||
    /\b(thow|wheels|park model|park-model).{0,48}(not allowed|prohibit|ban)\b/.test(
      text,
    )
  ) {
    return "warning";
  }

  if (
    /\b(allows|allowed|favorable|welcomed|permitted under|expressly|workable)\b/.test(
      text,
    )
  ) {
    return "eligible";
  }

  if (
    /\b(confirm|unclear|verify|not always explicit|case-by-case|typically need|limited to)\b/.test(
      text,
    )
  ) {
    return "warning";
  }

  return "warning";
}

function jurisdictionLabel(resolved: ResolvedJurisdiction): string {
  return resolved.cityLabel ?? resolved.countyLabel;
}

function buildAduResult(
  resolved: ResolvedJurisdiction,
  note: JurisdictionNote | null,
  status: EligibilityStatus,
): EligibilityResult {
  const reasons: CitedClaim[] = [];
  const label = jurisdictionLabel(resolved);

  if (note) {
    const seeds = requirementsFromJurisdictionNote(note);
    const explanation = seeds[0]?.tinyHomeExplanation ?? note.summary;
    const sources = noteSources(note);
    reasons.push({
      text: `${label}: ${explanation}`,
      sources: sources.length > 0 ? sources : [...BASE_ADU_SOURCES],
    });
    const parkModel = note.parkModel?.trim();
    if (parkModel && seeds[0]?.tinyHomeExplanation !== parkModel) {
      reasons.push({
        text: `${label} park model / THOW: ${parkModel}`,
        sources: sources.length > 0 ? sources : [...BASE_ADU_SOURCES],
      });
    }
  } else {
    reasons.push({
      text: `${resolved.countyLabel}: This checker does not yet have structured local guidance. Statewide ADU and tiny-home classification rules still apply — confirm THOW / park-model / ADU pathways with local planning staff before you buy or place a unit.`,
      sources: [...BASE_ADU_SOURCES],
    });
  }

  reasons.push({
    text: "Lot-level zoning was not verified for this coordinate. This ADU posture reflects published county/city tiny-home guidance plus the statewide Gov. Code Chapter 13 floor — confirm residential zoning and local development standards with Planning/Building before placing or occupying a unit.",
    sources: [...BASE_ADU_SOURCES],
  });

  return { status, reasons };
}

function buildSb9Result(): EligibilityResult {
  return {
    status: "warning",
    reasons: [
      {
        text: "Lot-level zoning was not verified. Gov. Code § 65852.21 SB 9 rights apply only to lots zoned for single-family dwellings — confirm base district and overlay exclusions (historic district, very high fire hazard) before assuming a lot-split or duplex path.",
        sources: [...BASE_SB9_SOURCES],
      },
    ],
  };
}

/**
 * Produce a ZoningReport from geocode jurisdiction context when no lot GIS provider matched.
 */
export function evaluateJurisdictionContext(
  input: JurisdictionContextInput,
): ZoningReport {
  const resolved = resolveJurisdictionGuide(input.place, input.county);
  const primaryNote = resolved.city ?? resolved.county;
  const aduStatus = inferAduPostureFromNote(primaryNote);
  const adu = buildAduResult(resolved, primaryNote, aduStatus);
  const sb9 = buildSb9Result();

  return {
    addressId: input.addressId,
    formattedAddress: input.formattedAddress,
    zoning: "Not verified",
    overlays: { ...EMPTY_OVERLAYS },
    adu,
    sb9,
    overall: computeOverall(adu.status, sb9.status),
    analysisScope: "jurisdiction_context",
  };
}
