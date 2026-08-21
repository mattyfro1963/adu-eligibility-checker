import { ExternalLink } from "lucide-react";
import type { CitedClaim, SourceRef } from "@/lib/regulations/types";

/** One visible link per href — claim arrays may repeat the same official source. */
function uniqueSourcesByHref(sources: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.href)) return false;
    seen.add(source.href);
    return true;
  });
}

function SourceLink({ source }: { source: SourceRef }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      // 44px tap target preserved via padding; negative margin keeps rows tight.
      className="-my-2.5 inline-flex min-h-[44px] items-center gap-1 py-2.5 font-medium text-foreground underline-offset-2 hover:text-foreground hover:underline"
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
  className = "text-sm leading-relaxed text-muted-foreground",
  showSources = true,
}: {
  claim: CitedClaim;
  as?: "p" | "span" | "li" | "div";
  className?: string;
  /** Hide chips when the same sources appear in a nearby expander. */
  showSources?: boolean;
}) {
  const Tag = as;
  const sources = showSources ? uniqueSourcesByHref(claim.sources) : [];
  return (
    <Tag className={className}>
      <span>{claim.text}</span>
      {sources.length > 0 ? (
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-normal tracking-wide text-muted-foreground uppercase">
            Source
            {sources.length > 1 ? "s" : ""}:
          </span>
          {sources.map((source) => (
            <SourceLink key={source.href} source={source} />
          ))}
        </span>
      ) : null}
    </Tag>
  );
}
