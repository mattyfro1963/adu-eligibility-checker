"use client";

import { useState } from "react";
import { Hammer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ProjectBudget,
  PropertyIntent,
  StructureChoice,
} from "@/lib/types/leads";
import type { EligibilityStatus } from "@/lib/types/zoning";

export interface ProjectLeadFormValues {
  name: string;
  email: string;
  phone: string;
  propertyIntent: PropertyIntent;
  structure: StructureChoice;
  budget: ProjectBudget;
}

interface ProjectLeadFormProps {
  address: string;
  overallStatus?: EligibilityStatus | null;
  isSubmitting?: boolean;
  onSubmit: (values: ProjectLeadFormValues) => void | Promise<void>;
}

const INTENT_OPTIONS: { value: PropertyIntent; label: string }[] = [
  { value: "primary", label: "Primary residence" },
  { value: "rental", label: "Rental unit" },
  { value: "family", label: "Family housing" },
];

const STRUCTURE_OPTIONS: { value: StructureChoice; label: string }[] = [
  { value: "permanent_adu", label: "Permanent ADU" },
  { value: "thow", label: "Tiny Home on Wheels (THOW)" },
];

const BUDGET_OPTIONS: { value: ProjectBudget; label: string }[] = [
  { value: "under_50k", label: "Under $50k" },
  { value: "50k_150k", label: "$50k–$150k" },
  { value: "150k_plus", label: "$150k+" },
];

function selectClassName() {
  return "h-11 w-full rounded-xl border border-slate-200 bg-[#FBFBFD] px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-400";
}

export function ProjectLeadForm({
  address,
  overallStatus = null,
  isSubmitting = false,
  onSubmit,
}: ProjectLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyIntent, setPropertyIntent] =
    useState<PropertyIntent>("primary");
  const [structure, setStructure] = useState<StructureChoice>("permanent_adu");
  const [budget, setBudget] = useState<ProjectBudget>("50k_150k");

  const isComplex =
    overallStatus === "restricted" || overallStatus === "warning";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit({
      name,
      email,
      phone,
      propertyIntent,
      structure,
      budget,
    });
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div
          className={`rounded-lg border p-2 ${
            isComplex
              ? "border-amber-100 bg-amber-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <Hammer
            className={`h-5 w-5 ${isComplex ? "text-amber-600" : "text-slate-700"}`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {isComplex
              ? "Complex site — match with builders"
              : "Project details for builder match"}
          </h2>
          <p className="mt-1 text-sm font-light break-words text-slate-600">
            {isComplex ? (
              <>
                {address} needs careful permitting. Share project parameters so
                we can route a high-intent lead to licensed ADU / tiny-home
                builders nearby.
              </>
            ) : (
              <>
                Tell us about the project at{" "}
                <span className="font-medium text-slate-800">{address}</span>.
                We&apos;ll compile nearby contractors for quotes — not a permit
                or legal determination.
              </>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Full name</Label>
            <Input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
              aria-label="Full name for builder match"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-email">Email</Label>
            <Input
              id="project-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
              aria-label="Email for builder match"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="project-phone">Phone (optional)</Label>
          <Input
            id="project-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(415) 555-0100"
            className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
            aria-label="Phone for builder match"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="project-intent">Property intent</Label>
            <select
              id="project-intent"
              className={selectClassName()}
              value={propertyIntent}
              onChange={(e) =>
                setPropertyIntent(e.target.value as PropertyIntent)
              }
              disabled={isSubmitting}
              aria-label="Property intent"
            >
              {INTENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-structure">Structure</Label>
            <select
              id="project-structure"
              className={selectClassName()}
              value={structure}
              onChange={(e) => setStructure(e.target.value as StructureChoice)}
              disabled={isSubmitting}
              aria-label="Structure choice"
            >
              {STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-budget">Project budget</Label>
            <select
              id="project-budget"
              className={selectClassName()}
              value={budget}
              onChange={(e) => setBudget(e.target.value as ProjectBudget)}
              disabled={isSubmitting}
              aria-label="Project budget"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 sm:w-auto sm:self-end"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Matching contractors…
            </>
          ) : (
            "Find nearby contractors"
          )}
        </Button>
      </form>
    </section>
  );
}
