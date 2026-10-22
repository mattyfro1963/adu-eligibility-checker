import { describe, expect, it } from "vitest";
import {
  isUnsupportedStateReport,
  shouldShowOverallStatusBadge,
  shouldShowResultsConnectCtas,
} from "@/lib/results/coverage-chrome";
import { evaluateJurisdictionContext } from "@/lib/rules";
import { UNSUPPORTED_STATE_THOW_COPY } from "@/lib/rules/thow-summary";

describe("unsupported-state chrome", () => {
  const report = evaluateJurisdictionContext({
    addressId: "test-tx",
    formattedAddress: "100 Main St, Austin, TX",
    place: "Austin",
    county: "Travis",
    region: "TX",
    lat: 30.27,
    lng: -97.74,
  });

  it("keeps locked coverage copy without rewriting it", () => {
    expect(report.thowSummary.text).toBe(UNSUPPORTED_STATE_THOW_COPY);
    expect(isUnsupportedStateReport(report)).toBe(true);
  });

  it("skips Restricted first-chrome and the compliance CTA", () => {
    expect(shouldShowOverallStatusBadge(report)).toBe(false);
    expect(shouldShowResultsConnectCtas(report)).toBe(false);
  });

  it("does not treat a Cascadia jurisdiction report as unsupported", () => {
    const oakland = evaluateJurisdictionContext({
      addressId: "oakland",
      formattedAddress: "3800 Piedmont Ave, Oakland, CA",
      place: "Oakland",
      county: "Alameda",
      region: "CA",
      lat: 37.82,
      lng: -122.25,
    });
    expect(isUnsupportedStateReport(oakland)).toBe(false);
    expect(shouldShowOverallStatusBadge(oakland)).toBe(true);
    expect(shouldShowResultsConnectCtas(oakland)).toBe(true);
  });
});
