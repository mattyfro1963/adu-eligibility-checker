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
      expect(sample.label.length).toBeGreaterThan(0);
      expect(sample.label).not.toMatch(SPOILER);
      expect(sample.query).not.toMatch(SPOILER);
    }
  });

  it("does not reuse mock catalog streets (would pin demo-fact parcels)", () => {
    for (const sample of SAMPLE_REPORTS) {
      expect(catalogWouldCapture(sample.query)).toBe(false);
    }
  });
});
