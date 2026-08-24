import { describe, expect, it } from "vitest";
import { SAMPLE_REPORTS } from "@/lib/content/sample-reports";
import { lookupParcel } from "@/lib/adapters/zoning-lookup";
import { formatParcelAddress } from "@/lib/address/format-parcel-address";
import { composeResultsBriefing } from "@/lib/regulations/compose-briefing";
import { evaluateEligibility, evaluateJurisdictionContext } from "@/lib/rules";
import type { GeocodeResult } from "@/lib/types/gis";

/**
 * Census Bureau one-line matches (Public_AR_Current) for SAMPLE_REPORTS queries.
 * Pins live DataSF / jurisdiction outcomes — not mock parcels.
 */
const CENSUS_MATCHES: Record<
  string,
  Pick<
    GeocodeResult,
    "formattedAddress" | "place" | "county" | "postcode" | "lat" | "lng"
  >
> = {
  parkside: {
    formattedAddress: "2000 16th Ave, San Francisco, CA 94116",
    place: "San Francisco",
    county: "San Francisco",
    postcode: "94116",
    lat: 37.750594022208,
    lng: -122.472927419609,
  },
  richmond: {
    formattedAddress: "250 32nd Ave, San Francisco, CA 94121",
    place: "San Francisco",
    county: "San Francisco",
    postcode: "94121",
    lat: 37.784339340881,
    lng: -122.492494412579,
  },
  "los-angeles": {
    formattedAddress: "400 S June St, Los Angeles, CA 90020",
    place: "Los Angeles",
    county: "Los Angeles",
    postcode: "90020",
    lat: 34.066809851816,
    lng: -118.334128130858,
  },
  "long-beach": {
    formattedAddress: "2100 E 4th St, Long Beach, CA 90814",
    place: "Long Beach",
    county: "Los Angeles",
    postcode: "90814",
    lat: 33.771637847131,
    lng: -118.16670542451,
  },
  "san-diego": {
    formattedAddress: "3010 30th St, San Diego, CA 92104",
    place: "San Diego",
    county: "San Diego",
    postcode: "92104",
    lat: 32.736686757454,
    lng: -117.12936371755,
  },
  "san-jose": {
    formattedAddress: "1170 Lincoln Ave, San Jose, CA 95125",
    place: "San Jose",
    county: "Santa Clara",
    postcode: "95125",
    lat: 37.307305632375,
    lng: -121.900158871413,
  },
  sacramento: {
    formattedAddress: "1000 21st St, Sacramento, CA 95811",
    place: "Sacramento",
    county: "Sacramento",
    postcode: "95811",
    lat: 38.576299092446,
    lng: -121.47865079655,
  },
  "oakland-piedmont": {
    formattedAddress: "3800 Piedmont Ave, Oakland, CA 94611",
    place: "Oakland",
    county: "Alameda",
    postcode: "94611",
    lat: 37.82389818115,
    lng: -122.255582728622,
  },
  irvine: {
    formattedAddress: "1 Civic Center Plz, Irvine, CA 92606",
    place: "Irvine",
    county: "Orange",
    postcode: "92606",
    lat: 33.687526467912,
    lng: -117.826300567237,
  },
  downtown: {
    formattedAddress: "1 Market St, San Francisco, CA 94105",
    place: "San Francisco",
    county: "San Francisco",
    postcode: "94105",
    lat: 37.794409085395,
    lng: -122.394694960214,
  },
  "california-street": {
    formattedAddress: "555 California St, San Francisco, CA 94104",
    place: "San Francisco",
    county: "San Francisco",
    postcode: "94104",
    lat: 37.792618649436,
    lng: -122.404136225181,
  },
  "potrero-pdr": {
    formattedAddress: "2500 Marin St, San Francisco, CA 94124",
    place: "San Francisco",
    county: "San Francisco",
    postcode: "94124",
    lat: 37.748225219011,
    lng: -122.402760513919,
  },
};

const SF_HOST = /sfplanning\.org|sf\.gov|data\.sfgov\.org|sfplanninggis\.org/i;

/** Direct local ADU / planning pages expected on non-SF chip summaries. */
const LOCAL_SUMMARY_HOST: Record<string, RegExp> = {
  "los-angeles": /dbs\.lacity\.gov|planning\.lacity\.gov/i,
  "long-beach": /longbeach\.gov/i,
  "san-diego": /sandiego\.gov/i,
  "san-jose": /sanjoseca\.gov/i,
  sacramento: /cityofsacramento\.gov/i,
  "oakland-piedmont": /oaklandca\.gov/i,
  irvine: /cityofirvine\.gov/i,
};

const SF_ZONING: Record<string, RegExp> = {
  parkside: /^RH-1/,
  richmond: /^RH-1/,
  downtown: /^P$/,
  "california-street": /^C-3/,
  "potrero-pdr": /^PDR/,
};

