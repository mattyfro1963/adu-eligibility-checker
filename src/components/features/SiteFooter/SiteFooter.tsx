import Link from "next/link";
import { FOOTER_NAV } from "@/lib/content/site-nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted text-foreground">
      <div className="mx-auto max-w-layout px-4 py-8 sm:px-6">
        <nav aria-label="Resources">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center text-xs font-label tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Informational only — not legal advice. Confirm requirements with your
          local planning and building departments.
        </p>
      </div>
    </footer>
  );
}
