import Link from "next/link";
import { ExternalLink, MapPinned, Scale, ShieldAlert } from "lucide-react";
import {
  PageActionLink,
  PageAnchorLink,
  PageAside,
  PageHeader,
  PageShell,
  TocNav,
} from "@/components/features/PageShell/PageShell";
import { RegulationsStateNav } from "@/components/features/RegulationsGuide/RegulationsStateNav";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { buildAffiliateHref } from "@/lib/affiliates/track";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_DISCLOSURE,
  affiliatesByCategory,
  type AffiliateCategory,
} from "@/lib/content/affiliates";
import { CA_GUIDE_CONTENT } from "@/lib/content/ca-tiny-home-regulations";
import type {
  JurisdictionNote,
  ResourceLink,
  StateTinyHomeGuideContent,
} from "@/lib/content/state-tiny-home-guide-types";

const PARTNER_TEASER_CATEGORIES = Object.keys(
  AFFILIATE_CATEGORY_LABELS,
) as AffiliateCategory[];

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "park-models", label: "Park models" },
  { id: "county-guides", label: "County guides" },
  { id: "directories", label: "Official directories" },
  { id: "unclear", label: "Unclear counties" },
  { id: "permits", label: "Permits" },
  { id: "communities", label: "Communities" },
  { id: "partners", label: "Partners" },
  { id: "faqs", label: "FAQs" },
] as const;

function ExternalResource({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-2 hover:text-foreground hover:underline"
    >
      {link.label}
      <ExternalLink
        size={14}
        className="shrink-0 opacity-60"
        aria-hidden="true"
      />
    </a>
  );
}

function ResourceList({ links }: { links: ResourceLink[] }) {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <ExternalResource link={link} />
        </li>
      ))}
    </ul>
  );
}

function CountyCard({ county }: { county: JurisdictionNote }) {
  return (
    <details className="group rounded-xl border border-border bg-card">
      <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>{county.name}</span>
          <span className="text-xs font-normal tracking-wide text-muted-foreground uppercase group-open:hidden">
            Expand
          </span>
          <span className="hidden text-xs font-normal tracking-wide text-muted-foreground uppercase group-open:inline">
            Collapse
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>{county.summary}</p>
        {county.parkModel ? (
          <p>
            <span className="font-medium text-foreground">
              Park models / THOW:{" "}
            </span>
            {county.parkModel}
          </p>
        ) : null}
        {county.links.length > 0 ? <ResourceList links={county.links} /> : null}
        {county.cities?.map((city) => (
          <div
            key={city.name}
            className="rounded-lg border border-border bg-muted p-3"
          >
            <p className="mb-1 font-medium text-foreground">{city.name}</p>
            <p className="mb-2">{city.summary}</p>
            {city.parkModel ? <p className="mb-2">{city.parkModel}</p> : null}
            <ResourceList links={city.links} />
          </div>
        ))}
      </div>
    </details>
  );
}

/**
 * Shared CA / OR / WA regulations page shell.
 * All visible strings come from `content` — never hardcode California-only CTAs.
 */
