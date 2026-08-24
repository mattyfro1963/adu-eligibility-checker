import type { Metadata } from "next";
import { RegulationsGuide } from "@/components/features/RegulationsGuide/RegulationsGuide";

export const metadata: Metadata = {
  title: "Tiny Home Regulations in California",
  description:
    "County-by-county guide to California tiny home, park model, and THOW rules, permits, and official planning resources.",
};

export default function RegulationsPage() {
  return <RegulationsGuide />;
}