async function reportFor(id: string) {
  const sample = SAMPLE_REPORTS.find((s) => s.id === id);
  const geo = CENSUS_MATCHES[id];
  if (!sample || !geo) throw new Error(`Missing sample ${id}`);

  const geocode: GeocodeResult = {
    addressId: `${geo.lat},${geo.lng}`,
    streetLine: geo.formattedAddress.split(",")[0] ?? sample.query,
    region: "CA",
    ...geo,
  };

  const lookup = await lookupParcel(geo.lat, geo.lng, geo.formattedAddress);
  const report =
    lookup.parcel && lookup.coverage === "lot"
      ? evaluateEligibility(lookup.parcel)
      : evaluateJurisdictionContext(geocode);
  const briefing = composeResultsBriefing({ geocode, report });
  return { sample, geocode, lookup, report, briefing };
}

describe("SAMPLE_REPORTS parcel summaries", () => {
  it("covers every catalog chip", () => {
    expect(SAMPLE_REPORTS.map((s) => s.id).sort()).toEqual(
      Object.keys(CENSUS_MATCHES).sort(),
    );
  });

  it(
    "produces cited, city-accurate summaries whose chip tone matches the engine",
    async () => {
    for (const sample of SAMPLE_REPORTS) {
      const { geocode, lookup, report, briefing } = await reportFor(sample.id);
      const summarySources = briefing.summary.flatMap((c) => c.sources);
      const localReqs = briefing.requirements.filter(
        (r) => r.id.startsWith("county-") || r.id.startsWith("city-"),
      );
      const sfOnSummary = !/San Francisco/i.test(sample.label)
        ? summarySources.filter((s) => SF_HOST.test(s.href))
        : [];
      const lotClaim = briefing.summary.find((c) =>
        /^(On this |For this )/i.test(c.text),
      );
      const lotHrefs = lotClaim?.sources.map((s) => s.href) ?? [];

      expect(report.overall, `${sample.id} overall vs chip`).toBe(sample.tone);
      expect(
        briefing.summary.every(
          (c) =>
            c.text.length > 40 &&
            c.sources.length >= 1 &&
            c.sources.every(
              (s) => /^https:\/\//.test(s.href) && s.label.length > 0,
            ),
        ),
        `${sample.id} cited summary`,
      ).toBe(true);
      expect(
        /San Francisco/i.test(sample.label) || localReqs.length > 0,
        `${sample.id} local sources`,
      ).toBe(true);
      expect(sfOnSummary, `${sample.id} no SF hosts on non-SF summary`).toEqual(
        [],
      );
      // First summary claim is thowSummary (locked Green/Yellow/Red copy)
      expect(briefing.summary[0]?.text).toMatch(
        /Strong THOW candidate|Possible THOW candidate|Weak THOW candidate/,
      );
      expect(lotClaim, `${sample.id} lot/jurisdiction summary claim`).toBeDefined();
      expect(lotClaim?.text).toMatch(new RegExp(geocode.place, "i"));
      expect(lotClaim?.text).not.toMatch(/United States/i);
      expect(lotClaim?.text).not.toMatch(
        /RESIDENTIAL-\s*HOUSE|ONE FAMILY-\s*DETACHED/,
      );
      expect(lotClaim?.text).toMatch(/THOW/i);
      expect(lotClaim?.text).toMatch(/ADU pathway/i);
      expect(briefing.receipt.formattedAddress).toBe(
        formatParcelAddress(geocode),
      );
      expect(briefing.receipt.formattedAddress).not.toMatch(/United States/i);

      const receiptSf = !/San Francisco/i.test(sample.label)
        ? briefing.receipt.sourcesUsed.filter((s) => SF_HOST.test(s.href))
        : [];
      expect(receiptSf, `${sample.id} no SF hosts on non-SF receipt`).toEqual(
        [],
      );

      const localHost = LOCAL_SUMMARY_HOST[sample.id];
      if (localHost) {
        expect(
          summarySources.some((s) => localHost.test(s.href)),
          `${sample.id} local city source on summary`,
        ).toBe(true);
      }

      if (geocode.place === "San Francisco") {
        expect(lookup.coverage, `${sample.id} lot GIS`).toBe("lot");
        expect(report.analysisScope).toBe("lot_zoning");
        expect(report.zoning).toMatch(SF_ZONING[sample.id] ?? /./);
        expect(
          lotHrefs.some((href) => /data\.sfgov\.org\/d\/3i4a-hu95/.test(href)),
        ).toBe(true);
        expect(
          lotHrefs.some((href) => /codelibrary\.amlegal\.com/.test(href)),
        ).toBe(true);
      } else {
        expect(report.analysisScope).toBe("jurisdiction_context");
        expect(localReqs.flatMap((r) => r.sources).length).toBeGreaterThan(0);
      }
    }
  },
    30_000,
  );
});
