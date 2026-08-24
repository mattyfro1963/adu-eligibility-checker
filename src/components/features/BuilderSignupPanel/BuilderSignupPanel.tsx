"use client";

import { useState } from "react";
import { BriefcaseBusiness, Loader2 } from "lucide-react";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { Button } from "@/components/ui/button";
import { LegalConsentNote } from "@/components/features/LegalConsentNote/LegalConsentNote";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BuilderSignupPanelProps {
  onSubmit?: () => void;
}

export function BuilderSignupPanel({ onSubmit }: BuilderSignupPanelProps) {
  const [company, setCompany] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [email, setEmail] = useState("");
  const [serviceZips, setServiceZips] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/builder-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          licenseNumber,
          email,
          serviceZips,
          notes: notes.trim() || undefined,
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
            : "Signup failed";
        throw new Error(message);
      }
      setSubmitted(true);
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ExpandableSection
      id="builder-partners"
      title="Are you a licensed California builder?"
      description="Join the beta lead network — homeowners arrive with address, structure, and budget captured."
      defaultOpen={false}
      variant="card"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-[8px] border border-border bg-muted p-2">
          <BriefcaseBusiness
            className="h-5 w-5 text-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p className="font-label text-muted-foreground">Builder network</p>
          <p className="mt-2 text-body text-muted-foreground">
            Buy high-intent, pre-qualified property leads in your ZIP codes
            ($20–$100/lead). Informational matching only — not a permit or
            marketplace guarantee.
          </p>
        </div>
      </div>

      {submitted ? (
        <p className="rounded-input border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Thanks{company ? `, ${company}` : ""} — we&apos;ll follow up at{" "}
          {email} about beta lead routing.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="builder-company">Company</Label>
              <Input
                id="builder-company"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="h-11"
                aria-label="Builder company name"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="builder-license">CSLB license #</Label>
              <Input
                id="builder-license"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="License number"
                className="h-11"
                aria-label="CSLB license number"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="builder-email">Work email</Label>
              <Input
                id="builder-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11"
                aria-label="Builder work email"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="builder-zips">Service ZIP codes</Label>
              <Input
                id="builder-zips"
                required
                value={serviceZips}
                onChange={(e) => setServiceZips(e.target.value)}
                placeholder="94110, 94114, 94607"
                className="h-11"
                aria-label="Service ZIP codes"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="builder-notes">Notes (optional)</Label>
            <Input
              id="builder-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ADU / THOW focus, coverage radius…"
              className="h-11"
              aria-label="Builder notes"
              disabled={isSubmitting}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          ) : null}
          <LegalConsentNote />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              "Join beta network"
            )}
          </Button>
        </form>
      )}
    </ExpandableSection>
  );
}
