import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  House,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  SEARCH_TOPIC_CARDS,
  type SearchTopicIcon,
} from "@/lib/content/search-topics";

const TOPIC_ICONS: Record<SearchTopicIcon, LucideIcon> = {
  house: House,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  sparkles: Sparkles,
};

/** Topic cards below the idle search hero — quiet luxury chrome + line icons. */
export function SearchTopicCards() {
  return (
    <nav
      aria-label="Guides and resources"
      className="grid gap-4 sm:grid-cols-2 sm:gap-5"
    >
      {SEARCH_TOPIC_CARDS.map((card) => {
        const Icon = TOPIC_ICONS[card.icon];
        return (
          <article
            key={card.id}
            className="flex min-h-0 flex-col border border-border-luxury bg-surface-elevated/80 px-5 py-6 sm:min-h-[200px] sm:px-6 sm:py-7"
          >
            <div className="flex items-start gap-3">
              <Icon
                size={20}
                strokeWidth={1.25}
                className="mt-0.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="font-sans text-lg tracking-tight text-foreground">
                {card.title}
              </h2>
            </div>
            <ul className="mt-5 flex flex-1 flex-col gap-3">
              {card.links.map((link) => (
                <li key={`${card.id}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-[15px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={card.viewAllHref}
              className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {card.viewAllLabel ?? "View all"}
              <ArrowRight size={14} strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </nav>
  );
}