export function RegulationsGuide({
  content = CA_GUIDE_CONTENT,
  activeHref,
}: {
  content?: StateTinyHomeGuideContent;
  activeHref?: string;
} = {}) {
  const navHref = activeHref ?? content.defaultActiveHref;
  const { intro, actions, asideCta } = content;

  return (
    <PageShell>
      <PageHeader
        eyebrow={content.eyebrow}
        title={intro.title}
        description={
          <>
            <RegulationsStateNav activeHref={navHref} className="mb-3" />
            <p className="text-[15px] sm:text-base">{intro.subtitle}</p>
            <p className="mt-3 text-sm sm:text-[15px]">{intro.lead}</p>
          </>
        }
        meta={<RegulationsAuthorByline />}
        actions={
          <>
            <PageActionLink href={actions.primary.href}>
              {actions.primary.label}
            </PageActionLink>
            <PageActionLink
              href={actions.secondary.href}
              variant={actions.secondary.variant ?? "outline"}
            >
              {actions.secondary.label}
            </PageActionLink>
            <PageAnchorLink href={actions.jumpToCounties.href}>
              {actions.jumpToCounties.label}
            </PageAnchorLink>
          </>
        }
      />

      <div className="lg:hidden">
        <TocNav items={TOC} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-10">
        <div className="space-y-10 sm:space-y-12">
          <section
            id="overview"
            className="scroll-mt-32 sm:scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Scale
                size={18}
                className="text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-xl font-normal tracking-tight text-foreground">
                {content.codeBaseline.sectionTitle}
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {intro.buildingCodeNote}
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              {content.codeBaseline.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <dt className="text-xs font-normal tracking-wide text-muted-foreground uppercase">
                    {metric.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            id="park-models"
            className="scroll-mt-32 sm:scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <MapPinned
                size={18}
                className="text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-xl font-normal tracking-tight text-foreground">
                {content.parkModelOverview.title}
              </h2>
            </div>
            <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{content.parkModelOverview.body}</p>
              <p>{content.parkModelOverview.livingFullTime}</p>
              <p>{content.parkModelOverview.ansiNote}</p>
            </div>
          </section>

          <section
            id="county-guides"
            className="scroll-mt-32 sm:scroll-mt-24 space-y-4"
          >
            <h2 className="text-xl font-normal tracking-tight text-foreground">
              {content.countyGuides.sectionTitle}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {content.countyGuides.intro}
            </p>
            <div className="space-y-2">
              {content.countyGuides.counties.map((county) => (
                <CountyCard key={county.name} county={county} />
              ))}
            </div>
          </section>

          <section id="directories" className="scroll-mt-32 sm:scroll-mt-24">
            <ExpandableSection
              title={content.directories.title}
              description={content.directories.description}
              defaultOpen={false}
            >
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-base font-normal tracking-tight text-foreground">
                    {content.directories.countyTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {content.directories.countyDescription}
                  </p>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <ResourceList links={content.directories.countyLinks} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-normal tracking-tight text-foreground">
                    {content.directories.cityTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {content.directories.cityDescription}
                  </p>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <ResourceList links={content.directories.cityLinks} />
                  </div>
                </div>
              </div>
            </ExpandableSection>
          </section>

          <section
            id="unclear"
            className="scroll-mt-32 sm:scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={18}
                className="text-amber-500"
                aria-hidden="true"
              />
              <h2 className="text-xl font-normal tracking-tight text-foreground">
                {content.unclear.sectionTitle}
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {content.unclear.intro}
            </p>
            <div className="border border-warning/30 bg-warning/5 p-5">
              <ResourceList links={content.unclear.links} />
            </div>
          </section>

          <section
            id="permits"
            className="scroll-mt-32 sm:scroll-mt-24 space-y-3"
          >
            <h2 className="text-xl font-normal tracking-tight text-foreground">
              {content.permitOverview.title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {content.permitOverview.body}
            </p>
          </section>

          <section id="communities" className="scroll-mt-32 sm:scroll-mt-24">
            <ExpandableSection
              title={content.communities.title}
              description={content.communities.description}
              defaultOpen={false}
            >
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {content.communities.intro}
              </p>
              <ul className="grid gap-4 md:grid-cols-3">
                {content.communities.items.map((community) => (
                  <li
                    key={community.name}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <p className="font-medium text-foreground">
                      {community.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {community.address}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {community.notes}
                    </p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          </section>

          <section id="partners" className="scroll-mt-32 sm:scroll-mt-24">
            <ExpandableSection
              title="Partners & build-out resources"
              description="Curated manufacturer links — not endorsements or permit substitutes"
              defaultOpen={false}
            >
              <p className="mb-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                After you understand local rules, manufacturer product lines can
                help you research solar, sanitation, chassis, and compact
                appliances.{" "}
                <Link
                  href="/partners"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Browse the full partners directory
                </Link>
                .
              </p>
              <p className="mb-5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                {AFFILIATE_DISCLOSURE}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PARTNER_TEASER_CATEGORIES.map((category) => {
                  const partner = affiliatesByCategory(category)[0];
                  if (!partner) return null;
                  const href = buildAffiliateHref(partner, {
                    intent: "eligible",
                  });
                  return (
                    <li
                      key={category}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <p className="text-xs font-normal tracking-wider text-muted-foreground uppercase">
                        {AFFILIATE_CATEGORY_LABELS[category]}
                      </p>
                      <a
                        href={href}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-normal text-foreground underline-offset-2 hover:underline"
                      >
                        {partner.name}
                        <ExternalLink
                          size={12}
                          className="shrink-0 opacity-60"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {partner.blurb}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 text-sm text-muted-foreground">
                <Link
                  href="/partners"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  See all partner categories
                </Link>
              </p>
            </ExpandableSection>
          </section>

          <section id="faqs" className="scroll-mt-32 sm:scroll-mt-24 space-y-4">
            <h2 className="text-xl font-normal tracking-tight text-foreground">
              FAQs
            </h2>
            <div className="space-y-2">
              {content.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-xl border border-border bg-card"
                >
                  <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                  </summary>
                  <p className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
        <div className="hidden lg:block">
          <TocNav items={TOC} />
        </div>
      </div>

      <PageAside>
        <p>{content.disclaimer}</p>
        <p className="mt-3">
          {asideCta.lead}{" "}
          <Link
            href={asideCta.href}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {asideCta.linkLabel}
          </Link>
          .
        </p>
      </PageAside>
    </PageShell>
  );
}
