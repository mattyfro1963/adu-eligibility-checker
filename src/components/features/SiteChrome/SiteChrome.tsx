"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/features/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/features/SiteFooter/SiteFooter";

/** Site chrome: header and footer on every route, including the checker. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWidget = pathname === "/";

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter demo={isWidget} />
    </>
  );
}
