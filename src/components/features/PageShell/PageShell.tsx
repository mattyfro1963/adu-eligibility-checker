import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  spacing?: "default" | "compact";
}

export function PageShell({
  children,
  className,
  spacing = "default",
}: PageShellProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "mx-auto w-full max-w-layout flex-1 px-4 py-8 sm:px-6 sm:py-12",
        spacing === "default" ? "space-y-10" : "space-y-8",
        className,
      )}
    >
      {children}
    </main>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: PageHeaderProps) {
  return (
    <header className="space-y-5 text-center">
      {eyebrow ? (
        <p className="font-label text-[11px] uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col items-center gap-5">
        <div className="mx-auto min-w-0 max-w-3xl space-y-3">
          <h1 className="font-display text-[2rem] leading-[1.15] tracking-display text-balance text-foreground sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <div className="mx-auto max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </div>
          ) : null}
          {meta}
        </div>
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-2">{children}</div>;
}

interface PageActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function PageActionLink({
  href,
  children,
  variant = "primary",
}: PageActionLinkProps) {
  return (
    <Button
      asChild
      variant={variant === "outline" ? "outline" : "default"}
      size="lg"
      className="min-h-[44px] w-full px-5 font-label text-[11px] tracking-[0.12em] sm:w-auto"
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function PageAnchorLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="min-h-[44px] w-full px-5 font-label text-[11px] tracking-[0.12em] sm:w-auto"
    >
      <a href={href}>{children}</a>
    </Button>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="-ml-2 h-10 gap-2 font-label text-[10px] tracking-[0.14em] text-muted-foreground hover:text-foreground"
    >
      <Link href={href}>
        <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
        {children}
      </Link>
    </Button>
  );
}

interface PageSectionProps {
  id?: string;
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  id,
  title,
  description,
  children,
  className,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        id && "scroll-mt-32 sm:scroll-mt-24",
        "space-y-4",
        className,
      )}
    >
      {title ? (
        <div className="space-y-1.5 text-center">
          <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <div className="mx-auto max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageAside({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      role="note"
      className={cn(
        "rounded-xl border border-border bg-muted p-5 text-[15px] leading-relaxed text-muted-foreground shadow-elevated",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-4", className)}>
      {children}
    </div>
  );
}

interface ContentLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

export function ContentLinkCard({
  href,
  title,
  description,
  icon,
}: ContentLinkCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <article className="flex min-h-[44px] items-start gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-elevated transition-colors hover:border-foreground/15 sm:gap-4 sm:px-5">
        {icon ? (
          <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg tracking-tight text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
            {description}
          </span>
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </article>
    </Link>
  );
}

export function TocNav({
  items,
  label = "On this page",
}: {
  items: ReadonlyArray<{ id: string; label: string }>;
  label?: string;
}) {
  return (
    <nav
      aria-label={label}
      className="rounded-xl border border-border bg-card p-5 shadow-elevated lg:sticky lg:top-24"
    >
      <p className="mb-3 font-label text-[10px] text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 border-border bg-background px-3 text-xs font-normal text-muted-foreground hover:text-foreground lg:w-full lg:justify-start"
            >
              <a href={`#${item.id}`}>{item.label}</a>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-button focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
    >
      Skip to content
    </a>
  );
}
