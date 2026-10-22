import type { Metadata } from "next";
import { RegulationsGuide } from "@/components/features/RegulationsGuide/RegulationsGuide";
import { CA_GUIDE_CONTENT } from "@/lib/content/ca-tiny-home-regulations";

export const metadata: Metadata = {
  title: "Tiny Home Regulations in California",
  description:
    "County-by-county California guide plus Cascadia statewide THOW context for Oregon and Washington. Park models, permits, and official planning resources.",
};

/** Hub keeps CA content + hash anchors (#county-guides, etc.) for backward compatibility. */
export default function RegulationsPage() {
  return (
    <RegulationsGuide content={CA_GUIDE_CONTENT} activeHref="/regulations" />
  );
}
