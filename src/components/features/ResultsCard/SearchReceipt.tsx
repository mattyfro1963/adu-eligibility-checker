import { Receipt } from "lucide-react";
import { ExternalLink } from "lucide-react";
import type { SearchReceipt } from "@/lib/regulations/types";

function formatIssuedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** On-page search receipt — provenance stamp, not a shareable permalink. */
export function SearchReceiptCard({
  receipt,
  embedded = false,
}: {
  receipt: SearchReceipt;
  embedded?: boolean;
}) {
  const scopeLabel =
    receipt.analysisScope === "lot_zoning"
      ? "California lot analysis (local zoning data)"
      : "Jurisdiction context (county / city + statewide)";

  const body = (
    <>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Issued
          </dt>
          <dd className="font-mono text-foreground">
            {formatIssuedAt(receipt.issuedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Address
          </dt>
          <dd className="break-words text-foreground">
            {receipt.formattedAddress}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Place / region
          </dt>
          <dd className="font-mono break-words text-foreground">
            {[receipt.place, receipt.region].filter(Boolean).join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            APN / block-lot
          </dt>
          <dd className="font-mono break-all text-foreground">
            {receipt.mapblklot ?? "Not in local parcel index"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Analysis scope
          </dt>
          <dd className="text-foreground">{scopeLabel}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Author
          </dt>
          <dd className="text-foreground">{receipt.author.name}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
            Corpus
          </dt>
          <dd className="font-mono text-xs break-all text-foreground">
            {receipt.corpusVersion} · reviewed {receipt.lastReviewed}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-[10px] font-normal tracking-widest text-muted-foreground uppercase">
          Sources used for this search
        </p>
        <ul className="flex flex-wrap gap-x-3 gap-y-2">
          {receipt.sourcesUsed.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1 py-1 text-xs font-medium text-foreground underline-offset-2 hover:underline"
              >
                {source.label}
                <ExternalLink
                  size={12}
                  className="shrink-0 opacity-60"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {receipt.disclaimer}
        </p>
      </div>
    </>
  );

  if (embedded) {
    return body;
  }

  return (
    <section
      aria-labelledby="search-receipt-heading"
      className="rounded-xl border border-border bg-muted/50 p-5 sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg border border-border bg-card p-2">
          <Receipt size={18} className="text-foreground" aria-hidden="true" />
        </div>
        <div>
          <h3
            id="search-receipt-heading"
            className="text-[10px] font-normal tracking-widest text-muted-foreground uppercase"
          >
            Search receipt
          </h3>
          <p className="text-sm font-medium text-foreground">
            Provenance for this visit
          </p>
        </div>
      </div>
      {body}
    </section>
  );
}
