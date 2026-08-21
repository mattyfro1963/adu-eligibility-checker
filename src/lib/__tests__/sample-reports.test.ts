import { describe, expect, it } from "vitest";
import { SAMPLE_REPORTS } from "@/lib/content/sample-reports";
import { mockPropertyList } from "@/lib/mock/properties";

const SPOILER =
  /\b(eligible|warning|restricted|historic|coastal|commercial)\b/i;

function catalogWouldCapture(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return mockPropertyList.some(
    (p) =>
      p.formattedAddress.toLowerCase() === normalized ||
      p.formattedAddress.toLowerCase().includes(normalized) ||
      p.addressId.toLowerCase() === normalized,
  );
}

describe("SAMPLE_REPORTS catalog", () => {
  it("has unique ids and queries only — no mock geocode payloads", () => {
    const ids = SAMPLE_REPORTS.map((s) => s.id);
    const queries = SAMPLE_REPORTS.map((s) => s.query);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(queries).size).toBe(queries.length);

    for (const sample of SAMPLE_REPORTS) {
      expect(sample).not.toHaveProperty("geocodeResult");
      expect(sample.query).toMatch(/, CA(?:\s+\d{5})?$/);
      expect(sample.label).toMatch(/, CA$/);
      expect(sample.label).toMatch(
        /San Francisco|Oakland|Los Angeles|Long Beach|San Diego|Irvine|San Jose|Sacramento|Orange County|East Bay/,
      );
      expect(sample.label).not.toMatch(SPOILER);
      expect(sample.query).not.toMatch(SPOILER);
      expect(["eligible", "warning", "restricted"]).toContain(sample.tone);
    }
  });

  it("lists two lot-GIS eligible, seven jurisdiction warnings, and three restricted chips", () => {
    const eligible = SAMPLE_REPORTS.filter((s) => s.tone === "eligible");
    const warning = SAMPLE_REPORTS.filter((s) => s.tone === "warning");
    const restricted = SAMPLE_REPORTS.filter((s) => s.tone === "restricted");
    expect(eligible).toHaveLength(2);
    expect(warning).toHaveLength(7);
    expect(restricted).toHaveLength(3);
    expect(eligible.every((s) => /San Francisco/.test(s.label))).toBe(true);
    expect(warning.map((s) => s.id).sort()).toEqual(
      [
        "irvine",
        "long-beach",
        "los-angeles",
        "oakland-piedmont",
        "sacramento",
        "san-diego",
        "san-jose",
      ].sort(),
    );
    expect(restricted.map((s) => s.id).sort()).toEqual(
      ["california-street", "downtown", "potrero-pdr"].sort(),
    );
  });

  it("does not reuse mock catalog streets (would pin demo-fact parcels)", () => {
    for (const sample of SAMPLE_REPORTS) {
      expect(catalogWouldCapture(sample.query)).toBe(false);
    }
  });
});
