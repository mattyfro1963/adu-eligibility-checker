import { ExternalLink } from "lucide-react";
import type { CitedClaim, SourceRef } from "@/lib/regulations/types";

function SourceLink({ source }: { source: SourceRef }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-1 py-1 font-medium text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
    >
      {source.label}
      <ExternalLink
        size={12}
        className="shrink-0 opacity-60"
        aria-hidden="true"
      />
    </a>
  );
}

/** Sentence plus accompanying official source link(s) for every claim. */
export function CitedText({
  claim,
  as = "p",
  className = "text-sm leading-relaxed text-slate-600",
}: {
  claim: CitedClaim;
  as?: "p" | "span" | "li" | "div";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag className={className}>
      <span>{claim.text}</span>
      {claim.sources.length > 0 ? (
        <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="font-semibold tracking-wide text-slate-400 uppercase">
            Source
            {claim.sources.length > 1 ? "s" : ""}:
          </span>
          {claim.sources.map((source) => (
            <SourceLink key={source.href} source={source} />
          ))}
        </span>
      ) : null}
    </Tag>
  );
}
