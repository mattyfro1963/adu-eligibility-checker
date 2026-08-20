"use client";

import Globe, { type GlobeMethods } from "react-globe.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { MeshLambertMaterial } from "three";
import {
  CALIFORNIA_CENTROID,
  CALIFORNIA_TILE,
  CALIFORNIA_TILE_COLOR,
  EARTH_DAY_TEXTURE,
  GLOBE_FOCUS_ALTITUDE,
  GLOBE_FOCUS_TRANSITION_MS,
  GLOBE_IDLE_ALTITUDE,
  GLOBE_TILES_TRANSITION_MS,
  SEARCH_TILE_COLOR,
  isValidCoordinate,
  markerAtCoordinate,
  searchTileAtCoordinate,
} from "@/lib/globe/globe-config";
import { cn } from "@/lib/utils";

type GlobeTileWithMaterial = {
  id: string;
  lat: number;
  lng: number;
  width: number;
  height: number;
  material: MeshLambertMaterial;
};

type SearchGlobeCanvasProps = {
  targetLat?: number | null;
  targetLng?: number | null;
  isLoading?: boolean;
  className?: string;
};

export function SearchGlobeCanvas({
  targetLat,
  targetLng,
  isLoading = false,
  className,
}: SearchGlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const hasTarget = isValidCoordinate(targetLat, targetLng);
  const shouldFocus = hasTarget && !isLoading;

  const californiaMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: CALIFORNIA_TILE_COLOR,
        opacity: 0.32,
        transparent: true,
      }),
    [],
  );

  const searchMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: SEARCH_TILE_COLOR,
        opacity: 0.5,
        transparent: true,
      }),
    [],
  );

  const points = useMemo(() => {
    if (!shouldFocus || targetLng === null || targetLng === undefined) return [];
    return [markerAtCoordinate(targetLat, targetLng)];
  }, [shouldFocus, targetLat, targetLng]);

  const tilesData = useMemo((): GlobeTileWithMaterial[] => {
    if (shouldFocus && targetLng !== null && targetLng !== undefined) {
      return [
        {
          ...searchTileAtCoordinate(targetLat, targetLng),
          material: searchMaterial,
        },
      ];
    }

    return [
      {
        ...CALIFORNIA_TILE,
        material: californiaMaterial,
      },
    ];
  }, [shouldFocus, targetLat, targetLng, californiaMaterial, searchMaterial]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const maxHeight =
        typeof window !== "undefined"
          ? Math.floor(window.innerHeight * 0.7)
          : width;
      const height = Math.min(width, maxHeight);
      setDimensions({ width, height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    if (shouldFocus && targetLng !== null && targetLng !== undefined) {
      globe.pointOfView(
        { lat: targetLat, lng: targetLng, altitude: GLOBE_FOCUS_ALTITUDE },
        GLOBE_FOCUS_TRANSITION_MS,
      );
      return;
    }

    globe.pointOfView(
      {
        lat: CALIFORNIA_CENTROID.lat,
        lng: CALIFORNIA_CENTROID.lng,
        altitude: GLOBE_IDLE_ALTITUDE,
      },
      GLOBE_FOCUS_TRANSITION_MS,
    );
  }, [shouldFocus, targetLat, targetLng]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      aria-hidden="true"
    >
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={EARTH_DAY_TEXTURE}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#e6e8eb"
          atmosphereAltitude={0.12}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.02}
          pointsMerge={false}
          tilesData={tilesData}
          tileLat="lat"
          tileLng="lng"
          tileWidth="width"
          tileHeight="height"
          tileMaterial="material"
          tileAltitude={0.012}
          tileUseGlobeProjection
          tileCurvatureResolution={4}
          tilesTransitionDuration={GLOBE_TILES_TRANSITION_MS}
          onGlobeReady={() => {
            globeRef.current?.pointOfView({
              lat: CALIFORNIA_CENTROID.lat,
              lng: CALIFORNIA_CENTROID.lng,
              altitude: GLOBE_IDLE_ALTITUDE,
            });
          }}
        />
      ) : null}
    </div>
  );
}
