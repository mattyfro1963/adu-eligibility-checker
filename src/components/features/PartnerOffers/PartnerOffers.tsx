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
    sectionClass:
      "rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-8",
    iconWrapClass: "rounded-lg border border-emerald-100 bg-emerald-50 p-2",
    iconClass: "text-emerald-700",
    linkHoverClass: "hover:border-emerald-200 hover:bg-emerald-50/40",
  },
  warning: {
    title: "Research options",
    subtitle:
      "Optional product research while you resolve parcel constraints — secondary to a specialist review.",
    Icon: Search,
    sectionClass:
      "rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[2rem] sm:p-6",
    iconWrapClass: "rounded-lg border border-amber-100 bg-amber-50 p-2",
    iconClass: "text-amber-600",
    linkHoverClass: "hover:border-amber-200 hover:bg-amber-50/40",
  },
  restricted: {
    title: "Alternate pathways",
    subtitle:
      "Low-emphasis manufacturer links some builders research when foundation ADU timing is blocked — not a workaround for restricted overlays.",
    Icon: Route,
    sectionClass:
      "rounded-[1.5rem] border border-slate-200/60 bg-slate-50/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[2rem] sm:p-6",
    iconWrapClass: "rounded-lg border border-slate-200 bg-white p-2",
    iconClass: "text-slate-500",
    linkHoverClass: "hover:border-slate-300 hover:bg-white",
  },
};

function groupByCategory(
  partners: AffiliatePartner[],
): {
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
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {copy.title}
          </h3>
          <p className="text-xs text-slate-500">{copy.subtitle}</p>
        </div>
      </div>

      <p
        data-affiliate-disclosure
        className="mb-5 text-xs leading-relaxed text-slate-500 sm:mb-6"
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
            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
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
                    className={`flex min-h-[44px] flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/80 p-4 transition-colors ${copy.linkHoverClass}`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
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
                          ? "text-xs leading-relaxed text-slate-500"
                          : "text-sm leading-relaxed text-slate-600"
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
        <p className="mt-5 text-sm text-slate-600 sm:mt-6">
          <Link
            href="/partners"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Browse the full partners directory
          </Link>
        </p>
      ) : null}
    </section>
  );
}
