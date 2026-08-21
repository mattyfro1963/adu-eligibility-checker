/**
 * Curated manufacturer / product-line catalog for intent-bifurcated CTAs.
 * Featured resources only — not official partnerships or legal endorsements.
 * Zero React. Fill trackingId later when live affiliate network IDs exist.
 */

import type { EligibilityStatus } from "@/lib/types/zoning";

export type AffiliateCategory =
  | "solar_kits"
  | "composting_toilets"
  | "trailer_chassis"
  | "tiny_home_appliances";

export type AffiliateIntent = EligibilityStatus;

export type AffiliatePartner = {
  id: string;
  name: string;
  category: AffiliateCategory;
  blurb: string;
  publicUrl: string;
  /** Empty until a live affiliate network ID is assigned. */
  trackingId: string;
  /** Which overall outcomes may surface this partner. */
  intents: AffiliateIntent[];
};

export const AFFILIATE_DISCLOSURE =
  "Featured resources are curated manufacturer links. doihave.space may earn a commission if you buy through them, at no extra cost to you. These are not official partnerships, endorsements, or legal advice for your parcel.";

export const AFFILIATE_CATEGORY_LABELS: Record<AffiliateCategory, string> = {
  solar_kits: "Solar kits & portable power",
  composting_toilets: "Composting toilets",
  trailer_chassis: "Trailer chassis",
  tiny_home_appliances: "Tiny-home appliances",
};

/**
 * Intent coverage (same inventory, different CTA weight upstream):
 * - eligible → full build-out set
 * - warning → narrower research subset
 * - restricted → alternate-pathway subset (chassis / off-grid heavy)
 */
export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "jackery-solar",
    name: "Jackery",
    category: "solar_kits",
    blurb:
      "Portable solar generators commonly used for staging power and off-grid subsystems during build-out.",
    publicUrl: "https://www.jackery.com/",
    trackingId: "",
    intents: ["eligible", "warning", "restricted"],
  },
  {
    id: "ecoflow-solar",
    name: "EcoFlow",
    category: "solar_kits",
    blurb:
      "Expandable battery and solar kits for temporary power while comparing utility connection paths.",
    publicUrl: "https://www.ecoflow.com/",
    trackingId: "",
    intents: ["eligible", "restricted"],
  },
  {
    id: "renogy-solar",
    name: "Renogy",
    category: "solar_kits",
    blurb:
      "Panel, charge-controller, and battery kits for DIY solar research on tiny-home and ADU projects.",
    publicUrl: "https://www.renogy.com/",
    trackingId: "",
    intents: ["eligible"],
  },
  {
    id: "natures-head",
    name: "Nature's Head",
    category: "composting_toilets",
    blurb:
      "Composting toilet systems often researched for staged or remote builds — confirm local sanitation rules before purchase.",
    publicUrl: "https://natureshead.net/",
    trackingId: "",
    intents: ["eligible", "warning", "restricted"],
  },
  {
    id: "separett",
    name: "Separett",
    category: "composting_toilets",
    blurb:
      "Waterless toilet product line for comparing off-grid sanitation options against conventional plumbing.",
    publicUrl: "https://www.separett.com/",
    trackingId: "",
    intents: ["eligible"],
  },
  {
    id: "air-head",
    name: "Air Head",
    category: "composting_toilets",
    blurb:
      "Compact composting toilets used in tiny-home build-outs; placement legality is separate from the hardware.",
    publicUrl: "https://airheadtoilet.com/",
    trackingId: "",
    intents: ["eligible", "warning"],
  },
  {
    id: "pj-trailers",
    name: "PJ Trailers",
    category: "trailer_chassis",
    blurb:
      "Utility and specialty trailers that DIY builders often adapt as THOW chassis starting points.",
    publicUrl: "https://www.pjtrailers.com/",
    trackingId: "",
    intents: ["eligible", "restricted"],
  },
  {
    id: "iron-eagle-trailers",
    name: "Iron Eagle Trailers",
    category: "trailer_chassis",
    blurb:
      "Custom and stock trailer frames often researched for tiny-house builds — confirm local rules before purchase.",
    publicUrl: "https://ironeagletrailers.com/",
    trackingId: "",
    intents: ["eligible", "restricted"],
  },
  {
    id: "unique-appliances",
    name: "Unique Appliances",
    category: "tiny_home_appliances",
    blurb:
      "Compact refrigerators and cooking appliances sized for ADU and tiny-home kitchens.",
    publicUrl: "https://www.uniqueappliances.com/",
    trackingId: "",
    intents: ["eligible", "warning"],
  },
  {
    id: "dometic",
    name: "Dometic",
    category: "tiny_home_appliances",
    blurb:
      "Mobile living HVAC, refrigeration, and cooktop lines used in THOW and compact dwelling fit-outs.",
    publicUrl: "https://www.dometic.com/",
    trackingId: "",
    intents: ["eligible"],
  },
];

export function affiliatesForIntent(
  intent: AffiliateIntent,
): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter((partner) =>
    partner.intents.includes(intent),
  );
}

export function affiliatesByCategory(
  category: AffiliateCategory,
  intent?: AffiliateIntent,
): AffiliatePartner[] {
  const pool = intent ? affiliatesForIntent(intent) : AFFILIATE_PARTNERS;
  return pool.filter((partner) => partner.category === category);
}
