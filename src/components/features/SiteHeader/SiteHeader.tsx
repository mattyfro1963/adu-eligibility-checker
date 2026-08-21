"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_NAV, isActiveNavPath } from "@/lib/content/site-nav";
import { cn } from "@/lib/utils";

function NavLabel({
  label,
  shortLabel,
}: {
  label: string;
  shortLabel?: string;
}) {
  if (!shortLabel) {
    return label;
  }

  return (
    <>
      <span className="sm:hidden">{shortLabel}</span>
      <span className="hidden sm:inline">{label}</span>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 overflow-x-clip border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="relative mx-auto flex max-w-layout flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-h-[44px] min-w-0 items-center gap-2.5 self-start outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3 sm:shrink-0"
          aria-label="doihave.space home"
        >
          <span
            className="size-2 shrink-0 rounded-full bg-brand shadow-[0_0_12px_var(--color-brand)]"
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="font-label text-[10px] uppercase tracking-[0.12em] text-foreground sm:text-[11px] sm:tracking-[0.16em]">
              doihave.space
            </span>
            <span className="hidden text-[10px] tracking-wide text-muted-foreground sm:block">
              ADU &amp; SB 9 eligibility checker
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="w-full min-w-0 sm:w-auto">
          <ul className="flex touch-pan-x items-center gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-end sm:gap-1 [&::-webkit-scrollbar]:hidden">
            {HEADER_NAV.map((item) => {
              const active = isActiveNavPath(pathname, item.href);
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    title={item.description}
                    className={cn(
                      "inline-flex min-h-[44px] items-center rounded-md px-2.5 text-[10px] font-label tracking-[0.1em] uppercase whitespace-nowrap transition-colors sm:px-3 sm:text-[11px] sm:tracking-[0.12em]",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <NavLabel label={item.label} shortLabel={item.shortLabel} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent"
        />
      </div>
    </header>
  );
}
