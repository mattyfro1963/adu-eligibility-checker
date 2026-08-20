import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

const statusConfig: Record<
  EligibilityStatus,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  eligible: {
    label: "Eligible",
    icon: CheckCircle2,
    className:
      "border-emerald-600/35 bg-emerald-600/10 text-emerald-600 [a]:hover:bg-emerald-600/15",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className:
      "border-amber-500/35 bg-amber-500/10 text-amber-500 [a]:hover:bg-amber-500/15",
  },
  restricted: {
    label: "Restricted",
    icon: XCircle,
    className:
      "border-rose-600/35 bg-rose-600/10 text-rose-600 [a]:hover:bg-rose-600/15",
  },
};

/**
 * Thin eligibility status badge over shadcn Badge.
 * Chromatic emerald / amber / rose — eligibility/stat context only.
 */
export function EligibilityBadge({
  status,
  size = "sm",
  className,
}: {
  status: EligibilityStatus;
  size?: "sm" | "lg";
  className?: string;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-pill border shadow-none",
        size === "lg"
          ? "h-auto px-4 py-1.5 text-sm font-medium"
          : "h-auto px-2.5 py-1 text-[11px] font-medium tracking-[-0.02em] uppercase",
        config.className,
        className,
      )}
      aria-label={`Status: ${config.label}`}
    >
      <Icon
        className={size === "lg" ? "size-[18px]!" : "size-3.5!"}
        strokeWidth={2}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  );
}
