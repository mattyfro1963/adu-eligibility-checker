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
    expect(historic?.passed).toBe(false);
    expect(historic?.severity).toBe("blocking");
  });

  it("marks ADU fire overlay as caution failure when fire is detected", () => {
    const facts = parcel("addr-r1-fire");
    const report = evaluateEligibility(facts);
    const evaluations = buildStatutoryEvaluations(facts, report);
    const fire = evaluations.find((item) => item.ruleId === "ADU-R2");
    expect(fire?.passed).toBe(false);
    expect(fire?.severity).toBe("caution");
  });

  it("includes lot-size rule that passes when lot size is unknown", () => {
    const facts = parcel("addr-r1-clean");
    const withoutLot: Parcel = { ...facts, lotSizeSqFt: null };
    const report = evaluateEligibility(withoutLot);
    const lotRule = buildStatutoryEvaluations(withoutLot, report).find(
      (item) => item.ruleId === "SB9-R5",
    );
    expect(lotRule?.passed).toBe(true);
  });
});
