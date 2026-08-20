import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { GuideMeta } from "@/lib/content/guides/types";

interface GuideLayoutProps {
  meta: GuideMeta;
  children: ReactNode;
  lead?: string;
  disclaimer?: string;
}

/** Shared chrome for SF buyer-guide articles. */
export function GuideLayout({
  meta,
  children,
  lead,
  disclaimer,
}: GuideLayoutProps) {
  return (
    <article className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-4 border-b border-slate-200/80 pb-8 sm:pb-10">
        <Link
          href="/guides"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All SF buyer guides
        </Link>
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          {meta.eyebrow}
        </p>
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {meta.title}
        </h1>
        {lead ? (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {lead}
          </p>
        ) : (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {meta.description}
          </p>
        )}
        <p className="text-xs text-slate-400">
          Last reviewed {meta.lastReviewed}
        </p>
        <RegulationsAuthorByline />
      </header>

      <div className="space-y-10 sm:space-y-12">{children}</div>

      {disclaimer ? (
        <p className="border-t border-slate-200/80 pt-6 text-xs leading-relaxed text-slate-500">
          {disclaimer}
        </p>
      ) : null}
    </article>
  );
}
