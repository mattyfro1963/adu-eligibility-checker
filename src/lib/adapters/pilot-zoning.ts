/**
 * Re-export SF DataSF zoning under the legacy pilot module path.
 * New code should import from `sf-datasf-zoning.ts`.
 */

export {
  buildPilotParcel,
  buildSfDatasfParcel,
  getPilotParcel,
  getSfDatasfParcel,
  lookupSfDatasfZoning,
  lookupZoning,
  lookupZoningInCollection,
} from "@/lib/adapters/sf-datasf-zoning";
