import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "@/lib/rules";
import { evaluateCertification } from "@/lib/rules/certification";
import { computeThowOverall } from "@/lib/rules/compute-thow-overall";
import { evaluateTransport } from "@/lib/rules/transport";
import {
  DEFAULT_11_4,
  TRANSPORT_OPTIMIZED_11,
} from "@/lib/rules/thow-models";
import {
  THOW_SUMMARY_BY_STATUS,
  UNSUPPORTED_STATE_THOW_COPY,
} from "@/lib/rules/thow-summary";
import { evaluateJurisdictionContext } from "@/lib/rules/jurisdiction-context";
import { mockProperties } from "@/lib/mock/properties";
import type { CitedClaim } from "@/lib/regulations/types";
import type { Parcel } from "@/lib/types/zoning";

function parcel(id: keyof typeof mockProperties): Parcel {
  const value = mockProperties[id];
  if (!value) {
    throw new Error(`Missing mock parcel: ${String(id)}`);
  }
  return value;
}

function reasonTexts(reasons: CitedClaim[]): string[] {
  return reasons.map((r) => r.text);
}

function expectCited(reasons: CitedClaim[]): void {
  expect(reasons.length).toBeGreaterThan(0);
  for (const reason of reasons) {
    expect(reason.text.length).toBeGreaterThan(0);
    expect(reason.sources.length).toBeGreaterThanOrEqual(1);
    for (const source of reason.sources) {
      expect(source.href).toMatch(/^https:\/\//);
      expect(source.label.length).toBeGreaterThan(0);
    }
  }
}

describe("evaluateEligibility — THOW overall", () => {
  it("mock parcels are facts only — no canned eligibility status", () => {
    for (const facts of Object.values(mockProperties)) {
      expect(facts).not.toHaveProperty("status");
      expect(facts).not.toHaveProperty("overall");
      expect(facts).not.toHaveProperty("adu");
      expect(facts).not.toHaveProperty("sb9");
      expect(facts).not.toHaveProperty("thowOverall");
      expect(facts).not.toHaveProperty("dimensions");
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

  it("overall equals thowOverall and uses locked summary copy", () => {
    const report = evaluateEligibility(parcel("addr-r1-clean"));
    expect(report.overall).toBe(report.thowOverall);
    expect(report.thowSummary.text).toBe(
      THOW_SUMMARY_BY_STATUS[report.thowOverall].text,
    );
    expect(report.dimensions.placement).toBeDefined();
    expect(report.dimensions.certification).toBeDefined();
    expect(report.dimensions.transport).toBeDefined();
    expect(report.dimensions.lotReadiness).toBeDefined();
  });

  it("default 11.4 ft model → transport Yellow with route-qualified escort copy", () => {
    const transport = evaluateTransport({
      region: "WA",
      model: DEFAULT_11_4,
    });
    expect(transport.status).toBe("warning");
    expect(
      reasonTexts(transport.reasons).some((r) =>
        /No pilot car on qualifying routes/i.test(r),
      ),
    ).toBe(true);
    expect(
      reasonTexts(transport.reasons).some((r) =>
        /pilot-car need confirmed by state permit route/i.test(r),
      ),
    ).toBe(true);
    expectCited(transport.reasons);
  });

  it("≤11 ft optimized model → transport can be Green with route-qualified language", () => {
    const transport = evaluateTransport({
      region: "WA",
      model: TRANSPORT_OPTIMIZED_11,
    });
    expect(transport.status).toBe("eligible");
    expect(
      reasonTexts(transport.reasons).some((r) =>
        /route and permit confirmation required/i.test(r),
      ),
    ).toBe(true);
  });

  it("unknown certification → Yellow; never alone greens THOW overall", () => {
    const cert = evaluateCertification({ model: DEFAULT_11_4 });
    expect(cert.status).toBe("warning");
    expect(
      reasonTexts(cert.reasons).some((r) => /unverified|unknown/i.test(r)),
    ).toBe(true);
  });

  it("ADU eligible ≠ THOW Green when placement/cert/transport are Yellow", () => {
    const report = evaluateEligibility(parcel("addr-r1-clean"));
    expect(report.adu.status).toBe("eligible");
    expect(report.thowOverall).toBe("warning");
    expect(report.overall).toBe("warning");
    expect(report.dimensions.placement.status).toBe("warning");
    expect(report.dimensions.certification.status).toBe("warning");
  });

  it("tinyHomeFriendly + NOAH optimized model can reach THOW Green", () => {
    const report = evaluateEligibility(parcel("addr-r1-tiny"), {
      model: TRANSPORT_OPTIMIZED_11,
    });
    expect(report.dimensions.placement.status).toBe("eligible");
    expect(report.dimensions.certification.status).toBe("eligible");
    expect(report.dimensions.transport.status).toBe("eligible");
    expect(report.dimensions.lotReadiness.status).toBe("eligible");
    expect(report.thowOverall).toBe("eligible");
    expect(report.overall).toBe("eligible");
    expect(report.thowSummary.text).toBe(THOW_SUMMARY_BY_STATUS.eligible.text);
    // ADU pathway remains independent
    expect(report.adu.status).toBe("eligible");
  });

  it("computeThowOverall ignores ADU — restricted dimension → Red", () => {
    expect(
      computeThowOverall({
        placement: { status: "restricted", reasons: [] },
        certification: { status: "eligible", reasons: [] },
        transport: { status: "eligible", reasons: [] },
        lotReadiness: { status: "eligible", reasons: [] },
      }),
    ).toBe("restricted");
  });

  it("R-1 with unknown lot area → SB 9 warning; THOW overall from dimensions", () => {
    const withoutLot: Parcel = {
      ...parcel("addr-r1-clean"),
      lotSizeSqFt: null,
    };
    const report = evaluateEligibility(withoutLot);
    expect(report.sb9?.status).toBe("warning");
    expect(report.sb9?.status).not.toBe("eligible");
    expect(
      reasonTexts(report.sb9?.reasons ?? []).some((r) =>
        /lot area was not verified/i.test(r),
      ),
    ).toBe(true);
    expect(report.thowOverall).toBe("warning");
  });

  it("R-1 with unchecked overlays → ADU warning; THOW Yellow", () => {
    const unchecked: Parcel = {
      ...parcel("addr-r1-clean"),
      overlaysVerified: false,
    };
    const report = evaluateEligibility(unchecked);
    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
  });

  it("R-1 + VHFHSZ/fire → ADU warning, SB 9 restricted; THOW Yellow not Red from ADU alone", () => {
    const report = evaluateEligibility(parcel("addr-r1-fire"));
    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.thowOverall).toBe("warning");
    expectCited(report.adu.reasons);
  });

  it("R-1 + historic → ADU warning, SB 9 restricted; THOW Yellow", () => {
    const report = evaluateEligibility(parcel("addr-r1-historic"));
    expect(report.adu.status).toBe("warning");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.thowOverall).toBe("warning");
  });

  it("C-2 non-residential → placement Red → THOW Red", () => {
    const report = evaluateEligibility(parcel("addr-c2"));
    expect(report.adu.status).toBe("restricted");
    expect(report.dimensions.placement.status).toBe("restricted");
    expect(report.thowOverall).toBe("restricted");
    expect(report.thowSummary.text).toBe(
      THOW_SUMMARY_BY_STATUS.restricted.text,
    );
    expectCited(report.adu.reasons);
  });

  it("R-1 + coastal → ADU warning; THOW Yellow", () => {
    const report = evaluateEligibility(parcel("addr-r1-coastal"));
    expect(report.adu.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
    expect(report.adu.status).not.toBe("restricted");
  });

  it("NC-3 mixed-use → ADU eligible; placement Yellow without express THOW path", () => {
    const mixed: Parcel = {
      ...parcel("addr-c2"),
      zoning: "NC-3",
    };
    const report = evaluateEligibility(mixed);
    expect(report.adu.status).toBe("eligible");
    expect(report.sb9?.status).toBe("restricted");
    expect(report.dimensions.placement.status).toBe("warning");
    expect(report.thowOverall).toBe("warning");
    expect(
      reasonTexts(report.adu.reasons).some((r) =>
        /not automatic|THOW-as-ADU|does not alone set/i.test(r),
      ),
    ).toBe(true);
  });

  it("ADU pathway reasons never claim THOW equals ADU", () => {
    const report = evaluateEligibility(parcel("addr-r1-clean"));
    const joined = reasonTexts(report.adu.reasons).join(" ");
    expect(joined).not.toMatch(/THOW is automatically an ADU/i);
    expect(joined).toMatch(/not automatic|only where local/i);
  });
});

describe("unsupported state", () => {
  it("returns Red with locked unsupported copy", () => {
    const report = evaluateJurisdictionContext({
      addressId: "test-tx",
      formattedAddress: "100 Main St, Austin, TX",
      place: "Austin",
      county: "Travis",
      region: "TX",
      lat: 30.27,
      lng: -97.74,
    });
    expect(report.thowOverall).toBe("restricted");
    expect(report.overall).toBe("restricted");
    expect(report.thowSummary.text).toBe(UNSUPPORTED_STATE_THOW_COPY);
    expect(report.dimensions.placement.reasons[0]?.text).toBe(
      UNSUPPORTED_STATE_THOW_COPY,
    );
  });
});
