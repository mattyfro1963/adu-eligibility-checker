"use client";

import { cn } from "@/lib/utils";
import {
  SEARCH_AUDIENCE_OPTIONS,
  type SearchAudience,
} from "@/lib/content/search-topics";

type SearchAudienceToggleProps = {
  value: SearchAudience;
  onChange: (value: SearchAudience) => void;
};

/** Revolut-style Personal / Business pill toggle. */
export function SearchAudienceToggle({
  value,
  onChange,
}: SearchAudienceToggleProps) {
  return (
    <div
      className="inline-flex rounded-full bg-secondary p-1"
      role="tablist"
      aria-label="Search audience"
    >
      {SEARCH_AUDIENCE_OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-[44px] rounded-full px-6 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
