import type { Metadata } from "next";
import {
  PageBody,
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How doihave.space collects, uses, and shares information from address checks and lead forms.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we handle information you share when you check a parcel or submit a lead form."
      />
      <PageBody className="mx-auto max-w-2xl space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            What we collect
          </h2>
          <p>
            When you search an address, we process the query and resulting
            geocode coordinates to run zoning and eligibility checks. When you
            submit a lead or waitlist form, we collect the fields you provide
            (typically name, email, and optional phone, project intent, and
            budget).
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">How we use it</h2>
          <p>
            Search data powers eligibility results and related briefing content.
            Lead submissions are used to route high-intent inquiries to partner
            builders or specialist review queues, and to follow up about your
            request. Waitlist submissions are used to notify you when a listed
            tool is available.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">Sharing</h2>
          <p>
            Lead details may be forwarded to partner builders or review
            contacts via configured server webhooks. Affiliate clicks on the
            partners directory go to third-party manufacturer sites; we may
            receive a commission if you purchase through those links. We do not
            sell personal information as a standalone product.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            Retention and contact
          </h2>
          <p>
            We retain lead and waitlist records only as long as needed to
            fulfill the request and operate the service. For privacy questions
            or deletion requests, email{" "}
            <a
              href="mailto:privacy@doihave.space"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              privacy@doihave.space
            </a>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: August 24, 2026. This summary is informational and
            not a substitute for formal counsel.
          </p>
        </section>
      </PageBody>
    </PageShell>
  );
}
