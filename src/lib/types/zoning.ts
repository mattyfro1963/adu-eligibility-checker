export type EligibilityStatus = "eligible" | "warning" | "restricted";

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
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
}

export interface ZoningReport {
  addressId: string;
  formattedAddress: string;
  zoning: string;
  adu: EligibilityResult;
  sb9: EligibilityResult;
  overall: EligibilityStatus;
}
