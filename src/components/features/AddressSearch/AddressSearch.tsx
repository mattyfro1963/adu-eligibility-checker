"use client";

import { useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { useAddressSearch } from "@/components/features/AddressSearch/useAddressSearch";
import type { GeocodeResult } from "@/lib/types/gis";

interface AddressSearchProps {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
}

export function AddressSearch({ onResolved, onError }: AddressSearchProps) {
  const {
    query,
    suggestions,
    isSearching,
    isOpen,
    setIsOpen,
    handleQueryChange,
    selectAddress,
    handleSubmit,
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

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <label htmlFor="address-search" className="sr-only">
        Search property address
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder="Enter a San Francisco address…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Property address search"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSearching || !query.trim()}
          className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-700 disabled:opacity-50"
          aria-label="Search address"
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
      </div>

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.addressId} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => selectAddress(suggestion)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50"
                aria-label={`Select ${suggestion.formattedAddress}`}
              >
                <MapPin
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                {suggestion.formattedAddress}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
