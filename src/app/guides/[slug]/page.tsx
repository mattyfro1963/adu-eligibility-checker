import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CostMatrixGuide } from "@/components/features/Guides/CostMatrixGuide";
import { SfThowZoningGuide } from "@/components/features/Guides/SfThowZoningGuide";
import { WheelsVsFoundationGuide } from "@/components/features/Guides/WheelsVsFoundationGuide";
import {
  GUIDE_BY_SLUG,
  GUIDE_LINKS,
  getGuideMeta,
  isGuideSlug,
} from "@/lib/content/guides/catalog";
import type { GuideSlug } from "@/lib/content/guides/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: GuideSlug }> {
  return GUIDE_LINKS.map((link) => ({ slug: link.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getGuideMeta(slug);
  if (!meta) {
    return { title: "Guide not found — doihave.space" };
  }
  return {
    title: `${meta.title} — doihave.space`,
    description: meta.description,
  };
}

function GuideBody({ slug }: { slug: GuideSlug }) {
  switch (slug) {
    case "tiny-home-on-wheels-san-francisco":
      return <SfThowZoningGuide />;
    case "tiny-home-cost-matrix":
      return <CostMatrixGuide />;
    case "wheels-vs-foundation":
      return <WheelsVsFoundationGuide />;
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}

export default async function GuideSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isGuideSlug(slug)) {
    notFound();
  }
  // Touch catalog so static analysis keeps GUIDE_BY_SLUG referenced.
  void GUIDE_BY_SLUG[slug];
  return <GuideBody slug={slug} />;
}
