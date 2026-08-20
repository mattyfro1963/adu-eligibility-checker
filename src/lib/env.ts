import { z } from "zod";

/** Fail fast at import time if required public config is missing. */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  REGRID_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
  REGRID_API_KEY: process.env.REGRID_API_KEY,
});
