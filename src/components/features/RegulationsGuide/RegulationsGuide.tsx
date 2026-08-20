import Link from "next/link";
import {
  ExternalLink,
  MapPinned,
  Package,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { buildAffiliateHref } from "@/lib/affiliates/track";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_DISCLOSURE,
  affiliatesByCategory,
  type AffiliateCategory,
} from "@/lib/content/affiliates";
import {
  CBC_BASELINE,
  CITY_DIRECTORY,
  COMMUNITIES,
  COUNTY_DIRECTORY,
  COUNTY_GUIDES,
  FAQS,
  GUIDE_DISCLAIMER,
  GUIDE_INTRO,
  PARK_MODEL_OVERVIEW,
  PERMIT_OVERVIEW,
  UNCLEAR_COUNTIES,
  type JurisdictionNote,
  type ResourceLink,
} from "@/lib/content/ca-tiny-home-regulations";

const PARTNER_TEASER_CATEGORIES = Object.keys(
  AFFILIATE_CATEGORY_LABELS,
) as AffiliateCategory[];

function ExternalResource({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
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
    <details className="group rounded-xl border border-slate-200/80 bg-white open:shadow-sm">
      <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>{county.name}</span>
          <span className="text-xs font-normal tracking-wide text-slate-400 uppercase group-open:hidden">
            Expand
          </span>
          <span className="hidden text-xs font-normal tracking-wide text-slate-400 uppercase group-open:inline">
            Collapse
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600">
        <p>{county.summary}</p>
        {county.parkModel ? (
          <p>
            <span className="font-medium text-slate-800">
              Park models / THOW:{" "}
            </span>
            {county.parkModel}
          </p>
        ) : null}
        {county.links.length > 0 ? <ResourceList links={county.links} /> : null}
        {county.cities?.map((city) => (
          <div
            key={city.name}
            className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
          >
            <p className="mb-1 font-medium text-slate-800">{city.name}</p>
            <p className="mb-2">{city.summary}</p>
            {city.parkModel ? <p className="mb-2">{city.parkModel}</p> : null}
            <ResourceList links={city.links} />
          </div>
        ))}
      </div>
    </details>
  );
}

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

export function RegulationsGuide() {
  return (
    <article className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 sm:space-y-12 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-4 border-b border-slate-200/80 pb-8 sm:pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          California · {CBC_BASELINE.codeYear} CBC context
        </p>
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {GUIDE_INTRO.title}
        </h1>
        <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
          {GUIDE_INTRO.subtitle}
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {GUIDE_INTRO.lead}
        </p>
        <RegulationsAuthorByline />
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Check a California address
          </Link>
          <Link
            href="/connect"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Match with builders
          </Link>
          <a
            href="#county-guides"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Jump to county guides
          </a>
        </div>
      </header>

      <nav
        aria-label="On this page"
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
      >
        <p className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          On this page
        </p>
        <ul className="flex flex-wrap gap-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="overview" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-slate-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Building code baseline
          </h2>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {GUIDE_INTRO.buildingCodeNote}
        </p>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Ceiling height
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {CBC_BASELINE.ceilingHeight}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Primary room
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              ≥ {CBC_BASELINE.primaryRoomSqFt} sq ft
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Additional rooms
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              ≥ {CBC_BASELINE.additionalRoomSqFt} sq ft each
            </dd>
          </div>
        </dl>
      </section>

      <section id="park-models" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <MapPinned size={18} className="text-slate-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {PARK_MODEL_OVERVIEW.title}
          </h2>
        </div>
        <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-slate-600">
          <p>{PARK_MODEL_OVERVIEW.body}</p>
          <p>{PARK_MODEL_OVERVIEW.livingFullTime}</p>
          <p>{PARK_MODEL_OVERVIEW.ansiNote}</p>
        </div>
      </section>

      <section id="county-guides" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          What counties allow tiny houses?
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Nearly every California county allows some form of tiny home. The
          details—especially for park models—vary. Expand a county for a short
          summary and official links.
        </p>
        <div className="space-y-2">
          {COUNTY_GUIDES.map((county) => (
            <CountyCard key={county.name} county={county} />
          ))}
        </div>
      </section>

      <section
        id="directories"
        className="scroll-mt-24 grid gap-8 lg:grid-cols-2"
      >
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            County resource directory
          </h2>
          <p className="text-sm text-slate-600">
            Direct links to planning, building, and tiny-home materials.
          </p>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <ResourceList links={COUNTY_DIRECTORY} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Major cities
          </h2>
          <p className="text-sm text-slate-600">
            City rules can differ from the surrounding county—check both.
          </p>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <ResourceList links={CITY_DIRECTORY} />
          </div>
        </div>
      </section>

      <section id="unclear" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={18}
            className="text-amber-500"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Counties with unclear park-model rules
          </h2>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Published guidance for park models / THOWs is thin in these counties.
          Contact planning or building staff before assuming permanence.
        </p>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5">
          <ResourceList links={UNCLEAR_COUNTIES} />
        </div>
      </section>

      <section id="permits" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {PERMIT_OVERVIEW.title}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {PERMIT_OVERVIEW.body}
        </p>
      </section>

      <section id="communities" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Example tiny-home communities
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          When local rules require a designated park, established communities
          can be a practical placement option. Verify current availability and
          residency rules directly with each site.
        </p>
        <ul className="grid gap-4 md:grid-cols-3">
          {COMMUNITIES.map((community) => (
            <li
              key={community.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <p className="font-medium text-slate-900">{community.name}</p>
              <p className="mt-1 text-xs text-slate-500">{community.address}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {community.notes}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="partners" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-slate-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Partners &amp; build-out resources
          </h2>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          After you understand local rules, manufacturer product lines can help
          you research solar, sanitation, chassis, and compact appliances. These
          are curated featured resources — not endorsements or permit
          substitutes.{" "}
          <Link
            href="/partners"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Browse the full partners directory
          </Link>
          .
        </p>
        <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
          {AFFILIATE_DISCLOSURE}
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNER_TEASER_CATEGORIES.map((category) => {
            const partner = affiliatesByCategory(category)[0];
            if (!partner) return null;
            const href = buildAffiliateHref(partner, { intent: "eligible" });
            return (
              <li
                key={category}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {AFFILIATE_CATEGORY_LABELS[category]}
                </p>
                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
                >
                  {partner.name}
                  <ExternalLink
                    size={12}
                    className="shrink-0 opacity-60"
                    aria-hidden="true"
                  />
                </a>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {partner.blurb}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-slate-600">
          <Link
            href="/partners"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            See all partner categories
          </Link>
        </p>
      </section>

      <section id="faqs" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          FAQs
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="rounded-xl border border-slate-200/80 bg-white open:shadow-sm"
            >
              <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>
              <p className="border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <aside
        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600"
        role="note"
      >
        <p>{GUIDE_DISCLAIMER}</p>
        <p className="mt-3">
          Ready to evaluate a California address for ADU or SB 9 overlays?{" "}
          <Link
            href="/"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Open the eligibility checker
          </Link>
          . Looking for contractors?{" "}
          <Link
            href="/connect"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Match with ADU builders
          </Link>
          .
        </p>
      </aside>
    </article>
  );
}
