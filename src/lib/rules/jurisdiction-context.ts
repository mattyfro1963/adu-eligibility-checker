/**
 * Jurisdiction-aware THOW lot screening when lot GIS is unavailable.
 * Uses pre-authored COUNTY_GUIDES corpus — never invents statute text.
 * Cascadia (CA/OR/WA); unsupported states return Red overall with locked copy.
 */

import {
  requirementsFromJurisdictionNote,
  resolveJurisdictionGuide,
  type ResolvedJurisdiction,
} from "@/lib/content/resolve-jurisdiction";
import type { JurisdictionNote } from "@/lib/content/ca-tiny-home-regulations";
import { evaluateCertification } from "@/lib/rules/certification";
import { computeThowOverall } from "@/lib/rules/compute-thow-overall";
import { evaluateLotReadiness } from "@/lib/rules/lot-readiness";
import {
  evaluatePlacement,
  inferExpressThowPathFromText,
  inferPlacementBanFromText,
} from "@/lib/rules/placement";
import { isPublishedThowState } from "@/lib/rules/published-states";
import {
  thowSummaryForStatus,
  UNSUPPORTED_STATE_THOW_COPY,
} from "@/lib/rules/thow-summary";
import { evaluateTransport } from "@/lib/rules/transport";
import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim, SourceRef } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";
import type {
  EligibilityResult,
  EligibilityStatus,
  ZoningReport,
} from "@/lib/types/zoning";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";

const BASE_ADU_SOURCES = [
  SRC.govChapter13,
  SRC.hcdAdu,
  SRC.hcdTinyHomesIb,
] as const;
const BASE_SB9_SOURCES = [SRC.gov65852_21, SRC.hcdSb9] as const;
const BASE_THOW_SOURCES = [SRC.hcdTinyHomesIb, SRC.hcdAdu, SRC.noahDwelling] as const;

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
 * Infer ADU pathway posture from authored jurisdiction notes.
 * City notes take precedence over county when both match.
 * Express THOW-as-ADU language can support eligible; generic welcome ≠ ADU green.
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

  // THOW-as-ADU, foundation tiny home, or explicit ADU welcome
  if (
    /\bfoundation tiny homes?\b/.test(text) ||
    /\bas permanent adus?\b/.test(text) ||
    /\b(adu|accessory dwelling).{0,40}(thow|wheels|movable|moveable|park model)\b/.test(
      text,
    ) ||
    /\b(thow|movable tiny|moveable tiny|park model).{0,40}(as an? adu|adu path|adu pathway|as permanent adus?)\b/.test(
      text,
    ) ||
    /\b(allows|allowed|favorable|welcomed|permitted under|expressly|workable).{0,48}adu\b/.test(
      text,
    )
  ) {
    return "eligible";
  }

  if (
    /\b(allows|allowed|favorable|welcomed|permitted under|expressly|workable)\b/.test(
      text,
    )
  ) {
    // Local welcome without ADU-specific path → pathway warning (not auto-green)
    return "warning";
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

/** Placement posture from jurisdiction notes (separate from ADU pathway). */
export function inferPlacementPostureFromNote(
  note: JurisdictionNote | null,
): {
  express: boolean;
  ban: boolean;
  temporaryOnly: boolean;
  utilityBanned: boolean;
} {
  if (!note) {
    return {
      express: false,
      ban: false,
      temporaryOnly: false,
      utilityBanned: false,
    };
  }
  const text = collectNoteText(note);
  return {
    express: inferExpressThowPathFromText(text),
    ban: inferPlacementBanFromText(text),
    temporaryOnly:
      /\b(temporary only|camping only|storage only|seasonal only|no permanent)\b/.test(
        text,
      ),
    utilityBanned:
      /\b(utilities? (cannot|may not|not allowed to) connect|no utility hookup|hookups? prohibited)\b/.test(
        text,
      ),
  };
}

function jurisdictionLabel(resolved: ResolvedJurisdiction): string {
  return resolved.cityLabel ?? resolved.countyLabel;
}

function buildAduPathwayResult(
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
      text: `${label} ADU pathway: ${explanation} Possible if local THOW-as-ADU or foundation conversion — not automatic from state ADU law alone.`,
      sources: sources.length > 0 ? sources : [...BASE_ADU_SOURCES],
    });
    const parkModel = note.parkModel?.trim();
    if (parkModel && seeds[0]?.tinyHomeExplanation !== parkModel) {
      reasons.push({
        text: `${label} park model / THOW notes: ${parkModel}`,
        sources: sources.length > 0 ? sources : [...BASE_ADU_SOURCES],
      });
    }
  } else {
    reasons.push({
      text: `${resolved.countyLabel}: No structured local ADU / THOW-as-ADU guidance in this checker yet. Statewide ADU floors (where applicable) do not automatically authorize wheeled placement — confirm THOW-as-ADU or foundation conversion with local planning staff.`,
      sources: [...BASE_ADU_SOURCES],
    });
  }

  reasons.push({
    text: "Lot-level zoning was not verified. This ADU pathway reflects published county/city guidance plus any statewide ADU floor — never treat it as a THOW placement green light.",
    sources: [...BASE_ADU_SOURCES],
  });

  return { status, reasons };
}

