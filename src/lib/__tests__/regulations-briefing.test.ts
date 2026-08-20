import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { REGULATIONS_AGENT } from "@/lib/regulations/agent";
import { composeLocationRequirements } from "@/lib/regulations/location-requirements";
import { resolveJurisdictionGuide } from "@/lib/content/resolve-jurisdiction";
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
  county: "San Francisco",
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

describe("resolveJurisdictionGuide", () => {
  it("Oakland → Alameda County + Oakland city notes", () => {
    const resolved = resolveJurisdictionGuide("Oakland", "Alameda");
    expect(resolved.county?.name).toBe("Alameda County");
    expect(resolved.city?.name).toBe("Oakland");
    expect(resolved.countyLabel).toBe("Alameda County");
  });

  it("South San Francisco ≠ San Francisco", () => {
    const resolved = resolveJurisdictionGuide(
      "South San Francisco",
      "San Mateo",
    );
    expect(resolved.county?.name).not.toBe("San Francisco");
    expect(resolved.city).toBeNull();
  });

  it("San Francisco County normalizes to San Francisco guide", () => {
    const resolved = resolveJurisdictionGuide(
      "San Francisco",
      "San Francisco County",
    );
    expect(resolved.county?.name).toBe("San Francisco");
  });

  it("rural county fallback matches COUNTY_GUIDES by county name", () => {
    const resolved = resolveJurisdictionGuide("", "Humboldt County");
    expect(resolved.county?.name).toBe("Humboldt County");
    expect(resolved.city).toBeNull();
  });
});

describe("composeLocationRequirements", () => {
  it("always non-empty for CA geocodes", () => {
    const reqs = composeLocationRequirements({
      geocode: sfGeocode,
      report: null,
    });
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs.some((r) => r.jurisdictionLabel === "California")).toBe(true);
    expect(
      reqs.some(
        (r) => r.id.startsWith("county-") || r.id === "county-fallback",
      ),
    ).toBe(true);
  });

  it("includes Oakland city requirements when place is Oakland", () => {
    const reqs = composeLocationRequirements({
      geocode: {
        ...sfGeocode,
        place: "Oakland",
        county: "Alameda",
        formattedAddress: "100 Broadway, Oakland, CA",
      },
      report: null,
    });
    expect(
      reqs.some(
        (r) => /Oakland/i.test(r.title) || r.jurisdictionLabel === "Oakland",
      ),
    ).toBe(true);
  });
});

