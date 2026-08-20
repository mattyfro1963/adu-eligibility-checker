"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
  /** Search / zoning error shown on the bar (rose micro-border + 13px text). */
  error?: string | null;
  /** When false (Mapbox live), omit mock demo chips. */
  showDemoScenarios?: boolean;
  /** Compact bar after a lot is resolved (hides landing headline chrome). */
  compact?: boolean;
  /** Feature row rendered inside the search card (landing layout). */
  children?: ReactNode;
}

const DEMO_SCENARIOS = [
  { label: "123 Main St", query: "123 Main St" },
  { label: "100 Market St", query: "100 Market St" },
  { label: "555 Beach", query: "555 Beach" },
  { label: "789 Pine", query: "789 Pine" },
] as const;

function secondaryLine(suggestion: GeocodeResult): string {
  const parts = [
    suggestion.place,
    [suggestion.region, suggestion.postcode].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.join(", ");
}

function subscribeMapboxFlag() {
  return () => {};
}

function getMapboxDemoSnapshot(): boolean {
  return document.body.dataset.mapboxConfigured !== "1";
}

function getMapboxDemoServerSnapshot(): boolean {
  return false;
}

export function AddressSearch({
  onResolved,
  onError,
  error = null,
  showDemoScenarios,
  compact = false,
  children,
}: AddressSearchProps) {
  const {
    query,
    suggestions,
    isResolving,
    isOpen,
    setIsOpen,
    handleQueryChange,
    selectAddress,
    handleSubmit,
    resolveQuery,
  } = useAddressSearch({ onResolved, onError });

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = "address-suggestions";
  const showList = isOpen && suggestions.length > 0;

  const demosFromDom = useSyncExternalStore(
    subscribeMapboxFlag,
    getMapboxDemoSnapshot,
    getMapboxDemoServerSnapshot,
  );
  const demosEnabled =
    typeof showDemoScenarios === "boolean" ? showDemoScenarios : demosFromDom;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [setIsOpen]);

  const hasError = Boolean(error);

  return (
    <section
      className={cn(
        "landing-hero-copy flex flex-col",
        compact ? "space-y-4" : "space-y-6 sm:space-y-8",
      )}
    >
      {!compact ? (
        <div className="space-y-3 sm:space-y-4">
          <h1 className="max-w-xl text-3xl leading-[1.15] font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
            Instantly evaluate California properties for ADU and SB 9 potential.
          </h1>
          <p className="max-w-lg text-base font-light tracking-wide text-muted-foreground sm:text-lg">
            Parcel-fact checks for ADU and SB 9 — SF zoning is a DataSF-backed
            pilot, not a statewide permit engine.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border border-border bg-white shadow-registry",
          compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        )}
      >
        <div ref={containerRef} className="relative w-full">
          <label htmlFor="address-search" className="sr-only">
            Search property address
          </label>
          <form
            id="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="relative"
          >
            <div
              className={cn(
                "relative flex h-16 items-center rounded-xl border bg-white p-1.5 transition-all duration-200",
                hasError
                  ? "border-rose-600"
                  : "border-border focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(0,102,204,0.15)]",
              )}
            >
              <MapPin
                className="absolute left-4 text-muted-foreground sm:left-5"
                size={20}
                aria-hidden="true"
              />
              <input
                id="address-search"
                type="text"
                role="combobox"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                placeholder="Enter a California address..."
                className="h-full w-full bg-transparent pr-28 pl-12 text-base font-light text-foreground placeholder:text-muted-foreground focus:outline-none sm:pr-40 sm:pl-14 sm:text-lg"
                aria-label="Property address search"
                aria-autocomplete="list"
                aria-expanded={showList}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                aria-invalid={hasError}
                autoComplete="off"
                disabled={isResolving}
              />
              <Button
                type="submit"
                disabled={isResolving || !query.trim()}
                className="absolute top-1/2 right-1.5 h-11 -translate-y-1/2 gap-2 rounded-lg px-3 text-xs font-medium tracking-wide shadow-sm sm:right-2 sm:px-4 sm:text-sm"
                aria-label="Evaluate lot"
              >
                {isResolving ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                    Locating...
                  </>
                ) : (
                  <>
                    <Search size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Evaluate</span>
                  </>
                )}
              </Button>
            </div>
          </form>
          {hasError ? (
            <p
              role="alert"
              className="mt-2 text-left text-[13px] text-rose-600"
            >
              {error}
            </p>
          ) : null}

          {showList ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md"
            >
              {suggestions.map((suggestion) => {
                const secondary = secondaryLine(suggestion);
                return (
                  <li
                    key={suggestion.addressId}
                    role="option"
                    aria-selected="false"
                  >
                    <button
                      type="button"
                      onClick={() => selectAddress(suggestion)}
                      className="flex min-h-[44px] w-full items-start gap-3 border-b border-slate-100 px-3.5 py-3 text-left last:border-b-0 hover:bg-slate-50 sm:px-4"
                      aria-label={`Select ${suggestion.formattedAddress}`}
                    >
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {suggestion.streetLine || suggestion.formattedAddress}
                        </span>
                        {secondary ? (
                          <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {secondary}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        {!compact ? (
          <div className="mt-5 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm"
              aria-hidden="true"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              Compliant
            </span>
            <span className="sr-only">
              Example status badge — real eligibility appears after you evaluate
              a lot.
            </span>
          </div>
        ) : null}

        {!compact && children ? (
          <div className="mt-5 border-t border-border pt-5">{children}</div>
        ) : null}

        {!compact ? (
          <p className="mt-4 text-center text-[11px] tracking-wide text-slate-400">
            California statewide analysis — parcel-level zoning is currently in
            pilot coverage (DataSF-backed for San Francisco lots).
          </p>
        ) : null}

        {demosEnabled && !compact ? (
          <div className="mt-4 flex w-full flex-col items-center gap-3">
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Simulate Scenarios
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {DEMO_SCENARIOS.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => {
                    void resolveQuery(demo.query);
                  }}
                  className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-[#F5F5F7] hover:text-slate-900 sm:px-4 sm:py-2"
                >
                  {demo.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              Demo strings use the mock geocoder (Mapbox token unset).
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