function buildSb9Result(): EligibilityResult {
  return {
    status: "warning",
    reasons: [
      {
        text: "Lot-level zoning was not verified. Gov. Code § 65852.21 SB 9 rights apply only to lots zoned for single-family dwellings in California — confirm base district and overlay exclusions before assuming a lot-split or duplex path. SB 9 is orthogonal to wheeled THOW placement.",
        sources: [...BASE_SB9_SOURCES],
      },
    ],
  };
}

function unsupportedStateReport(input: JurisdictionContextInput): ZoningReport {
  const region = normalizeRegionCode(input.region);
  const restricted: EligibilityResult = {
    status: "restricted",
    reasons: [
      {
        text: UNSUPPORTED_STATE_THOW_COPY,
        sources: [...BASE_THOW_SOURCES],
      },
    ],
  };

  return {
    addressId: input.addressId,
    formattedAddress: input.formattedAddress,
    zoning: "Not verified",
    overlays: { ...EMPTY_OVERLAYS },
    overlaysVerified: false,
    overall: "restricted",
    thowOverall: "restricted",
    thowSummary: {
      text: UNSUPPORTED_STATE_THOW_COPY,
      sources: [...BASE_THOW_SOURCES],
    },
    dimensions: {
      placement: restricted,
      certification: evaluateCertification({}),
      transport: {
        status: "restricted",
        reasons: [
          {
            text: UNSUPPORTED_STATE_THOW_COPY,
            sources: [...BASE_THOW_SOURCES],
          },
        ],
      },
      lotReadiness: restricted,
    },
    adu: {
      status: "warning",
      reasons: [
        {
          text: "ADU pathway screening is not published for this state in this checker. Do not assume California Chapter 13 ADU rules apply here.",
          sources: [...BASE_ADU_SOURCES],
        },
      ],
    },
    sb9: {
      status: "warning",
      reasons: [
        {
          text: "SB 9 is a California statute and does not apply outside California.",
          sources: [...BASE_SB9_SOURCES],
        },
      ],
    },
    analysisScope: "jurisdiction_context",
    coverage: "jurisdiction",
    zoningProvider: null,
    region,
  };
}

/**
 * Produce a ZoningReport from geocode jurisdiction context when no lot GIS matched.
 */
export function evaluateJurisdictionContext(
  input: JurisdictionContextInput,
): ZoningReport {
  if (!isPublishedThowState(input.region)) {
    return unsupportedStateReport(input);
  }

  const region = normalizeRegionCode(input.region) || "CA";
  const resolved = resolveJurisdictionGuide(input.place, input.county);
  const primaryNote = resolved.city ?? resolved.county;
  const placementSignals = inferPlacementPostureFromNote(primaryNote);
  const aduStatus = inferAduPostureFromNote(primaryNote);

  const placement = evaluatePlacement(null, {
    jurisdictionFallback: true,
    jurisdictionExpressPath: placementSignals.express,
    explicitBan: placementSignals.ban,
  });
  const certification = evaluateCertification({});
  const transport = evaluateTransport({ region });
  const lotReadiness = evaluateLotReadiness(null, {
    jurisdictionFallback: true,
    temporaryOnly: placementSignals.temporaryOnly,
    utilityConnectBanned: placementSignals.utilityBanned,
  });

  const dimensions = {
    placement,
    certification,
    transport,
    lotReadiness,
  };
  const thowOverall = computeThowOverall(dimensions);

  const adu = buildAduPathwayResult(resolved, primaryNote, aduStatus);
  const sb9 =
    region === "CA"
      ? buildSb9Result()
      : {
          status: "warning" as const,
          reasons: [
            {
              text: "SB 9 (Gov. Code § 65852.21) is California-only and does not set THOW lot candidacy in Oregon or Washington.",
              sources: [...BASE_SB9_SOURCES],
            },
          ],
        };

  return {
    addressId: input.addressId,
    formattedAddress: input.formattedAddress,
    zoning: "Not verified",
    overlays: { ...EMPTY_OVERLAYS },
    overlaysVerified: false,
    overall: thowOverall,
    thowOverall,
    thowSummary: thowSummaryForStatus(thowOverall),
    dimensions,
    adu,
    sb9,
    analysisScope: "jurisdiction_context",
    coverage: "jurisdiction",
    zoningProvider: null,
    region,
  };
}
