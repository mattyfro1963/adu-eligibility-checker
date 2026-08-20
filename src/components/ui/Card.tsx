import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-lg border border-slate-200 bg-white p-6 shadow-md ${className}`}
    >
      {children}
    </article>
  );
}
