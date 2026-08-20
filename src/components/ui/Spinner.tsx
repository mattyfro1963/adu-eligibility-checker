import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-label={label}
    >
      <div className="animate-spin">
        <Loader2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
