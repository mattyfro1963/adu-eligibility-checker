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
export function SearchReceiptCard({ receipt }: { receipt: SearchReceipt }) {
  const scopeLabel =
    receipt.analysisScope === "sf_pilot_lot"
      ? "California lot analysis (local zoning data)"
      : "Statewide context only";

  return (
    <section
      aria-labelledby="search-receipt-heading"
      className="rounded-[1.25rem] border border-dashed border-slate-300 bg-[#F5F5F7]/80 p-5 sm:rounded-[1.5rem] sm:p-6 md:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <Receipt size={18} className="text-slate-700" aria-hidden="true" />
        </div>
        <div>
          <h3
            id="search-receipt-heading"
            className="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
          >
            Search receipt
          </h3>
          <p className="text-sm font-medium text-slate-800">
            Provenance for this visit
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Issued
          </dt>
          <dd className="font-mono text-slate-800">
            {formatIssuedAt(receipt.issuedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Address
          </dt>
          <dd className="break-words text-slate-800">
            {receipt.formattedAddress}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Place / region
          </dt>
          <dd className="font-mono break-words text-slate-800">
            {[receipt.place, receipt.region].filter(Boolean).join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            APN / block-lot
          </dt>
          <dd className="font-mono break-all text-slate-800">
            {receipt.mapblklot ?? "Not in local parcel index"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Analysis scope
          </dt>
          <dd className="text-slate-800">{scopeLabel}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Corpus
          </dt>
          <dd className="font-mono text-xs break-all text-slate-800">
            {receipt.corpusVersion} · reviewed {receipt.lastReviewed}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Sources used for this lot
        </p>
        <ul className="flex flex-wrap gap-x-3 gap-y-2">
          {receipt.sourcesUsed.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1 py-1 text-xs font-medium text-slate-700 underline-offset-2 hover:underline"
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
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          {receipt.disclaimer}
        </p>
      </div>
    </section>
  );
}
