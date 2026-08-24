"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { cn } from "@/lib/utils";

const STEPS = [
  "Locating address",
  "Resolving county requirements",
  "Local zoning when available",
  "Evaluating THOW lot candidacy",
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

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

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

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analyzing parcel"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
    >
      <div className="pointer-events-none absolute inset-0">
        <AddressMapPreview
          lat={lat}
          lng={lng}
          chrome={false}
          className="min-h-full rounded-none border-0 bg-muted shadow-none sm:min-h-full lg:min-h-full"
        />
      </div>
      <div
        className="relative z-10 w-[min(100%-2rem,400px)] rounded-[10px] border border-border bg-card p-8 shadow-elevated"
        aria-label="Analysis progress"
      >
        <p className="font-label text-muted-foreground">Parcel analysis</p>
        <p className="font-heading mt-3 text-subheading break-words text-foreground">
          {address}
        </p>
        <ol className="mt-5 space-y-3">
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
                    <Check size={14} className="text-emerald-600" />
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
    </div>
  );
}