describe("composeResultsBriefing", () => {
  it("lot zoning report → CA checklist, outline, receipt with lot_zoning scope", () => {
    const report = evaluateEligibility(mockProperties["addr-r1-clean"]!);
    const briefing = composeResultsBriefing({
      geocode: sfGeocode,
      report,
      issuedAt: "2026-08-20T19:00:00.000Z",
    });

    expect(briefing.isCalifornia).toBe(true);
    expect(briefing.author).toEqual(REGULATIONS_AGENT);
    expect(briefing.receipt.author).toEqual(REGULATIONS_AGENT);
    expect(briefing.receipt.disclaimer).toMatch(
      /Authored by the doihave\.space Regulations Expert/,
    );
    expect(briefing.receipt.analysisScope).toBe("lot_zoning");
    expect(briefing.receipt.mapblklot).toBeNull();
    expect(briefing.checklist.length).toBeGreaterThan(0);
    expect(briefing.checklist[0]?.id).toBe("ca-use");
    expect(briefing.outline.some((s) => s.id === "use-of-land")).toBe(true);
    expect(briefing.summary.length).toBeGreaterThanOrEqual(3);
    expect(
      briefing.summary.some((c) => c.text.startsWith("On this California lot")),
    ).toBe(true);
    expect(briefing.guideLinks.length).toBe(3);
    expect(briefing.requirements.length).toBeGreaterThan(0);
    for (const claim of briefing.summary) {
      assertClaimCited(claim);
    }
    for (const item of briefing.checklist) {
      assertClaimCited(item.detail);
    }
  });

  it("CA outside lot coverage → jurisdiction_context and requirements", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Oakland",
        county: "Alameda",
        formattedAddress: "100 Broadway, Oakland, CA",
      },
      report: null,
      zoningError: null,
    });

    expect(briefing.isCalifornia).toBe(true);
    expect(briefing.receipt.analysisScope).toBe("jurisdiction_context");
    expect(briefing.checklist[0]?.id).toBe("ca-use");
    expect(briefing.guideLinks).toEqual([]);
    expect(briefing.requirements.length).toBeGreaterThan(0);
    expect(
      briefing.summary.some((c) =>
        /not available for this coordinate/i.test(c.text),
      ),
    ).toBe(true);
  });

  it("South San Francisco (no report) → CA checklist, not SF guides", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "South San Francisco",
        county: "San Mateo",
        formattedAddress: "100 El Camino Real, South San Francisco, CA",
      },
      report: null,
    });

    expect(briefing.isCalifornia).toBe(true);
    expect(briefing.checklist[0]?.id).toBe("ca-use");
    expect(briefing.checklist.some((item) => item.id.startsWith("sf-"))).toBe(
      false,
    );
    expect(briefing.guideLinks).toEqual([]);
  });

  it("unpublished state → only not-published notice, no CA/SF summary claims", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Austin",
        county: "Travis",
        region: "TX",
        formattedAddress: "100 Congress Ave, Austin, TX",
      },
      report: null,
    });

    expect(briefing.isCalifornia).toBe(false);
    expect(briefing.checklist).toEqual([]);
    expect(briefing.outline).toEqual([]);
    expect(briefing.requirements).toEqual([]);
    expect(briefing.summary).toHaveLength(1);
    expect(briefing.summary[0]?.text).toMatch(/not published/i);
    expect(
      briefing.summary.some((c) => /California (lot|pilot)/i.test(c.text)),
    ).toBe(false);
    expect(briefing.summary.some((c) => /SF Planning|DBI/i.test(c.text))).toBe(
      false,
    );
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

  it("receipt sources include Civil Code § 4751 for lot zoning and jurisdiction context", () => {
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
        county: "Sacramento",
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
      "agent.ts",
      "compose-briefing.ts",
      "corpus.ts",
      "sources.ts",
      "sf-source-catalog.ts",
      "states/ca.ts",
      "states/registry.ts",
      "types.ts",
      "location-requirements.ts",
      "../rules/jurisdiction-context.ts",
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(root, rel), "utf8");
      expect(src.toLowerCase()).not.toMatch(/nolo/);
    }
  });
});

describe("zero network in regulations / zoning disk adapters", () => {
  it("regulations and sf-datasf modules do not call fetch on gov hosts", () => {
    const root = path.join(process.cwd(), "src/lib");
    const files = [
      "regulations/compose-briefing.ts",
      "regulations/sources.ts",
      "regulations/sf-source-catalog.ts",
      "regulations/states/ca.ts",
      "adapters/sf-datasf-zoning.ts",
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
    expect(header).toMatch(/Eligibility Check/);

    const search = readFileSync(
      path.join(componentsRoot, "AddressSearch/AddressSearch.tsx"),
      "utf8",
    );
    expect(search).toMatch(/Enter a California address/);
    expect(search).toMatch(/All CA counties/);

    const results = readFileSync(
      path.join(componentsRoot, "ResultsCard/ResultsCard.tsx"),
      "utf8",
    );
    expect(results).toMatch(/California application checklist/);
    expect(results).toMatch(/JurisdictionRequirements/);

    const receipt = readFileSync(
      path.join(componentsRoot, "ResultsCard/SearchReceipt.tsx"),
      "utf8",
    );
    expect(receipt).toMatch(/California lot analysis \(local zoning data\)/);
    expect(receipt).toMatch(/Jurisdiction context/);
    expect(receipt).toMatch(/Author/);

    const briefingSection = readFileSync(
      path.join(componentsRoot, "ResultsCard/ResultsBriefing.tsx"),
      "utf8",
    );
    expect(briefingSection).toMatch(/RegulationsAuthorByline/);
  });

  it("uses responsive padding, heights, and 44px touch targets on key surfaces", () => {
    const checks: Array<[string, RegExp[]]> = [
      ["SiteHeader/SiteHeader.tsx", [/\bpx-4\b/, /sm:px-6/, /min-h-\[44px\]/]],
      [
        "AddressSearch/AddressSearch.tsx",
        [/uppercase/, /rounded-2xl/, /min-h-\[44px\]/],
      ],
      [
        "ResultsCard/ResultsCard.tsx",
        [
          /min-h-\[280px\]/,
          /sm:min-h-\[360px\]/,
          /lg:grid-cols-5/,
          /gap-6/,
          /lg:gap-8/,
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
        [/\bpx-4\b/, /sm:px-6/, /py-8/, /min-h-\[44px\]/],
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
