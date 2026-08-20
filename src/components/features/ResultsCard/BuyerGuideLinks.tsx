import Link from "next/link";
import { Compass } from "lucide-react";
import type { GuideLinkRef } from "@/lib/regulations/types";

/** Compact deep-link strip to SF buyer guides under the parcel briefing. */
export function BuyerGuideLinks({ links }: { links: GuideLinkRef[] }) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-labelledby="buyer-guides-heading"
      className="border border-border bg-muted/40 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg border border-border bg-card p-2">
          <Compass size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="buyer-guides-heading"
            className="text-sm font-normal tracking-tight text-foreground"
          >
            Buyer guides
          </h3>
          <p className="text-xs text-muted-foreground">
            SF technical guides for THOW rules, costs, and wheels vs foundation
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              href={link.href}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:text-foreground"
            >
              {link.title.length > 64
                ? `${link.title.slice(0, 61)}…`
                : link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
