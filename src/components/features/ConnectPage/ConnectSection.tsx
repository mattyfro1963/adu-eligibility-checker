"use client";

import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BuilderSignupPanel } from "@/components/features/BuilderSignupPanel/BuilderSignupPanel";
import { ContractorMatchGrid } from "@/components/features/ContractorMatchGrid/ContractorMatchGrid";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import { PartnerOffers } from "@/components/features/PartnerOffers/PartnerOffers";
import {
  PageAside,
  PageSection,
} from "@/components/features/PageShell/PageShell";
import {
  ProjectLeadForm,
  type ProjectLeadFormValues,
} from "@/components/features/ProjectLeadForm/ProjectLeadForm";
import { CONNECT_SECTION_ID } from "@/lib/content/connect-url";
import type { GeocodeResult } from "@/lib/types/gis";
import type {
  ContractorMatch,
  LeadSuccessResponse,
  ProjectLeadPayload,
} from "@/lib/types/leads";
import type { EligibilityStatus } from "@/lib/types/zoning";

const MATCH_UX_LATENCY_MS = 1200;

interface ConnectSectionProps {
  geocodeResult: GeocodeResult;
  overallStatus: EligibilityStatus | null;
}

/**
 * Builder match, partner offers, and lead forms — bifurcated by eligibility.
 * Rendered on `/` below parcel results; deep-linkable via `/#connect`.
 */
export function ConnectSection({
  geocodeResult,
  overallStatus,
}: ConnectSectionProps) {
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

  const handleProjectSubmit = useCallback(
    async (values: ProjectLeadFormValues) => {
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
      if (!contact) {
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
    <PageSection
      id={CONNECT_SECTION_ID}
      title="Connect with ADU and tiny-home builders"
      description="Share project details after your parcel check. We compile nearby mock contractors for quotes and route high-intent leads to partner builders. Informational matching only — not a permit or marketplace guarantee."
      className="space-y-12"
    >
      <p className="text-center font-label text-[11px] text-muted-foreground">
        Builder match · Lead routing
      </p>

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

      {!matches ? (
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
                embedded
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
                embedded
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

      <PageAside>
        <p>
          Builder matching is informational only — not a permit guarantee or
          legal advice. Confirm licensing, scope, and local requirements
          directly with each contractor.
        </p>
      </PageAside>
    </PageSection>
  );
}
