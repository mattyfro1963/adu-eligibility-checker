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
    label: "Green",
    icon: CheckCircle2,
    className:
      "border-status-eligible-border bg-status-eligible-muted text-status-eligible-fg [a]:hover:bg-status-eligible-muted",
  },
  warning: {
    label: "Yellow",
    icon: AlertTriangle,
    className:
      "border-status-warning-border bg-status-warning-muted text-status-warning-fg [a]:hover:bg-status-warning-muted",
  },
  restricted: {
    label: "Red",
    icon: XCircle,
    className:
      "border-status-restricted-border bg-status-restricted-muted text-status-restricted-fg [a]:hover:bg-status-restricted-muted",
  },
};

/**
 * THOW lot-candidacy badge: Green / Yellow / Red over shadcn Badge.
 * Status tokens only — emerald / amber / rose reserved for eligibility context.
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
      aria-label={`THOW candidacy: ${config.label}`}
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
