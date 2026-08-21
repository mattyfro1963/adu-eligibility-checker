"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { BuilderSignupPanel } from "@/components/features/BuilderSignupPanel/BuilderSignupPanel";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
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
import type { ProjectLeadPayload } from "@/lib/types/leads";
import type { EligibilityStatus } from "@/lib/types/zoning";

interface ConnectSectionProps {
  geocodeResult: GeocodeResult;
  overallStatus: EligibilityStatus | null;
}

const PARTNERS_COPY: Record<
  EligibilityStatus,
  { sentence: string; link: string }
> = {
  eligible: {
    sentence:
      "Manufacturer resources for power, sanitation, chassis, and appliances live on the partners directory.",
    link: "Browse partners",
  },
  warning: {
    sentence:
      "Optional product research is on the partners directory — secondary to specialist review.",
    link: "Browse partners",
  },
  restricted: {
    sentence:
      "Alternate-pathway manufacturer links are listed on the partners directory, below expert review.",
    link: "Browse partners",
  },
};

function PartnersLink({ intent }: { intent: EligibilityStatus }) {
  const copy = PARTNERS_COPY[intent];
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {copy.sentence}{" "}
      <Link
        href="/partners"
        className="font-medium text-foreground underline-offset-2 hover:underline"
      >
        {copy.link}
      </Link>
      .
    </p>
  );
}

/**
 * Lead forms after parcel results; deep-linkable via `/#connect` when a report exists.
 */
export function ConnectSection({
  geocodeResult,
  overallStatus,
}: ConnectSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProjectSubmit = useCallback(
    async (values: ProjectLeadFormValues) => {
      setIsSubmitting(true);
      setError(null);
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
        await res.json();
        setSubmittedName(values.name);
        setSubmittedEmail(values.email);
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

  return (
    <PageSection
      id={CONNECT_SECTION_ID}
      title="Request a builder intro"
      description="Share project details after your parcel check. We route high-intent leads to partner builders. Informational matching only — not a permit or marketplace guarantee."
      className="scroll-mt-28 space-y-12"
    >
      <p className="text-center font-label text-[11px] text-muted-foreground">
        Builder intro · Lead routing
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

      {submittedName && submittedEmail ? (
        <section className="rounded-[10px] border border-border bg-card p-6 sm:p-8">
          <p className="break-words text-foreground">
            Thank you, {submittedName}. We&apos;ll follow up at {submittedEmail}{" "}
            about {geocodeResult.formattedAddress}.
          </p>
        </section>
      ) : (
        <>
          {overallStatus === "eligible" ? (
            <>
              <ProjectLeadForm
                address={geocodeResult.formattedAddress}
                overallStatus={overallStatus}
                isSubmitting={isSubmitting}
                onSubmit={handleProjectSubmit}
              />
              <PartnersLink intent="eligible" />
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
              <PartnersLink intent="warning" />
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
              <PartnersLink intent="restricted" />
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
      )}

      <BuilderSignupPanel />

      <PageAside>
        <p>
          Builder intros are informational only — not a permit guarantee or
          legal advice. Confirm licensing, scope, and local requirements
          directly with each contractor.
        </p>
      </PageAside>
    </PageSection>
  );
}
