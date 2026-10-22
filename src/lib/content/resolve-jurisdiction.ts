/**
 * Resolve COUNTY_GUIDES / nested cities from geocoded place + county.
 * Zero React. Matching is normalized — "San Francisco County" ≡ "San Francisco";
 * "South San Francisco" does not match San Francisco.
 * Region selects CA / OR / WA corpus (default CA for legacy callers).
 */

import { COUNTY_GUIDES as CA_COUNTY_GUIDES } from "@/lib/content/ca-tiny-home-regulations";
import { COUNTY_GUIDES as OR_COUNTY_GUIDES } from "@/lib/content/or-tiny-home-regulations";
import { COUNTY_GUIDES as WA_COUNTY_GUIDES } from "@/lib/content/wa-tiny-home-regulations";
import type {
  JurisdictionNote,
  JurisdictionRequirementSeed,
} from "@/lib/content/state-tiny-home-guide-types";
import { normalizeRegionCode } from "@/lib/regulations/states/registry";

export type { JurisdictionNote, JurisdictionRequirementSeed };

export type ResolvedJurisdiction = {
  county: JurisdictionNote | null;
  city: JurisdictionNote | null;
  countyLabel: string;
  cityLabel: string | null;
};

export type GuideRegion = "CA" | "OR" | "WA";

function countyGuidesForRegion(region?: string | null): JurisdictionNote[] {
  const code = normalizeRegionCode(region ?? "CA");
  if (code === "OR") return OR_COUNTY_GUIDES;
  if (code === "WA") return WA_COUNTY_GUIDES;
  return CA_COUNTY_GUIDES;
}

function defaultStateLabel(region: GuideRegion): string {
  if (region === "OR") return "Oregon";
  if (region === "WA") return "Washington";
  return "California";
}

function toGuideRegion(region?: string | null): GuideRegion {
  const code = normalizeRegionCode(region ?? "CA");
  if (code === "OR" || code === "WA") return code;
  return "CA";
}

/** Strip common jurisdiction prefixes/suffixes for equality checks. */
export function normalizeJurisdictionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^city and county of\s+/i, "")
    .replace(/^city of\s+/i, "")
    .replace(/^county of\s+/i, "")
    .replace(/\s+county$/i, "")
    .replace(/\s+/g, " ");
}

/**
 * Build structured requirement seeds from a guide note.
 * Prefers explicit `requirements`; otherwise seeds from summary / parkModel.
 */
export function requirementsFromJurisdictionNote(
  note: JurisdictionNote,
): JurisdictionRequirementSeed[] {
  if (note.requirements && note.requirements.length > 0) {
    return note.requirements;
  }

  const slug = normalizeJurisdictionName(note.name).replace(/\s+/g, "-");
  const seeds: JurisdictionRequirementSeed[] = [
    {
      id: `${slug}-local-stance`,
      title: `${note.name} tiny-home stance`,
      tinyHomeExplanation: note.summary,
    },
  ];
  if (note.parkModel?.trim()) {
    seeds.push({
      id: `${slug}-park-model`,
      title: `${note.name} park model / THOW`,
      tinyHomeExplanation: note.parkModel,
    });
  }
  return seeds;
}

function formatCountyLabel(
  county: string,
  place: string,
  region: GuideRegion,
): string {
  const raw = county.trim() || place.trim();
  if (!raw) return defaultStateLabel(region);
  if (/\bcounty\b/i.test(raw)) return raw;
  // Consolidated city-county (San Francisco) keeps the place name without "County".
  if (normalizeJurisdictionName(raw) === "san francisco") {
    return "San Francisco";
  }
  return `${raw} County`;
}

/** City of San Francisco only — not South San Francisco or other substrings. */
export function isSanFranciscoPlace(place: string): boolean {
  const p = place.trim().toLowerCase();
  return p === "san francisco" || p === "city and county of san francisco";
}

/**
 * Match place + county against the region's COUNTY_GUIDES and nested cities[].
 * City match under a county wins over bare place≈county name collisions.
 * @param region USPS region — selects CA / OR / WA guides (default CA).
 */
export function resolveJurisdictionGuide(
  place: string,
  county: string,
  region?: string | null,
): ResolvedJurisdiction {
  const guideRegion = toGuideRegion(region);
  const guides = countyGuidesForRegion(guideRegion);
  const placeNorm = normalizeJurisdictionName(place);
  const countyNorm = normalizeJurisdictionName(county);

  let matchedCounty: JurisdictionNote | null = null;
  let matchedCity: JurisdictionNote | null = null;

  // Prefer city-under-county when place matches a nested city (Oakland → Alameda).
  if (placeNorm) {
    for (const guide of guides) {
      const city = (guide.cities ?? []).find(
        (c) => normalizeJurisdictionName(c.name) === placeNorm,
      );
      if (city) {
        matchedCounty = guide;
        matchedCity = city;
        break;
      }
    }
  }

  // County / consolidated city-county match (e.g. San Francisco, rural counties).
  if (!matchedCounty) {
    const needle = countyNorm || placeNorm;
    if (needle) {
      matchedCounty =
        guides.find(
          (guide) => normalizeJurisdictionName(guide.name) === needle,
        ) ?? null;
    }
  }

  // If county string matched but place is a nested city, attach city notes.
  if (matchedCounty && !matchedCity && placeNorm) {
    matchedCity =
      (matchedCounty.cities ?? []).find(
        (c) => normalizeJurisdictionName(c.name) === placeNorm,
      ) ?? null;
  }

  return {
    county: matchedCounty,
    city: matchedCity,
    countyLabel: matchedCounty
      ? matchedCounty.name
      : formatCountyLabel(county, place, guideRegion),
    cityLabel: matchedCity?.name ?? null,
  };
}
