import { ExternalLink, Package } from "lucide-react";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_FTC_DISCLOSURE,
  affiliateOffersByCategory,
  type AffiliateCategory,
} from "@/lib/content/affiliates/catalog";

const CATEGORY_ORDER: AffiliateCategory[] = [
  "blueprints",
  "offGridHardware",
  "turnkeyKits",
];

/**
 * Product next-steps for eligible parcels only.
 * Presentation only — offers come from the affiliate catalog.
 */
export function EligibleNextSteps() {
  const sections = CATEGORY_ORDER.map((category) => ({
    category,
    label: AFFILIATE_CATEGORY_LABELS[category],
    offers: affiliateOffersByCategory(category),
  })).filter((section) => section.offers.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="eligible-next-steps-heading"
      data-affiliate-section="eligible-next-steps"
      className="rounded-card border border-border bg-card p-5 shadow-editorial sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-[6px] border border-border bg-muted p-2">
          <Package size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="eligible-next-steps-heading"
            className="text-lg font-normal tracking-tight text-foreground"
          >
            Eligible next steps
          </h3>
          <p className="text-xs text-muted-foreground">
            Research blueprints, hardware, and kits after a green-light parcel
            check — still confirm permits locally.
          </p>
        </div>
      </div>

      <p
        data-affiliate-disclosure="ftc"
        className="mb-6 text-xs leading-relaxed text-muted-foreground"
      >
        {AFFILIATE_FTC_DISCLOSURE}
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.category}
            data-affiliate-category={section.category}
            className="space-y-3"
          >
            <h4 className="text-xs font-normal tracking-widest text-muted-foreground uppercase">
              {section.label}
            </h4>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.offers.map((offer) => (
                <li key={offer.id}>
                  <a
                    href={offer.href!}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    data-affiliate-offer={offer.id}
                    className="flex min-h-[44px] flex-col gap-1 rounded-[10px] border border-border bg-muted/60 p-4 transition-colors hover:border-border hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-normal text-foreground">
                      {offer.title}
                      <ExternalLink
                        size={12}
                        className="shrink-0 opacity-60"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {offer.blurb}
                    </span>
                    {offer.disclosureNote ? (
                      <span className="text-xs text-muted-foreground">
                        {offer.disclosureNote}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
