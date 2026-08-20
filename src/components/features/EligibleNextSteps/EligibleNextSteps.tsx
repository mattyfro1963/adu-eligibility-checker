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
      className="rounded-[1.25rem] border border-emerald-200/70 bg-white p-5 shadow-sm sm:rounded-[1.5rem] sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-start gap-3 sm:items-center">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2">
          <Package size={18} className="text-emerald-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="eligible-next-steps-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Eligible next steps
          </h3>
          <p className="text-xs text-slate-500">
            Research blueprints, hardware, and kits after a green-light parcel
            check — still confirm permits locally.
          </p>
        </div>
      </div>

      <p
        data-affiliate-disclosure="ftc"
        className="mb-6 text-xs leading-relaxed text-slate-500"
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
            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
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
                    className="flex min-h-[44px] flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      {offer.title}
                      <ExternalLink
                        size={12}
                        className="shrink-0 opacity-60"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-600">
                      {offer.blurb}
                    </span>
                    {offer.disclosureNote ? (
                      <span className="text-xs text-slate-400">
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
