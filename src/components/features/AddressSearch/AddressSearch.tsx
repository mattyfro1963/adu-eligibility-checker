"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SampleReportButtons } from "@/components/features/AddressSearch/SampleReportButtons";
import { SearchTopicCards } from "@/components/features/AddressSearch/SearchTopicCards";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import { Button } from "@/components/ui/button";
import { STATE_REGULATION_LINKS } from "@/lib/content/state-regulations-nav";
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

/** Hairline elevation — cream paper, no raster. Matches the 15s film. */
function HeroHouseElevation() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-luxury-taupe"
      viewBox="0 0 960 540"
      fill="none"
      aria-hidden="true"
    >
      <g
        transform="translate(480 248)"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
        opacity="0.16"
      >
        <rect x="-340" y="-70" width="680" height="280" />
        <rect x="-340" y="-118" width="420" height="48" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-300 + i * 78} y="-20" width="64" height="150" />
        ))}
        <path d="M-360 210 H360" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${-320 + i * 80} 210 V250`} />
        ))}
      </g>
    </svg>
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
    setActiveIndex(-1);
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

    if (e.key === "Enter" && showList && activeIndex >= 0) {
      const selected = suggestions[activeIndex];
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
        void handleSubmit();
      }}
      className="relative"
    >
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-white/97 caret-luxury-charcoal transition-[border-color,box-shadow,transform]",
          compact
            ? "h-[52px] border-border-luxury shadow-brochure-input focus-within:border-luxury-charcoal/28 focus-within:ring-2 focus-within:ring-ring"
            : "h-16 border-border-luxury shadow-brochure-input focus-within:border-luxury-charcoal/28 focus-within:ring-2 focus-within:ring-ring",
          isResolving && "search-field-settle",
          hasError && "border-rose-400/70 ring-2 ring-rose-600/40 ring-inset",
        )}
      >
        <label htmlFor="address-search" className="sr-only">
          CA, OR, or WA property address
        </label>
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
            "h-full w-full bg-transparent pr-14 pl-5 text-body text-text-luxury placeholder:text-luxury-taupe/85 focus:outline-none",
            compact ? "text-[16px]" : "text-[18px]",
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
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isResolving || !query.trim()}
          className="absolute top-1/2 right-4 size-11 min-h-[44px] min-w-[44px] -translate-y-1/2 text-foreground hover:bg-transparent hover:text-muted-foreground"
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
        </Button>
      </div>
    </form>
  );

  const suggestionsList = showList ? (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Address suggestions"
      className={cn(
        "absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-card",
        compact
          ? "border-border shadow-elevated"
          : "border-border-luxury shadow-brochure-input",
      )}
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
              // Prevent input blur before click selects
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

  const errorMessage = hasError ? (
    <p
      id={errorId}
      role="alert"
      className="text-left text-sm leading-relaxed text-rose-700"
    >
      {error}
    </p>
  ) : null;

  if (compact) {
    return (
      <section className="flex flex-col space-y-5" aria-label="Address search">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-text-luxury">
              doihave.space
            </h1>
            <p className="mt-0.5 text-sm text-luxury-taupe">
              Tiny home lot readiness — CA, OR, WA
            </p>
          </div>
          {onNewSearch ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onNewSearch}
              className="min-h-[44px] shrink-0 justify-start px-0 text-sm text-text-secondary hover:text-text-luxury sm:justify-center"
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
      <div className="relative isolate min-h-svh w-full overflow-hidden bg-surface-luxury">
        <HeroHouseElevation />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-cream)_72%,transparent)_0%,color-mix(in_srgb,var(--brand-cream)_48%,transparent)_42%,color-mix(in_srgb,var(--brand-cream)_88%,transparent)_78%,var(--surface-luxury)_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20">
          <header className="text-center">
            <span
              className="hero-mark-enter mx-auto mb-5 block size-1.5 bg-brand"
              aria-hidden="true"
            />
            <p className="hero-mark-enter font-sans text-[22px] font-bold tracking-tight text-text-luxury">
              doihave.space
            </p>
            <p className="hero-mark-enter mt-3 font-label text-[13px] tracking-[0.18em] text-text-brand">
              {STATE_REGULATION_LINKS.map((state, index) => (
                <span key={state.href}>
                  {index > 0 ? (
                    <span className="text-text-brand" aria-hidden="true">
                      {" "}
                      ·{" "}
                    </span>
                  ) : null}
                  <Link
                    href={state.href}
                    aria-label={`${state.label} tiny home regulations`}
                    className="text-text-brand transition-colors hover:text-text-brand-hover focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {state.label.toUpperCase()}
                  </Link>
                </span>
              ))}
            </p>
            <span
              className="hero-mark-enter mx-auto mt-2 block h-px w-[210px] bg-text-brand/45"
              aria-hidden="true"
            />
            <h1 className="hero-title-enter font-display mt-8 text-[3rem] tracking-display text-text-luxury sm:mt-10 sm:text-[4rem]">
              <span className="block">Tiny Home Lot</span>
              <span className="block">Readiness Checker</span>
            </h1>
            <p className="hero-sub-enter mx-auto mt-8 max-w-xl text-[18px] leading-relaxed text-text-luxury/82">
              Screen a lot for certified THOW, park-model RV, or similar wheeled
              placement.
            </p>
            <p className="hero-sub-enter mx-auto mt-1 max-w-xl text-[18px] leading-relaxed text-text-luxury/82">
              ADU is an optional pathway, not automatic.
            </p>
          </header>

          <div
            ref={containerRef}
            className="hero-field-enter relative mt-8 w-full sm:mt-10"
          >
            {searchForm}
            {errorMessage ? <div className="mt-2">{errorMessage}</div> : null}
            {suggestionsList}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 sm:px-6 sm:py-12">
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
