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
  eligible: "bg-emerald-600/30",
  warning: "bg-amber-500/30",
  restricted: "bg-rose-600/30",
};

const STATUS_ACCENT: Record<EligibilityStatus, string> = {
  eligible: "text-emerald-600",
  warning: "text-amber-500",
  restricted: "text-rose-600",
};

type FeaturePinProps = {
  status?: EligibilityStatus;
  label?: string;
  /** When false, pin renders without popover interaction (e.g. analysis backdrop). */
  interactive?: boolean;
};

export function FeaturePin({
  status = "eligible",
  label,
  interactive = true,
}: FeaturePinProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const statusLabel = STATUS_LABEL[status];
  const hasLabel = Boolean(label?.trim());

  return (
    <div className="relative flex flex-col items-center">
      {interactive && open && hasLabel ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`${statusLabel} parcel: ${label}`}
          className="pointer-events-auto absolute bottom-full z-30 mb-3 w-[min(18rem,calc(100vw-2rem))] rounded-[10px] border border-border bg-card shadow-elevated"
        >
          <div className="flex items-start gap-2 border-b border-border px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p
                className={cn("font-label text-[10px]", STATUS_ACCENT[status])}
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
            ? `${statusLabel} parcel at ${label}. ${interactive ? "Show details" : ""}`
            : `${statusLabel} parcel location`
        }
        className={cn(
          "group/pin relative flex flex-col items-center",
          interactive && hasLabel ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span
          className={cn(
            "absolute -inset-3 animate-ping rounded-full opacity-60",
            STATUS_RING[status],
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "relative flex size-10 items-center justify-center rounded-full border-2 border-white bg-white shadow-[0_4px_14px_rgb(0_0_0_/_0.18)]",
            STATUS_ACCENT[status],
          )}
        >
          <MapPin size={20} strokeWidth={2.25} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
