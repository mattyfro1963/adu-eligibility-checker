"use client";

import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { HomePageClient } from "./HomePageClient";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-layout flex-1 items-center justify-center px-4 py-24 sm:px-6"
        >
          <Spinner />
        </main>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
