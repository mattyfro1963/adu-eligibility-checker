import type { Metadata } from "next";
import { GuidesIndex } from "@/components/features/Guides/GuidesIndex";

export const metadata: Metadata = {
  title: "SF Buyer Guides",
  description:
    "San Francisco technical buyer guides for tiny homes on wheels, cost matrices, and wheels-versus-foundation decisions.",
};

export default function GuidesPage() {
  return <GuidesIndex />;
}
