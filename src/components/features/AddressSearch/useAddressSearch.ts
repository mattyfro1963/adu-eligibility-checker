import { useCallback, useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/lib/types/gis";

interface UseAddressSearchOptions {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string) => void;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/** Same-origin relative URL — avoids apex↔www redirect breaking fetch. */
function geocodeUrl(query: string): string {
  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("q", query);
  return url.toString();
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return fallback;
}

function parseResults(data: unknown): GeocodeResult[] {
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray(data.results)
  ) {
    return data.results as GeocodeResult[];
  }
  return [];
}

export function useAddressSearch({
  onResolved,
  onError,
}: UseAddressSearchOptions) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(
    async (value: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);

      try {
        const res = await fetch(geocodeUrl(value), {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          setSuggestions([]);
          onError?.(
            readErrorMessage(body, "Failed to fetch address suggestions"),
          );
          return;
        }
        const data: unknown = await res.json();
        setSuggestions(parseResults(data));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        onError?.("Failed to fetch address suggestions");
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    },
    [onError],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchSuggestions(trimmed);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, fetchSuggestions]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(true);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      setSuggestions([]);
      setIsSearching(false);
    }
  }, []);

  const selectAddress = useCallback(
    (result: GeocodeResult) => {
      setQuery(result.formattedAddress);
      setIsOpen(false);
      setSuggestions([]);
      onResolved(result);
    },
    [onResolved],
  );

  const resolveQuery = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setQuery(trimmed);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      setIsResolving(true);

      try {
        const res = await fetch(geocodeUrl(trimmed), {
          signal: controller.signal,
        });
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          onError?.(readErrorMessage(body, "Address not found"));
          return;
        }
        const data: unknown = await res.json();
        const result = parseResults(data)[0];
        if (!result) {
          onError?.("Address not found");
          return;
        }
        selectAddress(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        onError?.("Failed to geocode address");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
          setIsResolving(false);
        }
      }
    },
    [onError, selectAddress],
  );

  const handleSubmit = useCallback(async () => {
    await resolveQuery(query);
  }, [query, resolveQuery]);

  return {
    query,
    suggestions,
    isSearching,
    isResolving,
    isOpen,
    setIsOpen,
    handleQueryChange,
    selectAddress,
    handleSubmit,
    resolveQuery,
  };
}
