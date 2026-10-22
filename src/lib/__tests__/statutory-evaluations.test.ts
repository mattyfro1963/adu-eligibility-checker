import { describe, expect, it } from "vitest";
import { evaluateEligibility, evaluateJurisdictionContext } from "@/lib/rules";
import {
  buildStatutoryEvaluations,
  statutoryEvaluationsForReport,
} from "@/lib/rules/statutory-evaluations";
import { mockProperties } from "@/lib/mock/properties";
import type { Parcel } from "@/lib/types/zoning";

function parcel(id: keyof typeof mockProperties): Parcel {
  const value = mockProperties[id];
  if (!value) throw new Error(`Missing mock parcel: ${String(id)}`);
  return value;
}

describe("buildStatutoryEvaluations", () => {
  it("marks SB9 historic rule failed for historic parcels", () => {
    const facts = parcel("addr-r1-historic");
    const report = evaluateEligibility(facts);
    const evaluations = buildStatutoryEvaluations(facts, report);
    const historic = evaluations.find((item) => item.ruleId === "SB9-R2");
    expect(historic?.outcome).toBe("fail");
    expect(historic?.severity).toBe("blocking");
  });

  it("marks ADU fire overlay as caution failure when fire is detected", () => {
    const facts = parcel("addr-r1-fire");
    const report = evaluateEligibility(facts);
    const evaluations = buildStatutoryEvaluations(facts, report);
    const fire = evaluations.find((item) => item.ruleId === "ADU-R2");
    expect(fire?.outcome).toBe("fail");
    expect(fire?.severity).toBe("caution");
  });

  it("marks lot-size rule unverified when lot size is unknown", () => {
    const facts = parcel("addr-r1-clean");
    const withoutLot: Parcel = { ...facts, lotSizeSqFt: null };
    const report = evaluateEligibility(withoutLot);
    expect(report.sb9?.status).toBe("warning");
    const lotRule = buildStatutoryEvaluations(withoutLot, report).find(
      (item) => item.ruleId === "SB9-R5",
    );
    expect(lotRule?.outcome).toBe("unverified");
  });

  it("marks overlay rules unverified when overlaysVerified is false", () => {
    const facts: Parcel = {
      ...parcel("addr-r1-clean"),
      overlaysVerified: false,
    };
    const report = evaluateEligibility(facts);
    const evaluations = buildStatutoryEvaluations(facts, report);
    expect(evaluations.find((item) => item.ruleId === "SB9-R2")?.outcome).toBe(
      "unverified",
    );
    expect(evaluations.find((item) => item.ruleId === "SB9-R3")?.outcome).toBe(
      "unverified",
    );
    expect(evaluations.find((item) => item.ruleId === "ADU-R2")?.outcome).toBe(
      "unverified",
    );
  });

  it("does not treat unverified zoning as a failed district", () => {
    const facts = parcel("addr-r1-clean");
    const report = evaluateEligibility(facts);
    report.analysisScope = "jurisdiction_context";
    report.zoning = "Not verified";
    const evaluations = buildStatutoryEvaluations(facts, report);
    expect(evaluations.find((item) => item.ruleId === "ADU-R1")?.outcome).toBe(
      "unverified",
    );
    expect(evaluations.find((item) => item.ruleId === "SB9-R1")?.outcome).toBe(
      "unverified",
    );
    expect(evaluations.find((item) => item.ruleId === "ADU-R2")?.outcome).toBe(
      "unverified",
    );
  });

  it("always returns every SB 9 and ADU unit, including passes", () => {
    const facts = parcel("addr-r1-clean");
    const report = evaluateEligibility(facts);
    const evaluations = buildStatutoryEvaluations(facts, report);
    expect(evaluations.map((item) => item.ruleId)).toEqual([
      "SB9-R1",
      "SB9-R2",
      "SB9-R3",
      "SB9-R4",
      "SB9-R5",
      "ADU-R1",
      "ADU-R2",
      "ADU-R3",
      "ADU-R4",
    ]);
    expect(report.statutoryEvaluations?.map((item) => item.ruleId)).toEqual(
      evaluations.map((item) => item.ruleId),
    );
  });

  it("still lists every SB 9 and ADU unit when lot GIS did not run", () => {
    const report = evaluateJurisdictionContext({
      addressId: "oakland",
      formattedAddress: "3800 Piedmont Ave, Oakland, CA 94611",
      place: "Oakland",
      county: "Alameda",
      region: "CA",
      lat: 37.8239,
      lng: -122.2556,
    });
    expect(report.statutoryEvaluations?.map((item) => item.ruleId)).toEqual([
      "SB9-R1",
      "SB9-R2",
      "SB9-R3",
      "SB9-R4",
      "SB9-R5",
      "ADU-R1",
      "ADU-R2",
      "ADU-R3",
      "ADU-R4",
    ]);
    expect(
      report.statutoryEvaluations?.every(
        (item) => item.outcome === "unverified",
      ),
    ).toBe(true);
  });

  it("attaches the same projection the zoning route can return", () => {
    const facts = parcel("addr-r1-clean");
    const report = evaluateEligibility(facts);
    const attached = statutoryEvaluationsForReport(report, {
      addressId: facts.addressId,
      lat: facts.lat,
      lng: facts.lng,
    });
    expect(attached.length).toBeGreaterThan(0);
    expect(attached.map((item) => item.ruleId)).toEqual(
      buildStatutoryEvaluations(facts, report).map((item) => item.ruleId),
    );
  });
});
