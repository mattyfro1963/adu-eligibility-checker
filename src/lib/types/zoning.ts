import type { CitedClaim } from "@/lib/regulations/types";

export type EligibilityStatus = "eligible" | "warning" | "restricted";

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: CitedClaim[];
}

export interface Overlays {
  tinyHomeFriendly: boolean;
  fireHazard: boolean;
  vhfhsz: boolean;
  historicDistrict: boolean;
  coastalZone: boolean;
}

/** Parcel facts only — never store Eligible / Warning / Restricted here. */
export interface Parcel {
  addressId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  zoning: string;
  overlays: Overlays;
  /** SF assessor block/lot when resolved from a local parcel index. */
  mapblklot?: string | null;
}

/** How the report was produced — lot GIS vs jurisdiction corpus fallback. */
export type ZoningAnalysisScope = "lot_zoning" | "jurisdiction_context";

export interface ZoningReport {
  addressId: string;
  formattedAddress: string;
  zoning: string;
  /** Parcel overlay facts for Target Acquired summary (not eligibility). */
  overlays: Overlays;
  adu: EligibilityResult;
  sb9: EligibilityResult;
  overall: EligibilityStatus;
  /** SF assessor block/lot when known. */
  mapblklot?: string | null;
  /** Defaults to lot_zoning when omitted (legacy responses). */
  analysisScope?: ZoningAnalysisScope;
}
