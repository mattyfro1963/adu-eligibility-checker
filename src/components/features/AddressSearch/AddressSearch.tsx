"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import { SearchAudienceToggle } from "@/components/features/AddressSearch/SearchAudienceToggle";
import { SearchTopicCards } from "@/components/features/AddressSearch/SearchTopicCards";
import { SearchGlobe } from "@/components/features/SearchGlobe/SearchGlobe";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { cn } from "@/lib/utils";
import type { SearchAudience } from "@/lib/content/search-topics";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
  error?: string | null;
  showDemoScenarios?: boolean;
  compact?: boolean;
  focusLat?: number | null;
  focusLng?: number | null;
  globeLoading?: boolean;
  children?: ReactNode;
}

const DEMO_SCENARIOS = [
  { label: "Clean R-1", query: "123 Main St" },
  { label: "Historic demo", query: "321 historic elm" },
  { label: "Coastal demo", query: "555 coastal beach" },
  { label: "Small lot", query: "950 small lot" },
  { label: "Commercial", query: "100 commercial market" },
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
  focusLat = null,
  focusLng = null,
  globeLoading = false,
  children,
}: AddressSearchProps) {
  const [audience, setAudience] = useState<SearchAudience>("homeowner");
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
        compact ? "space-y-4" : "mx-auto w-full max-w-3xl space-y-8",
      )}
    >
      {!compact ? (
        <header className="space-y-3 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-taupe">
            State of California · ADU &amp; SB 9
          </span>
          <h1 className="font-quote text-4xl font-normal text-brand-charcoal sm:text-5xl">
            Small Footprint. Elevated Living.
          </h1>
          <p className="mx-auto max-w-lg text-base text-brand-charcoal/80">
            Enter a California address below for ADU and SB 9 eligibility,
            county requirements, and tiny-home guidance.
          </p>
        </header>
      ) : null}

      <div
        ref={containerRef}
        className={cn("relative w-full", compact ? "space-y-2" : "space-y-6")}
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
          <div
            className={cn(
              "relative flex items-center border border-brand-taupe/40 bg-white shadow-elevated transition-colors focus-within:border-brand-charcoal",
              compact ? "h-12 rounded-xl" : "h-14 rounded-none sm:h-16",
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
              placeholder="Enter a California address..."
              className={cn(
                "h-full w-full bg-transparent pr-14 pl-5 text-body text-brand-charcoal placeholder:text-brand-taupe/70 focus:outline-none",
                compact ? "text-sm" : "text-base",
              )}
              aria-label="Property address search"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-invalid={hasError}
              autoComplete="off"
              disabled={isResolving}
            />
            <button
              type="submit"
              disabled={isResolving || !query.trim()}
              className="absolute top-1/2 right-4 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-brand-charcoal transition-colors hover:text-brand-wood disabled:opacity-40"
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

        {hasError ? (
          <p role="alert" className="text-left text-caption text-rose-600">
            {error}
          </p>
        ) : null}

        {showList ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-2 w-full overflow-hidden border border-brand-taupe/30 bg-white shadow-elevated"
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

        {!compact ? (
          <div className="flex justify-center">
            <SearchAudienceToggle value={audience} onChange={setAudience} />
          </div>
        ) : null}

        {!compact ? (
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
            <SearchGlobe
              targetLat={focusLat}
              targetLng={focusLng}
              isLoading={globeLoading}
            />
          </div>
        ) : null}

        {!compact && children ? <div>{children}</div> : null}

        {!compact ? (
          <p className="text-center text-caption text-muted-foreground">
            All CA counties — free county requirements; SF lot GIS when
            available.
          </p>
        ) : null}

        {demosEnabled && !compact ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <span className="font-label text-muted-foreground">
              Simulate scenarios
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {DEMO_SCENARIOS.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => {
                    void resolveQuery(demo.query);
                  }}
                  className="min-h-[44px] rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div className="mx-auto w-full max-w-5xl pt-4">
          <SearchTopicCards />
        </div>
      ) : null}
    </section>
  );
}
