import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/**
 * Prefer `MAPBOX_ACCESS_TOKEN`; fall back to `VITE_MAPBOX_ACCESS_TOKEN`
 * (legacy Vercel / Vite naming) so deploys keep working without a rename.
 * Server-only — never expose via NEXT_PUBLIC_*.
 */
export function resolveMapboxAccessToken(vars: {
  MAPBOX_ACCESS_TOKEN?: string | undefined;
  VITE_MAPBOX_ACCESS_TOKEN?: string | undefined;
}): string | undefined {
  const primary = emptyToUndefined(vars.MAPBOX_ACCESS_TOKEN);
  if (typeof primary === "string") {
    return primary.trim();
  }
  const fallback = emptyToUndefined(vars.VITE_MAPBOX_ACCESS_TOKEN);
  if (typeof fallback === "string") {
    return fallback.trim();
  }
  return undefined;
}

/** Fail fast at import time if required public config is missing. */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  MAPBOX_ACCESS_TOKEN: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  REGRID_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  /** Optional — Sentry no-ops when unset (local/CI without secrets). */
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  MAPBOX_ACCESS_TOKEN: resolveMapboxAccessToken({
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    VITE_MAPBOX_ACCESS_TOKEN: process.env.VITE_MAPBOX_ACCESS_TOKEN,
  }),
  REGRID_API_KEY: process.env.REGRID_API_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_DSN: process.env.SENTRY_DSN,
});

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

/** True when a Mapbox token resolved (primary or VITE_ fallback). */
export function isMapboxConfigured(): boolean {
  return Boolean(env.MAPBOX_ACCESS_TOKEN?.trim());
}
