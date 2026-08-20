"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPinned } from "lucide-react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { BuilderSignupPanel } from "@/components/features/BuilderSignupPanel/BuilderSignupPanel";
import { ContractorMatchGrid } from "@/components/features/ContractorMatchGrid/ContractorMatchGrid";
import {
  ProjectLeadForm,
  type ProjectLeadFormValues,
} from "@/components/features/ProjectLeadForm/ProjectLeadForm";
import type { GeocodeResult } from "@/lib/types/gis";
import type {
  ContractorMatch,
  LeadSuccessResponse,
  ProjectLeadPayload,
} from "@/lib/types/leads";
import type { EligibilityStatus, ZoningReport } from "@/lib/types/zoning";

const MATCH_UX_LATENCY_MS = 1200;

function parsePrefill(searchParams: URLSearchParams): GeocodeResult | null {
  const address = searchParams.get("address")?.trim();
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  if (!address || latRaw == null || lngRaw == null) {
    return null;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return {
    addressId: `prefill-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    formattedAddress: address,
    streetLine: address,
    place: searchParams.get("place") ?? "",
    region: searchParams.get("region") ?? "CA",
    postcode: searchParams.get("postcode") ?? "",
    lat,
    lng,
  };
}

function parseOverallStatus(
  searchParams: URLSearchParams,
): EligibilityStatus | null {
  const status = searchParams.get("status");
  if (
    status === "eligible" ||
    status === "warning" ||
    status === "restricted"
  ) {
    return status;
  }
  return null;
}

export function ConnectPage() {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const queryPrefill = parsePrefill(searchParams);
  const queryStatus = parseOverallStatus(searchParams);

  const [clearedQuery, setClearedQuery] = useState(false);
  const [manualResult, setManualResult] = useState<GeocodeResult | null>(null);
  const [manualStatus, setManualStatus] = useState<EligibilityStatus | null>(
    null,
  );
  const [contact, setContact] = useState<{
    name: string;
    email: string;
    phone?: string;
  } | null>(null);
  const [lastProject, setLastProject] = useState<ProjectLeadFormValues | null>(
    null,
  );
  const [matches, setMatches] = useState<ContractorMatch[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedQueryKey, setAppliedQueryKey] = useState(queryKey);

  // When the URL query changes (e.g. from checker CTA), re-apply prefill.
  if (queryKey !== appliedQueryKey) {
    setAppliedQueryKey(queryKey);
    setClearedQuery(false);
    setManualResult(null);
    setManualStatus(null);
    setMatches(null);
    setContact(null);
    setLastProject(null);
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
      const res = await fetch(url.toString());
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as ZoningReport;
      setManualStatus(data.overall);
    } catch {
      // Zoning is optional context for lead copy — ignore failures.
    }
  }, []);

  const handleResolved = useCallback(
    (result: GeocodeResult) => {
      setClearedQuery(true);
      setManualResult(result);
      setMatches(null);
      setError(null);
      setManualStatus(null);
      void fetchOptionalZoning(result);
    },
    [fetchOptionalZoning],
  );

  const handleSearchError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleProjectSubmit = useCallback(
    async (values: ProjectLeadFormValues) => {
      if (!geocodeResult) {
        return;
      }
      setIsSubmitting(true);
      setError(null);
      const started = Date.now();
      try {
        const payload: ProjectLeadPayload = {
          type: "project",
          name: values.name,
          email: values.email,
          phone: values.phone.trim() || undefined,
          address: geocodeResult.formattedAddress,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          propertyIntent: values.propertyIntent,
          structure: values.structure,
          budget: values.budget,
          overallStatus: overallStatus ?? undefined,
        };

        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            body &&
            typeof body === "object" &&
            "error" in body &&
            typeof body.error === "string"
              ? body.error
              : "Failed to submit project lead";
          throw new Error(message);
        }
        const data = (await res.json()) as LeadSuccessResponse;
        const elapsed = Date.now() - started;
        if (elapsed < MATCH_UX_LATENCY_MS) {
          await new Promise((r) =>
            setTimeout(r, MATCH_UX_LATENCY_MS - elapsed),
          );
        }
        setContact({
          name: values.name,
          email: values.email,
          phone: values.phone.trim() || undefined,
        });
        setLastProject(values);
        setMatches(data.matches);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit project lead",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [geocodeResult, overallStatus],
  );

  const handleQuoteInterest = useCallback(
    async (contractor: ContractorMatch) => {
      if (!geocodeResult || !contact) {
        return;
      }
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote_interest",
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: geocodeResult.formattedAddress,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          contractorId: contractor.id,
          propertyIntent: lastProject?.propertyIntent,
          structure: lastProject?.structure,
          budget: lastProject?.budget,
        }),
      });
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          body &&
          typeof body === "object" &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Failed to request quote";
        throw new Error(message);
      }
    },
    [contact, geocodeResult, lastProject],
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-3 border-b border-slate-200/80 pb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          Builder match · Lead routing
        </p>
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Connect with ADU and tiny-home builders
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Share your project details after an address search. We compile nearby
          mock contractors for quotes and route high-intent leads to partner
          builders. Informational matching only — not a permit or marketplace
          guarantee.
        </p>
      </header>

      {!geocodeResult ? (
        <AddressSearch
          onResolved={handleResolved}
          onError={handleSearchError}
          showDemoScenarios
        />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <MapPinned
                className="h-4 w-4 text-slate-700"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Project address
              </p>
              <p className="break-words text-sm font-medium text-slate-900">
                {geocodeResult.formattedAddress}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setClearedQuery(true);
              setManualResult(null);
              setMatches(null);
              setManualStatus(null);
              setContact(null);
              setLastProject(null);
            }}
            className="inline-flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Change address
          </button>
        </div>
      )}

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
          <p className="min-w-0 text-sm font-medium break-words">{error}</p>
        </div>
      ) : null}

      {geocodeResult && !matches ? (
        <ProjectLeadForm
          address={geocodeResult.formattedAddress}
          overallStatus={overallStatus}
          isSubmitting={isSubmitting}
          onSubmit={handleProjectSubmit}
        />
      ) : null}

      {matches ? (
        <ContractorMatchGrid
          matches={matches}
          onRequestQuote={handleQuoteInterest}
        />
      ) : null}

      <BuilderSignupPanel />
    </main>
  );
}
