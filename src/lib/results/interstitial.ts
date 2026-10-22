export const INTERSTITIAL_HOLD_COPY = "Lot reading almost ready";

/**
 * Steps may tick to the last label before `/api/zoning` returns.
 * Hold incomplete until a report exists so the last tick is not a false “done.”
 */
export function interstitialHoldsIncomplete(reportReady: boolean): boolean {
  return !reportReady;
}

export function interstitialStepState(
  index: number,
  activeIndex: number,
  reportReady: boolean,
): "pending" | "active" | "done" {
  if (reportReady && index < activeIndex) return "done";
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}
