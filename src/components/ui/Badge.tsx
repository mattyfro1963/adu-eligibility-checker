import type { EligibilityStatus } from "@/lib/types/zoning";

const statusStyles: Record<
  EligibilityStatus,
  { bg: string; text: string; label: string }
> = {
  eligible: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    label: "Eligible",
  },
  warning: {
    bg: "bg-amber-100",
    text: "text-amber-500",
    label: "Warning",
  },
  restricted: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    label: "Restricted",
  },
};

export function Badge({
  status,
  className = "",
}: {
  status: EligibilityStatus;
  className?: string;
}) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text} ${className}`}
      aria-label={`Status: ${style.label}`}
    >
      {style.label}
    </span>
  );
}
