/**
 * SF buyer-guide catalog for /guides index and ResultsCard deep-links.
 * Zero React.
 */

import type {
  GuideLink,
  GuideMeta,
  GuideSlug,
} from "@/lib/content/guides/types";
import { SF_COST_META } from "@/lib/content/guides/sf-cost-matrix";
import { SF_THOW_META } from "@/lib/content/guides/sf-thow-zoning";
import { WHEELS_VS_FOUNDATION_META } from "@/lib/content/guides/wheels-vs-foundation";

const METAS: GuideMeta[] = [
  SF_THOW_META,
  SF_COST_META,
  WHEELS_VS_FOUNDATION_META,
];

function toLink(meta: GuideMeta): GuideLink {
  return {
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    href: `/guides/${meta.slug}`,
  };
}

/** Ordered links for index + parcel briefing strip. */
export const GUIDE_LINKS: GuideLink[] = METAS.map(toLink);

export const GUIDE_BY_SLUG: Record<GuideSlug, GuideMeta> = {
  "tiny-home-on-wheels-san-francisco": SF_THOW_META,
  "tiny-home-cost-matrix": SF_COST_META,
  "wheels-vs-foundation": WHEELS_VS_FOUNDATION_META,
};

export function isGuideSlug(value: string): value is GuideSlug {
  return value in GUIDE_BY_SLUG;
}

export function getGuideMeta(slug: string): GuideMeta | null {
  return isGuideSlug(slug) ? GUIDE_BY_SLUG[slug] : null;
}
