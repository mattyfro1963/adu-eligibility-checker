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
      "border-emerald-200/60 bg-emerald-50 text-emerald-700 [a]:hover:bg-emerald-50",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className:
      "border-amber-200/60 bg-amber-50 text-amber-700 [a]:hover:bg-amber-50",
  },
  restricted: {
    label: "Restricted",
    icon: XCircle,
    className:
      "border-rose-200/60 bg-rose-50 text-rose-700 [a]:hover:bg-rose-50",
  },
};

/**
 * Thin eligibility status badge over shadcn Badge.
 * Keeps emerald / amber / rose semantics for ADU & SB 9 results.
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
        "gap-1.5 rounded-full border shadow-sm backdrop-blur-md",
        size === "lg"
          ? "h-auto px-4 py-1.5 text-sm font-semibold"
          : "h-auto px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase",
        config.className,
        className,
      )}
      aria-label={`Status: ${config.label}`}
    >
      <Icon
        className={size === "lg" ? "size-[18px]!" : "size-3.5!"}
        strokeWidth={2.5}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  );
}
