import {
  PageActionLink,
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <PageShell className="flex flex-col items-center justify-center py-16">
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
        actions={<PageActionLink href="/">Return to checker</PageActionLink>}
      />
    </PageShell>
  );
}
