/**
 * Compose jurisdiction-aware location requirements for CA search results.
 * Zero React. Uses REGULATIONS_AGENT corpus + COUNTY_GUIDES — never invents statute text.
 */

import {
  CBC_BASELINE,
  PARK_MODEL_OVERVIEW,
} from "@/lib/content/ca-tiny-home-regulations";
import {
  requirementsFromJurisdictionNote,
  resolveJurisdictionGuide,
} from "@/lib/content/resolve-jurisdiction";
import {
  CA_CHAPTER13_SIZE_CLAIM,
  CA_CRC_SIZE_CLAIM,
  CA_STRUCTURE_PATH_CLAIM,
} from "@/lib/regulations/size-structure";
import { SRC } from "@/lib/regulations/sources";
import type { CitedClaim, SourceRef } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

export type RequirementCategory =
  | "classification"
  | "zoning_use"
  | "building_path"
  | "overlays"
  | "permits"
  | "local_ordinance";

export type RequirementApplies =
  "always" | "likely" | "jurisdiction_specific" | "if_overlay";

export type LocationRequirement = {
  id: string;
  category: RequirementCategory;
  title: string;
  applies: RequirementApplies;
  tinyHomeExplanation: CitedClaim;
  sources: SourceRef[];
  /** "California" | "Alameda County" | "Oakland" */
  jurisdictionLabel: string;
};

export type ComposeLocationRequirementsInput = {
  geocode: GeocodeResult;
  report: ZoningReport | null;
};

function claim(text: string, sources: SourceRef[]): CitedClaim {
  return { text, sources };
}

function statewideFloor(): LocationRequirement[] {
  const cbcSources: SourceRef[] = [SRC.cbscBulletin2601, SRC.hcdTinyHomesIb];
  const aduSources: SourceRef[] = [
    SRC.govChapter13,
    SRC.hcdAdu,
    SRC.hcdFactSheets2026,
  ];
  const classSources: SourceRef[] = [SRC.hcdTinyHomesIb];

  return [
    {
      id: "ca-hcd-classification",
      category: "classification",
      title: "HCD classification (no generic “tiny home” occupancy)",
      applies: "always",
      jurisdictionLabel: "California",
      sources: classSources,
      tinyHomeExplanation: claim(
        "California does not recognize a generic “tiny home” occupancy. A unit must fit an established class such as a CBC/CRC dwelling, factory-built housing, manufactured home, recreational vehicle, park trailer, or commercial modular before local zoning can authorize dwelling use.",
        classSources,
      ),
    },
    {
      id: "ca-chapter13-adu-floor",
      category: "building_path",
      title: "State ADU floor (Gov. Code Chapter 13)",
      applies: "always",
      jurisdictionLabel: "California",
      sources: aduSources,
      tinyHomeExplanation: CA_CHAPTER13_SIZE_CLAIM,
    },
    {
      id: "ca-size-structure",
      category: "building_path",
      title: "Size and structure paths for proposed tiny homes",
      applies: "always",
      jurisdictionLabel: "California",
      sources: [...cbcSources, ...classSources],
      tinyHomeExplanation: claim(
        `${CA_CRC_SIZE_CLAIM.text} ${CA_STRUCTURE_PATH_CLAIM.text}`,
        [...cbcSources, ...classSources],
      ),
    },
    {
      id: "ca-cbc-appendix-aq",
      category: "building_path",
      title: `${CBC_BASELINE.appendix} / CRC habitable-room minima`,
      applies: "always",
      jurisdictionLabel: "California",
      sources: cbcSources,
      tinyHomeExplanation: CA_CRC_SIZE_CLAIM,
    },
    {
      id: "ca-ansi-park-model",
      category: "classification",
      title: "Park model / THOW vs foundation ADU",
      applies: "likely",
      jurisdictionLabel: "California",
      sources: classSources,
      tinyHomeExplanation: claim(
        `${PARK_MODEL_OVERVIEW.body} ${PARK_MODEL_OVERVIEW.ansiNote}`,
        classSources,
      ),
    },
    {
      id: "ca-permits",
      category: "permits",
      title: "Building / planning permits before placement",
      applies: "always",
      jurisdictionLabel: "California",
      sources: [SRC.hcdAdu, SRC.hcdTinyHomesIb],
      tinyHomeExplanation: claim(
        "Building permits, ADU or special-use permits, foundation permits, and sometimes temporary occupancy permits usually apply. Unpermitted placement can trigger code enforcement — contact local Planning/Building before delivery.",
        [SRC.hcdAdu, SRC.hcdTinyHomesIb],
      ),
    },
  ];
}

