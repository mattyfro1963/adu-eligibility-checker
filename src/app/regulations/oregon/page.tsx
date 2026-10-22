import type { Metadata } from "next";
import { RegulationsGuide } from "@/components/features/RegulationsGuide/RegulationsGuide";
import { OR_GUIDE_CONTENT } from "@/lib/content/or-tiny-home-regulations";

export const metadata: Metadata = {
  title: "Tiny Home Regulations in Oregon",
  description:
    "County and city guide to Oregon tiny home, park model, and THOW rules, permits, and official planning resources. Informational only.",
};

export default function OregonRegulationsPage() {
  return (
    <RegulationsGuide
      content={OR_GUIDE_CONTENT}
      activeHref="/regulations/oregon"
    />
  );
}
