import type { EligibilityStatus, ThowDimensions } from "@/lib/types/zoning";
import { isTransportWarningNonBlockingForOverall } from "@/lib/rules/transport";

export type ComputeThowOverallOptions = {
  /** USPS region — required for option (b) transport non-blocking. */
  region?: string | null;
  /** Model width in feet — required for option (b) envelope + WA escort check. */
  widthFt?: number;
};

/**
 * THOW overall from the four lot-candidacy dimensions only.
 * ADU pathway status must never alone set overall.
 *
 * any dimension restricted → Red.
 *
 * Option (b) overall Green: when transport is only a standard oversize /
 * route-review `warning` in a published Cascadia state with width ≤ 11.4 ft,
 * that transport warning does **not** alone block Green — placement,
 * certification, and lot-readiness must still be eligible. WA width > 11 ft
 * (WAC 468-38-100(1)(a) escort trigger) keeps transport warning blocking.
 * Do not invent a Green “no permit needed” transport gate.
 *
 * Else any (blocking) warning → Yellow; else Green.
 */
export function computeThowOverall(
  dimensions: ThowDimensions,
  options: ComputeThowOverallOptions = {},
): EligibilityStatus {
  const statuses: EligibilityStatus[] = [
    dimensions.placement.status,
    dimensions.certification.status,
    dimensions.transport.status,
    dimensions.lotReadiness.status,
  ];

  if (statuses.some((s) => s === "restricted")) {
    return "restricted";
  }

  const widthFt = options.widthFt ?? Number.POSITIVE_INFINITY;
  const transportNonBlocking = isTransportWarningNonBlockingForOverall({
    region: options.region,
    widthFt,
    transportStatus: dimensions.transport.status,
  });

  const blockingWarnings: EligibilityStatus[] = [
    dimensions.placement.status,
    dimensions.certification.status,
    dimensions.lotReadiness.status,
  ];
  if (dimensions.transport.status === "warning" && !transportNonBlocking) {
    blockingWarnings.push(dimensions.transport.status);
  }

  if (blockingWarnings.some((s) => s === "warning")) {
    return "warning";
  }

  return "eligible";
}
