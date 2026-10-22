"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { cn } from "@/lib/utils";

function subscribeNoop() {
  return () => {};
}

const STEPS = [
  "Locating address",
  "Resolving county requirements",
  "Local zoning when available",
  "Evaluating THOW lot fit",
] as const;

const STEP_MS = 450;

interface AnalysisInterstitialProps {
  lat: number;
  lng: number;
  address: string;
}

export function AnalysisInterstitial({
  lat,
  lng,
  address,
}: AnalysisInterstitialProps) {
  const [completedCount, setCompletedCount] = useState(1);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const progressId = useId();

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const main = document.getElementById("main-content");
    main?.setAttribute("inert", "");

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute("inert");
      previouslyFocused?.focus?.();
    };
  }, [mounted]);

  useEffect(() => {
    if (completedCount >= STEPS.length) return;
    const timeoutId = window.setTimeout(() => {
      setCompletedCount((count) => Math.min(count + 1, STEPS.length));
    }, STEP_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [completedCount]);

  const activeIndex = Math.min(completedCount, STEPS.length - 1);
  const allComplete = completedCount >= STEPS.length;
  const liveStatus = allComplete
    ? "Analysis complete"
    : (STEPS[activeIndex] ?? "Analyzing parcel");

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      role="presentation"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <AddressMapPreview
          lat={lat}
          lng={lng}
          chrome={false}
          className="min-h-full rounded-none border-0 bg-muted shadow-none sm:min-h-full lg:min-h-full"
        />
      </div>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={progressId}
        tabIndex={-1}
        className="relative z-10 w-[min(100%-2rem,400px)] rounded-[10px] border border-border bg-card p-8 shadow-elevated outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p id={titleId} className="font-label text-muted-foreground">
          Parcel analysis
        </p>
        <p className="font-heading mt-3 text-subheading break-words text-foreground">
          {address}
        </p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveStatus}
        </p>
        <ol
          id={progressId}
          className="mt-5 space-y-3"
          aria-label="Analysis progress"
        >
          {STEPS.map((label, index) => {
            const done =
              index < activeIndex ||
              (allComplete && index === STEPS.length - 1);
            const active = index === activeIndex && !allComplete;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    done && "border-emerald-600/30 bg-emerald-500/15",
                    active && "border-primary bg-primary/10",
                    !done && !active && "border-border bg-muted",
                  )}
                  aria-hidden="true"
                >
                  {done ? (
                    <Check size={14} className="text-emerald-700" />
                  ) : active ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-border" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    done && "text-foreground",
                    active && "font-medium text-primary",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {label}
                  {active ? (
                    <span className="sr-only"> (in progress)</span>
                  ) : null}
                  {done ? <span className="sr-only"> (complete)</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-5 text-xs text-muted-foreground">
          County requirements, then lot GIS when available, then THOW placement,
          certification, transport, and lot readiness.
        </p>
      </div>
    </div>,
    document.body,
  );
}
