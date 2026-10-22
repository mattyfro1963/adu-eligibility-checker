"use client";

import { useEffect, useId, useState } from "react";
import {
  INTERSTITIAL_HOLD_COPY,
  interstitialHoldsIncomplete,
  interstitialStepState,
} from "@/lib/results/interstitial";
import { cn } from "@/lib/utils";

const STEPS = [
  "Reading the lot",
  "Checking the placement path",
  "Checking certification, transport, and utilities",
] as const;

/** Goal-gradient ticks — stay inside Doherty's 0.4–1s competence window. */
const STEP_MS = 280;

interface AnalysisInterstitialProps {
  address: string;
  /** True only after `/api/zoning` has a report. */
  reportReady?: boolean;
}

/**
 * Quiet inline “reading the lot” state — not a spinner void, not a modal.
 * Map authority lives in ResultsCard beside this copy.
 */
export function AnalysisInterstitial({
  address,
  reportReady = false,
}: AnalysisInterstitialProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const titleId = useId();
  const progressId = useId();
  const holding = interstitialHoldsIncomplete(reportReady);

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) return;
    const timeoutId = window.setTimeout(() => {
      setActiveIndex((index) => Math.min(index + 1, STEPS.length - 1));
    }, STEP_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex]);

  const liveStatus =
    holding && activeIndex >= STEPS.length - 1
      ? INTERSTITIAL_HOLD_COPY
      : (STEPS[activeIndex] ?? STEPS[0]);

  return (
    <div
      role="status"
      aria-labelledby={titleId}
      aria-describedby={progressId}
      className="space-y-5"
    >
      <p id={titleId} className="font-label text-luxury-taupe">
        Reading the lot
      </p>
      <p className="font-sans text-lg leading-snug font-bold break-words text-text-luxury">
        {address}
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </p>
      <ol id={progressId} className="space-y-2.5" aria-label="Lot reading">
        {STEPS.map((label, index) => {
          const state = interstitialStepState(index, activeIndex, reportReady);
          const active = state === "active";
          const done = state === "done";
          return (
            <li key={label} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  done || active ? "bg-luxury-charcoal" : "bg-luxury-taupe/35",
                  active && holding && "animate-pulse",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  active && "text-text-luxury",
                  done && "text-text-luxury/70",
                  !done && !active && "text-luxury-taupe",
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
      {holding && activeIndex >= STEPS.length - 1 ? (
        <p className="text-sm leading-relaxed text-text-luxury">
          {INTERSTITIAL_HOLD_COPY}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-luxury-taupe">
        Placement, certification, transport, and lot readiness — informational,
        not a permit.
      </p>
    </div>
  );
}
