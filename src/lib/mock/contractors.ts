import type { Contractor } from "@/lib/types/leads";

/**
 * Mock Bay Area ADU / tiny-home builders for `/connect` matching.
 * Distances are computed at request time from the searched address — not canned.
 */
export const mockContractors: Contractor[] = [
  {
    id: "bay-area-tiny-homes",
    name: "Bay Area Tiny Homes",
    specialties: ["thow", "tiny_home"],
    serviceCities: ["San Francisco", "Oakland", "Berkeley"],
    lat: 37.8044,
    lng: -122.2712,
    blurb:
      "Factory-built tiny homes and THOW packages with Bay Area delivery and site setup.",
    website: "https://example.com/bay-area-tiny-homes",
  },
  {
    id: "pacific-adu-builders",
    name: "Pacific ADU Builders",
    specialties: ["permanent_adu"],
    serviceCities: ["San Francisco", "Daly City", "South San Francisco"],
    lat: 37.6879,
    lng: -122.4702,
    blurb:
      "Permanent ADU design-build for SF peninsula lots — foundation, utility, and permit coordination.",
    website: "https://example.com/pacific-adu-builders",
  },
  {
    id: "golden-gate-adu",
    name: "Golden Gate ADU Co.",
    specialties: ["permanent_adu", "tiny_home"],
    serviceCities: ["San Francisco", "Marin", "San Mateo"],
    lat: 37.7749,
    lng: -122.4194,
    blurb:
      "San Francisco–focused ADU remodels and detached backyard units with historic-district experience.",
  },
  {
    id: "east-bay-modular",
    name: "East Bay Modular Living",
    specialties: ["permanent_adu", "thow", "tiny_home"],
    serviceCities: ["Oakland", "Berkeley", "Alameda", "Hayward"],
    lat: 37.8044,
    lng: -122.2711,
    blurb:
      "Modular ADUs and park-model tiny homes for East Bay lots with flat-pack install crews.",
  },
  {
    id: "peninsula-backyard",
    name: "Peninsula Backyard Homes",
    specialties: ["permanent_adu"],
    serviceCities: ["Palo Alto", "Redwood City", "San Mateo", "Menlo Park"],
    lat: 37.4419,
    lng: -122.143,
    blurb:
      "Turnkey detached ADUs on the Peninsula — site survey through final inspection handoff.",
  },
  {
    id: "north-bay-tiny",
    name: "North Bay Tiny Works",
    specialties: ["thow", "tiny_home"],
    serviceCities: ["San Rafael", "Petaluma", "Napa", "Santa Rosa"],
    lat: 37.9735,
    lng: -122.5311,
    blurb: "Custom THOW builds and moveable tiny homes for North Bay counties.",
  },
  {
    id: "south-bay-adu-lab",
    name: "South Bay ADU Lab",
    specialties: ["permanent_adu", "tiny_home"],
    serviceCities: ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View"],
    lat: 37.3382,
    lng: -121.8863,
    blurb:
      "High-efficiency permanent ADUs and prefab shells for Silicon Valley parcels.",
  },
  {
    id: "mission-district-builders",
    name: "Mission District Builders",
    specialties: ["permanent_adu"],
    serviceCities: ["San Francisco"],
    lat: 37.7599,
    lng: -122.4148,
    blurb: "In-law units and garage conversions in dense SF neighborhoods.",
  },
  {
    id: "coastal-cabin-co",
    name: "Coastal Cabin Co.",
    specialties: ["thow", "tiny_home"],
    serviceCities: ["Half Moon Bay", "Pacifica", "Santa Cruz"],
    lat: 37.4636,
    lng: -122.4286,
    blurb:
      "Coast-ready THOW and cabin-style tiny homes with wind and moisture detailing.",
  },
  {
    id: "tri-valley-adu",
    name: "Tri-Valley ADU Partners",
    specialties: ["permanent_adu"],
    serviceCities: ["Pleasanton", "Livermore", "Dublin", "San Ramon"],
    lat: 37.6624,
    lng: -121.8747,
    blurb:
      "Suburban ADU specialists for Tri-Valley lots — garage conversions and new detached units.",
  },
];
