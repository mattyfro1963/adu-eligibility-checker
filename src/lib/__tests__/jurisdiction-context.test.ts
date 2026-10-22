import { describe, expect, it } from "vitest";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import {
  evaluateJurisdictionContext,
  inferAduPostureFromNote,
  inferPlacementPostureFromNote,
} from "@/lib/rules/jurisdiction-context";
import { resolveJurisdictionGuide } from "@/lib/content/resolve-jurisdiction";
import { inferExpressThowPathFromText } from "@/lib/rules/placement";
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

const portlandGeocode: GeocodeResult = {
  addressId: "test-portland",
  formattedAddress: "2326 NE Alberta St, Portland, OR 97211",
  streetLine: "2326 NE Alberta St",
  place: "Portland",
  county: "Multnomah",
  region: "OR",
  postcode: "97211",
  lat: 45.559005496793,
  lng: -122.641613614019,
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

describe("inferExpressThowPathFromText", () => {
  it("Oakland vehicular / THOW pathway → express", () => {
    expect(
      inferExpressThowPathFromText(
        "Oakland allows foundation tiny homes and tiny homes on wheels through the city’s vehicular residential / THOW pathway.",
      ),
    ).toBe(true);
  });

  it("Portland occupied RV / THOW → express", () => {
    expect(
      inferExpressThowPathFromText(
        "Portland allows one occupied recreational vehicle / THOW on a developed residential lot under Zoning Code Ch. 33.260.",
      ),
    ).toBe(true);
  });

  it("accepts plurals and tiny house on wheels", () => {
    expect(
      inferExpressThowPathFromText(
        "The county allows park models and THOWs where zoning permits.",
      ),
    ).toBe(true);
    expect(
      inferExpressThowPathFromText(
        "City allows one tiny house on wheels on a developed lot.",
      ),
    ).toBe(true);
  });

  it("Long Beach allows ADUs + distant THOW → not express", () => {
    expect(
      inferExpressThowPathFromText(
        "Long Beach allows code-compliant ADUs under city building and planning standards. Confirm current ADU submittal rules with Long Beach Development Services. THOW permanence is not always the same as a foundation ADU — confirm with Long Beach Building & Safety.",
      ),
    ).toBe(false);
  });

  it("LA movable tiny as ADU copy → not express wheeled path", () => {
    expect(
      inferExpressThowPathFromText(
        "The City of Los Angeles allows ADUs and movable tiny houses as ADUs under LAMC and state ADU law. A city permit is required.",
      ),
    ).toBe(false);
  });

  it("Plumas THOWs not allowed as permanent → not express", () => {
    expect(
      inferExpressThowPathFromText(
        "Allows tiny homes under published county guidance. THOWs are generally not allowed as permanent residences; campground / RV park use may still be viable.",
      ),
    ).toBe(false);
  });
});

describe("resolveJurisdictionGuide region", () => {
  it("Portland OR → Multnomah County + Portland city notes", () => {
    const resolved = resolveJurisdictionGuide("Portland", "Multnomah", "OR");
    expect(resolved.county?.name).toBe("Multnomah County");
    expect(resolved.city?.name).toBe("Portland");
    expect(resolved.city?.summary).toMatch(
      /allows one occupied recreational vehicle/i,
    );
  });
});

describe("evaluateJurisdictionContext", () => {
  it("Oakland without lot GIS → express path; overall Eligible", () => {
    const report = evaluateJurisdictionContext(oaklandGeocode);

    expect(report.analysisScope).toBe("jurisdiction_context");
    expect(report.zoning).toBe("Not verified");
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("warning");
    expect(report.dimensions.placement.status).toBe("eligible");
    expect(report.dimensions.lotReadiness.status).toBe("eligible");
    expect(report.thowOverall).toBe("eligible");
    expect(report.overall).toBe(report.thowOverall);
    expect(report.thowSummary.text).toBe(THOW_SUMMARY_BY_STATUS.eligible.text);
    expect(report.adu.reasons[0]?.text).toMatch(/Oakland/i);
    expect(
      report.adu.reasons.some((r) =>
        /Lot-level zoning was not verified/i.test(r.text),
      ),
    ).toBe(true);
    expectCited(report.adu.reasons);
    expectCited(report.sb9?.reasons ?? []);
  });

  it("Portland without lot GIS → express path; overall Eligible", () => {
    const report = evaluateJurisdictionContext(portlandGeocode);

    expect(report.analysisScope).toBe("jurisdiction_context");
    expect(report.region).toBe("OR");
    expect(report.dimensions.placement.status).toBe("eligible");
    expect(report.dimensions.lotReadiness.status).toBe("eligible");
    expect(report.thowOverall).toBe("eligible");
    expect(report.overall).toBe("eligible");
    expect(report.thowSummary.text).toBe(THOW_SUMMARY_BY_STATUS.eligible.text);
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

  it("Portland placement posture is express THOW path", () => {
    const resolved = resolveJurisdictionGuide("Portland", "Multnomah", "OR");
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
