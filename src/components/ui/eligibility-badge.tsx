import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

const statusConfig: Record<
  EligibilityStatus,
  {
    /** Live chrome: Green / Yellow / Red */
    label: string;
    /** Fixed vocabulary: Eligible / Warning / Restricted */
    vocabulary: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  eligible: {
    label: "Green",
    vocabulary: "Eligible",
    icon: CheckCircle2,
    className:
      "border-status-eligible-border bg-status-eligible-muted text-status-eligible-fg [a]:hover:bg-status-eligible-muted",
  },
  warning: {
    label: "Yellow",
    vocabulary: "Warning",
    icon: AlertTriangle,
    className:
      "border-status-warning-border bg-status-warning-muted text-status-warning-fg [a]:hover:bg-status-warning-muted",
  },
  restricted: {
    label: "Red",
    vocabulary: "Restricted",
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
      role="status"
      className={cn(
        "gap-1.5 rounded-md border shadow-none",
        size === "lg"
          ? "h-auto px-3 py-1.5 text-xs font-medium tracking-[0.04em] uppercase"
          : "h-auto px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] uppercase",
        config.className,
        className,
      )}
      aria-label={`THOW candidacy: ${config.vocabulary} (${config.label})`}
    >
      <Icon
        className={size === "lg" ? "size-3.5!" : "size-3!"}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span aria-hidden="true">{config.vocabulary}</span>
    </Badge>
  );
}
