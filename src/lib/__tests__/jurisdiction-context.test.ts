import { describe, expect, it } from "vitest";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import {
  evaluateJurisdictionContext,
  inferAduPostureFromNote,
  inferPlacementPostureFromNote,
} from "@/lib/rules/jurisdiction-context";
import { resolveJurisdictionGuide } from "@/lib/content/resolve-jurisdiction";
import { THOW_SUMMARY_BY_STATUS } from "@/lib/rules/thow-summary";
import type { CitedClaim } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";

function expectCited(reasons: CitedClaim[]): void {
  expect(reasons.length).toBeGreaterThan(0);
  for (const reason of reasons) {
    expect(reason.text.length).toBeGreaterThan(0);
    expect(reason.sources.length).toBeGreaterThanOrEqual(1);
    for (const source of reason.sources) {
      expect(source.href).toMatch(/^https:\/\//);
    }
  }
}

const oaklandGeocode: GeocodeResult = {
  addressId: "test-oakland",
  formattedAddress: "100 Broadway, Oakland, CA 94607",
  streetLine: "100 Broadway",
  place: "Oakland",
  county: "Alameda",
  region: "CA",
  postcode: "94607",
  lat: 37.8044,
  lng: -122.2712,
};

const humboldtGeocode: GeocodeResult = {
  addressId: "test-humboldt",
  formattedAddress: "123 Main St, Eureka, CA 95501",
  streetLine: "123 Main St",
  place: "Eureka",
  county: "Humboldt County",
  region: "CA",
  postcode: "95501",
  lat: 40.8021,
  lng: -124.1637,
};

describe("evaluateJurisdictionContext", () => {
  it("Oakland without lot GIS → express THOW placement; SB 9 warning; THOW Yellow (transport/cert)", () => {
    const report = evaluateJurisdictionContext(oaklandGeocode);

    expect(report.analysisScope).toBe("jurisdiction_context");
    expect(report.zoning).toBe("Not verified");
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("warning");
    expect(report.dimensions.placement.status).toBe("eligible");
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe(report.thowOverall);
    expect(report.thowSummary.text).toBe(THOW_SUMMARY_BY_STATUS.warning.text);
    expect(report.adu.reasons[0]?.text).toMatch(/Oakland/i);
    expect(
      report.adu.reasons.some((r) =>
        /Lot-level zoning was not verified/i.test(r.text),
      ),
    ).toBe(true);
    expectCited(report.adu.reasons);
    expectCited(report.sb9?.reasons ?? []);
  });

  it("rural Humboldt County → ADU eligible from county guidance; THOW Yellow", () => {
    const report = evaluateJurisdictionContext(humboldtGeocode);

    expect(report.analysisScope).toBe("jurisdiction_context");
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
    expect(
      report.adu.reasons.some((r) => /Humboldt County/i.test(r.text)),
    ).toBe(true);
  });

  it("Plumas THOW limits → ADU warning (not full restriction)", () => {
    const resolved = resolveJurisdictionGuide("", "Plumas County");
    expect(resolved.county).not.toBeNull();
    expect(inferAduPostureFromNote(resolved.county)).toBe("warning");

    const report = evaluateJurisdictionContext({
      addressId: "test-plumas",
      formattedAddress: "1 Main St, Quincy, CA",
      place: "Quincy",
      county: "Plumas County",
      region: "CA",
      lat: 39.94,
      lng: -120.95,
    });
    expect(report.adu.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
  });

  it("unknown county → ADU warning with fallback copy", () => {
    const report = evaluateJurisdictionContext({
      addressId: "test-unknown",
      formattedAddress: "1 Rural Rd, Unknownville, CA",
      place: "Unknownville",
      county: "Unknown County",
      region: "CA",
      lat: 36.5,
      lng: -119.5,
    });

    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
    expect(
      report.adu.reasons.some((r) =>
        /No structured local ADU|does not yet have structured local guidance/i.test(
          r.text,
        ),
      ),
    ).toBe(true);
  });

  it("Oakland placement posture is express THOW path", () => {
    const resolved = resolveJurisdictionGuide("Oakland", "Alameda");
    const posture = inferPlacementPostureFromNote(resolved.city);
    expect(posture.express).toBe(true);
    expect(posture.ban).toBe(false);
  });
});

describe("composeResultsBriefing with jurisdiction-context report", () => {
  it("uses jurisdiction_context scope when report carries analysisScope", () => {
    const report = evaluateJurisdictionContext(oaklandGeocode);
    const briefing = composeResultsBriefing({
      geocode: oaklandGeocode,
      report,
    });

    expect(briefing.receipt.analysisScope).toBe("jurisdiction_context");
    expect(
      briefing.summary.some((c) => /lot zoning was not verified/i.test(c.text)),
    ).toBe(true);
    expect(briefing.requirements.length).toBeGreaterThan(0);
  });
});
