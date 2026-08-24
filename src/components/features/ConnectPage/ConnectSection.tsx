"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { BuilderSignupPanel } from "@/components/features/BuilderSignupPanel/BuilderSignupPanel";
import { LeadFallbackForm } from "@/components/features/LeadFallbackForm/LeadFallbackForm";
import {
  PageAside,
  PageBody,
  PageSection,
} from "@/components/features/PageShell/PageShell";
import {
  ProjectLeadForm,
  type ProjectLeadFormValues,
} from "@/components/features/ProjectLeadForm/ProjectLeadForm";
import { AFFILIATE_DISCLOSURE } from "@/lib/content/affiliates";
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
      "Alternate-pathway manufacturer links are listed on the partners directory, below specialist review.",
    link: "Browse partners",
  },
};

const SECTION_COPY: Record<
  EligibilityStatus | "default",
  { title: string; description: string; eyebrow: string }
> = {
  eligible: {
    title: "Request a builder intro",
    description:
      "Share project details after your THOW lot check. We route high-intent leads to partner builders. Informational matching only — not a permit or marketplace guarantee.",
    eyebrow: "Builder match · Lead routing",
  },
  warning: {
    title: "Request specialist review",
    description:
      "This lot needs local confirmation before delivery. Share details for specialist review — informational matching only, not legal representation.",
    eyebrow: "Specialist review · Lead routing",
  },
  restricted: {
    title: "Request specialist compliance review",
    description:
      "THOW lot candidacy is Red on this check. Request specialist review of pathways that may still apply — not legal representation or a permit guarantee.",
    eyebrow: "Compliance review · Lead routing",
  },
  default: {
    title: "Request a builder intro",
    description:
      "Share project details after your THOW lot check. We route high-intent leads to partner builders. Informational matching only — not a permit or marketplace guarantee.",
    eyebrow: "Builder match · Lead routing",
  },
};

function PartnersLink({ intent }: { intent: EligibilityStatus }) {
  const copy = PARTNERS_COPY[intent];
  return (
    <div className="space-y-2">
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
      <p className="text-xs leading-relaxed text-muted-foreground">
        {AFFILIATE_DISCLOSURE}
      </p>
    </div>
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

  const sectionKey =
    overallStatus === "eligible" ||
    overallStatus === "warning" ||
    overallStatus === "restricted"
      ? overallStatus
      : "default";
  const section = SECTION_COPY[sectionKey];

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
      title={section.title}
      description={section.description}
      className="scroll-mt-32 space-y-8 sm:scroll-mt-28 sm:space-y-12"
    >
      <PageBody className="space-y-8 sm:space-y-10">
        <p className="text-center font-label text-[11px] tracking-[0.14em] text-brand uppercase">
          {section.eyebrow}
        </p>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/15 p-4 text-rose-600"
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
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <p className="break-words text-[15px] text-foreground">
              Thank you, {submittedName}. We&apos;ll follow up at{" "}
              {submittedEmail} about {geocodeResult.formattedAddress}.
            </p>
            {overallStatus === "eligible" ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Meanwhile, you can{" "}
                <Link
                  href="/partners"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  browse partners
                </Link>{" "}
                for build-out resources.
              </p>
            ) : null}
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
            Lead routing is informational only — not a permit guarantee, legal
            advice, or licensed representation. Confirm licensing, scope, and
            local requirements directly with each contractor or specialist.
          </p>
        </PageAside>
      </PageBody>
    </PageSection>
  );
}
