/**
 * Sample-chip catalog — query strings and place labels only.
 * Clicks run the same `/api/geocode` path as a typed search. No mock parcels.
 * `tone` is a chip color hint only; the live engine still decides the report.
 */

export type SampleReportTone = "tiny_home" | "restricted";

export type SampleReport = {
  id: string;
  label: string;
  /** Geocode query — must not match mock catalog streets (see mock-geocoder). */
  query: string;
  /** Optional chip tint: tiny-home-friendly jurisdictions vs restricted lots. */
  tone?: SampleReportTone;
};

/** Neighborhood / street shortcuts. Outcomes come from live geocode + zoning. */
export const SAMPLE_REPORTS: readonly SampleReport[] = [
  {
    id: "oakland-piedmont",
    label: "Oakland",
    query: "3800 Piedmont Avenue, Oakland, CA",
    tone: "tiny_home",
  },
  {
    id: "eureka-humboldt",
    label: "Eureka",
    query: "1500 H Street, Eureka, CA",
    tone: "tiny_home",
  },
  {
    id: "auburn-placer",
    label: "Auburn",
    query: "301 Lincoln Way, Auburn, CA",
    tone: "tiny_home",
  },
  {
    id: "santa-ana-oc",
    label: "Santa Ana",
    query: "1234 N Broadway, Santa Ana, CA",
    tone: "tiny_home",
  },
  {
    id: "irvine",
    label: "Irvine",
    query: "1000 Culver Drive, Irvine, CA",
    tone: "tiny_home",
  },
  {
    id: "anaheim",
    label: "Anaheim",
    query: "1234 W Broadway, Anaheim, CA",
    tone: "tiny_home",
  },
  {
    id: "los-angeles",
    label: "Los Angeles",
    query: "1234 N Alvarado Street, Los Angeles, CA",
    tone: "tiny_home",
  },
  {
    id: "long-beach",
    label: "Long Beach",
    query: "1234 E 7th Street, Long Beach, CA",
    tone: "tiny_home",
  },
  {
    id: "san-diego",
    label: "San Diego",
    query: "1234 30th Street, San Diego, CA",
    tone: "tiny_home",
  },
  {
    id: "san-jose",
    label: "San Jose",
    query: "1234 Willow Street, San Jose, CA",
    tone: "tiny_home",
  },
  {
    id: "sacramento",
    label: "Sacramento",
    query: "1234 21st Street, Sacramento, CA",
    tone: "tiny_home",
  },
  {
    id: "fresno",
    label: "Fresno",
    query: "1234 N First Street, Fresno, CA",
    tone: "tiny_home",
  },
  {
    id: "riverside",
    label: "Riverside",
    query: "3900 Main Street, Riverside, CA",
    tone: "tiny_home",
  },
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
    tone: "restricted",
  },
] as const;
