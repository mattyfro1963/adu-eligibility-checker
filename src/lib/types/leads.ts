/** Homeowner project structure preference for contractor matching. */
export type StructureChoice = "permanent_adu" | "thow";

/** How the homeowner intends to use the unit. */
export type PropertyIntent = "primary" | "rental" | "family";

/** Rough budget band for lead qualification. */
export type ProjectBudget = "under_50k" | "50k_150k" | "150k_plus";

export type ContractorSpecialty = "permanent_adu" | "thow" | "tiny_home";

export interface Contractor {
  id: string;
  name: string;
  specialties: ContractorSpecialty[];
  serviceCities: string[];
  lat: number;
  lng: number;
  blurb: string;
  website?: string;
}

export interface ContractorMatch extends Contractor {
  distanceMiles: number;
}

export type LeadRequestType =
  "project" | "quote_interest" | "restricted_review";

export interface ProjectLeadPayload {
  type: "project";
  name: string;
  email: string;
  phone?: string;
  address: string;
  lat: number;
  lng: number;
  propertyIntent: PropertyIntent;
  structure: StructureChoice;
  budget: ProjectBudget;
  /** Optional eligibility context from checker (not invented by this form). */
  overallStatus?: "eligible" | "warning" | "restricted";
}

export interface QuoteInterestPayload {
  type: "quote_interest";
  name: string;
  email: string;
  phone?: string;
  address: string;
  lat: number;
  lng: number;
  contractorId: string;
  propertyIntent?: PropertyIntent;
  structure?: StructureChoice;
  budget?: ProjectBudget;
}

/** Restricted-path expert review from ResultsCard (buyer-guides monetization). */
export type RestrictedIntent = "adu_workaround" | "lot_split" | "other";

export type RestrictedBudget =
  "under_50k" | "50k_150k" | "150k_350k" | "350k_plus" | "unsure";

export interface RestrictedReviewPayload {
  type: "restricted_review";
  name: string;
  email: string;
  phone?: string;
  address: string;
  lat: number;
  lng: number;
  intent: RestrictedIntent;
  budget: RestrictedBudget;
  overallStatus?: "restricted";
}

export type LeadPayload =
  ProjectLeadPayload | QuoteInterestPayload | RestrictedReviewPayload;

export interface BuilderSignupPayload {
  company: string;
  licenseNumber: string;
  email: string;
  serviceZips: string;
  notes?: string;
}

export interface LeadSuccessResponse {
  ok: true;
  success: true;
  matches: ContractorMatch[];
}

export interface BuilderSignupSuccessResponse {
  success: true;
}
