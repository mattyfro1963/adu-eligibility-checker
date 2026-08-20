"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EligibilityStatus } from "@/lib/types/zoning";

interface LeadFallbackFormProps {
  address: string;
  lat: number;
  lng: number;
  overallStatus?: Extract<EligibilityStatus, "restricted">;
}

const INTENT_OPTIONS = [
  { value: "adu_workaround", label: "Permanent-foundation ADU workaround" },
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

function buildConnectHref(props: {
  address: string;
  lat: number;
  lng: number;
  overallStatus: string;
}): string {
  const url = new URL("/connect", "http://local.invalid");
  url.searchParams.set("address", props.address);
  url.searchParams.set("lat", String(props.lat));
  url.searchParams.set("lng", String(props.lng));
  url.searchParams.set("status", props.overallStatus);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export function LeadFallbackForm({
  address,
  lat,
  lng,
  overallStatus = "restricted",
}: LeadFallbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectHref = buildConnectHref({
    address,
    lat,
    lng,
    overallStatus,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
          overallStatus,
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
      <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-8">
        <p className="break-words text-slate-800">
          Thank you{name ? `, ${name}` : ""}! We&apos;ll review {address} and
          contact you at {email}.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Prefer builder matching now?{" "}
          <Link
            href={connectHref}
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            Open Connect
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section
      data-lead-form="restricted"
      className="rounded-[1.5rem] border border-rose-200/60 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-8"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-2">
          <Mail className="h-5 w-5 text-rose-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Restricted — expert compliance review
          </h2>
          <p className="text-sm font-medium break-words text-rose-800">
            Movable tiny homes / THOW placement is restricted on this parcel
            under the pilot overlays and applicable local rules. Review the
            diagnostics above for engine reasons — this form does not invent new
            statute.
          </p>
          <p className="text-sm font-light break-words text-slate-600">
            You may still qualify for a permanent-foundation ADU pathway. Local
            compliance experts manually audit complex lots and route referrals
            through our review queue.
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
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
              className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
              aria-label="Email for expert review"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="lead-intent" className="text-xs text-slate-500">
              Intent
            </Label>
            <select
              id="lead-intent"
              required
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#FBFBFD] px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
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
            <Label htmlFor="lead-budget" className="text-xs text-slate-500">
              Budget band
            </Label>
            <select
              id="lead-budget"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#FBFBFD] px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
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
          <p className="text-xs text-slate-500">
            Or{" "}
            <Link
              href={connectHref}
              className="font-medium text-slate-700 underline-offset-2 hover:underline"
            >
              continue to builder match on Connect
            </Link>
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 min-h-[44px] w-full rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 sm:w-auto"
          >
            {isSubmitting ? "Submitting…" : "Request Review"}
          </Button>
        </div>
      </form>
    </section>
  );
}
