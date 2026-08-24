"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { AnalysisInterstitial } from "@/components/features/AnalysisInterstitial/AnalysisInterstitial";
import { ConnectSection } from "@/components/features/ConnectPage/ConnectSection";
import { ResultsCard } from "@/components/features/ResultsCard/ResultsCard";
import {
  CONNECT_SECTION_ID,
  parseConnectOverallStatus,
  parseConnectPrefill,
} from "@/lib/content/connect-url";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

type ZoningApiSuccess = {
  report: ZoningReport | null;
  coverage: "lot" | "jurisdiction";
  provider?: string | null;
};

function parseZoningPayload(data: unknown): ZoningApiSuccess | null {
  if (!data || typeof data !== "object") return null;

  if ("coverage" in data) {
    const coverage = (data as { coverage?: unknown }).coverage;
    if (coverage !== "lot" && coverage !== "jurisdiction") return null;
    const report = (data as { report?: unknown }).report;
    const providerRaw = (data as { provider?: unknown }).provider;
    const provider =
      typeof providerRaw === "string"
        ? providerRaw
        : providerRaw === null
          ? null
          : undefined;
    if (report === null) {
      return { report: null, coverage, provider: provider ?? null };
    }
    if (report && typeof report === "object" && "overall" in report) {
      return {
        report: report as ZoningReport,
        coverage,
        provider: provider ?? null,
      };
    }
    return null;
  }

  if ("overall" in data && "zoning" in data) {
    return { report: data as ZoningReport, coverage: "lot" };
  }

  return null;
}

export function HomePageClient() {
  const searchParams = useSearchParams();
  const queryPrefill = parseConnectPrefill(searchParams);
  const queryStatus = parseConnectOverallStatus(searchParams);

  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    null,
  );
  const [report, setReport] = useState<ZoningReport | null>(null);
  const [isZoningLoading, setIsZoningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantsConnect, setWantsConnect] = useState(false);
  const zoningAbortRef = useRef<AbortController | null>(null);
  const appliedQueryKeyRef = useRef<string | null>(null);

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
      url.searchParams.set("addressId", result.addressId);
      if (result.place) url.searchParams.set("place", result.place);
      if (result.county) url.searchParams.set("county", result.county);
      if (result.region) url.searchParams.set("region", result.region);
      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) {
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
      if (parsed.report) {
        setReport({
          ...parsed.report,
          formattedAddress: result.formattedAddress,
          coverage: parsed.coverage,
          zoningProvider:
            parsed.provider ?? parsed.report.zoningProvider ?? null,
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

  const handleNewSearch = useCallback(() => {
    zoningAbortRef.current?.abort();
    setGeocodeResult(null);
    setReport(null);
    setError(null);
    setIsZoningLoading(false);
    setWantsConnect(false);
    appliedQueryKeyRef.current = null;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  const queryKey = searchParams.toString();
  useEffect(() => {
    if (!queryPrefill || queryKey === appliedQueryKeyRef.current) {
      return;
    }
    appliedQueryKeyRef.current = queryKey;
    void handleResolved(queryPrefill);
  }, [queryKey, queryPrefill, handleResolved]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.replace("#", "") === CONNECT_SECTION_ID) {
      setWantsConnect(true);
    }
  }, []);

  const showInterstitial = Boolean(geocodeResult) && isZoningLoading;
  const showDashboard = Boolean(geocodeResult) && !isZoningLoading;
  const connectOverallStatus = report?.overall ?? queryStatus;
  const compact = Boolean(geocodeResult);
  const showConnect =
    showDashboard && Boolean(geocodeResult) && Boolean(report) && !error;
  const showConnectPrompt = wantsConnect && !geocodeResult && !isZoningLoading;

  useEffect(() => {
    if (!showConnect || typeof window === "undefined") {
      return;
    }
    if (window.location.hash.replace("#", "") !== CONNECT_SECTION_ID) {
      return;
    }
    const target = document.getElementById(CONNECT_SECTION_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showConnect, geocodeResult?.addressId]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-layout flex-1 scroll-mt-4 space-y-8 bg-surface-luxury px-4 py-6 text-text-luxury sm:space-y-12 sm:px-6 sm:py-12"
    >
      <div className="search-enter space-y-6 sm:space-y-8">
        {showConnectPrompt ? (
          <p
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
          >
            Search a California address first — builder intro and specialist
            review forms appear after your parcel check.
          </p>
        ) : null}

        <AddressSearch
          onResolved={handleResolved}
          onError={handleSearchError}
          error={error}
          compact={compact}
          showSampleReports={!geocodeResult}
          onNewSearch={geocodeResult ? handleNewSearch : undefined}
        />

        {showInterstitial && geocodeResult ? (
          <AnalysisInterstitial
            lat={geocodeResult.lat}
            lng={geocodeResult.lng}
            address={geocodeResult.formattedAddress}
          />
        ) : null}

        {showDashboard && geocodeResult ? (
          <>
            <ResultsCard
              report={report}
              geocodeResult={geocodeResult}
              isLoading={false}
              zoningError={error}
              connectHref={`#${CONNECT_SECTION_ID}`}
              onRetry={() => void handleResolved(geocodeResult)}
            />
            {showConnect ? (
              <ConnectSection
                geocodeResult={geocodeResult}
                overallStatus={connectOverallStatus}
              />
            ) : null}
          </>
        ) : null}
      </div>

      <footer className="border-t border-border pt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        <p>
          Informational only — not legal advice. Confirm with local planning
          and building departments.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/privacy"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/guides"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Guides
          </Link>
          <Link
            href="/regulations"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Regulations
          </Link>
        </p>
      </footer>
    </main>
  );
}
