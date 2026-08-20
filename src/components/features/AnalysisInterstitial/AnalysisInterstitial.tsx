"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { cn } from "@/lib/utils";

const STEPS = [
  "Locating address",
  "Fetching parcel / zoning (DataSF PIP)",
  "Evaluating ADU rules",
  "Evaluating SB 9 rules",
] as const;

const STEP_MS = 450;

interface AnalysisInterstitialProps {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Full-screen analysis overlay while zoning is in flight.
 * Checklist tracks the real pipeline — no invented overlay layers.
 */
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
    if (completedCount >= STEPS.length - 1) return;
    const timeoutId = window.setTimeout(() => {
      setCompletedCount((count) => Math.min(count + 1, STEPS.length - 1));
    }, STEP_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [completedCount]);

  const activeIndex = Math.min(completedCount, STEPS.length - 1);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analyzing parcel"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1D1D1F]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 saturate-0">
        <AddressMapPreview
          lat={lat}
          lng={lng}
          chrome={false}
          className="min-h-full rounded-none border-0 bg-[#1D1D1F] shadow-none sm:min-h-full lg:min-h-full"
        />
      </div>
      <div
        className="relative z-10 w-[min(100%-2rem,400px)] rounded-xl border border-border bg-white p-6 shadow-registry"
        aria-label="Analysis progress"
      >
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          Parcel analysis
        </p>
        <p className="mt-2 text-sm font-medium break-words text-foreground">
          {address}
        </p>
        <ol className="mt-5 space-y-3">
          {STEPS.map((label, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    done && "border-emerald-200 bg-emerald-50",
                    active && "border-primary bg-primary/10",
                    !done && !active && "border-border bg-[#F5F5F7]",
                  )}
                  aria-hidden="true"
                >
                  {done ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : active ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-slate-300" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    done && "text-foreground",
                    active && "animate-pulse font-medium text-primary",
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
          Fire, historic, and coastal overlays are still stubbed false in this
          SF zoning pilot.
        </p>
      </div>
    </div>
  );
}
