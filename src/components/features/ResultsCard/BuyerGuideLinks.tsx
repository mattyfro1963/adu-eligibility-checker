import Link from "next/link";
import { Compass } from "lucide-react";
import type { GuideLinkRef } from "@/lib/regulations/types";

/** Compact deep-link strip to SF buyer guides under the parcel briefing. */
export function BuyerGuideLinks({ links }: { links: GuideLinkRef[] }) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-labelledby="buyer-guides-heading"
      className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-5 sm:rounded-[1.5rem] sm:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <Compass size={18} className="text-slate-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3
            id="buyer-guides-heading"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Buyer guides
          </h3>
          <p className="text-xs text-slate-500">
            SF technical guides for THOW rules, costs, and wheels vs foundation
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              href={link.href}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
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
