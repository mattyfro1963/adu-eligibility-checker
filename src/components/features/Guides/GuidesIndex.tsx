import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { GUIDE_LINKS } from "@/lib/content/guides/catalog";

/** Index of San Francisco technical buyer guides. */
export function GuidesIndex() {
  return (
    <article className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12 md:py-16">
      <header className="space-y-4 border-b border-slate-200/80 pb-8 sm:pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
          San Francisco pilot
        </p>
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          SF technical buyer guides
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          High-utility guides for THOW legality, cost trade-offs, and
          wheels-versus-foundation decisions. Statewide county context remains
          on{" "}
          <Link
            href="/regulations"
            className="font-medium text-slate-800 underline-offset-2 hover:underline"
          >
            Regulations
          </Link>
          .
        </p>
        <RegulationsAuthorByline />
      </header>

      <ul className="space-y-4">
        {GUIDE_LINKS.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={guide.href}
              className="group flex min-h-[44px] items-start gap-4 rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/80 sm:rounded-[1.5rem] sm:p-6"
            >
              <div className="rounded-lg border border-slate-200 bg-slate-100 p-2">
                <BookOpen
                  size={18}
                  className="text-slate-700"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-950">
                  {guide.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {guide.description}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
