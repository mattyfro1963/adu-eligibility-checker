/**
 * Affiliate offer catalog for eligible-parcel next steps.
 * Zero React. Hrefs resolve from env so tracking IDs stay out of git.
 * Do not put commission rates or payout amounts in visitor-facing strings.
 */

export type AffiliateCategory =
  "blueprints" | "offGridHardware" | "turnkeyKits";

export type AffiliateOffer = {
  id: string;
  category: AffiliateCategory;
  title: string;
  blurb: string;
  /** process.env key holding the outbound affiliate URL. */
  hrefEnvKey: string;
  /** Optional per-offer note (never commission rates). */
  disclosureNote?: string;
};

export type ResolvedAffiliateOffer = AffiliateOffer & {
  href: string | null;
};

export const AFFILIATE_FTC_DISCLOSURE =
  "Some links may be affiliate links. If you buy through them, doihave.space may earn a commission at no extra cost to you. We only list products relevant to eligible build-out next steps — this is not an endorsement of any particular builder for your lot.";

export const AFFILIATE_CATEGORY_LABELS: Record<AffiliateCategory, string> = {
  blueprints: "Blueprints & plans",
  offGridHardware: "Off-grid & hardware",
  turnkeyKits: "Turn-key kits & builders",
};

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "tiny-project-plans",
    category: "blueprints",
    title: "Tiny Project–style house plans",
    blurb:
      "Permit-oriented plan sets for compact dwellings — useful when you are pricing a foundation ADU path.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_TINY_PROJECT_URL",
  },
  {
    id: "tiny-house-design-build-plans",
    category: "blueprints",
    title: "Tiny House Design Build plans",
    blurb:
      "Design-build plan packages for buyers comparing DIY shells versus hired fabrication.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_THDB_PLANS_URL",
  },
  {
    id: "jackery-solar",
    category: "offGridHardware",
    title: "Jackery-style solar generators",
    blurb:
      "Portable power for staging and off-grid subsystems — not a substitute for permitted utility connections.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_JACKERY_URL",
  },
  {
    id: "ecoflow-solar",
    category: "offGridHardware",
    title: "EcoFlow-style power stations",
    blurb:
      "Expandable battery systems commonly used during build-out and temporary power scenarios.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_ECOFLOW_URL",
  },
  {
    id: "composting-toilet",
    category: "offGridHardware",
    title: "Composting toilet systems",
    blurb:
      "Hardware research for remote or staged builds — confirm SF plumbing / sanitation acceptance before purchase.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_COMPOSTING_TOILET_URL",
  },
  {
    id: "trailer-chassis",
    category: "offGridHardware",
    title: "Trailer chassis suppliers",
    blurb:
      "Chassis options for DIY THOW builds. Placement legality in SF is separate from the purchase.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_TRAILER_CHASSIS_URL",
  },
  {
    id: "tumbleweed-kits",
    category: "turnkeyKits",
    title: "Tumbleweed-style tiny house kits",
    blurb:
      "National kit / shell builders for turn-key THOW comparison shopping against foundation ADU bids.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_TUMBLEWEED_URL",
  },
  {
    id: "modular-adu-kits",
    category: "turnkeyKits",
    title: "Modular ADU / tiny kit builders",
    blurb:
      "Factory modular pathways that map more cleanly onto permanent-foundation ADU permitting.",
    hrefEnvKey: "NEXT_PUBLIC_AFFILIATE_MODULAR_KIT_URL",
  },
];

/**
 * Static `process.env.NEXT_PUBLIC_*` property access so Next.js can inline
 * values into the client bundle. Dynamic `process.env[key]` is never replaced.
 */
function readAffiliateEnv(hrefEnvKey: string): string | undefined {
  switch (hrefEnvKey) {
    case "NEXT_PUBLIC_AFFILIATE_TINY_PROJECT_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_TINY_PROJECT_URL;
    case "NEXT_PUBLIC_AFFILIATE_THDB_PLANS_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_THDB_PLANS_URL;
    case "NEXT_PUBLIC_AFFILIATE_JACKERY_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_JACKERY_URL;
    case "NEXT_PUBLIC_AFFILIATE_ECOFLOW_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_ECOFLOW_URL;
    case "NEXT_PUBLIC_AFFILIATE_COMPOSTING_TOILET_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_COMPOSTING_TOILET_URL;
    case "NEXT_PUBLIC_AFFILIATE_TRAILER_CHASSIS_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_TRAILER_CHASSIS_URL;
    case "NEXT_PUBLIC_AFFILIATE_TUMBLEWEED_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_TUMBLEWEED_URL;
    case "NEXT_PUBLIC_AFFILIATE_MODULAR_KIT_URL":
      return process.env.NEXT_PUBLIC_AFFILIATE_MODULAR_KIT_URL;
    default:
      return undefined;
  }
}

/** Resolve href from env; null when unset so UI can omit the card. */
export function resolveAffiliateHref(hrefEnvKey: string): string | null {
  const raw = readAffiliateEnv(hrefEnvKey);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "#") return null;
  return trimmed;
}

export function listResolvedAffiliateOffers(): ResolvedAffiliateOffer[] {
  return AFFILIATE_OFFERS.map((offer) => ({
    ...offer,
    href: resolveAffiliateHref(offer.hrefEnvKey),
  }));
}

/** Offers with a usable href — for EligibleNextSteps rendering. */
export function listActiveAffiliateOffers(): ResolvedAffiliateOffer[] {
  return listResolvedAffiliateOffers().filter(
    (offer): offer is ResolvedAffiliateOffer & { href: string } =>
      typeof offer.href === "string" && offer.href.length > 0,
  );
}

export function affiliateOffersByCategory(
  category: AffiliateCategory,
): ResolvedAffiliateOffer[] {
  return listActiveAffiliateOffers().filter((o) => o.category === category);
}
