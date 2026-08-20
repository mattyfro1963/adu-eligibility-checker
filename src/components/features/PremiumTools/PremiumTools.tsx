"use client";

import {
  useId,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import { ClipboardList, Mail, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PREMIUM_TOOLS,
  PREMIUM_TOOLS_INTRO,
  type PremiumTool,
  type PremiumToolIcon,
} from "@/lib/content/premium-tools";

const ICON_MAP: Record<
  PremiumToolIcon,
  ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>
> = {
  checklist: ClipboardList,
  mail: Mail,
  spreadsheet: Table2,
};

function ProductCard({
  tool,
  onJoinWaitlist,
}: {
  tool: PremiumTool;
  onJoinWaitlist: (toolId: string) => void;
}) {
  const Icon = ICON_MAP[tool.icon];

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
          <Icon size={18} className="text-slate-700" aria-hidden={true} />
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-600 uppercase">
          {tool.format}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
        {tool.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {tool.description}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">
          {tool.priceLabel}
        </p>
        <p className="text-xs text-slate-500">suggested · not billed yet</p>
      </div>

      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        {tool.includes.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-relaxed text-slate-600"
          >
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={() => onJoinWaitlist(tool.id)}
        className="mt-5 h-11 min-h-[44px] w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
      >
        Join waitlist
      </Button>
    </li>
  );
}

function WaitlistForm({
  selectedToolId,
  onSelectedToolChange,
  nameInputRef,
}: {
  selectedToolId: string;
  onSelectedToolChange: (toolId: string) => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
}) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const toolSelectId = `${formId}-tool`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // Client-only capture for now — no API / checkout yet.
    window.setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 400);
  }

  if (submitted) {
    const selected =
      PREMIUM_TOOLS.find((t) => t.id === selectedToolId)?.title ?? "that tool";
    return (
      <div
        className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-5"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm leading-relaxed text-slate-800">
          Thank you{name ? `, ${name}` : ""}. We&apos;ll email{" "}
          <span className="font-medium">{email}</span> when {selected} is ready
          for checkout.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={nameId}
            className="text-xs font-medium text-slate-600"
          >
            Full name
          </Label>
          <Input
            ref={nameInputRef}
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={emailId}
            className="text-xs font-medium text-slate-600"
          >
            Email
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-11 rounded-xl border-slate-200 bg-[#FBFBFD]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={toolSelectId}
          className="text-xs font-medium text-slate-600"
        >
          Which tool?
        </Label>
        <select
          id={toolSelectId}
          name="tool"
          required
          value={selectedToolId}
          onChange={(e) => onSelectedToolChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-[#FBFBFD] px-3 text-sm text-slate-900 outline-none transition-[box-shadow] focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          {PREMIUM_TOOLS.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.title} ({tool.priceLabel})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-500">
          Waitlist only — no payment is collected here.
        </p>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 min-h-[44px] w-full shrink-0 rounded-xl bg-slate-900 text-white hover:bg-slate-800 sm:w-auto sm:px-6"
        >
          {isSubmitting ? "Joining…" : "Join waitlist"}
        </Button>
      </div>
    </form>
  );
}

export function PremiumTools() {
  const waitlistRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [selectedToolId, setSelectedToolId] = useState(PREMIUM_TOOLS[0].id);

  function joinWaitlistFor(toolId: string) {
    setSelectedToolId(toolId);
    waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 350);
  }

  return (
    <article className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 sm:space-y-12 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-4 border-b border-slate-200/80 pb-8 sm:pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          {PREMIUM_TOOLS_INTRO.eyebrow}
        </p>
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {PREMIUM_TOOLS_INTRO.title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {PREMIUM_TOOLS_INTRO.subtitle}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#waitlist"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Join the waitlist
          </a>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to Checker
          </Link>
        </div>
      </header>

      <section aria-labelledby="premium-catalog-heading" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="premium-catalog-heading"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Catalog
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Three downloadable tools with suggested prices. Checkout and file
            delivery are not available yet — join the waitlist for the tool you
            need.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_TOOLS.map((tool) => (
            <ProductCard
              key={tool.id}
              tool={tool}
              onJoinWaitlist={joinWaitlistFor}
            />
          ))}
        </ul>
      </section>

      <section
        id="waitlist"
        ref={waitlistRef}
        aria-labelledby="premium-waitlist-heading"
        className="scroll-mt-24 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
            <Mail size={18} className="text-slate-700" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2
              id="premium-waitlist-heading"
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              Join the waitlist
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Choose a tool and leave an email. We&apos;ll notify you when
              checkout opens — nothing is charged on this page.
            </p>
          </div>
        </div>
        <WaitlistForm
          selectedToolId={selectedToolId}
          onSelectedToolChange={setSelectedToolId}
          nameInputRef={nameInputRef}
        />
      </section>

      <aside
        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600"
        role="note"
      >
        <p>{PREMIUM_TOOLS_INTRO.honestyNote}</p>
        <p className="mt-3">
          Need parcel eligibility first?{" "}
          <Link
            href="/"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Open the Checker
          </Link>
          .
        </p>
      </aside>
    </article>
  );
}
