"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/features/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/features/SiteFooter/SiteFooter";
import { isEngineRoute } from "@/lib/content/site-nav";

/**
 * Site chrome: header and footer on marketing/resource routes.
 * Hidden on `/` (embeddable checker widget) per ARCHITECTURE.md.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = isEngineRoute(pathname);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
