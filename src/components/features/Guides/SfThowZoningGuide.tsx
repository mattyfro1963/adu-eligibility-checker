import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { GuideLayout } from "@/components/features/Guides/GuideLayout";
import {
  SF_THOW_INTRO,
  SF_THOW_META,
  SF_THOW_SECTIONS,
} from "@/lib/content/guides/sf-thow-zoning";

export function SfThowZoningGuide() {
  return (
    <GuideLayout
      meta={SF_THOW_META}
      lead={SF_THOW_INTRO.lead}
      disclaimer={SF_THOW_INTRO.disclaimer}
    >
      {SF_THOW_SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`thow-${section.id}`}
          className="space-y-4"
        >
          <h2
            id={`thow-${section.id}`}
            className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
          >
            {section.title}
          </h2>
          <ul className="space-y-4">
            {section.claims.map((claim) => (
              <li key={claim.text.slice(0, 64)}>
                <CitedText claim={claim} as="div" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </GuideLayout>
  );
}
