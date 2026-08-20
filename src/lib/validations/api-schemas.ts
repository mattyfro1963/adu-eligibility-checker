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

const propertyIntentSchema = z.enum(["primary", "rental", "family"]);
const structureChoiceSchema = z.enum(["permanent_adu", "thow"]);
const projectBudgetSchema = z.enum(["under_50k", "50k_150k", "150k_plus"]);
const overallStatusSchema = z.enum(["eligible", "warning", "restricted"]);

/** Restricted-path expert review (SF buyer-guides monetization). */
export const restrictedIntentSchema = z.enum([
  "adu_workaround",
  "lot_split",
  "other",
]);

export const restrictedBudgetSchema = z.enum([
  "under_50k",
  "50k_150k",
  "150k_350k",
  "350k_plus",
  "unsure",
]);

const leadContactBase = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().min(1, "Address is required").max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
};

export const projectLeadBodySchema = z.object({
  type: z.literal("project"),
  ...leadContactBase,
  propertyIntent: propertyIntentSchema,
  structure: structureChoiceSchema,
  budget: projectBudgetSchema,
  overallStatus: overallStatusSchema.optional(),
});

export const quoteInterestBodySchema = z.object({
  type: z.literal("quote_interest"),
  ...leadContactBase,
  contractorId: z.string().trim().min(1).max(80),
  propertyIntent: propertyIntentSchema.optional(),
  structure: structureChoiceSchema.optional(),
  budget: projectBudgetSchema.optional(),
});

export const restrictedReviewBodySchema = z.object({
  type: z.literal("restricted_review"),
  ...leadContactBase,
  intent: restrictedIntentSchema,
  budget: restrictedBudgetSchema,
  overallStatus: z.literal("restricted").optional(),
});

export const leadBodySchema = z.discriminatedUnion("type", [
  projectLeadBodySchema,
  quoteInterestBodySchema,
  restrictedReviewBodySchema,
]);

export type LeadBody = z.infer<typeof leadBodySchema>;

export const builderSignupBodySchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(160),
  licenseNumber: z.string().trim().min(1, "License number is required").max(80),
  email: z.string().trim().email("Valid email is required").max(200),
  serviceZips: z
    .string()
    .trim()
    .min(1, "Service ZIP codes are required")
    .max(200),
  notes: z.string().trim().max(1000).optional(),
});
