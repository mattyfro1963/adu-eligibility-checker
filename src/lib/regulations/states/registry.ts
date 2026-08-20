/**
 * Fifty-state registry. Only California is published in this pass;
 * other states return { published: false } so we never invent ordinances.
 */

import { CA_PROFILE } from "@/lib/regulations/states/ca";
import type { StateProfile } from "@/lib/regulations/types";

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

function unpublished(
  code: string,
): Extract<StateProfile, { published: false }> {
  return {
    published: false,
    code,
    name: US_STATE_NAMES[code] ?? code,
  };
}

const REGISTRY: Record<string, StateProfile> = Object.fromEntries(
  Object.keys(US_STATE_NAMES).map((code) => [
    code,
    code === "CA" ? CA_PROFILE : unpublished(code),
  ]),
);

/** Normalize Mapbox region text to a USPS code when possible. */
export function normalizeRegionCode(region: string): string {
  const trimmed = region.trim();
  if (!trimmed) return "";
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && US_STATE_NAMES[upper]) {
    return upper;
  }
  const match = Object.entries(US_STATE_NAMES).find(
    ([, name]) => name.toUpperCase() === upper,
  );
  return match?.[0] ?? upper;
}

export function getStateProfile(region: string): StateProfile {
  const code = normalizeRegionCode(region);
  return REGISTRY[code] ?? unpublished(code || "??");
}

export function listStateCodes(): string[] {
  return Object.keys(US_STATE_NAMES);
}
