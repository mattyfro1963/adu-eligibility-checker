"use client";

import { useCallback, useRef, useState } from "react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { ResultsCard } from "@/components/features/ResultsCard/ResultsCard";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import { Spinner } from "@/components/ui/Spinner";
import { env } from "@/lib/env";
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
      const url = new URL("/api/zoning", env.NEXT_PUBLIC_API_URL);
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <AddressSearch onResolved={handleResolved} onError={handleSearchError} />

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
        >
          {error}
        </div>
      ) : null}

      {isZoningLoading ? (
        <Spinner label="Checking eligibility…" />
      ) : report?.overall === "restricted" ? (
        <LeadFallbackForm
          address={geocodeResult?.formattedAddress ?? report.formattedAddress}
        />
      ) : report ? (
        <ResultsCard report={report} />
      ) : null}
    </main>
  );
}
