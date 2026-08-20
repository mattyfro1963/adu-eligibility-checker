"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

type SearchGlobeProps = {
  targetLat?: number | null;
  targetLng?: number | null;
  isLoading?: boolean;
  className?: string;
};

const SearchGlobeCanvas = dynamic(
  () =>
    import("@/components/features/SearchGlobe/SearchGlobeCanvas").then(
      (mod) => mod.SearchGlobeCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="aspect-square w-full max-h-[70vh] min-h-[200px]"
        aria-hidden="true"
      />
    ),
  },
);

/** WGS84-accurate globe via react-globe.gl — transparent background, day texture. */
export function SearchGlobe({
  targetLat,
  targetLng,
  isLoading = false,
  className,
}: SearchGlobeProps) {
  return (
    <SearchGlobeCanvas
      targetLat={targetLat}
      targetLng={targetLng}
      isLoading={isLoading}
      className={cn(className)}
    />
  );
}