function jurisdictionRequirements(
  geocode: GeocodeResult,
): LocationRequirement[] {
  const resolved = resolveJurisdictionGuide(geocode.place, geocode.county);
  const out: LocationRequirement[] = [];

  if (resolved.county) {
    const label = resolved.countyLabel;
    const sources: SourceRef[] = resolved.county.links.map((link) => ({
      label: link.label,
      href: link.href,
    }));
    const fallbackSources =
      sources.length > 0 ? sources : [SRC.hcdAdu, SRC.hcdTinyHomesIb];

    for (const seed of requirementsFromJurisdictionNote(resolved.county)) {
      out.push({
        id: `county-${seed.id}`,
        category: "local_ordinance",
        title: seed.title,
        applies: "jurisdiction_specific",
        jurisdictionLabel: label,
        sources: fallbackSources,
        tinyHomeExplanation: claim(seed.tinyHomeExplanation, fallbackSources),
      });
    }
  } else {
    out.push({
      id: "county-fallback",
      category: "local_ordinance",
      title: `${resolved.countyLabel} — confirm local ordinance`,
      applies: "jurisdiction_specific",
      jurisdictionLabel: resolved.countyLabel,
      sources: [SRC.hcdAdu],
      tinyHomeExplanation: claim(
        `This checker does not yet have a structured county note for ${resolved.countyLabel}. Statewide ADU and tiny-home classification rules still apply — confirm THOW / park-model / ADU pathways with the local planning and building departments before you buy or place a unit.`,
        [SRC.hcdAdu, SRC.hcdTinyHomesIb],
      ),
    });
  }

  if (resolved.city) {
    const label = resolved.cityLabel ?? resolved.city.name;
    const sources: SourceRef[] = resolved.city.links.map((link) => ({
      label: link.label,
      href: link.href,
    }));
    const fallbackSources =
      sources.length > 0 ? sources : [SRC.hcdAdu, SRC.hcdTinyHomesIb];

    for (const seed of requirementsFromJurisdictionNote(resolved.city)) {
      out.push({
        id: `city-${seed.id}`,
        category: "local_ordinance",
        title: seed.title,
        applies: "jurisdiction_specific",
        jurisdictionLabel: label,
        sources: fallbackSources,
        tinyHomeExplanation: claim(seed.tinyHomeExplanation, fallbackSources),
      });
    }
  }

  return out;
}

function lotZoningRequirements(
  report: ZoningReport | null,
): LocationRequirement[] {
  if (!report || report.analysisScope === "jurisdiction_context") return [];

  const zoneSources: SourceRef[] = [
    SRC.datasfZoning,
    SRC.govChapter13,
    SRC.hcdAdu,
  ];
  return [
    {
      id: "lot-zoning",
      category: "zoning_use",
      title: `Lot zoning ${report.zoning}`,
      applies: "always",
      jurisdictionLabel: "This lot",
      sources: zoneSources,
      tinyHomeExplanation: claim(
        `Local district ${report.zoning} was resolved for this coordinate. Residential / mixed-use districts are the usual ADU path; commercial-only districts generally do not carry statewide ADU rights for a dwelling-use tiny home.`,
        zoneSources,
      ),
    },
  ];
}

function overlayRequirements(
  report: ZoningReport | null,
): LocationRequirement[] {
  if (!report || report.analysisScope === "jurisdiction_context") return [];
  const { overlays } = report;
  const out: LocationRequirement[] = [];

  if (overlays.fireHazard || overlays.vhfhsz) {
    const sources: SourceRef[] = [SRC.hcdFactSheets2026, SRC.govChapter13];
    out.push({
      id: "overlay-fire",
      category: "overlays",
      title: "Fire hazard / VHFHSZ overlay",
      applies: "if_overlay",
      jurisdictionLabel: "This lot",
      sources,
      tinyHomeExplanation: claim(
        "Fire hazard or very high fire hazard severity zone facts can add objective standards or restrict SB 9 paths. Resolve wildfire mitigation requirements before treating a tiny home as ready for dwelling use.",
        sources,
      ),
    });
  }

  if (overlays.historicDistrict) {
    const sources: SourceRef[] = [SRC.govChapter13, SRC.hcdAdu];
    out.push({
      id: "overlay-historic",
      category: "overlays",
      title: "Historic district overlay",
      applies: "if_overlay",
      jurisdictionLabel: "This lot",
      sources,
      tinyHomeExplanation: claim(
        "Historic district overlays can impose objective design standards for ADUs and may hard-stop SB 9. Confirm local historic review before placing or converting a tiny home.",
        sources,
      ),
    });
  }

  if (overlays.coastalZone) {
    const sources: SourceRef[] = [SRC.hcdFactSheets2026, SRC.govChapter13];
    out.push({
      id: "overlay-coastal",
      category: "overlays",
      title: "Coastal zone overlay",
      applies: "if_overlay",
      jurisdictionLabel: "This lot",
      sources,
      tinyHomeExplanation: claim(
        "Coastal Act / CDP review may apply in addition to ADU ministerial rules. A wheels-on or foundation tiny home still needs coastal compliance where the overlay is present.",
        sources,
      ),
    });
  }

  if (overlays.tinyHomeFriendly) {
    const sources: SourceRef[] = [SRC.hcdTinyHomesIb, SRC.hcdAdu];
    out.push({
      id: "overlay-thow-friendly",
      category: "overlays",
      title: "Tiny-home-friendly overlay note",
      applies: "if_overlay",
      jurisdictionLabel: "This lot",
      sources,
      tinyHomeExplanation: claim(
        "This lot carries a tiny-home-friendly fact in the checker. That does not waive permits or HCD classification — still confirm the ADU or park-model path with local Planning/Building.",
        sources,
      ),
    });
  }

  return out;
}

/**
 * Always emits a non-empty list for California geocodes: statewide floor +
 * county/city notes + lot zoning/overlays when a report exists.
 */
export function composeLocationRequirements(
  input: ComposeLocationRequirementsInput,
): LocationRequirement[] {
  return [
    ...statewideFloor(),
    ...jurisdictionRequirements(input.geocode),
    ...lotZoningRequirements(input.report),
    ...overlayRequirements(input.report),
  ];
}
