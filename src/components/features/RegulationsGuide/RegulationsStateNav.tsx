import Link from "next/link";
import { STATE_REGULATION_LINKS } from "@/lib/content/state-regulations-nav";
import { cn } from "@/lib/utils";

/** Compact state switcher for regulations pages. */
export function RegulationsStateNav({
  activeHref,
  className,
}: {
  activeHref: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="State regulations"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm text-muted-foreground",
        className,
      )}
    >
      {STATE_REGULATION_LINKS.map((state, index) => {
        const isActive =
          activeHref === state.href ||
          (state.href === "/regulations/california" &&
            activeHref === "/regulations");
        return (
          <span key={state.href} className="inline-flex items-center">
            {index > 0 ? (
              <span
                className="mx-1.5 text-muted-foreground/50"
                aria-hidden="true"
              >
                ·
              </span>
            ) : null}
            <Link
              href={state.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-h-[44px] inline-flex items-center underline-offset-2 hover:underline",
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {state.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
