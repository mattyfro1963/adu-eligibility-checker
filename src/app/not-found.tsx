import Link from "next/link";
import { MapPinOff } from "lucide-react";
import {
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell spacing="compact" className="flex flex-col items-center justify-center py-16">
      <PageHeader
        eyebrow="Navigation"
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
        meta={
          <MapPinOff
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        }
      />
      <Button asChild className="min-h-[44px] rounded-button">
        <Link href="/">Return to checker</Link>
      </Button>
    </PageShell>
  );
}
