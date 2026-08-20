import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_FTC_DISCLOSURE,
  AFFILIATE_OFFERS,
  listResolvedAffiliateOffers,
  resolveAffiliateHref,
} from "@/lib/content/affiliates/catalog";
import { GUIDE_LINKS, isGuideSlug } from "@/lib/content/guides/catalog";
import { COST_LINE_ITEMS } from "@/lib/content/guides/sf-cost-matrix";
import { SF_THOW_SECTIONS } from "@/lib/content/guides/sf-thow-zoning";
import {
  COMPARISON_ROWS,
  DECISION_NODES,
} from "@/lib/content/guides/wheels-vs-foundation";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { evaluateEligibility } from "@/lib/rules";
import { mockProperties } from "@/lib/mock/properties";
import {
  leadBodySchema,
  restrictedReviewBodySchema,
} from "@/lib/validations/api-schemas";
import type { CitedClaim } from "@/lib/regulations/types";
import type { GeocodeResult } from "@/lib/types/gis";

function assertClaimCited(claim: CitedClaim): void {
  expect(claim.text.length).toBeGreaterThan(0);
  expect(claim.sources.length).toBeGreaterThanOrEqual(1);
  for (const source of claim.sources) {
    expect(source.href).toMatch(/^https:\/\//);
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

describe("SF buyer guides corpus", () => {
  it("exposes three GUIDE_LINKS with correct slugs and hrefs", () => {
    expect(GUIDE_LINKS).toHaveLength(3);
    const slugs = GUIDE_LINKS.map((g) => g.slug);
    expect(slugs).toEqual([
      "tiny-home-on-wheels-san-francisco",
      "tiny-home-cost-matrix",
      "wheels-vs-foundation",
    ]);
    for (const link of GUIDE_LINKS) {
      expect(link.href).toBe(`/guides/${link.slug}`);
      expect(isGuideSlug(link.slug)).toBe(true);
    }
  });

  it("THOW guide claims carry official sources", () => {
    expect(SF_THOW_SECTIONS.length).toBeGreaterThan(0);
    for (const section of SF_THOW_SECTIONS) {
      for (const claim of section.claims) {
        assertClaimCited(claim);
      }
    }
  });

  it("cost matrix includes crane, trenching $1,000–$5,000+, and permitFees", () => {
    const ids = COST_LINE_ITEMS.map((l) => l.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "crane",
        "trenching",
        "permitFees",
        "foundation",
        "delivery",
        "contingency",
      ]),
    );
    const trenching = COST_LINE_ITEMS.find((l) => l.id === "trenching");
    expect(trenching).toBeDefined();
    expect(trenching!.amounts.diy).toMatch(/\$1,000–\$5,000\+/);
    expect(trenching!.amounts.turnkeyThow).toMatch(/\$1,000–\$5,000\+/);
    expect(trenching!.amounts.foundationAdu).toMatch(/\$1,000–\$5,000\+/);
  });

  it("wheels-vs-foundation has decision nodes and comparison rows", () => {
    expect(DECISION_NODES.length).toBeGreaterThanOrEqual(3);
    expect(COMPARISON_ROWS.some((r) => r.id === "financing")).toBe(true);
    expect(COMPARISON_ROWS.some((r) => r.id === "insurance")).toBe(true);
  });
});

describe("composeResultsBriefing guideLinks", () => {
  it("attaches SF catalog links on California briefings", () => {
    const report = evaluateEligibility(mockProperties["addr-r1-clean"]!);
    const briefing = composeResultsBriefing({
      geocode: sfGeocode,
      report,
    });
    expect(briefing.guideLinks).toHaveLength(3);
    expect(briefing.guideLinks[0]?.href).toBe(
      "/guides/tiny-home-on-wheels-san-francisco",
    );
  });

  it("omits guideLinks for unpublished states", () => {
    const briefing = composeResultsBriefing({
      geocode: {
        ...sfGeocode,
        place: "Austin",
        region: "TX",
        formattedAddress: "100 Congress Ave, Austin, TX",
      },
      report: null,
    });
    expect(briefing.guideLinks).toEqual([]);
  });
});

describe("affiliate catalog (eligible monetization data)", () => {
  it("covers blueprints, offGridHardware, and turnkeyKits with env keys", () => {
    expect(Object.keys(AFFILIATE_CATEGORY_LABELS)).toEqual(
      expect.arrayContaining(["blueprints", "offGridHardware", "turnkeyKits"]),
    );
    const categories = new Set(AFFILIATE_OFFERS.map((o) => o.category));
    expect(categories.has("blueprints")).toBe(true);
    expect(categories.has("offGridHardware")).toBe(true);
    expect(categories.has("turnkeyKits")).toBe(true);
    for (const offer of AFFILIATE_OFFERS) {
      expect(offer.hrefEnvKey).toMatch(/^NEXT_PUBLIC_AFFILIATE_/);
      expect(offer.blurb.toLowerCase()).not.toMatch(
        /commission|payout|%\s*fee/,
      );
    }
    expect(AFFILIATE_FTC_DISCLOSURE.toLowerCase()).toMatch(/affiliate/);
  });

  it("does not put commission rates in visitor-facing catalog strings", () => {
    const blob = [
      AFFILIATE_FTC_DISCLOSURE,
      ...AFFILIATE_OFFERS.map((o) => `${o.title} ${o.blurb}`),
    ].join(" ");
    expect(blob).not.toMatch(/\$\d+\s*(per|\/)\s*lead/i);
    expect(blob).not.toMatch(/\d+%\s*commission/i);
  });

  it("resolves missing env hrefs to null and omits # placeholders", () => {
    const resolved = listResolvedAffiliateOffers();
    expect(
      resolved.every((o) => o.href === null || typeof o.href === "string"),
    ).toBe(true);
    expect(
      resolveAffiliateHref("NEXT_PUBLIC_AFFILIATE_UNKNOWN_URL"),
    ).toBeNull();
  });

  it("resolves affiliate hrefs via static NEXT_PUBLIC env property access", () => {
    const catalogSrc = readFileSync(
      path.join(process.cwd(), "src/lib/content/affiliates/catalog.ts"),
      "utf8",
    );
    expect(catalogSrc).not.toMatch(/process\.env\s*\[\s*hrefEnvKey\s*\]/);
    expect(catalogSrc).toMatch(
      /process\.env\.NEXT_PUBLIC_AFFILIATE_TUMBLEWEED_URL/,
    );
    expect(catalogSrc).toMatch(
      /process\.env\.NEXT_PUBLIC_AFFILIATE_TINY_PROJECT_URL/,
    );

    const key = "NEXT_PUBLIC_AFFILIATE_TUMBLEWEED_URL";
    const prev = process.env[key];
    try {
      process.env[key] = "https://example.com/tumbleweed?ref=test";
      expect(resolveAffiliateHref(key)).toBe(
        "https://example.com/tumbleweed?ref=test",
      );

      process.env[key] = "  #  ";
      expect(resolveAffiliateHref(key)).toBeNull();

      process.env[key] = "   ";
      expect(resolveAffiliateHref(key)).toBeNull();

      delete process.env[key];
      expect(resolveAffiliateHref(key)).toBeNull();
    } finally {
      if (prev === undefined) delete process.env[key];
      else process.env[key] = prev;
    }
  });
});

describe("monetization gating in UI sources", () => {
  const featuresRoot = path.join(process.cwd(), "src/components/features");

  it("page bifurcates PartnerOffers by overall and hides lead on eligible", () => {
    const page = readFileSync(
      path.join(process.cwd(), "src/app/page.tsx"),
      "utf8",
    );
    expect(page).toMatch(/PartnerOffers/);
    expect(page).toMatch(/intent=\{report\.overall\}/);
    expect(page).toMatch(/searchId/);
    expect(page).toMatch(/crypto\.randomUUID/);
    expect(page).not.toMatch(
      /overall === "eligible"[\s\S]{0,80}LeadFallbackForm/,
    );
    expect(
      readFileSync(
        path.join(featuresRoot, "ResultsCard/ResultsCard.tsx"),
        "utf8",
      ),
    ).not.toMatch(/EligibleNextSteps/);
  });

  it("LeadFallbackForm includes budget + intent and restricted pivot copy", () => {
    const form = readFileSync(
      path.join(featuresRoot, "LeadFallbackForm/LeadFallbackForm.tsx"),
      "utf8",
    );
    expect(form).toMatch(/lead-intent/);
    expect(form).toMatch(/lead-budget/);
    expect(form).toMatch(/restricted_review/);
    expect(form).toMatch(/permanent-foundation ADU pathway/i);
    expect(form).toMatch(/data-lead-form="restricted"/);
  });

  it("page shows lead form for warning and restricted, not eligible", () => {
    const page = readFileSync(
      path.join(process.cwd(), "src/app/page.tsx"),
      "utf8",
    );
    expect(page).toMatch(/overall === "restricted"/);
    expect(page).toMatch(/overall === "warning"/);
    expect(page).toMatch(/LeadFallbackForm/);
    expect(page).toMatch(/variant="warning"/);
    expect(page).not.toMatch(
      /overall === "eligible"[\s\S]{0,80}LeadFallbackForm/,
    );
  });

  it("Parcel briefing chrome is retitled", () => {
    const briefing = readFileSync(
      path.join(featuresRoot, "ResultsCard/ResultsBriefing.tsx"),
      "utf8",
    );
    expect(briefing).toMatch(/Parcel briefing/);
    expect(briefing).not.toMatch(/Tiny-home briefing/);
  });

  it("Guides appear in header and footer nav", () => {
    const header = readFileSync(
      path.join(featuresRoot, "SiteHeader/SiteHeader.tsx"),
      "utf8",
    );
    const footer = readFileSync(
      path.join(featuresRoot, "SiteFooter/SiteFooter.tsx"),
      "utf8",
    );
    expect(header).toMatch(/href: "\/guides"/);
    expect(footer).toMatch(/href: "\/guides"/);
  });
});

describe("restricted_review lead schema", () => {
  it("accepts a valid restricted_review payload", () => {
    const parsed = leadBodySchema.safeParse({
      type: "restricted_review",
      name: "Ada",
      email: "ada@example.com",
      address: "1 Market St, San Francisco, CA",
      lat: 37.79,
      lng: -122.39,
      intent: "adu_workaround",
      budget: "150k_350k",
      overallStatus: "restricted",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid restricted payloads", () => {
    const missingIntent = restrictedReviewBodySchema.safeParse({
      type: "restricted_review",
      name: "Ada",
      email: "ada@example.com",
      address: "1 Market St",
      lat: 37.79,
      lng: -122.39,
      budget: "under_50k",
    });
    expect(missingIntent.success).toBe(false);

    const badEmail = leadBodySchema.safeParse({
      type: "restricted_review",
      name: "Ada",
      email: "not-an-email",
      address: "1 Market St",
      lat: 37.79,
      lng: -122.39,
      intent: "other",
      budget: "unsure",
    });
    expect(badEmail.success).toBe(false);
  });

  it("still accepts Connect project leads", () => {
    const parsed = leadBodySchema.safeParse({
      type: "project",
      name: "Ada",
      email: "ada@example.com",
      address: "1 Market St",
      lat: 37.79,
      lng: -122.39,
      propertyIntent: "primary",
      structure: "permanent_adu",
      budget: "50k_150k",
    });
    expect(parsed.success).toBe(true);
  });
});
