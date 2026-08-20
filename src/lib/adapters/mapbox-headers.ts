import { env } from "@/lib/env";

/**
 * Mapbox public (`pk.`) tokens are often URL-restricted in the Mapbox
 * dashboard. URL restrictions are enforced via the `Referer` header, and
 * server-side fetches send none — so a restricted token gets 403 Forbidden
 * even though it works in a browser. Sending our own site origin as the
 * Referer keeps restricted tokens working for these server-side proxies.
 */
export function mapboxRequestHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    Referer: `${env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/`,
    ...extra,
  };
}
