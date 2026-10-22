import { describe, expect, it } from "vitest";
import { SRC } from "@/lib/regulations/sources";
import { evaluateEligibility } from "@/lib/rules";
import { evaluateCertification } from "@/lib/rules/certification";
import { computeThowOverall } from "@/lib/rules/compute-thow-overall";
import { evaluateJurisdictionContext } from "@/lib/rules/jurisdiction-context";
import { CAMBRIA_1_MODEL, CAMBRIA_2_MODEL } from "@/lib/rules/thow-models";
import { evaluateTransport } from "@/lib/rules/transport";
import { mockProperties } from "@/lib/mock/properties";
import {
  CAMBRIA_1,
  CAMBRIA_2,
  evaluateThowPlanForState,
  recommendFeaturedPlan,
  type FeaturedPlanEligibility,
} from "@/lib/thow/plans";
import type { CitedClaim } from "@/lib/regulations/types";
import type { Parcel } from "@/lib/types/zoning";

const OFFICIAL_HOST_ALLOWLIST =
  /^(https:\/\/)(leginfo\.legislature\.ca\.gov|app\.leg\.wa\.gov|wsdot\.wa\.gov|www\.oregon\.gov|oregon\.gov|secure\.sos\.state\.or\.us|dot\.ca\.gov|www\.hcd\.ca\.gov|hcd\.ca\.gov|lni\.wa\.gov|www\.lni\.wa\.gov|noahcertified\.org|www\.rvia\.org|rvia\.org)/i;

const FORBIDDEN_PHRASES = [
  /does not need a pilot car/i,
  /do not need a pilot car/i,
  /never needs a pilot/i,
  /No pilot car on qualifying routes/i,
  /THOWs do not need a pilot/i,
  /CAMBRIA 2 never needs a pilot/i,
];

function parcel(id: keyof typeof mockProperties): Parcel {
  const value = mockProperties[id];
  if (!value) throw new Error(`Missing mock parcel: ${String(id)}`);
  return value;
}

