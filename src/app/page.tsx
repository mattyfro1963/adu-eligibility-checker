"use client";

import { useCallback, useRef, useState } from "react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { AnalysisInterstitial } from "@/components/features/AnalysisInterstitial/AnalysisInterstitial";
import { ResultsCard } from "@/components/features/ResultsCard/ResultsCard";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

type ZoningApiSuccess = {
  report: ZoningReport | null;
  coverage: "lot" | "none";
  provider?: string | null;
};

function buildConnectHref(
  result: GeocodeResult,
  overall?: ZoningReport["overall"] | null,
): string {
  const url = new URL("/connect", "http://local.invalid");
  url.searchParams.set("address", result.formattedAddress);
  url.searchParams.set("lat", String(result.lat));
  url.searchParams.set("lng", String(result.lng));
  if (result.place) url.searchParams.set("place", result.place);
  if (result.county) url.searchParams.set("county", result.county);
  if (result.region) url.searchParams.set("region", result.region);
  if (result.postcode) url.searchParams.set("postcode", result.postcode);
  if (overall) url.searchParams.set("status", overall);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function parseZoningPayload(data: unknown): ZoningApiSuccess | null {
  if (!data || typeof data !== "object") return null;

  // Phase 2 envelope: { report, coverage }
  if ("coverage" in data) {
    const coverage = (data as { coverage?: unknown }).coverage;
    if (coverage !== "lot" && coverage !== "none") return null;
    const report = (data as { report?: unknown }).report;
    if (report === null) {
      return { report: null, coverage };
    }
    if (report && typeof report === "object" && "overall" in report) {
      return { report: report as ZoningReport, coverage };
    }
    return null;
  }

  // Legacy bare ZoningReport (overall present, no coverage wrapper).
  if ("overall" in data && "zoning" in data) {
    return { report: data as ZoningReport, coverage: "lot" };
  }

  return null;
}

export default function HomePage() {
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    null,
  );
  const [report, setReport] = useState<ZoningReport | null>(null);
  const [isZoningLoading, setIsZoningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zoningAbortRef = useRef<AbortController | null>(null);

  const handleResolved = useCallback(async (result: GeocodeResult) => {
    setGeocodeResult(result);
    zoningAbortRef.current?.abort();
    const controller = new AbortController();
    zoningAbortRef.current = controller;

    setIsZoningLoading(true);
    setError(null);
    setReport(null);

    try {
      const url = new URL("/api/zoning", window.location.origin);
      url.searchParams.set("lat", String(result.lat));
      url.searchParams.set("lng", String(result.lng));
      url.searchParams.set("address", result.formattedAddress);
      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) {
        // Uncovered counties return 200 + coverage:none; only transport/5xx here.
        const body: unknown = await res.json().catch(() => null);
        const message =
          body &&
          typeof body === "object" &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Failed to fetch zoning report";
        throw new Error(message);
      }
      const data: unknown = await res.json();
      const parsed = parseZoningPayload(data);
      if (!parsed) {
        throw new Error("Invalid zoning response");
      }
      // coverage:none is expected for most CA — keep report null, no rose error.
      if (parsed.report) {
        setReport({
          ...parsed.report,
          formattedAddress: result.formattedAddress,
        });
      } else {
        setReport(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      if (!controller.signal.aborted) {
        setIsZoningLoading(false);
      }
    }
  }, []);

  const handleSearchError = useCallback((message: string) => {
    setError(message);
  }, []);

  const showInterstitial = Boolean(geocodeResult) && isZoningLoading;
  const showDashboard = Boolean(geocodeResult) && !isZoningLoading;
  const connectHref =
    geocodeResult != null
      ? buildConnectHref(geocodeResult, report?.overall ?? null)
      : "/connect";
  const compact = Boolean(geocodeResult);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-editorial flex-1 px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="search-enter space-y-6 sm:space-y-8">
        <AddressSearch
          onResolved={handleResolved}
          onError={handleSearchError}
          error={error}
          compact={compact}
          showDemoScenarios={false}
        />

        {showInterstitial && geocodeResult ? (
          <AnalysisInterstitial
            lat={geocodeResult.lat}
            lng={geocodeResult.lng}
            address={geocodeResult.formattedAddress}
          />
        ) : null}

        {showDashboard ? (
          <ResultsCard
            report={report}
            geocodeResult={geocodeResult}
            isLoading={false}
            zoningError={error}
            connectHref={connectHref}
          />
        ) : null}
      </div>
    </main>
  );
}
