import type { EligibilityStatus } from "@/lib/types/zoning";

/**
 * Overall badge: restricted only when both programs are dead ends;
 * warning if either program warns or a single program is restricted;
 * otherwise eligible.
 */
export function computeOverall(
  aduStatus: EligibilityStatus,
  sb9Status: EligibilityStatus,
): EligibilityStatus {
  if (aduStatus === "restricted" && sb9Status === "restricted") {
    return "restricted";
  }
  if (
    aduStatus === "warning" ||
    sb9Status === "warning" ||
    aduStatus === "restricted" ||
    sb9Status === "restricted"
  ) {
    return "warning";
  }
  return "eligible";
}
