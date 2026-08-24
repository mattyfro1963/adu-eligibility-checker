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
  /**
   * True when overlay booleans were checked against GIS or authored demo facts.
   * False/omit when the overlay stub (or jurisdiction fallback) left them unchecked —
   * never treat false flags as verified “Clear.”
   */
  overlaysVerified?: boolean;
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

/** THOW lot-candidacy dimensions (primary chrome). ADU is a separate pathway. */
export interface ThowDimensions {
  placement: EligibilityResult;
  certification: EligibilityResult;
  transport: EligibilityResult;
  lotReadiness: EligibilityResult;
}

export interface ZoningReport {
  addressId: string;
  formattedAddress: string;
  zoning: string;
  /** Parcel overlay facts for Target Acquired summary (not eligibility). */
  overlays: Overlays;
  /**
   * Mirrors parcel.overlaysVerified — false when overlay layers were not queried.
   * UI must show Not verified, not Clear, when this is false.
   */
  overlaysVerified?: boolean;
  /**
   * THOW lot candidacy (Green/Yellow/Red). Same value as `thowOverall`.
   * Connect CTAs and map chrome key on this field.
   */
  overall: EligibilityStatus;
  /** Explicit THOW overall — always equal to `overall`. */
  thowOverall: EligibilityStatus;
  /** Canned Green/Yellow/Red summary for THOW lot candidacy. */
  thowSummary: CitedClaim;
  /** Placement, certification, transport, and lot-readiness gates. */
  dimensions: ThowDimensions;
  /**
   * Optional ADU pathway (THOW-as-ADU or foundation/modular conversion).
   * Never alone sets `thowOverall` / `overall`.
   */
  adu: EligibilityResult;
  /**
   * SB 9 remains computed for regulations / “other pathways” but is not
   * primary chrome and does not set THOW overall.
   */
  sb9?: EligibilityResult;
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
  /** Lot GIS provider when analysisScope is lot_zoning (sf-datasf, open-data, regrid). */
  zoningProvider?: string | null;
  /** API coverage envelope: lot GIS vs jurisdiction fallback. */
  coverage?: "lot" | "jurisdiction";
  /** USPS region when known (CA / OR / WA published). */
  region?: string | null;
}
