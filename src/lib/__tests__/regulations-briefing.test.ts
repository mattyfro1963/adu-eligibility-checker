import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { CA_PROFILE } from "@/lib/regulations/states/ca";
import {
  getStateProfile,
  listStateCodes,
  normalizeRegionCode,
} from "@/lib/regulations/states/registry";
import { SF_SOURCE_CATALOG } from "@/lib/regulations/sf-source-catalog";
import { SRC } from "@/lib/regulations/sources";
import { evaluateEligibility } from "@/lib/rules";
import { mockProperties } from "@/lib/mock/properties";
import type { CitedClaim } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";

function assertClaimCited(claim: CitedClaim): void {
  expect(claim.text.length).toBeGreaterThan(0);
  expect(claim.sources.length).toBeGreaterThanOrEqual(1);
  for (const source of claim.sources) {
    expect(source.href).toMatch(/^https:\/\//);
    expect(source.href).not.toMatch(/query\.geojson/i);
    expect(source.href).not.toMatch(/\$limit=/i);
  }
}

const sfGeocode: GeocodeResult = {
  addressId: "test-sf",
  formattedAddress: "123 Main St, San Francisco, CA 94117",
  streetLine: "123 Main St",
  place: "San Francisco",
  region: "CA",
  postcode: "94117",
  lat: 37.74,
  lng: -122.45,
};

describe("regulations registry", () => {
  it("lists US states and publishes only California", () => {
    const codes = listStateCodes();
    expect(codes).toContain("CA");
    expect(codes.length).toBeGreaterThanOrEqual(50);
    expect(getStateProfile("CA").published).toBe(true);
    expect(getStateProfile("TX").published).toBe(false);
    expect(normalizeRegionCode("California")).toBe("CA");
  });

  it("CA profile claims all carry official https sources", () => {
    for (const claim of CA_PROFILE.useDoctrine) {
      assertClaimCited(claim);
    }
    for (const section of CA_PROFILE.outline) {
      for (const claim of section.claims) {
        assertClaimCited(claim);
      }
    }
    for (const item of [...CA_PROFILE.sfChecklist, ...CA_PROFILE.caChecklist]) {
      assertClaimCited(item.detail);
    }
  });

  it("SF source catalog uses catalog pages, not Socrata downloads", () => {
    expect(SF_SOURCE_CATALOG.some((e) => e.fact === "zoning")).toBe(true);
    for (const entry of SF_SOURCE_CATALOG) {
      expect(entry.source.href).toMatch(/^https:\/\//);
      expect(entry.source.href).not.toMatch(/query\.geojson/i);
    }
  });
});

describe("composeResultsBriefing", () => {
  it("SF pilot report → SF checklist, outline, receipt with mapblklot null and California lot phrasing", () => {
    const report = evaluateEligibility(mockProperties["addr-r1-clean"]!);
    const briefing = composeResultsBriefing({
      geocode: sfGeocode,
      report,
      issuedAt: "2026-08-20T19:00:00.000Z",
    });

    expect(briefing.isCalifornia).toBe(true);
    expect(briefing.receipt.analysisScope).toBe("sf_pilot_lot");
    expect(briefing.receipt.mapblklot).toBeNull();
    expect(briefing.checklist.length).toBeGreaterThan(0);
    expect(briefing.checklist[0]?.id).toBe("sf-use");
    expect(briefing.outline.some((s) => s.id === "use-of-land")).toBe(true);
    expect(briefing.summary.length).toBeGreaterThanOrEqual(3);
    expect(
      briefing.summary.some((c) => c.text.startsWith("On this California lot")),
    ).toBe(true);
    expect(briefing.guideLinks.length).toBe(3);
    for (const claim of briefing.summary) {
      assertClaimCited(claim);
    }
    for (const item of briefing.checklist) {
      assertClaimCited(item.detail);
    }
  });

  it("CA outside SF (no report) → statewide checklist and context receipt", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Oakland",
        formattedAddress: "100 Broadway, Oakland, CA",
      },
      report: null,
      zoningError: "Location is outside California pilot zoning coverage.",
    });

    expect(briefing.isCalifornia).toBe(true);
    expect(briefing.receipt.analysisScope).toBe("statewide_context_only");
    expect(briefing.checklist[0]?.id).toBe("ca-use");
    expect(briefing.summary.some((c) => /California pilot/i.test(c.text))).toBe(
      true,
    );
  });

  it("unpublished state → no invented CA checklist", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Austin",
        region: "TX",
        formattedAddress: "100 Congress Ave, Austin, TX",
      },
      report: null,
    });

    expect(briefing.isCalifornia).toBe(false);
    expect(briefing.checklist).toEqual([]);
    expect(briefing.outline).toEqual([]);
    expect(briefing.summary[0]?.text).toMatch(/not published/i);
  });
});

