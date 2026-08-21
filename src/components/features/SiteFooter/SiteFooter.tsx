import Link from "next/link";
import { FOOTER_NAV } from "@/lib/content/site-nav";

const SHORT_DISCLAIMER =
  "Informational only — not legal advice. Confirm requirements with your local planning and building departments.";

const DEMO_DISCLAIMER =
  "For demo purposes only. Informational only — not legal advice. Confirm requirements with your local planning and building departments.";

export function SiteFooter({ demo = false }: { demo?: boolean }) {
  return (
    <footer className="mt-auto border-t border-border bg-muted text-foreground">
      <div className="mx-auto max-w-layout px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Page">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-2">
            {FOOTER_NAV.map((item) => (
              <li key={item.label} className="flex justify-center sm:block">
                <Link
                  href={item.href}
                  title={item.description}
                  className="inline-flex min-h-[44px] items-center text-xs font-label tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          {demo ? DEMO_DISCLAIMER : SHORT_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
