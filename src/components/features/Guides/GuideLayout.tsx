import type { ReactNode } from "react";
import {
  BackLink,
  PageAside,
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import type { GuideMeta } from "@/lib/content/guides/types";

interface GuideLayoutProps {
  meta: GuideMeta;
  children: ReactNode;
  lead?: string;
  disclaimer?: string;
}

/** Shared chrome for SF buyer-guide articles. */
export function GuideLayout({
  meta,
  children,
  lead,
  disclaimer,
}: GuideLayoutProps) {
  return (
    <PageShell>
      <BackLink href="/guides">All guides</BackLink>
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={lead ?? meta.description}
        meta={
          <>
            <p className="text-xs text-muted-foreground">
              Last reviewed {meta.lastReviewed}
            </p>
            <RegulationsAuthorByline />
          </>
        }
      />

      <div className="space-y-4 sm:space-y-6">{children}</div>

      {disclaimer ? (
        <PageAside>
          <p>{disclaimer}</p>
        </PageAside>
      ) : null}
    </PageShell>
  );
}