describe("ADU topic coverage and legal sources", () => {
  it("includes Civil Code § 4751 and § 4740 official LegInfo sources", () => {
    expect(SRC.civ4751.label).toBe("Civil Code § 4751");
    expect(SRC.civ4751.href).toMatch(/lawCode=CIV.*sectionNum=4751/);
    expect(SRC.civ4740.label).toBe("Civil Code § 4740");
    expect(SRC.civ4740.href).toMatch(/lawCode=CIV.*sectionNum=4740/);
  });

  it("includes impact fees, garage conversion, JADUs, and CC&Rs in CA outline", () => {
    const aduSection = CA_PROFILE.outline.find((s) => s.id === "adu");
    expect(aduSection).toBeDefined();

    const texts = aduSection!.claims.map((c) => c.text).join(" ");
    expect(texts).toMatch(/impact fees/i);
    expect(texts).toMatch(/750/);
    expect(texts).toMatch(/garage/i);
    expect(texts).toMatch(/replacement.*parking/i);
    expect(texts).toMatch(/junior adu|jadu/i);
    expect(texts).toMatch(/500 sq ft/i);
    expect(texts).toMatch(/covenants|cc&rs|4751/i);

    const allAduSources = aduSection!.claims.flatMap((c) => c.sources);
    expect(allAduSources.some((s) => s.href.includes("sectionNum=4751"))).toBe(
      true,
    );
    expect(allAduSources.some((s) => s.href.includes("sectionNum=4740"))).toBe(
      true,
    );
  });

  it("receipt sources include Civil Code § 4751 for both SF pilot and statewide context", () => {
    const sfSources = SF_SOURCE_CATALOG;
    expect(
      sfSources.some((s) => s.source.href.includes("sectionNum=4751")),
    ).toBe(true);

    const sfReport = evaluateEligibility(mockProperties["addr-r1-clean"]!);
    const sfBriefing = composeResultsBriefing({
      geocode: sfGeocode,
      report: sfReport,
    });
    expect(
      sfBriefing.receipt.sourcesUsed.some((s) =>
        s.href.includes("sectionNum=4751"),
      ),
    ).toBe(true);

    const caBriefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Sacramento",
        formattedAddress: "1000 I St, Sacramento, CA",
      },
      report: null,
    });
    expect(
      caBriefing.receipt.sourcesUsed.some((s) =>
        s.href.includes("sectionNum=4751"),
      ),
    ).toBe(true);
  });

  it("has zero references to nolo or nolo.com across regulation files", () => {
    const root = path.join(process.cwd(), "src/lib/regulations");
    const files = [
      "compose-briefing.ts",
      "corpus.ts",
      "sources.ts",
      "sf-source-catalog.ts",
      "states/ca.ts",
      "states/registry.ts",
      "types.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(root, rel), "utf8");
      expect(src.toLowerCase()).not.toMatch(/nolo/);
    }
  });
});

