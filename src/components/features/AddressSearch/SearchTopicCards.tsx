import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEARCH_TOPIC_CARDS } from "@/lib/content/search-topics";

/** Topic cards below the idle search hero — matches regulations card language. */
export function SearchTopicCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SEARCH_TOPIC_CARDS.map((card) => (
        <article
          key={card.id}
          className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-4 shadow-elevated transition-colors hover:border-foreground/15 sm:min-h-[180px] sm:p-6"
        >
          <h2 className="font-display text-lg tracking-tight text-foreground">
            {card.title}
          </h2>
          <ul className="mt-4 flex flex-1 flex-col gap-2.5">
            {card.links.map((link) => (
              <li key={`${card.id}-${link.label}`}>
                <Link
                  href={link.href}
                  className="text-[15px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={card.viewAllHref}
            className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {card.viewAllLabel ?? "View all"}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
