import { describe, expect, it } from "vitest";
import { mockProperties } from "@/lib/mock/properties";
import { buildKeyFindings, KEY_FINDING_IDS } from "@/lib/results/key-findings";
import { evaluateEligibility, evaluateJurisdictionContext } from "@/lib/rules";

describe("buildKeyFindings", () => {
  it("returns no findings without a report", () => {
    expect(buildKeyFindings(null)).toEqual([]);
  });

  it("surfaces GIS, dimensions, optional ADU, and SB 9 when fields exist", () => {
    const report = evaluateEligibility(mockProperties["addr-r1-tiny"]!);
    const findings = buildKeyFindings(report);
    expect(findings.map((f) => f.id)).toEqual([...KEY_FINDING_IDS]);
    const byId = Object.fromEntries(findings.map((f) => [f.id, f.text]));

    expect(byId.zoning).toMatch(/District RH-1 from lot GIS/);
    expect(byId.mapblklot).toMatch(/3558001/);
    expect(byId["lot-area"]).toMatch(/6,850 sq ft from GIS/);
    expect(byId["parcel-boundary"]).toMatch(/demo assessor geometry/);
    expect(byId.overlays).toMatch(/checked against mapped layers/);
    expect(byId["unit-capacity"]).toMatch(/up to 4 dwelling units/);
    expect(byId.placement).toMatch(/^Placement Eligible/);
    expect(byId.certification).toMatch(/^Certification Eligible/);
    expect(byId.transport).toMatch(/^Transport Warning/);
    expect(byId["lot-readiness"]).toMatch(/^Lot readiness Eligible/);
    expect(byId.adu).toMatch(/optional — not automatic/);
    expect(byId.sb9).toMatch(/other pathway/);
  });

  it("keeps unverified lot-area and overlay copy when GIS fields are absent", () => {
    const report = evaluateJurisdictionContext({
      addressId: "oakland",
      formattedAddress: "3800 Piedmont Ave, Oakland, CA 94611",
      place: "Oakland",
      county: "Alameda",
      region: "CA",
      lat: 37.8239,
      lng: -122.2556,
    });
    const findings = buildKeyFindings(report);
    expect(findings.map((f) => f.id)).toEqual([...KEY_FINDING_IDS]);
    expect(findings.find((f) => f.id === "zoning")?.text).toMatch(
      /was not verified/,
    );
    expect(findings.find((f) => f.id === "mapblklot")?.text).toMatch(
      /was not verified/,
    );
    expect(findings.find((f) => f.id === "lot-area")?.text).toMatch(
      /was not verified from GIS/,
    );
    expect(findings.find((f) => f.id === "parcel-boundary")?.text).toMatch(
      /was not verified/,
    );
    expect(findings.find((f) => f.id === "overlays")?.text).toMatch(
      /were not verified/,
    );
    expect(findings.find((f) => f.id === "unit-capacity")?.text).toMatch(
      /lot area is unknown/,
    );
    expect(findings.find((f) => f.id === "sb9")?.text).toMatch(/SB 9/);
  });
});
