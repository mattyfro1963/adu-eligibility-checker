"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Checker" },
  { href: "/guides", label: "Guides" },
  { href: "/regulations", label: "Regulations" },
  { href: "/premium", label: "Premium" },
  { href: "/connect", label: "Connect" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:gap-3"
          aria-label="doihave.space home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
            <Building2
              size={16}
              className="text-white"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            doihave
            <span className="font-normal text-slate-400">.space</span>
          </span>
        </Link>

        <nav
          className="-mx-1 min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          <ul className="flex w-max items-center gap-0.5 px-1 sm:gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-[40px] items-center rounded-lg px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 rounded-md border border-slate-200/80 bg-slate-100/80 px-3 py-1 font-mono text-[10px] font-semibold tracking-widest text-slate-600 uppercase shadow-sm lg:flex">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
            aria-hidden="true"
          />
          CA SYSTEM ACTIVE
        </div>
      </div>
    </header>
  );
}
