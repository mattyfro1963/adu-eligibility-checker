import type { Metadata } from "next";
import { PremiumTools } from "@/components/features/PremiumTools/PremiumTools";

export const metadata: Metadata = {
  title: "Premium Tools",
  description:
    "Waitlist for downloadable ADU site-planning checklists, zoning outreach templates, and budgeting spreadsheets.",
};

export default function PremiumPage() {
  return <PremiumTools />;
}
