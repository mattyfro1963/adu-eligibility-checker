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
import {
  PageActionLink,
  PageAnchorLink,
  PageAside,
  PageBody,
  PageHeader,
  PageSection,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { LegalConsentNote } from "@/components/features/LegalConsentNote/LegalConsentNote";
import { Button } from "@/components/ui/button";
import { ExpandableSection } from "@/components/ui/expandable-section";
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
    <li
      id={tool.id}
      className="flex scroll-mt-32 flex-col rounded-xl border border-border bg-card p-5 shadow-elevated transition-colors hover:border-foreground/15 sm:scroll-mt-24 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-border bg-muted p-2">
          <Icon size={18} className="text-foreground" aria-hidden={true} />
        </div>
        <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {tool.format}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg tracking-tight text-foreground">
        {tool.title}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
        {tool.description}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-2xl font-normal tracking-tight text-foreground">
          {tool.priceLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          suggested · not billed yet
        </p>
      </div>

      <ExpandableSection
        title="What's included"
        description={`${tool.includes.length} checklist items`}
        defaultOpen={false}
        variant="muted"
        className="mt-4 border-0 bg-transparent shadow-none"
        contentClassName="px-0 py-0 sm:px-0 sm:py-0"
      >
        <ul className="space-y-2 px-4 py-3">
          {tool.includes.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </ExpandableSection>

      <Button
        type="button"
        onClick={() => onJoinWaitlist(tool.id)}
        className="mt-5 h-11 min-h-[44px] w-full rounded-xl bg-primary text-white hover:bg-primary"
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
        className="rounded-xl border border-border bg-muted p-5"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm leading-relaxed text-foreground">
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
            className="text-xs font-medium text-muted-foreground"
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
            className="h-11 rounded-xl border-border bg-card"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={emailId}
            className="text-xs font-medium text-muted-foreground"
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
            className="h-11 rounded-xl border-border bg-card"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={toolSelectId}
          className="text-xs font-medium text-muted-foreground"
        >
          Which tool?
        </Label>
        <select
          id={toolSelectId}
          name="tool"
          required
          value={selectedToolId}
          onChange={(e) => onSelectedToolChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-[box-shadow] focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring"
        >
          {PREMIUM_TOOLS.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.title} ({tool.priceLabel})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Waitlist only — no payment is collected here.
          </p>
          <LegalConsentNote />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 min-h-[44px] w-full shrink-0 rounded-xl bg-primary text-white hover:bg-primary sm:w-auto sm:px-6"
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
    <PageShell>
      <PageHeader
        eyebrow={PREMIUM_TOOLS_INTRO.eyebrow}
        title={PREMIUM_TOOLS_INTRO.title}
        description={PREMIUM_TOOLS_INTRO.subtitle}
        actions={
          <>
            <PageAnchorLink href="#waitlist">Join the waitlist</PageAnchorLink>
            <PageActionLink href="/" variant="outline">
              Back to Checker
            </PageActionLink>
          </>
        }
      />

      <PageBody className="space-y-8 sm:space-y-10">
        <PageSection
          title="Catalog"
          description="Three downloadable tools with suggested prices. Checkout and file delivery are not available yet — join the waitlist for the tool you need."
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREMIUM_TOOLS.map((tool) => (
              <ProductCard
                key={tool.id}
                tool={tool}
                onJoinWaitlist={joinWaitlistFor}
              />
            ))}
          </ul>
        </PageSection>

        <section
          id="waitlist"
          ref={waitlistRef}
          aria-labelledby="premium-waitlist-heading"
          className="scroll-mt-32 space-y-5 rounded-xl border border-border bg-card p-5 shadow-elevated sm:scroll-mt-24 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border bg-muted p-2">
              <Mail size={18} className="text-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <h2
                id="premium-waitlist-heading"
                className="font-display text-xl tracking-tight text-foreground"
              >
                Join the waitlist
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
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

        <PageAside>
          <p>{PREMIUM_TOOLS_INTRO.honestyNote}</p>
          <p className="mt-3">
            Need parcel eligibility first?{" "}
            <Link
              href="/"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Open the Checker
            </Link>
            .
          </p>
        </PageAside>
      </PageBody>
    </PageShell>
  );
}
