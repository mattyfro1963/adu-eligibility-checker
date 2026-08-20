import { z } from "zod";

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required").max(200),
});

export const zoningQuerySchema = z
  .object({
    addressId: z.string().trim().min(1).optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.addressId) ||
      (data.lat !== undefined && data.lng !== undefined),
    { message: "addressId or lat and lng are required" },
  );
