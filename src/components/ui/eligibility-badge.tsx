import { Circle, Minus, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/lib/types/zoning";

export type EligibilityBadgeProgram = "thow" | "adu" | "sb9" | "dimension";

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
    icon: Circle,
    className:
      "border-transparent bg-status-eligible-solid text-status-eligible-solid-fg [a]:hover:bg-status-eligible-solid",
  },
  warning: {
    label: "Yellow",
    vocabulary: "Warning",
    icon: Minus,
    className:
      "border-transparent bg-status-warning-solid text-status-warning-solid-fg [a]:hover:bg-status-warning-solid",
  },
  restricted: {
    label: "Red",
    vocabulary: "Restricted",
    icon: Square,
    className:
      "border-transparent bg-status-restricted-solid text-status-restricted-solid-fg [a]:hover:bg-status-restricted-solid",
  },
};

function programAriaLabel(
  program: EligibilityBadgeProgram,
  vocabulary: string,
  color: string,
): string {
  if (program === "adu") {
    return `ADU pathway: ${vocabulary} (${color})`;
  }
  if (program === "sb9") {
    return `SB 9 pathway: ${vocabulary} (${color})`;
  }
  if (program === "dimension") {
    return `THOW dimension: ${vocabulary} (${color})`;
  }
  return `THOW candidacy: ${vocabulary} (${color})`;
}

/**
 * THOW lot-candidacy badge: filled Eligible / Warning / Restricted pills.
 * Eligible is the neon-green twin of the reference “Compliant” chrome.
 */
export function EligibilityBadge({
  status,
  size = "sm",
  className,
  program = "thow",
  example = false,
}: {
  status: EligibilityStatus;
  size?: "sm" | "lg";
  className?: string;
  program?: EligibilityBadgeProgram;
  /** Idle hero chrome — illustrates vocabulary, not a live lot result. */
  example?: boolean;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      role={example ? undefined : "status"}
      className={cn(
        "gap-1.5 rounded-full border font-semibold shadow-none",
        size === "lg"
          ? "h-auto px-5 py-2 text-[15px] tracking-tight [&>svg]:size-4!"
          : "h-auto px-2.5 py-1 text-[11px] tracking-tight [&>svg]:size-3.5!",
        config.className,
        className,
      )}
      aria-hidden={example || undefined}
      aria-label={
        example
          ? undefined
          : programAriaLabel(program, config.vocabulary, config.label)
      }
    >
      <Icon
        className={size === "lg" ? "size-4!" : "size-3!"}
        strokeWidth={2.4}
        aria-hidden="true"
      />
      <span aria-hidden="true">{config.vocabulary}</span>
    </Badge>
  );
}
