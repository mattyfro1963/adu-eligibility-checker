import { describe, expect, it } from "vitest";
import { isRegridEnabled, resolveMapboxAccessToken } from "@/lib/env";

describe("resolveMapboxAccessToken", () => {
  it("prefers MAPBOX_ACCESS_TOKEN when both are set", () => {
    expect(
      resolveMapboxAccessToken({
        MAPBOX_ACCESS_TOKEN: "pk.primary",
        VITE_MAPBOX_ACCESS_TOKEN: "pk.vite",
      }),
    ).toBe("pk.primary");
  });

  it("falls back to VITE_MAPBOX_ACCESS_TOKEN when primary is unset", () => {
    expect(
      resolveMapboxAccessToken({
        VITE_MAPBOX_ACCESS_TOKEN: "pk.vite",
      }),
    ).toBe("pk.vite");
  });

  it("treats empty / whitespace primary as missing and uses Vite fallback", () => {
    expect(
      resolveMapboxAccessToken({
        MAPBOX_ACCESS_TOKEN: " ",
        VITE_MAPBOX_ACCESS_TOKEN: "pk.vite",
      }),
    ).toBe("pk.vite");
  });

  it("returns undefined when neither token is set", () => {
    expect(resolveMapboxAccessToken({})).toBeUndefined();
  });
});

describe("isRegridEnabled", () => {
  it("is false when REGRID_ENABLED is unset (default free path)", () => {
    expect(isRegridEnabled()).toBe(false);
  });
});
