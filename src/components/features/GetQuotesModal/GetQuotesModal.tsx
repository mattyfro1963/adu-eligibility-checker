"use client";

import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ContractorMatchGrid } from "@/components/features/ContractorMatchGrid/ContractorMatchGrid";
import {
  ProjectLeadForm,
  type ProjectLeadFormValues,
} from "@/components/features/ProjectLeadForm/ProjectLeadForm";
import { Dialog } from "@/components/ui/dialog";
import type { GeocodeResult } from "@/lib/types/gis";
import type {
  ContractorMatch,
  LeadSuccessResponse,
  ProjectLeadPayload,
} from "@/lib/types/leads";
import type { EligibilityStatus } from "@/lib/types/zoning";

const MATCH_UX_LATENCY_MS = 800;

interface GetQuotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  geocodeResult: GeocodeResult;
  overallStatus?: EligibilityStatus | null;
}

export function GetQuotesModal({
  open,
  onOpenChange,
  geocodeResult,
  overallStatus = null,
}: GetQuotesModalProps) {
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

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setMatches(null);
        setContact(null);
        setLastProject(null);
        setError(null);
        setIsSubmitting(false);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

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
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Get quotes"
      description="Connect with licensed ADU / tiny-home builders near this parcel. Informational matching only — not a marketplace guarantee."
      className={matches ? "w-[min(100%-1.5rem,52rem)]" : undefined}
    >
      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p>{error}</p>
        </div>
      ) : null}

      {matches ? (
        <ContractorMatchGrid
          matches={matches}
          onRequestQuote={handleQuoteInterest}
          layout="modal"
        />
      ) : (
        <ProjectLeadForm
          address={geocodeResult.formattedAddress}
          overallStatus={overallStatus}
          isSubmitting={isSubmitting}
          onSubmit={handleProjectSubmit}
          variant="plain"
        />
      )}
    </Dialog>
  );
}
