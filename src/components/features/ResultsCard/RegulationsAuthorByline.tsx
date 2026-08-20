import {
  REGULATIONS_AGENT,
  regulationsAgentAttribution,
} from "@/lib/regulations/agent";

/** Shared byline for law/regulation sections authored by the briefing agent. */
export function RegulationsAuthorByline({
  lastReviewed,
  className = "text-xs text-muted-foreground",
}: {
  lastReviewed?: string;
  className?: string;
}) {
  return (
    <p className={className}>
      {regulationsAgentAttribution(lastReviewed)}
      <span className="sr-only"> Role: {REGULATIONS_AGENT.role}.</span>
    </p>
  );
}
