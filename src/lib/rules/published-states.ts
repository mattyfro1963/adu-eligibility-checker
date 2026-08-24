/**
 * Published Cascadia states for THOW lot screening.
 */

import { normalizeRegionCode } from "@/lib/regulations/states/registry";

export const PUBLISHED_THOW_STATES = ["CA", "OR", "WA"] as const;

export type PublishedThowState = (typeof PUBLISHED_THOW_STATES)[number];

export function isPublishedThowState(region: string | null | undefined): boolean {
  const code = normalizeRegionCode(region ?? "");
  return (PUBLISHED_THOW_STATES as readonly string[]).includes(code);
}

export function publishedThowStateCode(
  region: string | null | undefined,
): PublishedThowState | null {
  const code = normalizeRegionCode(region ?? "");
  if ((PUBLISHED_THOW_STATES as readonly string[]).includes(code)) {
    return code as PublishedThowState;
  }
  return null;
}
