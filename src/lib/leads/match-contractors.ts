import { mockContractors } from "@/lib/mock/contractors";
import type {
  Contractor,
  ContractorMatch,
  ContractorSpecialty,
  StructureChoice,
} from "@/lib/types/leads";

const EARTH_RADIUS_MILES = 3958.8;

/** Great-circle distance in miles (haversine). */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

function specialtiesForStructure(
  structure: StructureChoice,
): ContractorSpecialty[] {
  if (structure === "thow") {
    return ["thow", "tiny_home"];
  }
  return ["permanent_adu", "tiny_home"];
}

function matchesStructure(
  contractor: Contractor,
  structure: StructureChoice,
): boolean {
  const needed = specialtiesForStructure(structure);
  return contractor.specialties.some((s) => needed.includes(s));
}

export interface MatchContractorsOptions {
  lat: number;
  lng: number;
  structure: StructureChoice;
  /** Default 3. */
  limit?: number;
  /** Override directory (tests). */
  contractors?: Contractor[];
}

/**
 * Filter by structure specialty, sort by distance, return top N matches.
 */
export function matchContractors(
  options: MatchContractorsOptions,
): ContractorMatch[] {
  const {
    lat,
    lng,
    structure,
    limit = 3,
    contractors = mockContractors,
  } = options;

  const scored: ContractorMatch[] = contractors
    .filter((c) => matchesStructure(c, structure))
    .map((c) => ({
      ...c,
      distanceMiles:
        Math.round(haversineMiles(lat, lng, c.lat, c.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return scored.slice(0, limit);
}
