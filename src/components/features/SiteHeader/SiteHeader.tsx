import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-layout items-center px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="group flex min-h-[44px] flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="doihave.space home"
        >
          <span className="font-label text-[11px] uppercase tracking-[0.16em] text-foreground">
            doihave.space
          </span>
          <span className="text-[10px] tracking-wide text-muted-foreground">
            ADU &amp; SB 9 eligibility checker
          </span>
        </Link>
      </div>
    </header>
  );
}
