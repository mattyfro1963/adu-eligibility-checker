import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "@/lib/rules";
import { mockProperties } from "@/lib/mock/properties";
import type { Parcel } from "@/lib/types/zoning";

function parcel(id: keyof typeof mockProperties): Parcel {
  const value = mockProperties[id];
  if (!value) {
    throw new Error(`Missing mock parcel: ${String(id)}`);
  }
  return value;
}

describe("evaluateEligibility", () => {
  it("mock parcels are facts only — no canned eligibility status", () => {
    for (const facts of Object.values(mockProperties)) {
      expect(facts).not.toHaveProperty("status");
      expect(facts).not.toHaveProperty("overall");
      expect(facts).not.toHaveProperty("adu");
      expect(facts).not.toHaveProperty("sb9");
    }
  });

  it("does not branch on the formatted address string", () => {
    const base = parcel("addr-r1-clean");
    const renamed: Parcel = {
      ...base,
      formattedAddress: "999 Unknown Ave, San Francisco, CA",
    };
    expect(evaluateEligibility(renamed).overall).toBe(
      evaluateEligibility(base).overall,
    );
    expect(evaluateEligibility(renamed).adu.status).toBe("eligible");
  });

  it("R-1 with no overlays → ADU eligible, SB 9 eligible, overall eligible", () => {
    const report = evaluateEligibility(parcel("addr-r1-clean"));
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9.status).toBe("eligible");
    expect(report.overall).toBe("eligible");
  });

  it("R-1 + tinyHomeFriendly → ADU eligible with tiny-home reason", () => {
    const report = evaluateEligibility(parcel("addr-r1-tiny"));
    expect(report.adu.status).toBe("eligible");
    expect(report.adu.reasons.some((r) => /tiny home/i.test(r))).toBe(true);
    expect(report.sb9.status).toBe("eligible");
    expect(report.sb9.reasons.some((r) => /tiny home/i.test(r))).toBe(false);
    expect(report.overall).toBe("eligible");
  });

  it("R-1 + VHFHSZ/fire → ADU warning, SB 9 restricted, overall warning", () => {
    const report = evaluateEligibility(parcel("addr-r1-fire"));
    expect(report.adu.status).toBe("warning");
    expect(report.sb9.status).toBe("restricted");
    expect(report.overall).toBe("warning");
    expect(report.adu.reasons.some((r) => /65852\.2/.test(r))).toBe(true);
  });

  it("R-1 + historic → ADU warning, SB 9 restricted", () => {
    const report = evaluateEligibility(parcel("addr-r1-historic"));
    expect(report.adu.status).toBe("warning");
    expect(report.sb9.status).toBe("restricted");
    expect(report.overall).toBe("warning");
    expect(report.sb9.reasons.some((r) => /historic/i.test(r))).toBe(true);
  });

  it("C-2 non-residential → both restricted, overall restricted", () => {
    const report = evaluateEligibility(parcel("addr-c2"));
    expect(report.adu.status).toBe("restricted");
    expect(report.sb9.status).toBe("restricted");
    expect(report.overall).toBe("restricted");
  });

  it("R-1 + coastal → warnings, not a commercial-style hard ban", () => {
    const report = evaluateEligibility(parcel("addr-r1-coastal"));
    expect(report.adu.status).toBe("warning");
    expect(report.sb9.status).toBe("warning");
    expect(report.overall).toBe("warning");
    expect(report.adu.status).not.toBe("restricted");
    expect(report.sb9.status).not.toBe("restricted");
  });
});
