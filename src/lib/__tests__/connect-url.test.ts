import { describe, expect, it } from "vitest";
import {
  CONNECT_SECTION_ID,
  buildConnectHref,
  buildConnectRedirectPath,
  parseConnectOverallStatus,
  parseConnectPrefill,
} from "@/lib/content/connect-url";

describe("connect-url", () => {
  it("builds shareable deep links to /#connect", () => {
    const href = buildConnectHref(
      {
        addressId: "abc",
        formattedAddress: "1 Main St, SF, CA",
        streetLine: "1 Main St",
        place: "San Francisco",
        county: "San Francisco",
        region: "CA",
        postcode: "94102",
        lat: 37.77,
        lng: -122.42,
      },
      "eligible",
    );
    expect(href).toContain(`#${CONNECT_SECTION_ID}`);
    expect(href).toContain("address=1+Main+St");
    expect(href).toContain("status=eligible");
    expect(href.startsWith("/?")).toBe(true);
  });

  it("redirects legacy /connect query params to /", () => {
    const target = buildConnectRedirectPath({
      address: "1 Main St",
      lat: "37.77",
      lng: "-122.42",
      status: "warning",
      junk: "drop-me",
    });
    expect(target).toBe(
      "/?address=1+Main+St&lat=37.77&lng=-122.42&status=warning#connect",
    );
  });

  it("parses prefill and status from search params", () => {
    const params = new URLSearchParams(
      "address=1+Main&lat=37.7&lng=-122.4&status=restricted",
    );
    const prefill = parseConnectPrefill(params);
    expect(prefill?.formattedAddress).toBe("1 Main");
    expect(parseConnectOverallStatus(params)).toBe("restricted");
  });
});
