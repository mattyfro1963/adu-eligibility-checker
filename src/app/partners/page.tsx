import type { Metadata } from "next";
import { PartnersDirectory } from "@/components/features/PartnersDirectory/PartnersDirectory";

export const metadata: Metadata = {
  title: "Partners & Build-Out Resources — doihave.space",
  description:
    "Curated manufacturer links for solar kits, composting toilets, trailer chassis, and tiny-home appliances. Featured resources — may earn a commission.",
};

export default function PartnersPage() {
  return <PartnersDirectory />;
}
