/**
 * Sample-chip catalog — query strings and place labels only.
 * Clicks run the same `/api/geocode` path as a typed search. No mock parcels.
 * `tone` is a chip color hint aligned to a live engine outcome for that query.
 */

export type SampleReportTone = "eligible" | "warning" | "restricted";

export type SampleReport = {
  id: string;
  label: string;
  /** Geocode query — must not match mock catalog streets (see mock-geocoder). */
  query: string;
  tone: SampleReportTone;
};

/**
 * Statewide street shortcuts. Outcomes come from live geocode + zoning:
 * lot GIS where a provider covers the coordinate, otherwise county/city notes.
 * Chip tones are locked to engine output for Census-matched coordinates
 * (see sample-report-summaries.test.ts).
 */
export const SAMPLE_REPORTS: readonly SampleReport[] = [
  {
    id: "parkside",
    label: "Parkside, San Francisco, CA",
    query: "2000 16th Avenue, San Francisco, CA",
    tone: "eligible",
  },
  {
    id: "richmond",
    label: "Richmond District, San Francisco, CA",
    query: "250 32nd Avenue, San Francisco, CA",
    tone: "eligible",
  },
  {
    id: "los-angeles",
    label: "Hancock Park, Los Angeles, CA",
    query: "400 S June Street, Los Angeles, CA",
    tone: "warning",
  },
  {
    id: "long-beach",
    label: "Long Beach, Los Angeles County, CA",
    query: "2100 E 4th Street, Long Beach, CA",
    tone: "warning",
  },
  {
    id: "san-diego",
    label: "North Park, San Diego, CA",
    query: "3010 30th Street, San Diego, CA",
    tone: "warning",
  },
  {
    id: "san-jose",
    label: "Willow Glen, San Jose, CA",
    query: "1170 Lincoln Avenue, San Jose, CA",
    tone: "warning",
  },
  {
    id: "sacramento",
    label: "Midtown, Sacramento, CA",
    query: "1000 21st Street, Sacramento, CA",
    tone: "warning",
  },
  {
    id: "oakland-piedmont",
    label: "Oakland, East Bay, CA",
    query: "3800 Piedmont Avenue, Oakland, CA",
    tone: "warning",
  },
  {
    id: "irvine",
    label: "Irvine, Orange County, CA",
    query: "1 Civic Center Plaza, Irvine, CA",
    tone: "warning",
  },
  {
    id: "downtown",
    label: "Embarcadero, San Francisco, CA",
    query: "1 Market Street, San Francisco, CA 94105",
    tone: "restricted",
  },
  {
    id: "california-street",
    label: "Financial District, San Francisco, CA",
    query: "555 California Street, San Francisco, CA 94104",
    tone: "restricted",
  },
  {
    id: "potrero-pdr",
    label: "Bayview, San Francisco, CA",
    query: "2500 Marin Street, San Francisco, CA",
    tone: "restricted",
  },
] as const;
