import type { GeocodeResult } from "@/lib/types/gis";

function regionCode(region: string): string {
  const trimmed = region.trim();
  if (/^california$/i.test(trimmed)) return "CA";
  return trimmed;
}

/**
 * Compact parcel heading: street, city, ST ZIP — no country suffix.
 * Uses geocode parts when present; otherwise strips Mapbox `place_name` noise.
 */
export function formatParcelAddress(
  geocode: Pick<
    GeocodeResult,
    "streetLine" | "place" | "region" | "postcode" | "formattedAddress"
  >,
): string {
  const street = geocode.streetLine.trim();
  const place = geocode.place.trim();
  const region = regionCode(geocode.region);
  const postcode = geocode.postcode.trim();
  const regionZip = [region, postcode].filter(Boolean).join(" ");
  const locality = [place, regionZip].filter(Boolean).join(", ");
  if (street && locality) return `${street}, ${locality}`;
  if (street) return street;
  return geocode.formattedAddress
    .replace(/,\s*United States\s*$/i, "")
    .replace(/,\s*California\b/i, ", CA");
}

/**
 * GIS `districtna` values are often ALL CAPS. Title-case for headings
 * without mutating the published district code (`RH-1`, `C-3-O`).
 */
export function formatZoningDistrictName(name: string): string {
  return name
    .trim()
    .replace(/[-–]/g, " ")
    .toLowerCase()
    .replace(/\b([a-z])/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ");
}
