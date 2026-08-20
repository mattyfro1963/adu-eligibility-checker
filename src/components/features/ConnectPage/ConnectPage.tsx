"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, MapPinned } from "lucide-react";
import { AddressSearch } from "@/components/features/AddressSearch/AddressSearch";
import { BuilderSignupPanel } from "@/components/features/BuilderSignupPanel/BuilderSignupPanel";
import { ContractorMatchGrid } from "@/components/features/ContractorMatchGrid/ContractorMatchGrid";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import { PartnerOffers } from "@/components/features/PartnerOffers/PartnerOffers";
import {
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { Button } from "@/components/ui/button";
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
    county: searchParams.get("county") ?? "",
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
      // Legacy bare report
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
    <PageShell spacing="compact">
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
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[10px] border border-border bg-card px-4 py-3 shadow-editorial sm:px-5">
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
              setMatches(null);
              setManualStatus(null);
              setContact(null);
              setLastProject(null);
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
          className="flex items-start gap-3 rounded-[10px] border border-rose-500/30 bg-rose-500/15 p-4 text-rose-400 shadow-editorial"
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
        <>
          {overallStatus === "eligible" ? (
            <>
              <PartnerOffers intent="eligible" />
              <ProjectLeadForm
                address={geocodeResult.formattedAddress}
                overallStatus={overallStatus}
                isSubmitting={isSubmitting}
                onSubmit={handleProjectSubmit}
              />
            </>
          ) : null}

          {overallStatus === "warning" ? (
            <>
              <LeadFallbackForm
                address={geocodeResult.formattedAddress}
                lat={geocodeResult.lat}
                lng={geocodeResult.lng}
                variant="warning"
                overallStatus="warning"
              />
              <PartnerOffers intent="warning" compact />
            </>
          ) : null}

          {overallStatus === "restricted" ? (
            <>
              <LeadFallbackForm
                address={geocodeResult.formattedAddress}
                lat={geocodeResult.lat}
                lng={geocodeResult.lng}
                variant="restricted"
                overallStatus="restricted"
              />
              <PartnerOffers intent="restricted" compact />
            </>
          ) : null}

          {overallStatus == null ||
          (overallStatus !== "eligible" &&
            overallStatus !== "warning" &&
            overallStatus !== "restricted") ? (
            <ProjectLeadForm
              address={geocodeResult.formattedAddress}
              overallStatus={overallStatus}
              isSubmitting={isSubmitting}
              onSubmit={handleProjectSubmit}
            />
          ) : null}
        </>
      ) : null}

      {matches ? (
        <ContractorMatchGrid
          matches={matches}
          onRequestQuote={handleQuoteInterest}
        />
      ) : null}

      <BuilderSignupPanel />
    </PageShell>
  );
}
