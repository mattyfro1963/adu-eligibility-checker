"use client";

import { useCallback, useRef, useState } from "react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { AnalysisInterstitial } from "@/components/features/AnalysisInterstitial/AnalysisInterstitial";
import { GetQuotesModal } from "@/components/features/GetQuotesModal/GetQuotesModal";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import { PartnerOffers } from "@/components/features/PartnerOffers/PartnerOffers";
import { ResultsCard } from "@/components/features/ResultsCard/ResultsCard";
import { ValueProps } from "@/components/features/ValueProps/ValueProps";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

function buildConnectHref(
  result: GeocodeResult,
  overall?: ZoningReport["overall"] | null,
): string {
  const url = new URL("/connect", "http://local.invalid");
  url.searchParams.set("address", result.formattedAddress);
  url.searchParams.set("lat", String(result.lat));
  url.searchParams.set("lng", String(result.lng));
  if (result.place) url.searchParams.set("place", result.place);
  if (result.region) url.searchParams.set("region", result.region);
  if (result.postcode) url.searchParams.set("postcode", result.postcode);
  if (overall) url.searchParams.set("status", overall);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export default function HomePage() {
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    null,
  );
  const [report, setReport] = useState<ZoningReport | null>(null);
  const [isZoningLoading, setIsZoningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const zoningAbortRef = useRef<AbortController | null>(null);

  const handleResolved = useCallback(async (result: GeocodeResult) => {
    setGeocodeResult(result);
    setQuotesOpen(false);
    zoningAbortRef.current?.abort();
    const controller = new AbortController();
    zoningAbortRef.current = controller;

    setIsZoningLoading(true);
    setError(null);
    setReport(null);
    setSearchId(null);

    try {
      // Same-origin relative URL — avoids apex↔www redirect breaking fetch.
      const url = new URL("/api/zoning", window.location.origin);
      url.searchParams.set("lat", String(result.lat));
      url.searchParams.set("lng", String(result.lng));
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
      const data = (await res.json()) as ZoningReport;
      setReport({
        ...data,
        formattedAddress: result.formattedAddress,
      });
      setSearchId(crypto.randomUUID());
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12 md:py-16">
      <AddressSearch
        onResolved={handleResolved}
        onError={handleSearchError}
        error={error}
      />

      {!geocodeResult ? <ValueProps /> : null}

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
          onGetQuotes={() => setQuotesOpen(true)}
        />
      ) : null}

      {report?.overall === "warning" && geocodeResult && !isZoningLoading ? (
        <LeadFallbackForm
          variant="warning"
          address={geocodeResult.formattedAddress}
          lat={geocodeResult.lat}
          lng={geocodeResult.lng}
          overallStatus="warning"
        />
      ) : null}

      {report?.overall === "restricted" && geocodeResult && !isZoningLoading ? (
        <LeadFallbackForm
          address={geocodeResult.formattedAddress}
          lat={geocodeResult.lat}
          lng={geocodeResult.lng}
          overallStatus="restricted"
        />
      ) : null}

      {report && searchId && !isZoningLoading ? (
        <PartnerOffers
          intent={report.overall}
          searchId={searchId}
          compact={report.overall !== "eligible"}
        />
      ) : null}

      {geocodeResult ? (
        <GetQuotesModal
          open={quotesOpen}
          onOpenChange={setQuotesOpen}
          geocodeResult={geocodeResult}
          overallStatus={report?.overall ?? null}
        />
      ) : null}
    </main>
  );
}
