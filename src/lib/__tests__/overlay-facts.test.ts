import { describe, expect, it } from "vitest";
import { overlayFactLabel } from "@/lib/results/overlay-facts";

describe("overlayFactLabel", () => {
  it("does not label a negative overlay as Clear", () => {
    expect(overlayFactLabel(false, false)).toBe("Not shown on mapped layers");
    expect(overlayFactLabel(false, false)).not.toMatch(/clear/i);
  });

  it("keeps Detected and Not verified vocabulary", () => {
    expect(overlayFactLabel(true, false)).toBe("Detected");
    expect(overlayFactLabel(false, true)).toBe("Not verified");
  });
});
