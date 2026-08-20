import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Spinner label="Loading page…" />
    </main>
  );
}
