"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <AlertTriangle className="h-8 w-8 text-rose-600" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-slate-800">
        Something went wrong
      </h2>
      <p className="text-sm text-slate-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </main>
  );
}
