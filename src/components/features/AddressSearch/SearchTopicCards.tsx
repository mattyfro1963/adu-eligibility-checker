import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEARCH_TOPIC_CARDS } from "@/lib/content/search-topics";

/** Revolut-style topic cards below the idle search hero. */
export function SearchTopicCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SEARCH_TOPIC_CARDS.map((card) => (
        <article
          key={card.id}
          className="flex min-h-[220px] flex-col rounded-2xl bg-secondary p-6"
        >
          <h2 className="font-heading text-base text-foreground">
            {card.title}
          </h2>
          <ul className="mt-4 flex flex-1 flex-col gap-3">
            {card.links.map((link) => (
              <li key={`${card.id}-${link.label}`}>
                <Link
                  href={link.href}
                  className="text-sm leading-snug text-slate-600 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={card.viewAllHref}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
          >
            {card.viewAllLabel ?? "View all"}
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
