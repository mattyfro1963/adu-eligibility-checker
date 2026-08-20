"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <p className="text-slate-800">
          Thank you{name ? `, ${name}` : ""}! We&apos;ll review {address} and
          contact you at {email}.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-rose-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-2">
          <Mail className="h-5 w-5 text-rose-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Restricted — Expert Review Needed
          </h2>
          <p className="mt-1 text-sm font-light text-slate-600">
            {address} has significant restrictions under current zoning rules.
            Leave your details and we&apos;ll connect you with a specialist.
          </p>
        </div>
      </div>

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
        <Button
          type="submit"
          className="rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 sm:self-end"
        >
          Request Review
        </Button>
      </form>
    </section>
  );
}
