"use client";

import { useId, useState } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

const STATUS_LABEL: Record<EligibilityStatus, string> = {
  eligible: "Eligible",
  warning: "Warning",
  restricted: "Restricted",
};

const STATUS_RING: Record<EligibilityStatus, string> = {
  eligible: "bg-status-eligible/30",
  warning: "bg-status-warning/30",
  restricted: "bg-status-restricted/30",
};

const STATUS_ACCENT: Record<EligibilityStatus, string> = {
  eligible: "text-status-eligible-fg",
  warning: "text-status-warning-fg",
  restricted: "text-status-restricted-fg",
};

type FeaturePinProps = {
  /** When null/undefined, pin is neutral — never defaults to Eligible. */
  status?: EligibilityStatus | null;
  label?: string;
  /** When false, pin renders without popover interaction (e.g. analysis backdrop). */
  interactive?: boolean;
};

export function FeaturePin({
  status = null,
  label,
  interactive = true,
}: FeaturePinProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const resolved = status ?? null;
  const statusLabel = resolved ? STATUS_LABEL[resolved] : "Lookup point";
  const hasLabel = Boolean(label?.trim());

  return (
    <div className="relative flex flex-col items-center">
      {interactive && open && hasLabel ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`${statusLabel} geocoded location: ${label}`}
          className="pointer-events-auto absolute bottom-full z-30 mb-3 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-border bg-card shadow-elevated"
        >
          <div className="flex items-start gap-2 border-b border-border px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-label text-[10px]",
                  resolved
                    ? STATUS_ACCENT[resolved]
                    : "text-muted-foreground",
                )}
              >
                {statusLabel}
              </p>
              <p className="mt-0.5 truncate text-sm leading-snug text-foreground">
                {label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close parcel details"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!interactive}
        onClick={() => {
          if (interactive && hasLabel) {
            setOpen((prev) => !prev);
          }
        }}
        aria-expanded={interactive ? open : undefined}
        aria-controls={interactive && hasLabel ? popoverId : undefined}
        aria-label={
          hasLabel
            ? `${statusLabel} lookup point for ${label}. ${interactive ? "Show details" : ""}`
            : `${statusLabel} geocoded location`
        }
        className={cn(
          "group/pin relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-end",
          interactive && hasLabel ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span
          className={cn(
            "absolute -inset-2 rounded-full opacity-50",
            resolved ? STATUS_RING[resolved] : "bg-muted-foreground/20",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full border border-white/90 bg-white/95 shadow-[0_6px_18px_var(--map-pin-shadow)]",
            resolved ? STATUS_ACCENT[resolved] : "text-muted-foreground",
          )}
        >
          <MapPin size={18} strokeWidth={2.1} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
