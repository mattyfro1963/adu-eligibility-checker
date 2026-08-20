import { z } from "zod";

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required").max(200),
});

export const zoningQuerySchema = z.object({
  lat: z.coerce.number({ required_error: "lat is required" }),
  lng: z.coerce.number({ required_error: "lng is required" }),
});

/** Mapbox Static Images proxy — dimensions capped to API limits. */
export const mapPreviewQuerySchema = z.object({
  lat: z.coerce.number({ required_error: "lat is required" }).min(-90).max(90),
  lng: z.coerce
    .number({ required_error: "lng is required" })
    .min(-180)
    .max(180),
  width: z.coerce.number().int().min(1).max(1280).optional(),
  height: z.coerce.number().int().min(1).max(1280).optional(),
  zoom: z.coerce.number().min(0).max(22).optional(),
});
