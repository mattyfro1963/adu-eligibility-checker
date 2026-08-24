"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalConsentNote } from "@/components/features/LegalConsentNote/LegalConsentNote";
import { buildConnectHref as buildConnectDeepLink } from "@/lib/content/connect-url";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EligibilityStatus } from "@/lib/types/zoning";

type LeadVariant = "restricted" | "warning";

interface LeadFallbackFormProps {
  address: string;
  lat: number;
  lng: number;
  /** Visual + copy tone. Defaults to restricted (rose expert review). */
  variant?: LeadVariant;
  overallStatus?: Extract<EligibilityStatus, "restricted" | "warning">;
  /** Hide pivot link when already rendered inside `/#connect`. */
  embedded?: boolean;
}

const INTENT_OPTIONS = [
  { value: "adu_workaround", label: "Permanent-foundation ADU pathway" },
  { value: "lot_split", label: "Lot split / SB 9 path" },
  { value: "other", label: "Other / not sure" },
] as const;

const BUDGET_OPTIONS = [
  { value: "under_50k", label: "Under $50k" },
  { value: "50k_150k", label: "$50k–$150k" },
  { value: "150k_350k", label: "$150k–$350k" },
  { value: "350k_plus", label: "$350k+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

function buildLeadConnectHref(props: {
  address: string;
  lat: number;
  lng: number;
  overallStatus: string;
}): string {
  return buildConnectDeepLink(
    {
      addressId: `prefill-${props.lat.toFixed(5)}-${props.lng.toFixed(5)}`,
      formattedAddress: props.address,
      streetLine: props.address,
      place: "",
      county: "",
      region: "CA",
      postcode: "",
      lat: props.lat,
      lng: props.lng,
    },
    props.overallStatus as EligibilityStatus,
  );
}

export function LeadFallbackForm({
  address,
  lat,
  lng,
  variant = "restricted",
  overallStatus,
  embedded = false,
}: LeadFallbackFormProps) {
  const status = overallStatus ?? variant;
  const isWarning = status === "warning";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectHref = buildLeadConnectHref({
    address,
    lat,
    lng,
    overallStatus: status,
  });

  async function handleRestrictedSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "restricted_review",
          name,
          email,
          address,
          lat,
          lng,
          intent,
          budget,
          overallStatus: status,
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
            : "Could not submit review request";
        throw new Error(message);
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit review request",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWarningSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "specialist_review",
          name,
          email,
          address,
          lat,
          lng,
          overallStatus: "warning",
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
            : "Could not submit review request";
        throw new Error(message);
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit review request",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="rounded-[10px] border border-border bg-card p-6 sm:p-8">
        <p className="break-words text-foreground">
          Thank you{name ? `, ${name}` : ""}! We&apos;ll review {address} and
          contact you at {email}.
        </p>
      </section>
    );
  }

  if (isWarning) {
    return (
      <section
        data-lead-form="warning"
        className="rounded-[10px] border border-warning/30 bg-card p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/15 p-2">
            <Mail className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-normal tracking-tight text-foreground">
              Specialist review recommended
            </h2>
            <p className="text-sm font-medium break-words text-muted-foreground">
              This parcel shows warnings in the diagnostics above. A specialist
              can help interpret overlays and permitting pathways — this form
              does not invent new statute.
            </p>
            <p className="text-sm font-light break-words text-muted-foreground">
              Leave a name and email and we&apos;ll follow up. Partner resources
              are linked below this form.
            </p>
          </div>
        </div>

        <form onSubmit={handleWarningSubmit} className="flex flex-col gap-3">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[10px] border border-rose-500/30 bg-rose-500/15 p-3 text-sm text-rose-600"
            >
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p>{error}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="lead-warning-name" className="sr-only">
                Full name
              </Label>
              <Input
                id="lead-warning-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-[10px] border-border bg-card"
                aria-label="Full name for specialist review"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="lead-warning-email" className="sr-only">
                Email address
              </Label>
              <Input
                id="lead-warning-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 rounded-[10px] border-border bg-card"
                aria-label="Email for specialist review"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <LegalConsentNote className="flex-1 text-xs leading-relaxed text-muted-foreground" />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 min-h-[44px] w-full shadow-editorial sm:w-auto"
            >
              {isSubmitting ? "Submitting…" : "Request specialist review"}
            </Button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section
      data-lead-form="restricted"
      className="rounded-[10px] border border-restricted/30 bg-card p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/15 p-2">
          <Mail className="h-5 w-5 text-rose-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-normal tracking-tight text-foreground">
            Restricted — specialist compliance review
          </h2>
          <p className="text-sm font-medium break-words text-muted-foreground">
            This parcel is restricted for at least one program in the
            diagnostics above. Review those engine reasons with a local
            compliance specialist — this form does not invent new statute.
          </p>
          <p className="text-sm font-light break-words text-muted-foreground">
            You may still have a lawful pathway, such as a permanent-foundation
            ADU. Specialists audit complex lots and route referrals through
            our review queue — not licensed legal representation.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-[10px] border border-rose-500/30 bg-rose-500/15 p-3 text-sm text-rose-600"
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p>{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleRestrictedSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="lead-name" className="sr-only">
              Full name
            </Label>
            <Input
              id="lead-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-[10px] border-border bg-card"
              aria-label="Full name for expert review"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="lead-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-[10px] border-border bg-card"
              aria-label="Email for expert review"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="lead-intent"
              className="text-xs text-muted-foreground"
            >
              Intent
            </Label>
            <select
              id="lead-intent"
              required
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Project intent"
            >
              <option value="" disabled>
                Select intent
              </option>
              {INTENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="lead-budget"
              className="text-xs text-muted-foreground"
            >
              Budget band
            </Label>
            <select
              id="lead-budget"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Budget band"
            >
              <option value="" disabled>
                Select budget
              </option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <LegalConsentNote className="text-xs leading-relaxed text-muted-foreground" />
            {!embedded ? (
              <p className="text-xs text-muted-foreground">
                Or{" "}
                <Link
                  href={connectHref}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  continue to builder match below
                </Link>
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 min-h-[44px] w-full shadow-editorial sm:w-auto"
          >
            {isSubmitting ? "Submitting…" : "Request Review"}
          </Button>
        </div>
      </form>
    </section>
  );
}
