import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  ContentLinkCard,
  PageActionLink,
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { RegulationsAuthorByline } from "@/components/features/ResultsCard/RegulationsAuthorByline";
import { GUIDE_LINKS } from "@/lib/content/guides/catalog";

/** Index of San Francisco technical buyer guides. */
export function GuidesIndex() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="San Francisco pilot"
        title="SF technical buyer guides"
        description={
          <>
            High-utility guides for THOW legality, cost trade-offs, and
            wheels-versus-foundation decisions. Statewide county context remains
            on{" "}
            <Link
              href="/regulations"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Regulations
            </Link>
            .
          </>
        }
        meta={<RegulationsAuthorByline />}
      />

      <ul className="space-y-3">
        {GUIDE_LINKS.map((guide) => (
          <li key={guide.slug}>
            <ContentLinkCard
              href={guide.href}
              title={guide.title}
              description={guide.description}
              icon={
                <BookOpen
                  size={18}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              }
            />
          </li>
        ))}
      </ul>

      <PageActionLink href="/" variant="outline">
        Back to checker
      </PageActionLink>
    </PageShell>
  );
}
