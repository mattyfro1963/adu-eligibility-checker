/**
 * Allowlist for the server-side Mapbox API proxy.
 * Keeps MAPBOX_ACCESS_TOKEN off the client while GL can load styles/tiles.
 */

export const MAPBOX_PROXY_PREFIXES = [
  "styles/",
  "fonts/",
  "v4/",
  "map-sessions/",
] as const;

export function isAllowedMapboxProxyPath(path: string): boolean {
  const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
  if (
    normalized.length === 0 ||
    normalized.includes("..") ||
    normalized.includes("://")
  ) {
    return false;
  }
  return MAPBOX_PROXY_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}