function expectCited(reasons: CitedClaim[]): void {
  expect(reasons.length).toBeGreaterThan(0);
  for (const reason of reasons) {
    expect(reason.sources.length).toBeGreaterThanOrEqual(1);
    for (const source of reason.sources) {
      expect(source.href).toMatch(/^https:\/\//);
      expect(source.href).toMatch(OFFICIAL_HOST_ALLOWLIST);
    }
  }
}

function assertNoForbiddenPhrases(texts: string[]): void {
  const joined = texts.join("\n");
  for (const pattern of FORBIDDEN_PHRASES) {
    expect(joined).not.toMatch(pattern);
  }
}

function emptyPlan(
  overrides: Partial<FeaturedPlanEligibility> &
    Pick<FeaturedPlanEligibility, "planId" | "planName" | "lotRating">,
): FeaturedPlanEligibility {
  return {
    placementSummary: "",
    transportSummary: "",
    certificationSummary: "",
    nextSteps: [],
    transportStatus: "warning",
    placementStatus: "warning",
    transportSources: [],
    placementSources: [],
    certificationSources: [],
    ...overrides,
  };
}

describe("SRC CAMBRIA claim → source matrix", () => {
  it("resolves deep-linked transport and cert URLs from the plan matrix", () => {
    expect(SRC.waWacPilotEscort.href).toBe(
      "https://app.leg.wa.gov/WAC/default.aspx?cite=468-38-100",
    );
    expect(SRC.waDotPermitForm560002.href).toMatch(/560-002\.PDF$/i);
    expect(SRC.waWacParkTrailer.href).toMatch(/296-150p/i);
    expect(SRC.waLniFasLaws.href).toMatch(/lni\.wa\.gov/i);
    expect(SRC.waLniModularPortal.href).toMatch(/lni\.wa\.gov/i);
    expect(SRC.caCvc35100.href).toMatch(/sectionNum=35100/);
    expect(SRC.caDotVehicleWidths.href).toMatch(/vehicle-widths/);
    expect(SRC.caDotPilotCarMaps.href).toMatch(/stpcmaps/);
    expect(SRC.caDotTpmCh5.href).toMatch(/chapter-5/i);
    expect(SRC.orDotLegalDims.href).toMatch(/legal-vehicle-dimensions/i);
    expect(SRC.orDotOverDimOps.href).toMatch(/Over-Dimension-Operations/i);
    expect(SRC.orDotPermittableTables.href).toMatch(/permittable/i);
    expect(SRC.orOarPilotVehicles.href).toMatch(/oard|734-078/i);
    expect(SRC.orDotPilotGuide.href).toMatch(/pilotcarguide\.pdf/i);
  });
});

describe("CAMBRIA transport status matrix", () => {
  it.each([
    {
      region: "WA",
      model: CAMBRIA_1_MODEL,
      expected: "warning" as const,
      mustIncludeHref: SRC.waWacPilotEscort.href,
    },
    {
      region: "WA",
      model: CAMBRIA_2_MODEL,
      expected: "eligible" as const,
      mustIncludeHref: SRC.waWacPilotEscort.href,
    },
    {
      region: "CA",
      model: CAMBRIA_1_MODEL,
      expected: "warning" as const,
      mustIncludeHref: SRC.caCvc35100.href,
    },
    {
      region: "CA",
      model: CAMBRIA_2_MODEL,
      expected: "warning" as const,
      mustIncludeHref: SRC.caDotPilotCarMaps.href,
    },
    {
      region: "OR",
      model: CAMBRIA_1_MODEL,
      expected: "warning" as const,
      mustIncludeHref: SRC.orDotLegalDims.href,
    },
    {
      region: "OR",
      model: CAMBRIA_2_MODEL,
      expected: "warning" as const,
      mustIncludeHref: SRC.orOarPilotVehicles.href,
    },
  ])(
    "$region + $model.id → transport $expected with official cites",
    ({ region, model, expected, mustIncludeHref }) => {
      const transport = evaluateTransport({ region, model });
      expect(transport.status).toBe(expected);
      expectCited(transport.reasons);
      const hrefs = transport.reasons.flatMap((r) =>
        r.sources.map((s) => s.href),
      );
      expect(hrefs).toContain(mustIncludeHref);
      assertNoForbiddenPhrases(transport.reasons.map((r) => r.text));
      expect(
        transport.reasons.some((r) =>
          /designed to reduce pilot-car requirements/i.test(r.text),
        ),
      ).toBe(true);
    },
  );

  it("WA CAMBRIA 2 does not claim blanket no-pilot clearance", () => {
    const transport = evaluateTransport({
      region: "WA",
      model: CAMBRIA_2_MODEL,
    });
    assertNoForbiddenPhrases(transport.reasons.map((r) => r.text));
    expect(
      transport.reasons.some((r) =>
        /does not automatically trigger WAC 468-38-100/i.test(r.text),
      ),
    ).toBe(true);
    expect(
      transport.reasons.some((r) =>
        /oversize permits and route review are still required/i.test(r.text),
      ),
    ).toBe(true);
  });
});

describe("certification cites official hosts", () => {
  it("CAMBRIA plans (NOAH / ≤400) are Green with seal ≠ permit copy", () => {
    for (const model of [CAMBRIA_1_MODEL, CAMBRIA_2_MODEL]) {
      const cert = evaluateCertification({ model, region: "WA" });
      expect(cert.status).toBe("eligible");
      expectCited(cert.reasons);
      expect(
        cert.reasons.some((r) => /not a .*placement permit/i.test(r.text)),
      ).toBe(true);
      const hrefs = cert.reasons.flatMap((r) => r.sources.map((s) => s.href));
      expect(hrefs).toContain(SRC.waWacParkTrailer.href);
      expect(hrefs).toContain(SRC.noahDwelling.href);
    }
  });
});

describe("option (b) overall Green", () => {
  it("CA transport warning does not alone block Green when other gates are eligible", () => {
    const overall = computeThowOverall(
      {
        placement: { status: "eligible", reasons: [] },
        certification: { status: "eligible", reasons: [] },
        transport: { status: "warning", reasons: [] },
        lotReadiness: { status: "eligible", reasons: [] },
      },
      { region: "CA", widthFt: 11.4 },
    );
    expect(overall).toBe("eligible");
  });

  it("WA width > 11 ft transport warning blocks overall Green", () => {
    const overall = computeThowOverall(
      {
        placement: { status: "eligible", reasons: [] },
        certification: { status: "eligible", reasons: [] },
        transport: { status: "warning", reasons: [] },
        lotReadiness: { status: "eligible", reasons: [] },
      },
      { region: "WA", widthFt: 11.4 },
    );
    expect(overall).toBe("warning");
  });

  it("tinyHomeFriendly lot can reach overall Green via CAMBRIA recommendation", () => {
    const report = evaluateEligibility(parcel("addr-r1-tiny"), {
      region: "CA",
    });
    expect(report.dimensions.placement.status).toBe("eligible");
    expect(report.dimensions.certification.status).toBe("eligible");
    expect(report.dimensions.lotReadiness.status).toBe("eligible");
    // CA transport stays warning (route-specific); option (b) allows overall Green.
    expect(report.dimensions.transport.status).toBe("warning");
    expect(report.thowOverall).toBe("eligible");
    expect(report.overall).toBe(report.thowOverall);
    expect(report.featuredPlans?.length).toBe(2);
    expect(report.planRecommendation?.recommendedPlanId).toBe("cambria-1");
  });
});

describe("evaluateThowPlanForState + recommendation matrix", () => {
  it("evaluates both plans for CA / OR / WA", () => {
    for (const region of ["CA", "OR", "WA"] as const) {
      for (const plan of [CAMBRIA_1, CAMBRIA_2]) {
        const evaled = evaluateThowPlanForState({
          parcel: parcel("addr-r1-tiny"),
          region,
          plan,
          placementContext: { expressLocalPath: true },
        });
        expect(["green", "yellow", "red"]).toContain(
          evaled.eligibility.lotRating,
        );
        expectCited(evaled.dimensions.transport.reasons);
        expectCited(evaled.dimensions.certification.reasons);
        assertNoForbiddenPhrases(
          evaled.dimensions.transport.reasons.map((r) => r.text),
        );
        if (region === "WA" && plan.id === "cambria-1") {
          expect(evaled.dimensions.transport.status).toBe("warning");
          expect(
            evaled.dimensions.transport.reasons
              .flatMap((r) => r.sources.map((s) => s.href))
              .includes(SRC.waWacPilotEscort.href),
          ).toBe(true);
        }
        if (region === "WA" && plan.id === "cambria-2") {
          expect(evaled.dimensions.transport.status).toBe("eligible");
        }
      }
    }
  });

  it("recommendation: both green → CAMBRIA 1", () => {
    const rec = recommendFeaturedPlan([
      emptyPlan({
        planId: "cambria-1",
        planName: "CAMBRIA 1",
        lotRating: "green",
      }),
      emptyPlan({
        planId: "cambria-2",
        planName: "CAMBRIA 2",
        lotRating: "green",
      }),
    ]);
    expect(rec.recommendedPlanId).toBe("cambria-1");
  });

  it("recommendation: C1 yellow + C2 green → CAMBRIA 2", () => {
    const rec = recommendFeaturedPlan([
      emptyPlan({
        planId: "cambria-1",
        planName: "CAMBRIA 1",
        lotRating: "yellow",
      }),
      emptyPlan({
        planId: "cambria-2",
        planName: "CAMBRIA 2",
        lotRating: "green",
      }),
    ]);
    expect(rec.recommendedPlanId).toBe("cambria-2");
  });

  it("recommendation: both yellow → null + paid review", () => {
    const rec = recommendFeaturedPlan([
      emptyPlan({
        planId: "cambria-1",
        planName: "CAMBRIA 1",
        lotRating: "yellow",
      }),
      emptyPlan({
        planId: "cambria-2",
        planName: "CAMBRIA 2",
        lotRating: "yellow",
      }),
    ]);
    expect(rec.recommendedPlanId).toBeNull();
    expect(rec.rationale).toMatch(/paid feasibility review/i);
  });

  it("recommendation: both red → null + disqualify", () => {
    const rec = recommendFeaturedPlan([
      emptyPlan({
        planId: "cambria-1",
        planName: "CAMBRIA 1",
        lotRating: "red",
      }),
      emptyPlan({
        planId: "cambria-2",
        planName: "CAMBRIA 2",
        lotRating: "red",
      }),
    ]);
    expect(rec.recommendedPlanId).toBeNull();
    expect(rec.rationale).toMatch(/weak THOW candidate|different property/i);
  });

  it("recommendation: C1 red + C2 green → CAMBRIA 2 only", () => {
    const rec = recommendFeaturedPlan([
      emptyPlan({
        planId: "cambria-1",
        planName: "CAMBRIA 1",
        lotRating: "red",
      }),
      emptyPlan({
        planId: "cambria-2",
        planName: "CAMBRIA 2",
        lotRating: "green",
      }),
    ]);
    expect(rec.recommendedPlanId).toBe("cambria-2");
  });

  it("unsupported state → both red", () => {
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
    expect(report.featuredPlans?.every((p) => p.lotRating === "red")).toBe(
      true,
    );
  });
});
