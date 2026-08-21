import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEARCH_TOPIC_CARDS } from "@/lib/content/search-topics";

/** Topic cards below the idle search hero — matches regulations card language. */
export function SearchTopicCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SEARCH_TOPIC_CARDS.map((card) => (
        <article
          key={card.id}
          className="flex min-h-[220px] flex-col rounded-[10px] border border-border bg-card p-5 shadow-elevated"
        >
          <h2 className="text-base font-normal tracking-tight text-foreground">
            {card.title}
          </h2>
          <ul className="mt-4 flex flex-1 flex-col gap-3">
            {card.links.map((link) => (
              <li key={`${card.id}-${link.label}`}>
                <Link
                  href={link.href}
                  className="text-sm leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={card.viewAllHref}
            className="mt-6 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            {card.viewAllLabel ?? "View all"}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
