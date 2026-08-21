"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPinned } from "lucide-react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { ConnectSection } from "@/components/features/ConnectPage/ConnectSection";
import {
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { Button } from "@/components/ui/button";
import {
  parseConnectOverallStatus,
  parseConnectPrefill,
} from "@/lib/content/connect-url";
import type { GeocodeResult } from "@/lib/types/gis";
import type { EligibilityStatus, ZoningReport } from "@/lib/types/zoning";

/**
 * Standalone connect shell — superseded by unified `/` landing.
 * Kept for composition/tests; `/connect` route redirects to `/#connect`.
 */
export function ConnectPage() {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const queryPrefill = parseConnectPrefill(searchParams);
  const queryStatus = parseOverallStatus(searchParams);

  const [clearedQuery, setClearedQuery] = useState(false);
  const [manualResult, setManualResult] = useState<GeocodeResult | null>(null);
  const [manualStatus, setManualStatus] = useState<EligibilityStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [appliedQueryKey, setAppliedQueryKey] = useState(queryKey);

  if (queryKey !== appliedQueryKey) {
    setAppliedQueryKey(queryKey);
    setClearedQuery(false);
    setManualResult(null);
    setManualStatus(null);
  }

  const geocodeResult = clearedQuery
    ? manualResult
    : (manualResult ?? queryPrefill);
  const overallStatus = clearedQuery
    ? manualStatus
    : (manualStatus ?? queryStatus);

  const fetchOptionalZoning = useCallback(async (result: GeocodeResult) => {
    try {
      const url = new URL("/api/zoning", window.location.origin);
      url.searchParams.set("lat", String(result.lat));
      url.searchParams.set("lng", String(result.lng));
      url.searchParams.set("address", result.formattedAddress);
      url.searchParams.set("addressId", result.addressId);
      if (result.place) url.searchParams.set("place", result.place);
      if (result.county) url.searchParams.set("county", result.county);
      if (result.region) url.searchParams.set("region", result.region);
      const res = await fetch(url.toString());
      if (!res.ok) {
        return;
      }
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "report" in data &&
        (data as { report: unknown }).report &&
        typeof (data as { report: unknown }).report === "object" &&
        "overall" in ((data as { report: object }).report as object)
      ) {
        setManualStatus((data as { report: ZoningReport }).report.overall);
        return;
      }
      if (data && typeof data === "object" && "overall" in data) {
        setManualStatus((data as ZoningReport).overall);
      }
    } catch {
      // Zoning is optional context for lead copy — ignore failures.
    }
  }, []);

  const handleResolved = useCallback(
    (result: GeocodeResult) => {
      setClearedQuery(true);
      setManualResult(result);
      setError(null);
      setManualStatus(null);
      void fetchOptionalZoning(result);
    },
    [fetchOptionalZoning],
  );

  const handleSearchError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Builder match · Lead routing"
        title="Connect with ADU and tiny-home builders"
        description="Share your project details after an address search. We compile nearby mock contractors for quotes and route high-intent leads to partner builders. Informational matching only — not a permit or marketplace guarantee."
      />

      {!geocodeResult ? (
        <AddressSearch
          onResolved={handleResolved}
          onError={handleSearchError}
          compact
        />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] border border-border bg-card px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-lg border border-border bg-muted p-2">
              <MapPinned
                className="h-4 w-4 text-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
                Project address
              </p>
              <p className="break-words text-sm font-medium text-foreground">
                {geocodeResult.formattedAddress}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setClearedQuery(true);
              setManualResult(null);
              setManualStatus(null);
            }}
            className="min-h-[40px] text-muted-foreground hover:text-foreground"
          >
            Change address
          </Button>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[10px] border border-rose-500/30 bg-rose-500/15 p-4 text-rose-600"
        >
          <AlertTriangle
            className="mt-0.5 shrink-0"
            size={18}
            aria-hidden="true"
          />
          <p className="min-w-0 text-sm font-medium break-words">{error}</p>
        </div>
      ) : null}

      {geocodeResult ? (
        <ConnectSection
          geocodeResult={geocodeResult}
          overallStatus={overallStatus}
        />
      ) : null}
    </PageShell>
  );
}

function parseOverallStatus(
  searchParams: URLSearchParams,
): EligibilityStatus | null {
  return parseConnectOverallStatus(searchParams);
}
