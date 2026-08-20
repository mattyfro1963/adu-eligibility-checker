import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";
import {
  PageActionLink,
  PageAside,
  PageHeader,
  PageSection,
  PageShell,
} from "@/components/features/PageShell/PageShell";
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
    <PageShell>
      <PageHeader
        eyebrow="Featured resources"
        title="Partners & build-out resources"
        description="Curated manufacturer and product-line links for solar, sanitation, chassis, and compact appliances — research aids after you check a parcel, not endorsements or legal advice."
        meta={
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {AFFILIATE_DISCLOSURE}
          </p>
        }
        actions={
          <PageActionLink href="/">
            <Package size={16} aria-hidden="true" />
            Check a California address
          </PageActionLink>
        }
      />

      <div className="space-y-10">
        {sections.map((section) => (
          <PageSection
            key={section.category}
            title={section.label}
            className="space-y-4"
          >
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
                      className="flex min-h-[44px] flex-col gap-1 rounded-[10px] border border-border bg-card p-4 transition-colors hover:border-border hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-normal text-foreground">
                        {partner.name}
                        <ExternalLink
                          size={12}
                          className="shrink-0 opacity-60"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {partner.blurb}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </PageSection>
        ))}
      </div>

      <PageAside>
        <p>
          Catalog includes {AFFILIATE_PARTNERS.length} featured resources across{" "}
          {sections.length} categories. Ready to evaluate overlays for your lot?{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Open the eligibility checker
          </Link>
          .
        </p>
      </PageAside>
    </PageShell>
  );
}
