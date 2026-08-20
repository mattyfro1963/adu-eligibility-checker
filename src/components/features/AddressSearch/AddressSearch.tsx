"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { MapPin, Search } from "lucide-react";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
  error?: string | null;
  showDemoScenarios?: boolean;
  compact?: boolean;
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
    suggestion.county &&
    suggestion.county.toLowerCase() !== suggestion.place.toLowerCase()
      ? suggestion.county
      : null,
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
        "flex flex-col",
        compact ? "space-y-6" : "space-y-8",
      )}
    >
      {!compact ? (
        <header className="space-y-4 text-center">
          <p className="font-label text-[11px] text-muted-foreground">
            California ADU &amp; SB 9
          </p>
          <h1 className="font-display text-heading tracking-display sm:text-display">
            Check your lot.
          </h1>
          <p className="mx-auto max-w-md text-base font-normal leading-relaxed tracking-body text-muted-foreground">
            California ADU and SB 9 eligibility with county requirements — lot
            zoning where coverage exists, not statewide permitting automation.
          </p>
        </header>
      ) : null}

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-editorial">
        <div ref={containerRef} className="relative w-full p-8">
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
                "relative flex h-14 items-center rounded-input border bg-background transition-colors",
                hasError
                  ? "border-rose-600"
                  : "border-border focus-within:border-foreground",
              )}
            >
              <MapPin
                className="absolute left-4 text-muted-foreground"
                size={18}
                strokeWidth={1.5}
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
                className="h-full w-full rounded-input bg-transparent pr-28 pl-11 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 sm:pr-36"
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
                className="absolute top-1/2 right-1.5 h-10 -translate-y-1/2 gap-2 px-4"
                aria-label="Evaluate lot"
              >
                {isResolving ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                      aria-hidden="true"
                    />
                    Locating
                  </>
                ) : (
                  <>
                    <Search size={14} strokeWidth={1.5} aria-hidden="true" />
                    Evaluate
                  </>
                )}
              </Button>
            </div>
          </form>
          {hasError ? (
            <p
              role="alert"
              className="mt-2 text-left text-caption text-rose-600"
            >
              {error}
            </p>
          ) : null}

          {showList ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-2 w-[calc(100%-4rem)] overflow-hidden rounded-input border border-border bg-card shadow-editorial"
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
                      className="flex min-h-[44px] w-full items-start gap-3 border-b border-border px-3 py-3 text-left last:border-b-0 hover:bg-muted"
                      aria-label={`Select ${suggestion.formattedAddress}`}
                    >
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {suggestion.streetLine || suggestion.formattedAddress}
                        </span>
                        {secondary ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
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

        {!compact && children ? (
          <div className="border-t border-border px-8 py-6">{children}</div>
        ) : null}

        {!compact ? (
          <p className="border-t border-border px-8 py-4 text-center text-caption leading-relaxed text-muted-foreground">
            All CA counties — lot GIS where coverage exists; county requirements
            always.
          </p>
        ) : null}

        {demosEnabled && !compact ? (
          <div className="border-t border-border px-8 py-6">
            <div className="flex flex-col items-center gap-3">
              <span className="font-label text-muted-foreground">Simulate scenarios</span>
              <div className="flex flex-wrap justify-center gap-2">
                {DEMO_SCENARIOS.map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => {
                      void resolveQuery(demo.query);
                    }}
                    className="min-h-[44px] rounded-pill border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
