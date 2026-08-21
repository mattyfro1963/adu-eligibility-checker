import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  ContentLinkCard,
  PageActionLink,
  PageAside,
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
        actions={
          <PageActionLink href="/" variant="outline">
            Back to checker
          </PageActionLink>
        }
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

      <PageAside>
        <p>
          These guides focus on San Francisco buyer decisions. For statewide
          county rules and official planning links, see{" "}
          <Link
            href="/regulations"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            California tiny home regulations
          </Link>
          .
        </p>
      </PageAside>
    </PageShell>
  );
}
