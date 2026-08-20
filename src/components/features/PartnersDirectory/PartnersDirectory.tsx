import Link from "next/link";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { buildAffiliateHref } from "@/lib/affiliates/track";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_DISCLOSURE,
  AFFILIATE_PARTNERS,
  affiliatesByCategory,
  type AffiliateCategory,
} from "@/lib/content/affiliates";

const CATEGORY_ORDER = Object.keys(
  AFFILIATE_CATEGORY_LABELS,
) as AffiliateCategory[];

/**
 * Full curated partner catalog for static browse (/partners).
 * Omits per-search sid; UTM uses eligible campaign for directory traffic.
 */
export function PartnersDirectory() {
  const sections = CATEGORY_ORDER.map((category) => ({
    category,
    label: AFFILIATE_CATEGORY_LABELS[category],
    partners: affiliatesByCategory(category),
  })).filter((section) => section.partners.length > 0);

  return (
    <article className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 sm:space-y-12 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-4 border-b border-slate-200/80 pb-8 sm:pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          Featured resources
        </p>
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <Package size={18} className="text-slate-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Partners &amp; build-out resources
            </h1>
            <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
              Curated manufacturer and product-line links for solar, sanitation,
              chassis, and compact appliances — research aids after you check a
              parcel, not endorsements or legal advice.
            </p>
          </div>
        </div>
        <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
          {AFFILIATE_DISCLOSURE}
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Check a California address
        </Link>
      </header>

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section.category}
            aria-labelledby={`partners-${section.category}`}
            className="space-y-4"
          >
            <h2
              id={`partners-${section.category}`}
              className="text-xl font-semibold tracking-tight text-slate-900"
            >
              {section.label}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.partners.map((partner) => {
                const href = buildAffiliateHref(partner, {
                  intent: "eligible",
                });
                return (
                  <li key={partner.id}>
                    <a
                      href={href}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="flex min-h-[44px] flex-col gap-1 rounded-xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/80"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        {partner.name}
                        <ExternalLink
                          size={12}
                          className="shrink-0 opacity-60"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-600">
                        {partner.blurb}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside
        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600"
        role="note"
      >
        <p>
          Catalog includes {AFFILIATE_PARTNERS.length} featured resources across{" "}
          {sections.length} categories. Ready to evaluate overlays for your lot?{" "}
          <Link
            href="/"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Open the eligibility checker
          </Link>
          .
        </p>
      </aside>
    </article>
  );
}
