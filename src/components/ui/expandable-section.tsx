"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

export interface ExpandableSectionProps {
  id?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "card" | "muted";
}

const VARIANT_CLASS: Record<
  NonNullable<ExpandableSectionProps["variant"]>,
  string
> = {
  default: "border-border bg-card shadow-elevated",
  card: "border-border bg-card shadow-editorial",
  muted: "border-border bg-muted/40",
};

/**
 * Accessible collapsible section — native details/summary with keyboard support.
 */
export function ExpandableSection({
  id,
  title,
  description,
  children,
  defaultOpen = false,
  className,
  contentClassName,
  variant = "default",
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setOpen(event.currentTarget.open);
  }

  return (
    <details
      id={id}
      className={cn(
        "group rounded-card border",
        VARIANT_CLASS[variant],
        className,
      )}
      open={open}
      onToggle={handleToggle}
    >
      <summary
        className={cn(
          "flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4",
          "rounded-card marker:content-none [&::-webkit-details-marker]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-display text-base tracking-tight text-foreground sm:text-lg">
            {title}
          </span>
          {description ? (
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div
        className={cn(
          "border-t border-border px-4 py-4 sm:px-5 sm:py-5",
          contentClassName,
        )}
      >
        {children}
      </div>
    </details>
  );
}
