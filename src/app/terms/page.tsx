import type { Metadata } from "next";
import {
  PageBody,
  PageHeader,
  PageShell,
} from "@/components/features/PageShell/PageShell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using the doihave.space ADU, SB 9, and tiny-home eligibility checker and related lead services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        description="Conditions for using the eligibility checker, guides, and lead-routing features."
      />
      <PageBody className="mx-auto max-w-2xl space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            Informational tool only
          </h2>
          <p>
            doihave.space provides informational eligibility screening and
            cited regulatory context for California ADU, SB 9, and related
            tiny-home pathways. Outputs are not legal advice, not a permit, and
            not a substitute for your local planning and building departments or
            a licensed land-use attorney.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            No guarantee of accuracy
          </h2>
          <p>
            Zoning coverage, overlays, and lot facts may be incomplete,
            outdated, or jurisdiction-inferred. Where GIS is unavailable, we
            surface county/city guidance plus statewide statute floors — always
            confirm locally before design, purchase, or construction decisions.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            Lead routing and affiliates
          </h2>
          <p>
            Builder intros and specialist review forms route inquiries to third
            parties. Matching is informational — not a marketplace guarantee or
            endorsement. Featured manufacturer links may earn us a commission at
            no extra cost to you; see the partners page disclosure.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            Acceptable use
          </h2>
          <p>
            Do not abuse the service (automated scraping beyond reasonable use,
            false lead submissions, or attempts to disrupt APIs). We may refuse
            or remove access that harms the service or other users.
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: August 24, 2026. Contact{" "}
            <a
              href="mailto:hello@doihave.space"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              hello@doihave.space
            </a>{" "}
            with questions about these terms.
          </p>
        </section>
      </PageBody>
    </PageShell>
  );
}
