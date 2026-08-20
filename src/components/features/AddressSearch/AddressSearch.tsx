"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { MapPin, Search } from "lucide-react";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { Button } from "@/components/ui/button";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
  /** When false (Mapbox live), omit mock demo chips. */
  showDemoScenarios?: boolean;
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
  showDemoScenarios,
}: AddressSearchProps) {
  const {
    query,
    suggestions,
    isSearching,
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

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4 py-12 text-center sm:space-y-10 sm:px-6 sm:py-16 md:py-24">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <h2 className="text-3xl leading-[1.1] font-medium tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Unlock your parcel&apos;s <br className="hidden md:block" />
            <span className="text-slate-400">hidden potential.</span>
          </h2>
          <p className="mt-3 text-base font-light tracking-wide text-slate-500 sm:mt-4 sm:text-lg md:text-xl">
            Institutional-grade California ADU &amp; SB 9 spatial analysis in
            milliseconds.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative mt-4 w-full max-w-2xl sm:mt-6"
        >
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
            <div className="relative flex h-12 items-center rounded-2xl border border-slate-200 bg-[#FBFBFD] p-1.5 shadow-sm transition-all duration-300 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100 sm:h-14">
              <MapPin
                className="absolute left-4 text-slate-400 sm:left-5"
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
                placeholder="Query California address…"
                className="h-full w-full bg-transparent pr-28 pl-12 text-base font-light text-slate-900 placeholder:text-slate-400 focus:outline-none sm:pr-36 sm:pl-14 sm:text-lg"
                aria-label="Property address search"
                aria-autocomplete="list"
                aria-expanded={showList}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                autoComplete="off"
                disabled={isSearching}
              />
              <Button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="absolute top-1/2 right-1.5 h-10 -translate-y-1/2 rounded-xl bg-black px-4 text-xs font-medium tracking-wide text-white shadow-md hover:bg-slate-800 disabled:opacity-50 sm:right-2 sm:px-6 sm:text-sm"
                aria-label="Analyze address"
              >
                {isSearching ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    Analyze <Search size={14} aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>

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

          <p className="mt-3 text-center text-[11px] tracking-wide text-slate-400">
            California statewide analysis — parcel-level zoning is currently in
            pilot coverage (DataSF-backed for San Francisco lots).
          </p>
        </div>

        {demosEnabled ? (
          <div className="flex w-full max-w-2xl flex-col items-center gap-3 pt-2">
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
                  className="min-h-[44px] rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-[#F5F5F7] hover:text-slate-900 sm:px-4 sm:py-2"
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
