import { useCallback, useEffect, useRef, useState } from "react";
import { formatParcelAddress } from "@/lib/address/format-parcel-address";
import type { GeocodeResult } from "@/lib/types/gis";

interface UseAddressSearchOptions {
  onResolved: (result: GeocodeResult) => void;
  onError?: (message: string | null) => void;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/** Same-origin relative URL — avoids apex↔www redirect breaking fetch. */
function geocodeUrl(query: string, mode?: "suggest" | "geocode"): string {
  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("q", query);
  if (mode) {
    url.searchParams.set("mode", mode);
  }
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
  const suggestAbortRef = useRef<AbortController | null>(null);
  const resolveAbortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (value: string) => {
    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;
    setIsSearching(true);

    try {
      const res = await fetch(geocodeUrl(value, "suggest"), {
        signal: controller.signal,
      });
      if (!res.ok) {
        // Suggest 5xx: empty list, no rose 404 stuck on the field.
        setSuggestions([]);
        return;
      }
      const data: unknown = await res.json();
      setSuggestions(parseResults(data));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setSuggestions([]);
    } finally {
      if (suggestAbortRef.current === controller) {
        setIsSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isResolving) {
      return;
    }
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
  }, [query, fetchSuggestions, isResolving]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(true);
      onError?.(null);
      if (value.trim().length < MIN_QUERY_LENGTH) {
        suggestAbortRef.current?.abort();
        setSuggestions([]);
        setIsSearching(false);
      }
    },
    [onError],
  );

  const selectAddress = useCallback(
    (result: GeocodeResult) => {
      setQuery(formatParcelAddress(result));
      setIsOpen(false);
      setSuggestions([]);
      onError?.(null);
      onResolved(result);
    },
    [onError, onResolved],
  );

  const resolveQuery = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setQuery(trimmed);
      suggestAbortRef.current?.abort();
      resolveAbortRef.current?.abort();
      const controller = new AbortController();
      resolveAbortRef.current = controller;
      setIsSearching(true);
      setIsResolving(true);
      setIsOpen(false);
      setSuggestions([]);

      try {
        const res = await fetch(geocodeUrl(trimmed, "geocode"), {
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
        if (resolveAbortRef.current === controller) {
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