describe("zero network in regulations / pilot adapters", () => {
  it("regulations and pilot-zoning modules do not call fetch on gov hosts", () => {
    const root = path.join(process.cwd(), "src/lib");
    const files = [
      "regulations/compose-briefing.ts",
      "regulations/sources.ts",
      "regulations/sf-source-catalog.ts",
      "regulations/states/ca.ts",
      "adapters/pilot-zoning.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(root, rel), "utf8");
      expect(src).not.toMatch(/\bfetch\s*\(/);
      expect(src).not.toMatch(/data\.sfgov\.org\/api/);
      expect(src).not.toMatch(/query\.geojson/);
    }
  });
});

describe("California visitor-facing branding", () => {
  const componentsRoot = path.join(process.cwd(), "src/components/features");
  const appRoot = path.join(process.cwd(), "src/app");

  it("does not brand the product as San Francisco-only in key UI strings", () => {
    const files: Array<[string, string]> = [
      [componentsRoot, "SiteHeader/SiteHeader.tsx"],
      [componentsRoot, "AddressSearch/AddressSearch.tsx"],
      [componentsRoot, "SiteFooter/SiteFooter.tsx"],
      [componentsRoot, "ResultsCard/ResultsCard.tsx"],
      [componentsRoot, "ResultsCard/SearchReceipt.tsx"],
      [componentsRoot, "RegulationsGuide/RegulationsGuide.tsx"],
      [appRoot, "layout.tsx"],
      [appRoot, "api/zoning/route.ts"],
    ];

    for (const [root, rel] of files) {
      const src = readFileSync(path.join(root, rel), "utf8");
      expect(src).not.toMatch(/SF SYSTEM ACTIVE/);
      expect(src).not.toMatch(/Query San Francisco address/);
      expect(src).not.toMatch(/San Francisco application checklist/);
      expect(src).not.toMatch(/Check a San Francisco address/);
      expect(src).not.toMatch(/Try an SF address/);
      expect(src).not.toMatch(/SF pilot lot \(DataSF/);
    }

    const header = readFileSync(
      path.join(componentsRoot, "SiteHeader/SiteHeader.tsx"),
      "utf8",
    );
    expect(header).toMatch(/CA SYSTEM ACTIVE/);

    const search = readFileSync(
      path.join(componentsRoot, "AddressSearch/AddressSearch.tsx"),
      "utf8",
    );
    expect(search).toMatch(/Query California address/);

    const results = readFileSync(
      path.join(componentsRoot, "ResultsCard/ResultsCard.tsx"),
      "utf8",
    );
    expect(results).toMatch(/California application checklist/);

    const receipt = readFileSync(
      path.join(componentsRoot, "ResultsCard/SearchReceipt.tsx"),
      "utf8",
    );
    expect(receipt).toMatch(/California lot analysis \(local zoning data\)/);
    expect(receipt).toMatch(/Statewide context only/);
  });

  it("uses responsive padding, heights, and 44px touch targets on key surfaces", () => {
    const checks: Array<[string, RegExp[]]> = [
      [
        "SiteHeader/SiteHeader.tsx",
        [/\bpx-4\b/, /sm:px-6/, /\bh-16\b/, /sm:flex/],
      ],
      [
        "AddressSearch/AddressSearch.tsx",
        [/text-3xl/, /sm:text-4xl/, /\bh-12\b/, /sm:h-14/, /min-h-\[44px\]/],
      ],
      [
        "ResultsCard/ResultsCard.tsx",
        [
          /h-\[280px\]/,
          /sm:h-\[360px\]/,
          /lg:h-\[420px\]/,
          /gap-4/,
          /sm:gap-6/,
        ],
      ],
      ["ResultsCard/ResultsBriefing.tsx", [/\bp-5\b/, /sm:p-6/, /md:p-8/]],
      [
        "ResultsCard/ApplicationChecklist.tsx",
        [/\bp-5\b/, /sm:p-6/, /md:p-8/, /gap-3/, /sm:gap-4/],
      ],
      [
        "ResultsCard/CaliforniaOutline.tsx",
        [/min-h-\[44px\]/, /\bp-5\b/, /sm:p-6/, /md:p-8/],
      ],
      [
        "ResultsCard/SearchReceipt.tsx",
        [/\bp-5\b/, /sm:p-6/, /md:p-8/, /min-h-\[44px\]/],
      ],
      ["ResultsCard/CitedText.tsx", [/min-h-\[44px\]/, /flex-wrap/, /gap-x-3/]],
      [
        "LeadFallbackForm/LeadFallbackForm.tsx",
        [/\bp-6\b/, /sm:p-8/, /\bh-11\b/, /\bw-full\b/, /sm:w-auto/],
      ],
      [
        "SiteFooter/SiteFooter.tsx",
        [/\bpx-4\b/, /sm:px-6/, /py-8/, /sm:py-10/, /min-h-\[44px\]/],
      ],
    ];

    for (const [rel, patterns] of checks) {
      const src = readFileSync(path.join(componentsRoot, rel), "utf8");
      for (const pattern of patterns) {
        expect(src, `${rel} should match ${pattern}`).toMatch(pattern);
      }
    }
  });
});
