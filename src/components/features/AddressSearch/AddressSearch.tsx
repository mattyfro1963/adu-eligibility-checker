"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Search } from "lucide-react";
import { SampleReportButtons } from "@/components/features/AddressSearch/SampleReportButtons";
import { SearchTopicCards } from "@/components/features/AddressSearch/SearchTopicCards";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
  error?: string | null;
  showSampleReports?: boolean;
  compact?: boolean;
  /** Clears results and returns to idle search. */
  onNewSearch?: () => void;
  children?: ReactNode;
}

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

export function AddressSearch({
  onResolved,
  onError,
  error = null,
  showSampleReports = true,
  compact = false,
  onNewSearch,
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
  const errorId = "address-search-error";

  return (
    <section
      className={cn(
        "flex flex-col",
        compact ? "space-y-4" : "mx-auto w-full max-w-3xl space-y-10",
      )}
    >
      {compact ? (
        <h1 className="sr-only">
          Tiny Home on Wheels Lot Eligibility Checker — CA, OR, WA
        </h1>
      ) : (
        <header className="space-y-5 text-center">
          <p className="font-label text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
            California · Oregon · Washington
          </p>
          <h1 className="font-display text-[2rem] leading-[1.15] tracking-display text-balance text-text-luxury sm:text-4xl">
            Tiny Home on Wheels Lot Eligibility Checker
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-text-tertiary sm:text-base">
            Screen a lot for certified THOW, park-model RV, or similar wheeled
            placement — zoning path, certification, transport, and utilities.
            ADU is an optional pathway, not automatic.
          </p>
        </header>
      )}

      <div
        ref={containerRef}
        className={cn("relative w-full", compact ? "space-y-2" : "space-y-8")}
      >
        <label htmlFor="address-search" className="sr-only">
          Search property address
        </label>
        {compact && onNewSearch ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNewSearch}
              className="inline-flex min-h-[44px] items-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Search another address
            </button>
          </div>
        ) : null}
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
              "relative flex items-center rounded-xl border border-border bg-card shadow-elevated transition-[border-color,box-shadow] focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-ring/25",
              compact ? "h-12" : "h-14 sm:h-16",
              hasError && "ring-2 ring-rose-600 ring-inset",
            )}
          >
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
              placeholder="Enter a CA, OR, or WA address..."
              className={cn(
                "h-full w-full bg-transparent pr-14 pl-5 text-body text-foreground placeholder:text-muted-foreground focus:outline-none",
                compact ? "text-sm" : "text-base",
              )}
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
              autoComplete="off"
              disabled={isResolving}
            />
            <button
              type="submit"
              disabled={isResolving || !query.trim()}
              className="absolute top-1/2 right-4 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-foreground transition-colors hover:text-muted-foreground disabled:opacity-40"
              aria-label={isResolving ? "Locating address" : "Search address"}
            >
              {isResolving ? (
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Search size={20} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        </form>

        {showSampleReports && !compact && !isResolving ? (
          <SampleReportButtons
            onSelectQuery={(value) => {
              void resolveQuery(value);
            }}
            disabled={isResolving}
          />
        ) : null}

        {hasError ? (
          <p
            id={errorId}
            role="alert"
            className="text-left text-caption text-rose-600"
          >
            {error}
          </p>
        ) : null}

        {showList ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
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
                    className="flex min-h-[44px] w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted"
                    aria-label={`Select ${suggestion.formattedAddress}`}
                  >
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

        {!compact && children ? <div>{children}</div> : null}
      </div>

      {!compact ? (
        <div className="mx-auto w-full max-w-5xl">
          <SearchTopicCards />
        </div>
      ) : null}
    </section>
  );
}
