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
  /** Lot area in square feet when resolved from GIS or mock facts. */
  lotSizeSqFt?: number | null;
  /** SF assessor block/lot when resolved from a local parcel index. */
  mapblklot?: string | null;
  /** Vendor district title when GIS provides one. */
  zoningDistrictName?: string | null;
  /** Official district / ordinance URL from the GIS feature, when present. */
  zoningSourceUrl?: string | null;
}

export interface UnitCapacity {
  maxAllowableUnits: number;
  note: CitedClaim;
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
  /** Derived unit-capacity bounds when lot size is known. */
  unitCapacity?: UnitCapacity | null;
  /** Lot area when known at evaluation time. */
  lotSizeSqFt?: number | null;
  zoningDistrictName?: string | null;
  zoningSourceUrl?: string | null;
}
