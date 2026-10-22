/**
 * MapLibre 6 resolves its worker from `import.meta.url`. Next.js chunks that
 * to a hashed URL (or a non-http scheme), so `new Worker("")` / a missing
 * `./maplibre-gl-worker.mjs` sibling throws “Worker failed to load” and
 * GeoJSON site layers never paint. Pin a same-origin worker before Map init.
 * Zero React.
 */

import { setWorkerUrl } from "maplibre-gl";

export const MAPLIBRE_WORKER_PATH = "/api/maplibre-worker";

export function ensureMapLibreWorker(): void {
  if (typeof window === "undefined") {
    return;
  }
  setWorkerUrl(new URL(MAPLIBRE_WORKER_PATH, window.location.origin).href);
}
