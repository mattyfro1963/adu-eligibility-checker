"use client";

import { useCallback, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { ResultsCard } from "@/components/features/ResultsCard/ResultsCard";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import type { GeocodeResult } from "@/lib/types/gis";
import type { ZoningReport } from "@/lib/types/zoning";

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

  const showResults = Boolean(geocodeResult) || Boolean(report);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-6 py-12 md:py-16">
      <AddressSearch onResolved={handleResolved} onError={handleSearchError} />

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm"
        >
          <AlertTriangle
            className="mt-0.5 shrink-0"
            size={18}
            aria-hidden="true"
          />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : null}

      {showResults ? (
        <ResultsCard
          report={report}
          geocodeResult={geocodeResult}
          isLoading={isZoningLoading}
        />
      ) : null}

      {report?.overall === "restricted" ? (
        <LeadFallbackForm
          address={geocodeResult?.formattedAddress ?? report.formattedAddress}
        />
      ) : null}
    </main>
  );
}
