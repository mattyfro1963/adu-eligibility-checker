import { describe, expect, it } from "vitest";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_PARTNERS,
  affiliatesForIntent,
  type AffiliatePartner,
} from "@/lib/content/affiliates";
import { buildAffiliateHref } from "@/lib/affiliates/track";

const basePartner: AffiliatePartner = {
  id: "test-partner",
  name: "Test Partner",
  category: "solar_kits",
  blurb: "Test blurb",
  publicUrl: "https://example.com/products",
  trackingId: "",
  intents: ["eligible"],
};

describe("AFFILIATE_PARTNERS catalog", () => {
  it("covers all four categories and includes disclosure", () => {
    const categories = new Set(AFFILIATE_PARTNERS.map((p) => p.category));
    expect(categories).toEqual(
      new Set([
        "solar_kits",
        "composting_toilets",
        "trailer_chassis",
        "tiny_home_appliances",
      ]),
    );
    expect(AFFILIATE_DISCLOSURE.toLowerCase()).toMatch(/commission/);
    expect(AFFILIATE_DISCLOSURE.toLowerCase()).toMatch(/featured resources/);
  });

  it("assigns eligible full set, warning narrower, restricted chassis/off-grid heavy", () => {
    const eligible = affiliatesForIntent("eligible");
    const warning = affiliatesForIntent("warning");
    const restricted = affiliatesForIntent("restricted");

    expect(eligible.length).toBe(AFFILIATE_PARTNERS.length);
    expect(warning.length).toBeLessThan(eligible.length);
    expect(restricted.length).toBeLessThan(eligible.length);

    const restrictedCategories = new Set(restricted.map((p) => p.category));
    expect(restrictedCategories.has("trailer_chassis")).toBe(true);
    expect(restrictedCategories.has("solar_kits")).toBe(true);
    expect(restrictedCategories.has("tiny_home_appliances")).toBe(false);

    for (const partner of AFFILIATE_PARTNERS) {
      expect(partner.trackingId).toBe("");
      expect(partner.publicUrl).toMatch(/^https:\/\//);
    }
  });
});

describe("buildAffiliateHref", () => {
  it("appends utm params and sid when searchId is present", () => {
    const href = buildAffiliateHref(basePartner, {
      searchId: "search-abc",
      intent: "eligible",
    });
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://example.com/products");
    expect(url.searchParams.get("utm_source")).toBe("doihave.space");
    expect(url.searchParams.get("utm_medium")).toBe("affiliate");
    expect(url.searchParams.get("utm_campaign")).toBe("eligible");
    expect(url.searchParams.get("sid")).toBe("search-abc");
    expect(url.searchParams.has("ref")).toBe(false);
  });

  it("omits sid when searchId is absent", () => {
    const href = buildAffiliateHref(basePartner, { intent: "warning" });
    const url = new URL(href);
    expect(url.searchParams.get("utm_campaign")).toBe("warning");
    expect(url.searchParams.has("sid")).toBe(false);
    expect(url.searchParams.has("ref")).toBe(false);
  });

  it("omits ref when trackingId is empty string", () => {
    const href = buildAffiliateHref(
      { ...basePartner, trackingId: "" },
      { searchId: "sid-1", intent: "restricted" },
    );
    const url = new URL(href);
    expect(url.searchParams.has("ref")).toBe(false);
    expect(url.searchParams.get("sid")).toBe("sid-1");
    expect(url.searchParams.get("utm_campaign")).toBe("restricted");
  });

  it("sets ref when trackingId is non-empty", () => {
    const href = buildAffiliateHref(
      { ...basePartner, trackingId: "aff-network-99" },
      { searchId: "sid-2", intent: "eligible" },
    );
    const url = new URL(href);
    expect(url.searchParams.get("ref")).toBe("aff-network-99");
    expect(url.searchParams.get("sid")).toBe("sid-2");
  });

  it("preserves existing query params on publicUrl", () => {
    const href = buildAffiliateHref(
      {
        ...basePartner,
        publicUrl: "https://example.com/shop?sku=solar-1",
      },
      { intent: "eligible" },
    );
    const url = new URL(href);
    expect(url.searchParams.get("sku")).toBe("solar-1");
    expect(url.searchParams.get("utm_source")).toBe("doihave.space");
  });
});
