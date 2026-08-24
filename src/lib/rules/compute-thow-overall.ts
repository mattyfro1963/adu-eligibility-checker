import type { EligibilityStatus } from "@/lib/types/zoning";
import type { ThowDimensions } from "@/lib/types/zoning";

/**
 * THOW overall from the four lot-candidacy dimensions only.
 * ADU pathway status must never alone set overall.
 *
 * any dimension restricted → Red; else any warning → Yellow; else Green.
 */
export function computeThowOverall(dimensions: ThowDimensions): EligibilityStatus {
  const statuses: EligibilityStatus[] = [
    dimensions.placement.status,
    dimensions.certification.status,
    dimensions.transport.status,
    dimensions.lotReadiness.status,
  ];

  if (statuses.some((s) => s === "restricted")) {
    return "restricted";
  }
  if (statuses.some((s) => s === "warning")) {
    return "warning";
  }
  return "eligible";
}
