/**
 * Progressive open-data county/city GeoJSON packs under
 * `public/data/zoning/{jurisdiction}.geojson`.
 * Returns null when no pack covers the point (or no packs are installed).
 * Turf PIP only — never fetch remote open data at runtime.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { FeatureCollection } from "geojson";
import { lookupZoningInCollection } from "@/lib/adapters/sf-datasf-zoning";
import { emptyOverlays } from "@/lib/adapters/zoning-overlays";
import { normalizeVendorZoningCode } from "@/lib/adapters/zoning-normalize";
import type { Parcel } from "@/lib/types/zoning";

const OPEN_DATA_ZONING_DIR = path.join(process.cwd(), "public/data/zoning");

let packCache: Map<string, FeatureCollection> | null = null;

async function loadOpenDataPacks(): Promise<Map<string, FeatureCollection>> {
  if (packCache) return packCache;

  const map = new Map<string, FeatureCollection>();
  let entries: string[];
  try {
    entries = await readdir(OPEN_DATA_ZONING_DIR);
  } catch {
    packCache = map;
    return map;
  }

  for (const name of entries) {
    if (!name.endsWith(".geojson")) continue;
    try {
      const raw = await readFile(path.join(OPEN_DATA_ZONING_DIR, name), "utf8");
      const parsed = JSON.parse(raw) as FeatureCollection;
      if (
        parsed.type === "FeatureCollection" &&
        Array.isArray(parsed.features)
      ) {
        map.set(name, parsed);
      }
    } catch {
      // Skip corrupt packs; do not fail the whole lookup.
    }
  }

  packCache = map;
  return map;
}

/** Lookup parcel from optional open-data jurisdiction packs. */
export async function getOpenDataParcel(
  lat: number,
  lng: number,
  formattedAddress = "",
): Promise<Parcel | null> {
  const packs = await loadOpenDataPacks();
  for (const collection of packs.values()) {
    const zoning = lookupZoningInCollection(collection, lat, lng);
    if (zoning) {
      return {
        addressId: `${lat},${lng}`,
        formattedAddress,
        lat,
        lng,
        zoning: normalizeVendorZoningCode(zoning, "open-data"),
        overlays: emptyOverlays(),
        overlaysVerified: false,
        mapblklot: null,
      };
    }
  }
  return null;
}
