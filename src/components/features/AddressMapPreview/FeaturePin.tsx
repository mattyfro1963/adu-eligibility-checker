"use client";

import { MapPin } from "lucide-react";
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
  /** Always-visible white tooltip (banner chrome). */
  callout?: string;
  /** When false, pin renders without popover interaction (e.g. analysis backdrop). */
  interactive?: boolean;
};

/**
 * Map pin + white rounded tooltip pointing at the house.
 * Idle copy is “THOW lot reading”; live copy is status + district.
 */
export function FeaturePin({
  status = null,
  label,
  callout,
  interactive = true,
}: FeaturePinProps) {
  const resolved = status ?? null;
  const statusLabel = resolved ? STATUS_LABEL[resolved] : "Lookup point";
  const hasLabel = Boolean(label?.trim());
  const tooltip = callout?.trim() || "THOW lot reading";

  return (
    <div className="relative flex flex-col items-center">
      <div
        role="status"
        aria-label={hasLabel ? `${tooltip} at ${label}` : tooltip}
        className="pointer-events-none relative z-30 mb-2 max-w-[16rem] rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-center shadow-[0_6px_18px_rgb(15_23_42/0.12)]"
      >
        <p className="text-[13px] leading-none font-semibold tracking-tight text-slate-900">
          {tooltip}
        </p>
        <span
          className="absolute top-full left-1/2 -mt-px h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r border-b border-slate-200/90 bg-white"
          aria-hidden="true"
        />
      </div>

      <span
        aria-hidden={!interactive}
        aria-label={
          interactive
            ? hasLabel
              ? `${statusLabel} lookup point for ${label}`
              : `${statusLabel} geocoded location`
            : undefined
        }
        className={cn(
          "group/pin relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-end",
          interactive && hasLabel ? "cursor-default" : "cursor-default",
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
            resolved ? STATUS_ACCENT[resolved] : "text-slate-700",
          )}
        >
          <MapPin size={18} strokeWidth={2.1} aria-hidden="true" />
        </span>
      </span>
    </div>
  );
}
