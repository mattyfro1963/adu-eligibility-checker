/**
 * Sample-chip catalog — query strings and place labels only.
 * Clicks run the same `/api/geocode` path as a typed search. No mock parcels.
 */

export type SampleReport = {
  id: string;
  label: string;
  /** Geocode query — must not match mock catalog streets (see mock-geocoder). */
  query: string;
};

/** Neighborhood / street shortcuts. Outcomes come from live geocode + zoning. */
export const SAMPLE_REPORTS: readonly SampleReport[] = [
  {
    id: "inner-sunset",
    label: "Inner Sunset",
    query: "1234 9th Avenue, San Francisco, CA",
  },
  {
    id: "pacific-heights",
    label: "Pacific Heights",
    query: "2100 Steiner Street, San Francisco, CA",
  },
  {
    id: "outer-richmond",
    label: "Outer Richmond",
    query: "800 48th Avenue, San Francisco, CA",
  },
  {
    id: "mission",
    label: "Mission",
    query: "2700 24th Street, San Francisco, CA",
  },
  {
    id: "soma",
    label: "SOMA",
    query: "500 3rd Street, San Francisco, CA",
  },
] as const;
