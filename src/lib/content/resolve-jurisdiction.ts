/**
 * Resolve COUNTY_GUIDES / nested cities from geocoded place + county.
 * Zero React. Matching is normalized — "San Francisco County" ≡ "San Francisco";
 * "South San Francisco" does not match San Francisco.
 */

import {
  COUNTY_GUIDES,
  type JurisdictionNote,
  type JurisdictionRequirementSeed,
} from "@/lib/content/ca-tiny-home-regulations";

export type ResolvedJurisdiction = {
  county: JurisdictionNote | null;
  city: JurisdictionNote | null;
  countyLabel: string;
  cityLabel: string | null;
};

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

function formatCountyLabel(county: string, place: string): string {
  const raw = county.trim() || place.trim();
  if (!raw) return "California";
  if (/\bcounty\b/i.test(raw)) return raw;
  // Consolidated city-county (San Francisco) keeps the place name without "County".
  if (normalizeJurisdictionName(raw) === "san francisco") {
    return "San Francisco";
  }
  return `${raw} County`;
}

/**
 * Match place + county against COUNTY_GUIDES and nested cities[].
 * City match under a county wins over bare place≈county name collisions.
 */
export function resolveJurisdictionGuide(
  place: string,
  county: string,
): ResolvedJurisdiction {
  const placeNorm = normalizeJurisdictionName(place);
  const countyNorm = normalizeJurisdictionName(county);

  let matchedCounty: JurisdictionNote | null = null;
  let matchedCity: JurisdictionNote | null = null;

  // Prefer city-under-county when place matches a nested city (Oakland → Alameda).
  if (placeNorm) {
    for (const guide of COUNTY_GUIDES) {
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
        COUNTY_GUIDES.find(
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
      : formatCountyLabel(county, place),
    cityLabel: matchedCity?.name ?? null,
  };
}
