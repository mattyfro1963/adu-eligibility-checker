"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Next.js catches boundary errors before Sentry's global handlers.
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <AlertTriangle
        className="h-8 w-8 text-status-restricted-fg"
        aria-hidden="true"
      />
      <h2 className="text-lg font-normal text-foreground">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={reset} className="min-h-[44px]">
        Try again
      </Button>
    </main>
  );
}
