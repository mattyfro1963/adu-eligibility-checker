import type { Parcel } from "@/lib/types/zoning";

export type AddressHintFlags = {
  isHistoric: boolean;
  isCommercial: boolean;
  isCoastal: boolean;
  isFire: boolean;
  isSmallLot: boolean;
  isError: boolean;
};

const DEFAULT_LOT_SQFT = 6850;
const SMALL_LOT_SQFT = 950;

/** Adapter-only keyword hints — never used inside lib/rules. */
export function parseAddressHints(query: string): AddressHintFlags {
  const normalized = query.trim().toLowerCase();
  return {
    isHistoric: normalized.includes("historic"),
    isCommercial: normalized.includes("commercial"),
    isCoastal: normalized.includes("coastal") || normalized.includes("canyon"),
    isFire:
      normalized.includes("fire") ||
      normalized.includes("canyon") ||
      normalized.includes("pine"),
    isSmallLot: normalized.includes("small"),
    isError: normalized.includes("error"),
  };
}

export function synthesizeParcelFromHints(
  query: string,
  base: Pick<Parcel, "lat" | "lng">,
): Parcel {
  const hints = parseAddressHints(query);
  const addressId = `hint-${base.lat.toFixed(4)}-${base.lng.toFixed(4)}`;

  return {
    addressId,
    formattedAddress: query.trim(),
    lat: base.lat,
    lng: base.lng,
    zoning: hints.isCommercial ? "C-2" : "R-1",
    lotSizeSqFt: hints.isSmallLot ? SMALL_LOT_SQFT : DEFAULT_LOT_SQFT,
    overlays: {
      tinyHomeFriendly: false,
      fireHazard: hints.isFire,
      vhfhsz: hints.isFire,
      historicDistrict: hints.isHistoric,
      coastalZone: hints.isCoastal,
    },
  };
}

export function isAddressHintError(query: string): boolean {
  return parseAddressHints(query).isError;
}
