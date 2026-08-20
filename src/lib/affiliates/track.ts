/**
 * Pure outbound affiliate URL builder — appends UTM + per-search sid / ref slots.
 * Zero React.
 */

import type {
  AffiliateIntent,
  AffiliatePartner,
} from "@/lib/content/affiliates";

export type BuildAffiliateHrefOptions = {
  /** Minted on successful zoning search; omit for static directory browse. */
  searchId?: string;
  intent: AffiliateIntent;
};

/**
 * Appends tracking query params to a partner public URL.
 * `ref` is set only when `trackingId` is non-empty.
 */
export function buildAffiliateHref(
  partner: Pick<AffiliatePartner, "publicUrl" | "trackingId">,
  { searchId, intent }: BuildAffiliateHrefOptions,
): string {
  const url = new URL(partner.publicUrl);
  url.searchParams.set("utm_source", "doihave.space");
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", intent);
  if (searchId) {
    url.searchParams.set("sid", searchId);
  }
  if (partner.trackingId !== "") {
    url.searchParams.set("ref", partner.trackingId);
  }
  return url.toString();
}
