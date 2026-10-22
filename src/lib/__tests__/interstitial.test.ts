import { describe, expect, it } from "vitest";
import {
  INTERSTITIAL_HOLD_COPY,
  interstitialHoldsIncomplete,
  interstitialStepState,
} from "@/lib/results/interstitial";

describe("interstitial hold until report", () => {
  it("stays incomplete until a report exists", () => {
    expect(interstitialHoldsIncomplete(false)).toBe(true);
    expect(interstitialHoldsIncomplete(true)).toBe(false);
  });

  it("keeps the last step active — not done — while holding", () => {
    expect(interstitialStepState(2, 2, false)).toBe("active");
    expect(interstitialStepState(1, 2, false)).toBe("done");
    expect(interstitialStepState(0, 2, false)).toBe("done");
  });

  it("exposes hold copy for the almost-ready state", () => {
    expect(INTERSTITIAL_HOLD_COPY).toMatch(/almost ready/i);
  });
});
