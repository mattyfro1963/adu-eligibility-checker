import Link from "next/link";
import { ExternalLink, Package, Route, Search } from "lucide-react";
import { buildAffiliateHref } from "@/lib/affiliates/track";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_DISCLOSURE,
  affiliatesForIntent,
  type AffiliateCategory,
  type AffiliateIntent,
  type AffiliatePartner,
} from "@/lib/content/affiliates";

const CATEGORY_ORDER: AffiliateCategory[] = [
  "solar_kits",
  "composting_toilets",
  "trailer_chassis",
  "tiny_home_appliances",
];

const INTENT_COPY: Record<
  AffiliateIntent,
  {
    title: string;
    subtitle: string;
    Icon: typeof Package;
    sectionClass: string;
    iconWrapClass: string;
    iconClass: string;
    linkHoverClass: string;
  }
> = {
  eligible: {
    title: "Outfit the build",
    subtitle:
      "Curated manufacturer resources for power, sanitation, chassis, and compact appliances — confirm permits locally before purchase.",
    Icon: Package,
    sectionClass: "border border-border bg-card p-6 sm:p-8",
    iconWrapClass: "rounded-[6px] border border-border bg-muted p-2",
    iconClass: "text-foreground",
    linkHoverClass: "hover:border-border hover:bg-muted",
  },
  warning: {
    title: "Research options",
    subtitle:
      "Optional product research while you resolve parcel constraints — secondary to a specialist review.",
    Icon: Search,
    sectionClass: "border border-border bg-muted/50 p-5 sm:p-6",
    iconWrapClass: "rounded-[6px] border border-border bg-muted p-2",
    iconClass: "text-foreground",
    linkHoverClass: "hover:border-border hover:bg-muted",
  },
  restricted: {
    title: "Alternate pathways",
    subtitle:
      "Low-emphasis manufacturer links some builders research when foundation ADU timing is blocked — not a workaround for restricted overlays.",
    Icon: Route,
    sectionClass: "border border-border bg-muted/40 p-5 sm:p-6",
    iconWrapClass: "rounded-lg border border-border bg-card p-2",
    iconClass: "text-muted-foreground",
    linkHoverClass: "hover:border-border hover:bg-card",
  },
};

function groupByCategory(partners: AffiliatePartner[]): {
  category: AffiliateCategory;
  label: string;
  partners: AffiliatePartner[];
}[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: AFFILIATE_CATEGORY_LABELS[category],
    partners: partners.filter((p) => p.category === category),
  })).filter((section) => section.partners.length > 0);
}

export type PartnerOffersProps = {
  intent: AffiliateIntent;
  searchId?: string;
  /** Tighter padding and denser list — useful under restricted / warning CTAs. */
  compact?: boolean;
};

/**
 * Intent-bifurcated affiliate offers. Presentation only — catalog + hrefs from lib.
 */
export function PartnerOffers({
  intent,
  searchId,
  compact = false,
}: PartnerOffersProps) {
  const partners = affiliatesForIntent(intent);
  const sections = groupByCategory(partners);
  const copy = INTENT_COPY[intent];
  const Icon = copy.Icon;
  const isCompact = compact || intent === "warning" || intent === "restricted";

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={`partner-offers-${intent}-heading`}
      data-partner-offers={intent}
      className={copy.sectionClass}
    >
      <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:items-center">
        <div className={copy.iconWrapClass}>
          <Icon size={18} className={copy.iconClass} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id={`partner-offers-${intent}-heading`}
            className="text-lg font-normal tracking-tight text-foreground"
          >
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
        </div>
      </div>

      <p
        data-affiliate-disclosure
        className="mb-5 text-xs leading-relaxed text-muted-foreground sm:mb-6"
      >
        {AFFILIATE_DISCLOSURE}
      </p>

      <div className={isCompact ? "space-y-4" : "space-y-6"}>
        {sections.map((section) => (
          <div
            key={section.category}
            data-affiliate-category={section.category}
            className="space-y-3"
          >
            <h4 className="text-xs font-normal tracking-widest text-muted-foreground uppercase">
              {section.label}
            </h4>
            <ul
              className={
                isCompact
                  ? "flex flex-col gap-2"
                  : "grid grid-cols-1 gap-3 sm:grid-cols-2"
              }
            >
              {section.partners.map((partner) => (
                <li key={partner.id}>
                  <a
                    href={buildAffiliateHref(partner, { searchId, intent })}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    data-affiliate-partner={partner.id}
                    className={`flex min-h-[44px] flex-col gap-1 rounded-[10px] border border-border bg-card p-4 transition-colors ${copy.linkHoverClass}`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-normal text-foreground">
                      {partner.name}
                      <ExternalLink
                        size={12}
                        className="shrink-0 opacity-60"
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={
                        isCompact
                          ? "text-xs leading-relaxed text-muted-foreground"
                          : "text-sm leading-relaxed text-muted-foreground"
                      }
                    >
                      {partner.blurb}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {intent === "eligible" ? (
        <p className="mt-5 text-sm text-muted-foreground sm:mt-6">
          <Link
            href="/partners"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Browse the full partners directory
          </Link>
        </p>
      ) : null}
    </section>
  );
}
