import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "@/lib/rules";
import { buildStatutoryEvaluations } from "@/lib/rules/statutory-evaluations";
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
});
