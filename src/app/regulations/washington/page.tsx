import type { Metadata } from "next";
import { RegulationsGuide } from "@/components/features/RegulationsGuide/RegulationsGuide";
import { WA_GUIDE_CONTENT } from "@/lib/content/wa-tiny-home-regulations";

export const metadata: Metadata = {
  title: "Tiny Home Regulations in Washington",
  description:
    "County and city guide to Washington tiny home, park model, L&I dwelling, and THOW rules, permits, and official planning resources. Informational only.",
};

export default function WashingtonRegulationsPage() {
  return (
    <RegulationsGuide
      content={WA_GUIDE_CONTENT}
      activeHref="/regulations/washington"
    />
  );
}
