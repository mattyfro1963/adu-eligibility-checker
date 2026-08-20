import { z } from "zod";

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required").max(200),
});

export const zoningQuerySchema = z.object({
  lat: z.coerce.number({ required_error: "lat is required" }),
  lng: z.coerce.number({ required_error: "lng is required" }),
});
