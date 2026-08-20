import { describe, expect, it } from "vitest";
import {
  haversineMiles,
  matchContractors,
} from "@/lib/leads/match-contractors";
import type { Contractor } from "@/lib/types/leads";

const SF_LAT = 37.7749;
const SF_LNG = -122.4194;

const fixtures: Contractor[] = [
  {
    id: "near-adu",
    name: "Near ADU",
    specialties: ["permanent_adu"],
    serviceCities: ["San Francisco"],
    lat: 37.78,
    lng: -122.42,
    blurb: "Near ADU",
  },
  {
    id: "far-adu",
    name: "Far ADU",
    specialties: ["permanent_adu"],
    serviceCities: ["San Jose"],
    lat: 37.3382,
    lng: -121.8863,
    blurb: "Far ADU",
  },
  {
    id: "near-thow",
    name: "Near THOW",
    specialties: ["thow"],
    serviceCities: ["Oakland"],
    lat: 37.8,
    lng: -122.27,
    blurb: "Near THOW",
  },
  {
    id: "tiny-only",
    name: "Tiny Only",
    specialties: ["tiny_home"],
    serviceCities: ["Berkeley"],
    lat: 37.87,
    lng: -122.27,
    blurb: "Tiny only",
  },
];

describe("haversineMiles", () => {
  it("returns ~0 for identical points", () => {
    expect(haversineMiles(SF_LAT, SF_LNG, SF_LAT, SF_LNG)).toBeCloseTo(0, 5);
  });

  it("returns a positive distance between SF and Oakland", () => {
    const miles = haversineMiles(SF_LAT, SF_LNG, 37.8044, -122.2712);
    expect(miles).toBeGreaterThan(5);
    expect(miles).toBeLessThan(15);
  });
});

describe("matchContractors", () => {
  it("filters permanent ADU specialties and sorts by distance", () => {
    const matches = matchContractors({
      lat: SF_LAT,
      lng: SF_LNG,
      structure: "permanent_adu",
      contractors: fixtures,
      limit: 3,
    });

    expect(matches.map((m) => m.id)).toEqual([
      "near-adu",
      "tiny-only",
      "far-adu",
    ]);
    expect(matches[0]!.distanceMiles).toBeLessThan(matches[1]!.distanceMiles);
    expect(matches[1]!.distanceMiles).toBeLessThan(matches[2]!.distanceMiles);
    expect(matches.every((m) => m.id !== "near-thow")).toBe(true);
  });

  it("filters THOW / tiny specialties", () => {
    const matches = matchContractors({
      lat: SF_LAT,
      lng: SF_LNG,
      structure: "thow",
      contractors: fixtures,
      limit: 5,
    });

    expect(matches.map((m) => m.id).sort()).toEqual(
      ["near-thow", "tiny-only"].sort(),
    );
    expect(matches.every((m) => m.id !== "near-adu")).toBe(true);
  });

  it("respects limit", () => {
    const matches = matchContractors({
      lat: SF_LAT,
      lng: SF_LNG,
      structure: "permanent_adu",
      contractors: fixtures,
      limit: 1,
    });
    expect(matches).toHaveLength(1);
    expect(matches[0]!.id).toBe("near-adu");
  });
});
