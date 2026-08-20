import { CitedText } from "@/components/features/ResultsCard/CitedText";
import { GuideLayout } from "@/components/features/Guides/GuideLayout";
import { ExpandableSection } from "@/components/ui/expandable-section";
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
      {SF_THOW_SECTIONS.map((section, index) => (
        <ExpandableSection
          key={section.id}
          id={section.id}
          title={section.title}
          defaultOpen={index === 0}
        >
          <ul className="space-y-4">
            {section.claims.map((claim) => (
              <li key={claim.text.slice(0, 64)}>
                <CitedText claim={claim} as="div" />
              </li>
            ))}
          </ul>
        </ExpandableSection>
      ))}
    </GuideLayout>
  );
}
