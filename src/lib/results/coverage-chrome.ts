import { isPublishedThowState } from "@/lib/rules/published-states";
import { UNSUPPORTED_STATE_THOW_COPY } from "@/lib/rules/thow-summary";
import type { ZoningReport } from "@/lib/types/zoning";

/**
 * Out-of-Cascadia lots keep locked coverage copy but skip Restricted
 * first-chrome and the compliance CTA (Peak-End).
 */
export function isUnsupportedStateReport(
  report: Pick<ZoningReport, "thowSummary" | "region">,
): boolean {
  if (report.thowSummary.text === UNSUPPORTED_STATE_THOW_COPY) {
    return true;
  }
  return !isPublishedThowState(report.region);
}

/** Peak-End: skip Restricted first-chrome and the compliance CTA. */
export function shouldShowResultsConnectCtas(
  report: Pick<ZoningReport, "thowSummary" | "region"> | null,
): boolean {
  if (!report) return false;
  return !isUnsupportedStateReport(report);
}

export function shouldShowOverallStatusBadge(
  report: Pick<ZoningReport, "thowSummary" | "region"> | null,
): boolean {
  return shouldShowResultsConnectCtas(report);
}
