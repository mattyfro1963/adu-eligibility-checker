import { parcelToGeocodeResult } from "@/lib/adapters/mock-geocoder";
import { mockProperties } from "@/lib/mock/properties";
import type { GeocodeResult } from "@/lib/types/gis";

export type SampleReport = {
  id: string;
  label: string;
  description: string;
  /** Pre-built geocode payload — same shape as `/api/geocode` + suggestion select. */
  geocodeResult: GeocodeResult;
};

function sampleFromProperty(id: keyof typeof mockProperties): GeocodeResult {
  const parcel = mockProperties[id];
  if (!parcel) {
    throw new Error(`Missing mock parcel for sample report: ${String(id)}`);
  }
  return parcelToGeocodeResult(parcel);
}

/** Sample-report catalog — real CA addresses with coordinate-driven demo facts. */
export const SAMPLE_REPORTS: readonly SampleReport[] = [
  {
    id: "clean-r1",
    label: "SF R-1 · Inner Sunset",
    description: "eligible residential lot",
    geocodeResult: sampleFromProperty("addr-r1-clean"),
  },
  {
    id: "historic",
    label: "Historic · Pacific Hts",
    description: "historic district overlay",
    geocodeResult: sampleFromProperty("addr-r1-historic"),
  },
  {
    id: "coastal",
    label: "Coastal · Great Hwy",
    description: "coastal zone overlay",
    geocodeResult: sampleFromProperty("addr-r1-coastal"),
  },
  {
    id: "small-lot",
    label: "Small lot · Mission",
    description: "sub-1,200 sq ft lot",
    geocodeResult: sampleFromProperty("addr-r1-small-lot"),
  },
  {
    id: "commercial",
    label: "Commercial · SOMA",
    description: "non-residential zoning",
    geocodeResult: sampleFromProperty("addr-c2"),
  },
] as const;
