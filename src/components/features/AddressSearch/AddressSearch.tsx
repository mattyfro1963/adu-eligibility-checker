"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import { AddressMapPreview } from "@/components/features/AddressMapPreview/AddressMapPreview";
import { WordmarkIcon } from "@/components/features/WordmarkIcon/WordmarkIcon";
import { SampleReportButtons } from "@/components/features/AddressSearch/SampleReportButtons";
import { SearchTopicCards } from "@/components/features/AddressSearch/SearchTopicCards";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { ValueProps } from "@/components/features/ValueProps/ValueProps";
import { EligibilityBadge } from "@/components/ui/eligibility-badge";
import { Button } from "@/components/ui/button";
import { IDLE_HERO_VIEW } from "@/lib/map/basemap";
import {
  comboboxActiveIndexOnOpen,
  comboboxSubmitSelection,
} from "@/lib/search/combobox";
import {
  geocodeErrorNextStep,
  isGeocodeServiceFailure,
} from "@/lib/search/geocode-error";
import { cn } from "@/lib/utils";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string | null) => void;
  error?: string | null;
  showSampleReports?: boolean;
  compact?: boolean;
  /** Clears results and returns to idle search. */
  onNewSearch?: () => void;
  children?: ReactNode;
}

function ProductWordmark() {
  return (
    <div className="hero-mark-enter flex items-center gap-2">
      <WordmarkIcon className="size-8 shrink-0" />
      <span className="text-[15px] font-bold tracking-tight text-slate-900">
        doihave.space
      </span>
      <span className="sr-only">
        Tiny Home on Wheels Lot Eligibility Checker
      </span>
    </div>
  );
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
  const listboxId = useId();
  const optionIdPrefix = useId();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionsForIndex, setSuggestionsForIndex] = useState(suggestions);
  if (suggestions !== suggestionsForIndex) {
    setSuggestionsForIndex(suggestions);
    setActiveIndex(comboboxActiveIndexOnOpen(suggestions.length));
  }
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
  const activeOptionId =
    activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined;
  const nextStep = error ? geocodeErrorNextStep(error) : null;
  const showRetry = Boolean(error && isGeocodeServiceFailure(error));

  function submitFromField() {
    const selected = comboboxSubmitSelection(
      showList,
      activeIndex,
      suggestions,
    );
    if (selected) {
      selectAddress(selected);
      return;
    }
    void handleSubmit();
  }

  function onComboboxKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter") {
      const selected = comboboxSubmitSelection(
        showList,
        activeIndex,
        suggestions,
      );
      if (selected) {
        e.preventDefault();
        selectAddress(selected);
      }
      return;
    }

    if (e.key === "Home" && showList && suggestions.length > 0) {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (e.key === "End" && showList && suggestions.length > 0) {
      e.preventDefault();
      setActiveIndex(suggestions.length - 1);
    }
  }

  const searchForm = (
    <form
      id="search-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitFromField();
      }}
      className="relative"
    >
      <div
        className={cn(
          "relative flex items-center rounded-xl border border-slate-200 bg-white caret-slate-900 transition-[border-color,box-shadow]",
          compact
            ? "h-[52px] shadow-elevated focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-ring"
            : "h-14 shadow-none focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-ring",
          isResolving && "search-field-settle",
          hasError && "border-rose-400/70 ring-2 ring-rose-600/40 ring-inset",
        )}
      >
        <label htmlFor="address-search" className="sr-only">
          CA, OR, or WA property address
        </label>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isResolving || !query.trim()}
          className="absolute top-1/2 left-2 size-11 min-h-[44px] min-w-[44px] -translate-y-1/2 text-slate-400 hover:bg-transparent hover:text-slate-600"
          aria-label={isResolving ? "Locating address" : "Search address"}
        >
          {isResolving ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
              aria-hidden="true"
            />
          ) : (
            <Search size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
        </Button>
        <input
          id="address-search"
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onComboboxKeyDown}
          placeholder="Enter a CA, OR, or WA address..."
          className={cn(
            "h-full w-full bg-transparent pr-4 pl-14 text-body text-slate-900 placeholder:text-slate-400 focus:outline-none",
            compact ? "text-[16px]" : "text-[16px] sm:text-[17px]",
          )}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          autoComplete="off"
          disabled={isResolving}
        />
      </div>
    </form>
  );

  const suggestionsList = showList ? (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Address suggestions"
      className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-card shadow-elevated"
    >
      {suggestions.map((suggestion, index) => {
        const secondary = secondaryLine(suggestion);
        const isActive = index === activeIndex;
        return (
          <li
            key={suggestion.addressId}
            id={`${optionIdPrefix}-${index}`}
            role="option"
            aria-selected={isActive}
            className={cn(
              "flex min-h-[44px] w-full cursor-pointer items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0",
              isActive ? "bg-muted" : "hover:bg-muted",
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => selectAddress(suggestion)}
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
          </li>
        );
      })}
    </ul>
  ) : null;

  const errorMessage =
    hasError && error ? (
      <div id={errorId} role="alert" className="space-y-2 text-left">
        <p className="text-sm leading-relaxed text-rose-700">{error}</p>
        {nextStep ? (
          <p className="text-sm leading-relaxed text-slate-500">{nextStep}</p>
        ) : null}
        {showRetry ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] border-slate-200 hover:bg-slate-50"
            onClick={() => void resolveQuery(query)}
          >
            Retry address lookup
          </Button>
        ) : null}
      </div>
    ) : null;

  if (compact) {
    return (
      <section className="flex flex-col space-y-5" aria-label="Address search">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="sr-only">
            Tiny Home on Wheels Lot Eligibility Checker
          </h1>
          <ProductWordmark />
          {onNewSearch ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onNewSearch}
              className="min-h-[44px] shrink-0 justify-start px-0 text-sm text-slate-500 hover:text-slate-900 sm:justify-center"
            >
              Search another address
            </Button>
          ) : null}
        </header>

        <div ref={containerRef} className="relative w-full space-y-2">
          {searchForm}
          {errorMessage}
          {suggestionsList}
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col" aria-label="Address search">
      <div className="relative isolate w-full bg-surface-luxury">
        <div className="mx-auto grid w-full max-w-layout items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <div className="flex min-w-0 flex-col">
            <ProductWordmark />
            <h1 className="hero-title-enter mt-7 max-w-xl text-[2.35rem] leading-[1.12] font-black tracking-[-0.035em] text-slate-900 sm:mt-8 sm:text-[2.85rem] lg:text-[3.15rem]">
              Instantly evaluate CA, OR, and WA lots for Tiny Home on Wheels
              placement.
            </h1>
            <p className="hero-sub-enter mt-4 max-w-lg text-[15px] leading-relaxed text-slate-500">
              Certified THOW, park-model RV, or similar wheeled placement. ADU
              is an optional pathway, not automatic.
            </p>

            <div
              ref={containerRef}
              className="hero-field-enter relative mt-8 w-full overflow-visible rounded-[20px] border border-slate-200/90 bg-white p-5 pb-8 shadow-elevated sm:mt-9 sm:p-6 sm:pb-8"
            >
              {searchForm}
              {errorMessage ? <div className="mt-3">{errorMessage}</div> : null}
              {suggestionsList}
              <div className="mt-6 flex justify-center">
                <EligibilityBadge status="eligible" size="lg" example />
              </div>
              <p className="sr-only">
                Example Eligible status chrome. Search an address for a live
                Eligible, Warning, or Restricted reading.
              </p>
              <ValueProps />
            </div>
          </div>

          <div className="hero-field-enter relative min-h-[280px] overflow-hidden rounded-[20px] shadow-elevated sm:min-h-[360px] lg:min-h-[520px] lg:h-full">
            <AddressMapPreview
              lat={IDLE_HERO_VIEW.lat}
              lng={IDLE_HERO_VIEW.lng}
              chrome={false}
              showSiteLayers
              zoom={IDLE_HERO_VIEW.zoom}
              className="min-h-[280px] rounded-none sm:min-h-[360px] lg:min-h-[520px]"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-layout space-y-10 px-4 py-10 sm:px-6 sm:py-12">
        {showSampleReports && !isResolving ? (
          <SampleReportButtons
            onSelectQuery={(value) => {
              void resolveQuery(value);
            }}
            disabled={isResolving}
          />
        ) : null}

        {children ? <div>{children}</div> : null}

        <div className="mx-auto w-full max-w-5xl">
          <SearchTopicCards />
        </div>
      </div>
    </section>
  );
}
