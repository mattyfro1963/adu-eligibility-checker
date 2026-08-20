import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectPage } from "@/components/features/ConnectPage/ConnectPage";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Connect with ADU Builders — doihave.space",
  description:
    "Share your ADU or tiny-home project details and match with nearby contractors. Licensed California builders can join the beta lead network.",
};

export default function ConnectRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <ConnectPage />
    </Suspense>
  );
}
