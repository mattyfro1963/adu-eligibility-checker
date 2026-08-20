"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Checker" },
  { href: "/regulations", label: "Regulations" },
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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-[40px] items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="doihave.space home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black shadow-md">
            <Building2
              size={16}
              className="text-white"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            doihave
            <span className="font-normal text-slate-400">.space</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[40px] items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 rounded-md border border-slate-200/80 bg-slate-100/80 px-3 py-1 font-mono text-[10px] font-semibold tracking-widest text-slate-600 uppercase shadow-sm sm:flex">
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
