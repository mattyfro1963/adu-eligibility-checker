"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { isEngineRoute } from "@/lib/content/site-nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const onEngine = isEngineRoute(pathname);

  return (
    <header className="border-b border-border bg-background">
      <div
        className={cn(
          "mx-auto flex items-center px-4 py-6 sm:px-6",
          onEngine
            ? "max-w-layout justify-center"
            : "max-w-layout justify-between gap-4",
        )}
      >
        {!onEngine ? (
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 text-xs font-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home size={14} aria-hidden="true" />
            Checker
          </Link>
        ) : null}

        <Link
          href="/"
          className="group flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Eligibility checker home"
        >
          <span
            className="flex size-10 items-center justify-center rounded-[6px] border border-border text-foreground"
            aria-hidden="true"
          >
            <Home size={16} strokeWidth={1.5} />
          </span>
          <span className="font-label text-[10px] text-foreground">
            Eligibility Check
          </span>
        </Link>

        {!onEngine ? <span className="w-[72px]" aria-hidden="true" /> : null}
      </div>
    </header>
  );
}
