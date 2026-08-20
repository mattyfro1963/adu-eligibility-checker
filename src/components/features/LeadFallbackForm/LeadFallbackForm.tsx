"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface LeadFallbackFormProps {
  address: string;
}

export function LeadFallbackForm({ address }: LeadFallbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl">
        <p className="text-slate-800">
          Thank you{name ? `, ${name}` : ""}! We&apos;ll review {address} and
          contact you at {email}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <div className="mb-4 flex items-start gap-3">
        <Mail
          className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
          aria-hidden="true"
        />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Restricted — Expert Review Needed
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {address} has significant restrictions under current zoning rules.
            Leave your details and we&apos;ll connect you with a specialist.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="lead-name" className="sr-only">
            Full name
          </label>
          <input
            id="lead-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Full name for expert review"
          />
          <label htmlFor="lead-email" className="sr-only">
            Email address
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Email for expert review"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-rose-700 sm:self-end"
        >
          Request Review
        </button>
      </form>
    </Card>
  );
}
