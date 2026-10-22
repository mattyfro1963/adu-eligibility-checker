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
  const [wantsConnect, setWantsConnect] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.replace("#", "") === CONNECT_SECTION_ID;
  });
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

  const showDesk = Boolean(geocodeResult);
  const showInterstitial = showDesk && isZoningLoading;
  const showDashboard = showDesk && !isZoningLoading;
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
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [showConnect, geocodeResult?.addressId]);

  useEffect(() => {
    if (!geocodeResult || typeof window === "undefined") {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [geocodeResult?.addressId]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={
        compact
          ? "mx-auto w-full max-w-layout flex-1 scroll-mt-4 space-y-6 bg-surface-luxury px-4 py-5 text-text-luxury sm:space-y-8 sm:px-6 sm:py-6"
          : "w-full flex-1 scroll-mt-4 bg-surface-luxury text-text-luxury"
      }
    >
      <div className={compact ? "space-y-6 sm:space-y-8" : "search-enter"}>
        {showConnectPrompt ? (
          <p
            role="status"
            className={
              compact
                ? "border-b border-border-luxury pb-3 text-sm leading-relaxed text-luxury-taupe"
                : "mx-auto mt-4 max-w-layout px-4 text-sm leading-relaxed text-luxury-taupe sm:mt-6 sm:px-6"
            }
          >
            Search a CA, OR, or WA address first — builder intro and specialist
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

        {showDesk && geocodeResult ? (
          <>
            <ResultsCard
              report={report}
              geocodeResult={geocodeResult}
              isLoading={isZoningLoading}
              zoningError={error}
              connectHref={`#${CONNECT_SECTION_ID}`}
              onRetry={() => void handleResolved(geocodeResult)}
              reading={
                showInterstitial ? (
                  <AnalysisInterstitial
                    address={geocodeResult.formattedAddress}
                  />
                ) : null
              }
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

      <footer
        className={
          compact
            ? "border-t border-border-luxury pt-6 text-center text-[11px] leading-relaxed text-muted-foreground"
            : "mx-auto max-w-layout border-t border-border-luxury px-4 pt-6 pb-8 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6 sm:pb-12"
        }
      >
        <p className="font-label text-[11px] tracking-[0.22em] text-luxury-taupe">
          CA · OR · WA
        </p>
        <p className="mt-3">
          Informational only — not legal advice. Confirm with local planning and
          building departments.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/privacy"
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Terms
          </Link>
          <Link
            href="/guides"
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Guides
          </Link>
          <Link
            href="/regulations"
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Regulations
          </Link>
        </p>
      </footer>
    </main>
  );
}
