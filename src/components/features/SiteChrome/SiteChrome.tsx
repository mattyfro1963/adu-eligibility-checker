"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/features/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/features/SiteFooter/SiteFooter";

/** Site chrome for sub-pages; hidden on `/` so the checker embeds cleanly. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWidget = pathname === "/";

  return (
    <>
      {!isWidget ? <SiteHeader /> : null}
      {children}
      {!isWidget ? <SiteFooter /> : null}
    </>
  );
}
